'use client';

import { Edit, Calendar, MapPin, Globe, Star, TrendingUp, Zap, Award, CheckCircle } from 'lucide-react';
import { ProfileOverviewProps } from '@/types/profile';
import { formatDistanceToNow } from 'date-fns';

export function ProfileOverview({ profile, stats, onEdit, className = '' }: ProfileOverviewProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'advanced':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'expert':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getReputationColor = (reputation: number) => {
    if (reputation >= 1000) return 'text-purple-600 dark:text-purple-400';
    if (reputation >= 750) return 'text-blue-600 dark:text-blue-400';
    if (reputation >= 500) return 'text-green-600 dark:text-green-400';
    if (reputation >= 250) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6 ${className}`}>
      {/* Header with Edit Button */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Profile Overview
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Your public profile and trading statistics
          </p>
        </div>
        <button
          onClick={onEdit}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Edit className="w-4 h-4" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Profile Info */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Avatar and Basic Info */}
        <div className="flex flex-col items-center md:items-start space-y-4 md:w-1/3">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 border-4 border-white dark:border-gray-800 shadow-lg">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {profile.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
              )}
            </div>
            {profile.isVerified && (
              <div className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-1">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            )}
          </div>

          <div className="text-center md:text-left">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {profile.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">@{profile.username}</p>
            
            <div className="flex items-center justify-center md:justify-start space-x-2 mt-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(profile.level)}`}>
                {profile.level.charAt(0).toUpperCase() + profile.level.slice(1)}
              </span>
              <div className={`flex items-center space-x-1 ${getReputationColor(profile.reputation)}`}>
                <Award className="w-4 h-4" />
                <span className="text-sm font-medium">{profile.reputation}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bio and Details */}
        <div className="md:w-2/3 space-y-4">
          {profile.bio && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Bio</h4>
              <p className="text-gray-600 dark:text-gray-400">{profile.bio}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.location && (
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{profile.location}</span>
              </div>
            )}

            {profile.website && (
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <Globe className="w-4 h-4" />
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {profile.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}

            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">
                Joined {formatDistanceToNow(new Date(profile.joinDate), { addSuffix: true })}
              </span>
            </div>

            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">
                Active {formatDistanceToNow(new Date(profile.lastActive), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Trading Statistics */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Trading Statistics
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Total</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalTrades}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Trades</p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Success</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.successfulTrades}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {((stats.successfulTrades / stats.totalTrades) * 100).toFixed(1)}% Rate
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Rating</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.averageRating.toFixed(1)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {stats.totalReviews} Reviews
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Volume</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ${parseInt(stats.totalVolume).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Volume</p>
          </div>
        </div>
      </div>

      {/* Environmental Impact */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Environmental Impact
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <div className="flex items-center space-x-3">
              <div className="bg-green-600 rounded-full p-2">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Energy Saved</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {parseInt(stats.energySaved).toLocaleString()} kWh
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 rounded-full p-2">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">CO₂ Offset</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {parseInt(stats.co2Offset).toLocaleString()} kg
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DAO Participation */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              DAO Participation
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Active governance participation
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.daoParticipation}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Proposals</p>
          </div>
        </div>
      </div>
    </div>
  );
}
