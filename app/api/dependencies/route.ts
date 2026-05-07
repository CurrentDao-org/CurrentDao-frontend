import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { 
  DependencyInfo, 
  Vulnerability, 
  AuditReport, 
  DependencyAuditResponse,
  VulnerabilitySeverity 
} from '../../../src/types/dependencies';

const execAsync = promisify(exec);

// Simple role-based access control - in production, implement proper authentication
const ALLOWED_ROLES = ['admin', 'owner', 'maintainer'];

function hasAccess(request: NextRequest): boolean {
  // For now, check for a simple API key or role header
  // In production, implement proper JWT/session validation
  const role = request.headers.get('x-user-role');
  const apiKey = request.headers.get('x-api-key');
  
  // Allow access if role is allowed or if there's a valid API key
  return (role && ALLOWED_ROLES.includes(role)) || 
         apiKey === process.env.DEPENDENCY_DASHBOARD_API_KEY;
}

export async function GET(request: NextRequest) {
  try {
    // Check access permissions
    if (!hasAccess(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    // Run npm audit to get vulnerability information
    let auditData: any = {};
    try {
      const { stdout: auditOutput } = await execAsync('npm audit --json');
      auditData = JSON.parse(auditOutput);
    } catch (error: any) {
      // npm audit exits with non-zero code when vulnerabilities are found
      // but still outputs the JSON data
      if (error.stdout) {
        auditData = JSON.parse(error.stdout);
      }
    }

    // Get outdated packages information
    let outdatedData: any = {};
    try {
      const { stdout: outdatedOutput } = await execAsync('npm outdated --json');
      if (outdatedOutput.trim()) {
        outdatedData = JSON.parse(outdatedOutput);
      }
    } catch (error) {
      // npm outdated returns non-zero exit code when packages are outdated
      // but still outputs the JSON data
      if ((error as any).stdout) {
        try {
          outdatedData = JSON.parse((error as any).stdout);
        } catch {
          // Ignore parsing errors
        }
      }
    }

    // Read package.json to get current dependencies
    const packageJsonPath = join(process.cwd(), 'package.json');
    const packageJsonContent = await readFile(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(packageJsonContent);

    const report = processAuditData(auditData, outdatedData, packageJson);

    return NextResponse.json({
      success: true,
      report
    });

  } catch (error) {
    console.error('Error in dependency audit API:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      report: getEmptyReport()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!hasAccess(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'refresh':
        // Force refresh by clearing any server-side cache
        return GET(request);
      
      case 'audit':
        // Run a fresh audit
        try {
          const { stdout, stderr } = await execAsync('npm audit');
          return NextResponse.json({
            success: true,
            output: stdout,
            stderr
          });
        } catch (error: any) {
          return NextResponse.json({
            success: false,
            output: error.stdout || '',
            error: error.stderr || error.message
          });
        }
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in POST /api/dependencies:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function processAuditData(auditData: any, outdatedData: any, packageJson: any): AuditReport {
  const dependencies: DependencyInfo[] = [];
  const vulnerabilities = auditData.vulnerabilities || {};
  const metadata = auditData.metadata || {};

  // Process all dependencies from package.json
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
    ...packageJson.peerDependencies
  };

  // Use Object.keys and for...of loop to avoid TypeScript issues
  for (const name of Object.keys(allDeps)) {
    const version = allDeps[name];
    const depType = packageJson.dependencies[name] ? 'dependencies' :
                   packageJson.devDependencies[name] ? 'devDependencies' : 'peerDependencies';
    
    const currentVersion = version as string;
    const outdatedInfo = outdatedData[name];
    const vulnInfo = vulnerabilities[name];

    const dependency: DependencyInfo = {
      name,
      currentVersion,
      latestVersion: outdatedInfo?.latest || currentVersion,
      wantedVersion: outdatedInfo?.wanted,
      type: depType,
      outdated: !!outdatedInfo,
      vulnerabilities: vulnInfo ? processVulnerability(vulnInfo) : []
    };

    dependencies.push(dependency);
  }

  // Sort dependencies by vulnerability severity and outdated status
  dependencies.sort((a, b) => {
    if (a.vulnerabilities.length > 0 && b.vulnerabilities.length === 0) return -1;
    if (a.vulnerabilities.length === 0 && b.vulnerabilities.length > 0) return 1;
    if (a.outdated && !b.outdated) return -1;
    if (!a.outdated && b.outdated) return 1;
    return 0;
  });

  return {
    metadata: {
      totalDependencies: dependencies.length,
      vulnerableDependencies: dependencies.filter(d => d.vulnerabilities.length > 0).length,
      criticalVulnerabilities: countVulnerabilitiesBySeverity(dependencies, 'critical'),
      highVulnerabilities: countVulnerabilitiesBySeverity(dependencies, 'high'),
      mediumVulnerabilities: countVulnerabilitiesBySeverity(dependencies, 'medium'),
      lowVulnerabilities: countVulnerabilitiesBySeverity(dependencies, 'low'),
      lastUpdated: new Date()
    },
    dependencies,
    summary: {
      outdatedPackages: dependencies.filter(d => d.outdated).length,
      packagesWithVulnerabilities: dependencies.filter(d => d.vulnerabilities.length > 0).length,
      totalVulnerabilities: dependencies.reduce((sum, d) => sum + d.vulnerabilities.length, 0)
    }
  };
}

function processVulnerability(vulnData: any): Vulnerability[] {
  if (!vulnData) return [];

  // Handle single vulnerability
  if (!Array.isArray(vulnData)) {
    return [createVulnerability(vulnData)];
  }

  // Handle multiple vulnerabilities
  return vulnData.map((v: any) => createVulnerability(v));
}

function createVulnerability(vulnData: any): Vulnerability {
  return {
    id: vulnData.id || vulnData.title || 'unknown',
    title: vulnData.title || vulnData.name || 'Unknown vulnerability',
    severity: normalizeSeverity(vulnData.severity),
    url: vulnData.url || `https://www.npmjs.com/advisories/${vulnData.id}`,
    cwe: vulnData.cwe,
    cve: vulnData.cve,
    patchedIn: vulnData.patchedVersions,
    overview: vulnData.overview || 'No overview available',
    recommendation: vulnData.recommendation || 'Update to a patched version',
    affectedPaths: vulnData.affectedPaths || []
  };
}

function normalizeSeverity(severity: string): VulnerabilitySeverity {
  const normalized = severity?.toLowerCase();
  switch (normalized) {
    case 'critical': return 'critical';
    case 'high': return 'high';
    case 'moderate':
    case 'medium': return 'medium';
    case 'low': return 'low';
    case 'info':
    case 'none': return 'info';
    default: return 'info';
  }
}

function countVulnerabilitiesBySeverity(dependencies: DependencyInfo[], severity: VulnerabilitySeverity): number {
  return dependencies.reduce((count, dep) => {
    return count + dep.vulnerabilities.filter(v => v.severity === severity).length;
  }, 0);
}

function getEmptyReport(): AuditReport {
  return {
    metadata: {
      totalDependencies: 0,
      vulnerableDependencies: 0,
      criticalVulnerabilities: 0,
      highVulnerabilities: 0,
      mediumVulnerabilities: 0,
      lowVulnerabilities: 0,
      lastUpdated: new Date()
    },
    dependencies: [],
    summary: {
      outdatedPackages: 0,
      packagesWithVulnerabilities: 0,
      totalVulnerabilities: 0
    }
  };
}
