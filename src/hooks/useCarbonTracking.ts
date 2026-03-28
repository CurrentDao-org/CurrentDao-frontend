import { useState, useEffect, useCallback } from 'react';
import { 
  CarbonState,
  CarbonEmission,
  CarbonOffset,
  CarbonCredit,
  SustainabilityMetric,
  ImpactReport,
  GreenCertification,
  SustainabilityGoal,
  Recommendation,
  CarbonSettings,
  CarbonAnalytics,
  MarketplaceListing,
  CarbonTradingTransaction,
  CarbonCalculationRequest,
  CarbonCalculationResult,
  EmissionSource,
  EmissionCategory,
  OffsetProvider,
  OffsetType,
  CertificationType,
  MetricType,
  GoalType,
  RecommendationType,
  DifficultyLevel,
  Priority,
  CarbonFilter,
  ReportPeriod,
  AuditAction
} from '../types/carbon';
import { carbonService } from '../services/carbon/carbon-service';

interface UseCarbonTrackingOptions {
  userId: string;
  onStateChange?: (state: CarbonState) => void;
  onError?: (error: string) => void;
}

export const useCarbonTracking = (options: UseCarbonTrackingOptions) => {
  const [state, setState] = useState<CarbonState>({
    emissions: [],
    metrics: [],
    offsets: [],
    credits: [],
    reports: [],
    certifications: [],
    goals: [],
    recommendations: [],
    isLoading: false,
    error: null
  });

  const [filter, setFilter] = useState<CarbonFilter>({});
  const [analytics, setAnalytics] = useState<CarbonAnalytics | null>(null);
  const [settings, setSettings] = useState<CarbonSettings | null>(null);

  useEffect(() => {
    if (options.onStateChange) {
      options.onStateChange(state);
    }
  }, [state, options.onStateChange]);

  useEffect(() => {
    if (options.onError && state.error) {
      options.onError(state.error);
    }
  }, [state.error, options.onError]);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  }, []);

  // Emissions Management
  const loadEmissions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const emissions = await carbonService.getEmissions(options.userId, filter);
      setState(prev => ({ ...prev, emissions }));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load emissions');
    } finally {
      setLoading(false);
    }
  }, [options.userId, filter, setLoading, setError]);

  const addEmission = useCallback(async (emission: Omit<CarbonEmission, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);

    try {
      const newEmission = await carbonService.addEmission(emission);
      
      setState(prev => ({
        ...prev,
        emissions: [...prev.emissions, newEmission]
      }));

      await carbonService.logAudit(
        AuditAction.EMISSION_ADDED,
        options.userId,
        'emission',
        newEmission.id,
        { source: emission.source, amount: emission.amount }
      );

      return newEmission;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add emission');
      return null;
    } finally {
      setLoading(false);
    }
  }, [options.userId, setLoading, setError]);

  const updateEmission = useCallback(async (id: string, updates: Partial<CarbonEmission>) => {
    setLoading(true);
    setError(null);

    try {
      const updatedEmission = await carbonService.updateEmission(id, updates);
      
      setState(prev => ({
        ...prev,
        emissions: prev.emissions.map(emission =>
          emission.id === id ? updatedEmission : emission
        )
      }));

      await carbonService.logAudit(
        AuditAction.EMISSION_UPDATED,
        options.userId,
        'emission',
        id,
        updates
      );

      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update emission');
      return false;
    } finally {
      setLoading(false);
    }
  }, [options.userId, setLoading, setError]);

  const deleteEmission = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const success = await carbonService.deleteEmission(id);
      
      if (success) {
        setState(prev => ({
          ...prev,
          emissions: prev.emissions.filter(emission => emission.id !== id)
        }));

        await carbonService.logAudit(
          AuditAction.EMISSION_DELETED,
          options.userId,
          'emission',
          id,
          {}
        );
      }

      return success;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete emission');
      return false;
    } finally {
      setLoading(false);
    }
  }, [options.userId, setLoading, setError]);

  // Carbon Calculator
  const calculateEmissions = useCallback(async (request: CarbonCalculationRequest): Promise<CarbonCalculationResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await carbonService.calculateEmissions(request);
      
      await carbonService.logAudit(
        AuditAction.CALCULATION_PERFORMED,
        options.userId,
        'calculation',
        `calc-${Date.now()}`,
        { request, result }
      );

      return result;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to calculate emissions');
      return null;
    } finally {
      setLoading(false);
    }
  }, [options.userId, setLoading, setError]);

  // Sustainability Metrics
  const loadMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const metrics = await carbonService.getSustainabilityMetrics(options.userId);
      setState(prev => ({ ...prev, metrics }));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  }, [options.userId, setLoading, setError]);

  // Carbon Offsets
  const loadOffsets = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const offsets = await carbonService.getOffsets(options.userId);
      setState(prev => ({ ...prev, offsets }));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load offsets');
    } finally {
      setLoading(false);
    }
  }, [options.userId, setLoading, setError]);

  const purchaseOffset = useCallback(async (offsetData: Omit<CarbonOffset, 'id' | 'purchasedAt'>) => {
    setLoading(true);
    setError(null);

    try {
      const newOffset = await carbonService.purchaseOffset(offsetData);
      
      setState(prev => ({
        ...prev,
        offsets: [...prev.offsets, newOffset]
      }));

      await carbonService.logAudit(
        AuditAction.OFFSET_PURCHASED,
        options.userId,
        'offset',
        newOffset.id,
        { provider: offsetData.provider, amount: offsetData.amount }
      );

      return newOffset;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to purchase offset');
      return null;
    } finally {
      setLoading(false);
    }
  }, [options.userId, setLoading, setError]);

  const retireOffset = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const success = await carbonService.retireOffset(id);
      
      if (success) {
        setState(prev => ({
          ...prev,
          offsets: prev.offsets.map(offset =>
            offset.id === id ? { ...offset, status: 'retired' as any } : offset
          )
        }));

        await carbonService.logAudit(
          AuditAction.OFFSET_RETIRED,
          options.userId,
          'offset',
          id,
          {}
        );
      }

      return success;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to retire offset');
      return false;
    } finally {
      setLoading(false);
    }
  }, [options.userId, setLoading, setError]);

  // Carbon Credits Marketplace
  const getAvailableCredits = useCallback(async (): Promise<MarketplaceListing[]> => {
    setLoading(true);
    setError(null);

    try {
      const credits = await carbonService.getAvailableCredits();
      setState(prev => ({ ...prev, credits: credits.map(c => c.credit) }));
      return credits;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load available credits');
      return [];
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const purchaseCredit = useCallback(async (listingId: string, amount: number) => {
    setLoading(true);
    setError(null);

    try {
      const transaction = await carbonService.purchaseCredit(listingId, amount, options.userId);
      
      await carbonService.logAudit(
        AuditAction.CREDIT_SOLD,
        options.userId,
        'transaction',
        transaction.id,
        { listingId, amount }
      );

      return transaction;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to purchase credit');
      return null;
    } finally {
      setLoading(false);
    }
  }, [options.userId, setLoading, setError]);

  // Impact Reports
  const generateReport = useCallback(async (period: ReportPeriod) => {
    setLoading(true);
    setError(null);

    try {
      const report = await carbonService.generateReport(options.userId, period);
      
      setState(prev => ({
        ...prev,
        reports: [...prev.reports, report]
      }));

      await carbonService.logAudit(
        AuditAction.REPORT_GENERATED,
        options.userId,
        'report',
        report.id,
        { period }
      );

      return report;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate report');
      return null;
    } finally {
      setLoading(false);
    }
  }, [options.userId, setLoading, setError]);

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const reports = await carbonService.getReports(options.userId);
      setState(prev => ({ ...prev, reports }));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [options.userId, setLoading, setError]);

  // Green Certifications
  const loadCertifications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const certifications = await carbonService.getCertifications(options.userId);
      setState(prev => ({ ...prev, certifications }));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load certifications');
    } finally {
      setLoading(false);
    }
  }, [options.userId, setLoading, setError]);

  const addCertification = useCallback(async (certification: Omit<GreenCertification, 'id'>) => {
    setLoading(true);
    setError(null);

    try {
      const newCertification = await carbonService.addCertification(certification);
      
      setState(prev => ({
        ...prev,
        certifications: [...prev.certifications, newCertification]
      }));

      return newCertification;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add certification');
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  // Sustainability Goals
  const loadGoals = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const goals = await carbonService.getGoals(options.userId);
      setState(prev => ({ ...prev, goals }));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load goals');
    } finally {
      setLoading(false);
    }
  }, [options.userId, setLoading, setError]);

  const createGoal = useCallback(async (goal: Omit<SustainabilityGoal, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);

    try {
      const newGoal = await carbonService.createGoal(goal);
      
      setState(prev => ({
        ...prev,
        goals: [...prev.goals, newGoal]
      }));

      await carbonService.logAudit(
        AuditAction.GOAL_CREATED,
        options.userId,
        'goal',
        newGoal.id,
        { type: goal.type, target: goal.target }
      );

      return newGoal;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create goal');
      return null;
    } finally {
      setLoading(false);
    }
  }, [options.userId, setLoading, setError]);

  const updateGoal = useCallback(async (id: string, updates: Partial<SustainabilityGoal>) => {
    setLoading(true);
    setError(null);

    try {
      const updatedGoal = await carbonService.updateGoal(id, updates);
      
      setState(prev => ({
        ...prev,
        goals: prev.goals.map(goal =>
          goal.id === id ? updatedGoal : goal
        )
      }));

      await carbonService.logAudit(
        AuditAction.GOAL_UPDATED,
        options.userId,
        'goal',
        id,
        updates
      );

      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update goal');
      return false;
    } finally {
      setLoading(false);
    }
  }, [options.userId, setLoading, setError]);

  // Recommendations
  const loadRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const recommendations = await carbonService.getRecommendations(options.userId);
      setState(prev => ({ ...prev, recommendations }));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  }, [options.userId, setLoading, setError]);

  const completeRecommendation = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const success = await carbonService.completeRecommendation(id);
      
      if (success) {
        setState(prev => ({
          ...prev,
          recommendations: prev.recommendations.map(rec =>
            rec.id === id ? { ...rec, isCompleted: true, completedAt: new Date() } : rec
          )
        }));
      }

      return success;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to complete recommendation');
      return false;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  // Analytics
  const loadAnalytics = useCallback(async (period?: ReportPeriod) => {
    setLoading(true);
    setError(null);

    try {
      const analyticsData = await carbonService.getAnalytics(options.userId, period);
      setAnalytics(analyticsData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [options.userId, setLoading, setError]);

  // Settings
  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const userSettings = await carbonService.getSettings(options.userId);
      setSettings(userSettings);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, [options.userId, setLoading, setError]);

  const updateSettings = useCallback(async (settingsUpdate: Partial<CarbonSettings>) => {
    setLoading(true);
    setError(null);

    try {
      const updatedSettings = await carbonService.updateSettings(options.userId, settingsUpdate);
      setSettings(updatedSettings);

      await carbonService.logAudit(
        AuditAction.SETTINGS_UPDATED,
        options.userId,
        'settings',
        'user-settings',
        settingsUpdate
      );

      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update settings');
      return false;
    } finally {
      setLoading(false);
    }
  }, [options.userId, setLoading, setError]);

  // Export functionality
  const exportData = useCallback(async (type: 'emissions' | 'offsets' | 'reports', format: 'csv' | 'json') => {
    setLoading(true);
    setError(null);

    try {
      const blob = await carbonService.exportData(options.userId, type, format);
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-export-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to export data');
      return false;
    } finally {
      setLoading(false);
    }
  }, [options.userId, setLoading, setError]);

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        loadEmissions(),
        loadMetrics(),
        loadOffsets(),
        loadReports(),
        loadCertifications(),
        loadGoals(),
        loadRecommendations(),
        loadAnalytics(),
        loadSettings()
      ]);
    };

    initializeData();
  }, [loadEmissions, loadMetrics, loadOffsets, loadReports, loadCertifications, loadGoals, loadRecommendations, loadAnalytics, loadSettings]);

  // Refresh analytics when emissions or offsets change
  useEffect(() => {
    loadAnalytics();
  }, [state.emissions, state.offsets, loadAnalytics]);

  return {
    state,
    analytics,
    settings,
    filter,
    setFilter,
    loadEmissions,
    addEmission,
    updateEmission,
    deleteEmission,
    calculateEmissions,
    loadMetrics,
    loadOffsets,
    purchaseOffset,
    retireOffset,
    getAvailableCredits,
    purchaseCredit,
    generateReport,
    loadReports,
    loadCertifications,
    addCertification,
    loadGoals,
    createGoal,
    updateGoal,
    loadRecommendations,
    completeRecommendation,
    loadAnalytics,
    loadSettings,
    updateSettings,
    exportData,
    setError,
    setLoading
  };
};
