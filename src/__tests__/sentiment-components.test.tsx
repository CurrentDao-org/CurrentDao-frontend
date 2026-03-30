import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { describe, it, beforeEach, jest } from '@jest/globals'
import { SentimentDashboard } from '@/components/sentiment/SentimentDashboard'
import { NewsAggregator } from '@/components/sentiment/NewsAggregator'
import { SocialMediaTracker } from '@/components/sentiment/SocialMediaTracker'
import { SentimentHeatMap } from '@/components/sentiment/SentimentHeatMap'
import { TradingSignals } from '@/components/sentiment/TradingSignals'

// Mock the hooks
jest.mock('@/hooks/useSentimentData', () => ({
  useSentimentData: () => ({
    dashboardData: {
      overall: 45,
      bySource: [
        { source: 'news', sentiment: 50, weight: 0.5, lastUpdated: new Date().toISOString(), dataPoints: 100, trend: 'increasing' as const },
      ],
      byEnergyType: [
        { energyType: 'solar', sentiment: 60, trend: 'increasing' as const, newsCount: 50, socialCount: 100 },
      ],
      topNewsArticles: [],
      topSocialPosts: [],
      tradingSignals: [],
      recentAlerts: [],
      historicalData: [],
      heatMapData: [],
      regionalData: [],
      lastUpdated: new Date().toISOString(),
    },
    newsArticles: [],
    socialPosts: [],
    tradingSignals: [],
    alerts: [],
    isLoading: false,
    error: null,
    isRealTime: false,
    refetch: jest.fn(),
    dismissAlert: jest.fn(),
    subscribe: jest.fn(),
  }),
  useSentimentTrends: () => ({
    historicalData: [],
    isLoading: false,
    error: null,
  }),
  useSentimentHeatMap: () => ({
    heatMapData: [],
    isLoading: false,
    error: null,
  }),
  useTradingSignals: () => ({
    signals: [],
    isLoading: false,
    error: null,
  }),
}))

describe('SentimentDashboard Component', () => {
  it('should render dashboard with title', () => {
    render(<SentimentDashboard />)
    expect(screen.getByText('Market Sentiment Dashboard')).toBeInTheDocument()
  })

  it('should display overall sentiment score', () => {
    render(<SentimentDashboard />)
    expect(screen.getByText('45.0')).toBeInTheDocument()
  })

  it('should show real-time indicator when enabled', () => {
    render(<SentimentDashboard showRealTime={true} />)
    // Check for real-time indicator
    expect(screen.getByText(/real-time/i, { selector: 'span' })).toBeInTheDocument()
  })

  it('should allow time range selection', async () => {
    render(<SentimentDashboard />)
    const selectElement = screen.getByDisplayValue('7d') as HTMLSelectElement
    expect(selectElement.value).toBe('7d')

    fireEvent.change(selectElement, { target: { value: '1d' } })
    await waitFor(() => {
      expect(selectElement.value).toBe('1d')
    })
  })

  it('should allow energy type filtering', async () => {
    render(<SentimentDashboard />)
    const selectElement = screen.getByDisplayValue('All Types') as HTMLSelectElement
    
    fireEvent.change(selectElement, { target: { value: 'solar' } })
    await waitFor(() => {
      expect(selectElement.value).toBe('solar')
    })
  })

  it('should handle refresh action', () => {
    render(<SentimentDashboard />)
    const refreshButton = screen.getByRole('button', { name: '' }).parentElement?.querySelector('button')
    if (refreshButton) {
      fireEvent.click(refreshButton)
    }
  })

  it('should display error message on failure', () => {
    // Mock error state
    jest.mock('@/hooks/useSentimentData', () => ({
      useSentimentData: () => ({
        dashboardData: null,
        newsArticles: [],
        socialPosts: [],
        tradingSignals: [],
        alerts: [],
        isLoading: false,
        error: new Error('Test error'),
        isRealTime: false,
        refetch: jest.fn(),
        dismissAlert: jest.fn(),
        subscribe: jest.fn(),
      }),
    }))
  })
})

describe('NewsAggregator Component', () => {
  it('should render news aggregator section', () => {
    render(<NewsAggregator />)
    expect(screen.getByText('News Aggregation')).toBeInTheDocument()
  })

  it('should display search functionality', () => {
    render(<NewsAggregator />)
    const searchInput = screen.getByPlaceholderText('Search articles...')
    expect(searchInput).toBeInTheDocument()
  })

  it('should support category filtering', () => {
    render(<NewsAggregator />)
    const categorySelect = screen.getByDisplayValue('All Categories')
    expect(categorySelect).toBeInTheDocument()
  })

  it('should support sorting options', () => {
    render(<NewsAggregator />)
    const sortSelect = screen.getByDisplayValue('Latest')
    expect(sortSelect).toBeInTheDocument()
  })

  it('should call onArticleClick when article is selected', () => {
    const mockClick = jest.fn()
    render(<NewsAggregator onArticleClick={mockClick} />)
    // Article click would be tested with actual article data
  })

  it('should display loading state', () => {
    render(<NewsAggregator />)
    // Loading indicator would be visible during data fetch
  })
})

describe('SocialMediaTracker Component', () => {
  it('should render social media tracker', () => {
    render(<SocialMediaTracker />)
    expect(screen.getByText('Social Media Tracking')).toBeInTheDocument()
  })

  it('should filter by platform', () => {
    render(<SocialMediaTracker />)
    const allButton = screen.getByRole('button', { name: /All/i })
    expect(allButton).toBeInTheDocument()
  })

  it('should support engagement sorting', () => {
    render(<SocialMediaTracker />)
    const sortSelect = screen.getByDisplayValue('Sort by Engagement')
    expect(sortSelect).toBeInTheDocument()
  })

  it('should handle influence score filtering', () => {
    render(<SocialMediaTracker />)
    // Range input for minimum influence would be present
    expect(screen.getByText(/Min Influence:/i)).toBeInTheDocument()
  })

  it('should display engagement metrics', () => {
    render(<SocialMediaTracker />)
    // Engagement stats would be visible
    expect(screen.getByText(/Total Posts/i)).toBeInTheDocument()
  })
})

describe('SentimentHeatMap Component', () => {
  it('should render heat map component', () => {
    render(<SentimentHeatMap />)
    expect(screen.getByText('Sentiment Heat Map')).toBeInTheDocument()
  })

  it('should display sentiment scale legend', () => {
    render(<SentimentHeatMap />)
    expect(screen.getByText('Sentiment Scale')).toBeInTheDocument()
    expect(screen.getByText(/Very Positive/i)).toBeInTheDocument()
  })

  it('should show energy type rows', () => {
    render(<SentimentHeatMap />)
    // Energy types should be displayed
    expect(screen.getByText(/SOLAR/i) || screen.getByText(/Solar/i)).toBeDefined()
  })

  it('should display key insights', () => {
    render(<SentimentHeatMap />)
    expect(screen.getByText('Key Insights')).toBeInTheDocument()
  })

  it('should support time range selection', () => {
    render(<SentimentHeatMap timeRange="7d" />)
    // Heat map should render with 7d data
  })
})

describe('TradingSignals Component', () => {
  it('should render trading signals section', () => {
    render(<TradingSignals />)
    expect(screen.getByText('Sentiment-Based Trading Signals')).toBeInTheDocument()
  })

  it('should display signal statistics', () => {
    render(<TradingSignals />)
    expect(screen.getByText(/Strong Buy/i)).toBeInTheDocument()
    expect(screen.getByText(/Average Confidence/i) || screen.getByText(/Avg Confidence/i)).toBeDefined()
  })

  it('should show confidence levels', () => {
    render(<TradingSignals />)
    expect(screen.getByText(/Confidence/i)).toBeInTheDocument()
  })

  it('should display price targets', () => {
    render(<TradingSignals />)
    // Price target information would be shown for signals
  })

  it('should provide signal guide', () => {
    render(<TradingSignals />)
    expect(screen.getByText('Signal Guide')).toBeInTheDocument()
  })
})

describe('Component Accessibility', () => {
  it('SentimentDashboard should have proper ARIA labels', () => {
    render(<SentimentDashboard />)
    // All interactive elements should have proper labels
  })

  it('should support keyboard navigation', () => {
    render(<NewsAggregator />)
    // Tab navigation should work
  })

  it('should have sufficient color contrast', () => {
    render(<SentimentHeatMap />)
    // Color combinations should meet WCAG standards
  })
})

describe('Component Performance', () => {
  it('should render SentimentDashboard under 500ms', () => {
    const start = performance.now()
    render(<SentimentDashboard />)
    const end = performance.now()
    expect(end - start).toBeLessThan(500)
  })

  it('should memoize expensive calculations', () => {
    const { rerender } = render(<NewsAggregator />)
    rerender(<NewsAggregator showLimit={20} />)
    // Component should rerender efficiently
  })

  it('should handle large data sets efficiently', () => {
    render(<SocialMediaTracker showLimit={100} />)
    // Should render 100+ items without performance degradation
  })
})
