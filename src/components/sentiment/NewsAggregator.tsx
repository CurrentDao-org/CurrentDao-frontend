'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Newspaper, ExternalLink, TrendingUp, TrendingDown, Filter, Search } from 'lucide-react'
import { useSentimentData } from '@/hooks/useSentimentData'
import { NewsArticle } from '@/types/sentiment'

interface NewsAggregatorProps {
  showLimit?: number
  className?: string
  onArticleClick?: (article: NewsArticle) => void
}

const SENTIMENT_COLORS = {
  very_positive: 'bg-green-100 text-green-800 border-green-300',
  positive: 'bg-lime-100 text-lime-800 border-lime-300',
  neutral: 'bg-gray-100 text-gray-800 border-gray-300',
  negative: 'bg-orange-100 text-orange-800 border-orange-300',
  very_negative: 'bg-red-100 text-red-800 border-red-300',
}

const SENTIMENT_ICONS = {
  very_positive: '🟢',
  positive: '🟢',
  neutral: '🟡',
  negative: '🔴',
  very_negative: '🔴',
}

export const NewsAggregator: React.FC<NewsAggregatorProps> = ({
  showLimit = 10,
  className = '',
  onArticleClick,
}) => {
  const { newsArticles, isLoading, error } = useSentimentData(
    { timeRange: '1d' },
    true,
    60000 // Update every minute
  )

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'latest' | 'importance' | 'engagement'>('latest')

  // Filter articles
  const filteredArticles = newsArticles
    .filter((article) => {
      const matchesSearch =
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = selectedCategory === 'all' || article.source.category === selectedCategory

      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      if (sortBy === 'latest') {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      } else if (sortBy === 'importance') {
        return b.importance - a.importance
      } else {
        return b.viewCount - a.viewCount
      }
    })
    .slice(0, showLimit)

  const categories = Array.from(new Set(newsArticles.map((a) => a.source.category)))

  if (error) {
    return (
      <div className={`rounded-lg bg-red-50 p-4 border border-red-200 ${className}`}>
        <p className="text-red-700">Failed to load news articles</p>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Newspaper className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">News Aggregation</h2>
          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
            {filteredArticles.length}
          </span>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col gap-3 p-4 bg-white rounded-lg border border-gray-200">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {Array.from(new Set(newsArticles.map((a) => a.source.category))).map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="latest">Latest</option>
            <option value="importance">Importance</option>
            <option value="engagement">Engagement</option>
          </select>
        </div>
      </div>

      {/* Articles List */}
      <div className="space-y-3">
        <AnimatePresence mode="wait">
          {isLoading && filteredArticles.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center py-8"
            >
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </motion.div>
          ) : filteredArticles.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8 bg-gray-50 rounded-lg"
            >
              <Newspaper className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No articles found</p>
            </motion.div>
          ) : (
            filteredArticles.map((article, index) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onArticleClick?.(article)}
                className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-lg p-4 transition-all cursor-pointer group"
              >
                {/* Article Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {/* Sentiment Badge */}
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold border ${SENTIMENT_COLORS[article.sentimentLabel]}`}
                      >
                        {SENTIMENT_ICONS[article.sentimentLabel]} {article.sentimentLabel.replace('_', ' ').toUpperCase()}
                      </span>

                      {/* Source Badge */}
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                        {article.source.name}
                      </span>

                      {/* Importance Badge */}
                      {article.importance > 75 && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">
                          ⭐ High Impact
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                  </div>

                  {/* Sentiment Score */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-2xl font-bold text-gray-900">{article.sentiment}</div>
                    <div className="text-xs text-gray-500">
                      {article.sentiment > 0 ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> Positive
                        </span>
                      ) : (
                        <span className="text-red-600 flex items-center gap-1">
                          <TrendingDown className="w-3 h-3" /> Negative
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Article Summary */}
                <p className="text-sm text-gray-600 mt-3 line-clamp-2">{article.summary}</p>

                {/* Article Metadata */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Published: {new Date(article.publishedAt).toLocaleDateString()}</span>
                    <span>Views: {article.viewCount}</span>
                  </div>

                  <button
                    className="p-1 hover:bg-blue-50 rounded text-blue-600 hover:text-blue-700 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(article.url, '_blank')
                    }}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>

                {/* Energy Types */}
                {article.energyTypes && article.energyTypes.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {article.energyTypes.map((type) => (
                      <span key={type} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                        {type}
                      </span>
                    ))}
                  </div>
                )}
              </motion.article>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Footer Stats */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-600">Total Articles</p>
            <p className="text-lg font-bold text-gray-900">{newsArticles.length}</p>
          </div>

          <div>
            <p className="text-xs text-gray-600">Avg. Sentiment</p>
            <p className="text-lg font-bold text-gray-900">
              {newsArticles.length > 0
                ? (newsArticles.reduce((sum, a) => sum + a.sentiment, 0) / newsArticles.length).toFixed(1)
                : 'N/A'}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-600">Sources</p>
            <p className="text-lg font-bold text-gray-900">{new Set(newsArticles.map((a) => a.source.id)).size}</p>
          </div>

          <div>
            <p className="text-xs text-gray-600">Categories</p>
            <p className="text-lg font-bold text-gray-900">{categories.length}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
