'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  Heart,
  MessageCircle,
  Share2,
  TrendingUp,
  Filter,
  Shield,
  ZapOff,
} from 'lucide-react'
import { useSentimentData } from '@/hooks/useSentimentData'
import { SocialMediaPost, SocialMediaPlatform } from '@/types/sentiment'

interface SocialMediaTrackerProps {
  showLimit?: number
  className?: string
  autoRefresh?: boolean
}

const PLATFORM_COLORS: Record<SocialMediaPlatform, { bg: string; text: string; icon: string }> = {
  twitter: { bg: 'bg-blue-50', text: 'text-blue-600', icon: '𝕏' },
  reddit: { bg: 'bg-orange-50', text: 'text-orange-600', icon: 'R' },
  discord: { bg: 'bg-indigo-50', text: 'text-indigo-600', icon: 'D' },
  telegram: { bg: 'bg-cyan-50', text: 'text-cyan-600', icon: 'T' },
  tiktok: { bg: 'bg-black-50', text: 'text-gray-900', icon: '♪' },
  instagram: { bg: 'bg-pink-50', text: 'text-pink-600', icon: '📷' },
}

const SENTIMENT_COLORS = {
  very_positive: 'bg-green-100 text-green-800',
  positive: 'bg-lime-100 text-lime-800',
  neutral: 'bg-gray-100 text-gray-800',
  negative: 'bg-orange-100 text-orange-800',
  very_negative: 'bg-red-100 text-red-800',
}

export const SocialMediaTracker: React.FC<SocialMediaTrackerProps> = ({
  showLimit = 15,
  className = '',
  autoRefresh = true,
}) => {
  const { socialPosts, isLoading, error } = useSentimentData(
    { timeRange: '4h', socialOnly: true },
    autoRefresh,
    30000 // 30 seconds
  )

  const [selectedPlatform, setSelectedPlatform] = useState<SocialMediaPlatform | 'all'>('all')
  const [sortBy, setSortBy] = useState<'engagement' | 'sentiment' | 'latest'>('engagement')
  const [minInfluence, setMinInfluence] = useState(0)

  // Filter and sort posts
  const filteredPosts = socialPosts
    .filter((post) => {
      const platformMatch = selectedPlatform === 'all' || post.platform === selectedPlatform
      const influenceMatch = post.influenceScore >= minInfluence
      return platformMatch && influenceMatch
    })
    .sort((a, b) => {
      if (sortBy === 'engagement') {
        return b.engagement - a.engagement
      } else if (sortBy === 'sentiment') {
        return b.sentiment - a.sentiment
      } else {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      }
    })
    .slice(0, showLimit)

  const platforms = Array.from(new Set(socialPosts.map((p) => p.platform))) as SocialMediaPlatform[]

  if (error) {
    return (
      <div className={`rounded-lg bg-red-50 p-4 border border-red-200 ${className}`}>
        <p className="text-red-700">Failed to load social media data</p>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-900">Social Media Tracking</h2>
          <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
            {filteredPosts.length}
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 p-4 bg-white rounded-lg border border-gray-200">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <label className="text-sm font-medium text-gray-700">Platform:</label>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedPlatform('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedPlatform === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All
            </button>

            {platforms.map((platform) => (
              <button
                key={platform}
                onClick={() => setSelectedPlatform(platform)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  selectedPlatform === platform
                    ? `${PLATFORM_COLORS[platform].bg} ${PLATFORM_COLORS[platform].text} border-2 border-current`
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {PLATFORM_COLORS[platform].icon} {platform}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 flex-wrap items-center">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="engagement">Sort by Engagement</option>
            <option value="sentiment">Sort by Sentiment</option>
            <option value="latest">Sort by Latest</option>
          </select>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Min Influence:</label>
            <input
              type="range"
              min="0"
              max="100"
              value={minInfluence}
              onChange={(e) => setMinInfluence(parseInt(e.target.value))}
              className="w-24"
            />
            <span className="text-sm font-medium text-gray-900">{minInfluence}</span>
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-3">
        <AnimatePresence mode="wait">
          {isLoading && filteredPosts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center py-8"
            >
              <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
            </motion.div>
          ) : filteredPosts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8 bg-gray-50 rounded-lg"
            >
              <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No posts found</p>
            </motion.div>
          ) : (
            filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={`rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow ${
                  PLATFORM_COLORS[post.platform].bg
                }`}
              >
                {/* Post Header */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    {/* Platform Badge */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                        PLATFORM_COLORS[post.platform].bg
                      } ${PLATFORM_COLORS[post.platform].text}`}
                    >
                      {PLATFORM_COLORS[post.platform].icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 truncate">@{post.author}</p>

                        {post.verified && (
                          <div title="Verified">
                            <Shield className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          </div>
                        )}

                        {post.influenceScore > 75 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold flex-shrink-0">
                            ⭐ Influencer
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-600 mt-1">{new Date(post.timestamp).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Sentiment Badge */}
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold flex-shrink-0 ${
                      SENTIMENT_COLORS[post.sentimentLabel]
                    }`}
                  >
                    {post.sentiment > 0 ? '🟢' : post.sentiment < 0 ? '🔴' : '🟡'} {post.sentiment > 0 ? '+' : ''}
                    {post.sentiment}
                  </span>
                </div>

                {/* Post Content */}
                <p className="text-sm text-gray-700 mb-3 line-clamp-3">{post.content}</p>

                {/* Keywords */}
                {post.keywords && post.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {post.keywords.slice(0, 4).map((keyword) => (
                      <span key={keyword} className="px-2 py-0.5 bg-white bg-opacity-50 rounded text-xs text-gray-700">
                        #{keyword}
                      </span>
                    ))}
                  </div>
                )}

                {/* Energy Types */}
                {post.energyTypes && post.energyTypes.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3 pb-3 border-b border-gray-300 border-opacity-30">
                    {post.energyTypes.map((type) => (
                      <span key={type} className="px-2 py-0.5 bg-blue-200 bg-opacity-50 rounded text-xs text-blue-900">
                        {type}
                      </span>
                    ))}
                  </div>
                )}

                {/* Engagement Metrics */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Heart className="w-4 h-4" />
                      <span>{post.likes}</span>
                    </div>

                    <div className="flex items-center gap-1 text-gray-600">
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.replies}</span>
                    </div>

                    <div className="flex items-center gap-1 text-gray-600">
                      <Share2 className="w-4 h-4" />
                      <span>{post.retweets}</span>
                    </div>

                    {post.virality > 80 && (
                      <div className="flex items-center gap-1 text-red-600 font-semibold">
                        <TrendingUp className="w-4 h-4" />
                        <span>Viral</span>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-gray-600">
                    Engagement: <span className="font-semibold">{Math.round(post.engagement)}</span>
                  </div>
                </div>

                {/* Influence Score */}
                <div className="mt-3 pt-3 border-t border-gray-300 border-opacity-30">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Influence Score</span>
                    <span className="font-semibold text-gray-900">{post.influenceScore}%</span>
                  </div>
                  <div className="mt-1 h-2 bg-gray-300 bg-opacity-30 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${post.influenceScore}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    />
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Summary Stats */}
      <div className="p-4 bg-white rounded-lg border border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-xs text-gray-600">Total Posts</p>
            <p className="text-lg font-bold text-gray-900">{socialPosts.length}</p>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-600">Avg. Engagement</p>
            <p className="text-lg font-bold text-gray-900">
              {socialPosts.length > 0
                ? Math.round(socialPosts.reduce((sum, p) => sum + p.engagement, 0) / socialPosts.length)
                : 'N/A'}
            </p>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-600">Influencers</p>
            <p className="text-lg font-bold text-gray-900">
              {socialPosts.filter((p) => p.influenceScore > 75).length}
            </p>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-600">Platforms</p>
            <p className="text-lg font-bold text-gray-900">{platforms.length}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
