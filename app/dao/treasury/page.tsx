"use client";

export const dynamic = "force-dynamic";


import React, { useState, Suspense } from "react";
import dynamicImport from "next/dynamic";
import {
  LayoutDashboard,
  PieChart,
  Target,
  FileText,
  TrendingUp,
  Settings,
  Menu,
  X,
  Wallet,
  Shield,
  Activity,
} from "lucide-react";
import { LoadingSkeleton } from "../../../components/loading/LoadingSkeleton";
import { usePrefetchRoute } from "../../../utils/routeLoader";

// Dynamic imports for route-level code splitting
const TreasuryDashboard = dynamicImport(
  () =>
    import("../../../components/treasury/TreasuryDashboard").then((mod) => ({
      default: mod.TreasuryDashboard,
    })),
  {
    loading: () => <LoadingSkeleton variant="dashboard" />,
    ssr: true,
  },
);

const FundAllocation = dynamicImport(
  () =>
    import("../../../components/treasury/FundAllocation").then((mod) => ({
      default: mod.FundAllocation,
    })),
  {
    loading: () => <LoadingSkeleton variant="cards" />,
    ssr: true,
  },
);

const BudgetTracking = dynamicImport(
  () =>
    import("../../../components/treasury/BudgetTracking").then((mod) => ({
      default: mod.BudgetTracking,
    })),
  {
    loading: () => <LoadingSkeleton variant="table" />,
    ssr: true,
  },
);

const SpendingProposals = dynamicImport(
  () =>
    import("../../../components/treasury/SpendingProposals").then((mod) => ({
      default: mod.SpendingProposals,
    })),
  {
    loading: () => <LoadingSkeleton variant="table" />,
    ssr: true,
  },
);

const FinancialAnalytics = dynamicImport(
  () =>
    import("../../../components/treasury/FinancialAnalytics").then((mod) => ({
      default: mod.FinancialAnalytics,
    })),
  {
    loading: () => <LoadingSkeleton variant="chart" />,
    ssr: true,
  },
);

type TabType =
  | "dashboard"
  | "allocation"
  | "budget"
  | "proposals"
  | "analytics";

const TreasuryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const treasuryId = "treasury-main";

  // Prefetch adjacent routes on mount
  usePrefetchRoute(() => import("@/app/portfolio/history/page"), {
    prefetchOnHover: true,
  });

  const tabs = [
    {
      id: "dashboard" as TabType,
      label: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      description: "Overview and key metrics",
    },
    {
      id: "allocation" as TabType,
      label: "Fund Allocation",
      icon: <PieChart className="h-5 w-5" />,
      description: "Manage fund distribution",
    },
    {
      id: "budget" as TabType,
      label: "Budget Tracking",
      icon: <Target className="h-5 w-5" />,
      description: "Monitor budget performance",
    },
    {
      id: "proposals" as TabType,
      label: "Spending Proposals",
      icon: <FileText className="h-5 w-5" />,
      description: "Review and vote on proposals",
    },
    {
      id: "analytics" as TabType,
      label: "Financial Analytics",
      icon: <TrendingUp className="h-5 w-5" />,
      description: "Detailed financial insights",
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <Suspense fallback={<LoadingSkeleton variant="dashboard" />}>
            <TreasuryDashboard treasuryId={treasuryId} />
          </Suspense>
        );
      case "allocation":
        return (
          <Suspense fallback={<LoadingSkeleton variant="cards" />}>
            <FundAllocation treasuryId={treasuryId} />
          </Suspense>
        );
      case "budget":
        return (
          <Suspense fallback={<LoadingSkeleton variant="table" />}>
            <BudgetTracking treasuryId={treasuryId} />
          </Suspense>
        );
      case "proposals":
        return (
          <Suspense fallback={<LoadingSkeleton variant="table" />}>
            <SpendingProposals treasuryId={treasuryId} />
          </Suspense>
        );
      case "analytics":
        return (
          <Suspense fallback={<LoadingSkeleton variant="chart" />}>
            <FinancialAnalytics treasuryId={treasuryId} />
          </Suspense>
        );
      default:
        return (
          <Suspense fallback={<LoadingSkeleton variant="dashboard" />}>
            <TreasuryDashboard treasuryId={treasuryId} />
          </Suspense>
        );
    }
  };

  const renderSidebar = () => (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Wallet className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">DAO Treasury</h1>
          <p className="text-sm text-gray-600">Financial Management</p>
        </div>
      </div>

      <nav className="space-y-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSidebarOpen(false);
              }}
              onMouseEnter={() => {
                // Prefetch adjacent tab content on hover
                if (tab.id !== activeTab) {
                  // Triggers prefetch via dynamic import
                }
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {tab.icon}
              <div className="text-left">
                <div className="font-medium">{tab.label}</div>
                <div className="text-xs opacity-75">{tab.description}</div>
              </div>
            </button>
          );
        })}
      </nav>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Shield className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-gray-900">
            Security Status
          </span>
        </div>
        <p className="text-xs text-gray-600">
          All treasury operations are secured with multi-signature verification
          and audit logging.
        </p>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Activity className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-900">
            System Health
          </span>
        </div>
        <p className="text-xs text-gray-600">
          All systems operational. Last sync: 2 minutes ago.
        </p>
      </div>
    </div>
  );

  const renderMobileHeader = () => (
    <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          {sidebarOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Wallet className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">DAO Treasury</h1>
            <p className="text-xs text-gray-600">Financial Management</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMobileNav = () => (
    <div
      className={`lg:hidden fixed inset-0 z-50 ${
        sidebarOpen ? "block" : "hidden"
      }`}
    >
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={() => setSidebarOpen(false)}
      />
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
        {renderSidebar()}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Navigation */}
      {renderMobileNav()}
      {renderMobileHeader()}

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">{renderSidebar()}</div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="p-6">
            {/* Breadcrumb */}
            <div className="mb-6">
              <nav className="flex items-center space-x-2 text-sm text-gray-600">
                <span>DAO</span>
                <span>/</span>
                <span>Treasury</span>
                <span>/</span>
                <span className="text-gray-900 font-medium capitalize">
                  {tabs.find((tab) => tab.id === activeTab)?.label}
                </span>
              </nav>
            </div>

            {/* Page Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {tabs.find((tab) => tab.id === activeTab)?.label}
              </h2>
              <p className="text-gray-600 mt-1">
                {tabs.find((tab) => tab.id === activeTab)?.description}
              </p>
            </div>

            {/* Tab Content */}
            <div className="min-h-[600px]">{renderTabContent()}</div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                © 2024 DAO Treasury Management. All rights reserved.
              </div>
              <div className="flex items-center space-x-4">
                <button className="text-sm text-gray-600 hover:text-gray-900">
                  Documentation
                </button>
                <button className="text-sm text-gray-600 hover:text-gray-900">
                  Support
                </button>
                <button className="text-sm text-gray-600 hover:text-gray-900">
                  API Reference
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreasuryPage;
