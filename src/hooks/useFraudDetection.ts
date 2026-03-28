'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { fraudService } from '@/services/fraud/fraud-service';
import {
  FraudAlert,
  FraudPattern,
  InvestigationCase,
  PreventionMechanism,
  FraudSummaryStats,
  FraudHistoricalTrend
} from '@/types/fraud';
import { toast } from 'react-hot-toast';

export function useFraudDetection() {
  const [isLoading, setIsLoading] = useState(true);
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [patterns, setPatterns] = useState<FraudPattern[]>([]);
  const [cases, setCases] = useState<InvestigationCase[]>([]);
  const [mechanisms, setMechanisms] = useState<PreventionMechanism[]>([]);
  const [stats, setStats] = useState<FraudSummaryStats | null>(null);
  const [trends, setTrends] = useState<FraudHistoricalTrend[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchData = useCallback(async (showOverlay = false) => {
    if (showOverlay) setIsRefreshing(true);
    try {
      const [
        recentAlerts,
        allPatterns,
        allCases,
        allMechanisms,
        summaryStats,
        historicalTrends
      ] = await Promise.all([
        fraudService.getRecentAlerts(),
        fraudService.getPatterns(),
        fraudService.getCases(),
        fraudService.getPreventionMechanisms(),
        fraudService.getSummaryStats(),
        fraudService.getHistoricalTrends()
      ]);

      setAlerts(recentAlerts);
      setPatterns(allPatterns);
      setCases(allCases);
      setMechanisms(allMechanisms);
      setStats(summaryStats);
      setTrends(historicalTrends);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch fraud data:', error);
      toast.error('Failed to sync fraud detection data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh logic (mocking real-time)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchData(false);
    }, 30000); // Refresh every 30 seconds as per requirement
    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  const toggleMechanism = async (id: string, enabled: boolean) => {
    try {
      await fraudService.updateMechanismStatus(id, enabled);
      setMechanisms(prev => 
        prev.map(m => m.id === id ? { ...m, enabled } : m)
      );
      toast.success(`${enabled ? 'Enabled' : 'Disabled'} prevention mechanism`);
    } catch (error) {
      toast.error('Failed to update mechanism');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const dashboardStats = useMemo(() => {
    if (!stats) return null;
    return [
      { label: 'Alerts (24h)', value: stats.totalAlerts24h, trend: '+12%', icon: 'AlertCircle' },
      { label: 'Active Cases', value: stats.activeInvestigations, trend: '-2', icon: 'ShieldQuery' },
      { label: 'Prevention Rate', value: `${stats.preventionRate}%`, trend: '+0.5%', icon: 'ShieldCheck' },
      { label: 'Risk Index', value: stats.averageRiskScore, trend: 'Stable', icon: 'Activity' }
    ];
  }, [stats]);

  return {
    isLoading,
    isRefreshing,
    alerts,
    patterns,
    cases,
    mechanisms,
    stats,
    trends,
    lastUpdate,
    autoRefresh,
    setAutoRefresh,
    refreshData: () => fetchData(true),
    toggleMechanism,
    getSeverityColor,
    dashboardStats
  };
}
