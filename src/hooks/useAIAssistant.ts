/**
 * AI Assistant Hook
 * Provides AI-powered trading assistant functionality with learning system
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { AIService } from '../services/ai/ai-service';
import {
  TradingRecommendation,
  MarketInsight,
  AIUserProfile,
  AIAssistantState,
  AIQuery,
  AIResponse,
  LearningData,
  AIPerformance
} from '../types/ai';

/**
 * Options for the useAIAssistant hook.
 */
interface UseAIAssistantOptions {
  userProfile: AIUserProfile;
  enabled?: boolean;
  realTimeUpdates?: boolean;
  learningEnabled?: boolean;
  updateInterval?: number; // in seconds
}

/**
 * Return type for the useAIAssistant hook.
 */
interface UseAIAssistantReturn {
  // State
  state: AIAssistantState;
  recommendations: TradingRecommendation[];
  insights: MarketInsight[];
  performance: AIPerformance;
  
  // Actions
  generateRecommendation: (query?: AIQuery) => Promise<TradingRecommendation>;
  generateInsights: () => Promise<MarketInsight[]>;
  processQuery: (query: AIQuery) => Promise<AIResponse>;
  provideFeedback: (feedback: LearningData) => Promise<void>;
  
  // Learning
  updateLearningModel: () => Promise<void>;
  getLearningProgress: () => any;
  
  // Utilities
  resetState: () => void;
  refreshData: () => Promise<void>;
}

/**
 * Custom hook for interacting with the AI Trading Assistant service.
 * Manages state, real-time updates, and learning functionality.
 */
export function useAIAssistant(options: UseAIAssistantOptions): UseAIAssistantReturn {
  const {
    userProfile,
    enabled = true,
    realTimeUpdates = true,
    learningEnabled = true,
    updateInterval = 30
  } = options;

  // State management for the assistant's operational status
  const [state, setState] = useState<AIAssistantState>({
    isActive: false,
    isProcessing: false,
    currentRecommendation: null,
    insights: [],
    userProfile: null,
    voiceEnabled: false,
    lastUpdate: new Date(),
    performance: {
      responseTime: 0,
      accuracy: 0.85,
      uptime: 99.9,
      errorRate: 0.01,
      recommendationsProcessed: 0
    }
  });

  const [recommendations, setRecommendations] = useState<TradingRecommendation[]>([]);
  const [insights, setInsights] = useState<MarketInsight[]>([]);

  // Services and refs for managing side effects
  const aiService = useRef(AIService.getInstance());
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialized = useRef(false);

  // Initialize AI assistant when enabled or user profile changes
  useEffect(() => {
    if (enabled && userProfile && !isInitialized.current) {
      initializeAI();
    }

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [enabled, userProfile]);

  // Set up real-time updates interval
  useEffect(() => {
    if (enabled && realTimeUpdates && isInitialized.current) {
      updateIntervalRef.current = setInterval(() => {
        updateRealTimeData();
      }, updateInterval * 1000);

      return () => {
        if (updateIntervalRef.current) {
          clearInterval(updateIntervalRef.current);
        }
      };
    }
  }, [enabled, realTimeUpdates, updateInterval]);

  const initializeAI = async () => {
    try {
      setState(prevState => ({ ...prevState, isActive: true, isProcessing: true, userProfile }));

      // Generate initial recommendation and insights in parallel
      const [initialRecommendation, initialInsights] = await Promise.all([
        aiService.current.generateRecommendation(userProfile, []),
        aiService.current.generateInsights([], userProfile)
      ]);

      setState(prevState => ({
        ...prevState,
        isProcessing: false,
        currentRecommendation: initialRecommendation,
        insights: initialInsights,
        lastUpdate: new Date()
      }));

      setRecommendations([initialRecommendation]);
      setInsights(initialInsights);
      isInitialized.current = true;

    } catch (error) {
      console.error('AI initialization failed:', error);
      setState(prevState => ({ ...prevState, isProcessing: false }));
    }
  };

  const updateRealTimeData = async () => {
    if (!enabled || !userProfile) return;

    try {
      const [newRecommendation, newInsights] = await Promise.all([
        aiService.current.generateRecommendation(userProfile, []),
        aiService.current.generateInsights([], userProfile)
      ]);

      setState(prevState => ({
        ...prevState,
        currentRecommendation: newRecommendation,
        insights: newInsights,
        lastUpdate: new Date(),
        performance: aiService.current.getPerformance()
      }));

      setRecommendations(prevState => [newRecommendation, ...prevState].slice(0, 10));
      setInsights(prevState => [...newInsights, ...prevState].slice(0, 50));

    } catch (error) {
      console.error('Real-time update failed:', error);
    }
  };

  const generateRecommendation = useCallback(async (query?: AIQuery): Promise<TradingRecommendation> => {
    if (!enabled || !userProfile) {
      throw new Error('AI assistant not enabled or user profile not available');
    }

    try {
      setState(prev => ({ ...prev, isProcessing: true }));

      const marketData = await aiService.current.getRealTimeAnalysis(['BTC', 'ETH', 'ENERGY']);
      const recommendation = await aiService.current.generateRecommendation(userProfile, marketData, query);

      setState(prev => ({
        ...prev,
        isProcessing: false,
        currentRecommendation: recommendation,
        lastUpdate: new Date(),
        performance: aiService.current.getPerformance()
      }));

      setRecommendations(prev => [recommendation, ...prev].slice(0, 10));

      return recommendation;

    } catch (error) {
      setState(prev => ({ ...prev, isProcessing: false }));
      throw error;
    }
  }, [enabled, userProfile]);

  const generateInsights = useCallback(async (): Promise<MarketInsight[]> => {
    if (!enabled || !userProfile) {
      throw new Error('AI assistant not enabled or user profile not available');
    }

    try {
      const newInsights = await aiService.current.generateInsights([], userProfile);

      setState(prev => ({
        ...prev,
        insights: newInsights,
        lastUpdate: new Date(),
        performance: aiService.current.getPerformance()
      }));

      setInsights(prev => [...newInsights, ...prev].slice(0, 50));

      return newInsights;

    } catch (error) {
      throw error;
    }
  }, [enabled, userProfile]);

  const processQuery = useCallback(async (query: AIQuery): Promise<AIResponse> => {
    if (!enabled || !userProfile) {
      throw new Error('AI assistant not enabled or user profile not available');
    }

    try {
      setState(prev => ({ ...prev, isProcessing: true }));

      const response = await aiService.current.processQuery(query, userProfile);

      setState(prev => ({
        ...prev,
        isProcessing: false,
        lastUpdate: new Date(),
        performance: aiService.current.getPerformance()
      }));

      // Store learning data if learning is enabled
      if (learningEnabled) {
        const learningData: LearningData = {
          userId: userProfile.id,
          interactionType: 'query',
          userInput: query,
          aiResponse: response,
          userFeedback: 'neutral',
          outcome: null,
          timestamp: new Date()
        };

        // This would be sent to a learning service
        console.log('Learning data stored:', learningData);
      }

      return response;

    } catch (error) {
      setState(prev => ({ ...prev, isProcessing: false }));
      throw error;
    }
  }, [enabled, userProfile, learningEnabled]);

  const provideFeedback = useCallback(async (feedback: LearningData): Promise<void> => {
    if (!learningEnabled) {
      throw new Error('Learning is disabled');
    }

    try {
      // Store feedback for learning
      console.log('User feedback received:', feedback);

      // Update user profile based on feedback
      if (feedback.userFeedback === 'positive') {
        // Reinforce successful patterns
        console.log('Reinforcing successful patterns');
      } else if (feedback.userFeedback === 'negative') {
        // Adjust for unsuccessful patterns
        console.log('Adjusting for unsuccessful patterns');
      }

    } catch (error) {
      throw error;
    }
  }, [learningEnabled]);

  const updateLearningModel = useCallback(async (): Promise<void> => {
    if (!learningEnabled) {
      throw new Error('Learning is disabled');
    }

    try {
      setState(prev => ({ ...prev, isProcessing: true }));

      // Simulate model update
      const feedbackData: LearningData[] = [
        {
          userId: userProfile.id,
          interactionType: 'recommendation',
          userInput: { type: 'recommendation' },
          aiResponse: { confidence: 0.85 },
          userFeedback: 'positive',
          outcome: 'profit',
          timestamp: new Date()
        }
      ];

      const modelUpdate = await aiService.current.updateModel(feedbackData);

      setState(prev => ({
        ...prev,
        isProcessing: false,
        performance: aiService.current.getPerformance()
      }));

      console.log('Model updated:', modelUpdate);

    } catch (error) {
      setState(prev => ({ ...prev, isProcessing: false }));
      throw error;
    }
  }, [learningEnabled, userProfile]);

  const getLearningProgress = useCallback(() => {
    return {
      recommendationsGiven: state.performance.recommendationsProcessed,
      accuracyRate: state.performance.accuracy,
      userFeedbackScore: 0.85, // This would be calculated from actual feedback
      adaptationRate: 0.1,
      lastUpdated: state.lastUpdate
    };
  }, [state]);

  const resetState = useCallback(() => {
    setState({
      isActive: false,
      isProcessing: false,
      currentRecommendation: null,
      insights: [],
      userProfile: null,
      voiceEnabled: false,
      lastUpdate: new Date(),
      performance: {
        responseTime: 0,
        accuracy: 0.85,
        uptime: 99.9,
        errorRate: 0.01,
        recommendationsProcessed: 0
      }
    });

    setRecommendations([]);
    setInsights([]);
    isInitialized.current = false;
  }, []);

  const refreshData = useCallback(async () => {
    await updateRealTimeData();
  }, []);

  return {
    // State
    state,
    recommendations,
    insights,
    performance: state.performance,

    // Actions
    generateRecommendation,
    generateInsights,
    processQuery,
    provideFeedback,

    // Learning
    updateLearningModel,
    getLearningProgress,

    // Utilities
    resetState,
    refreshData
  };
}
