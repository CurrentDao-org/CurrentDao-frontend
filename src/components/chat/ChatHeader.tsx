import React from 'react';
import { User } from '../../types/chat';
import { User as UserIcon, Phone, Video, MoreVertical, Circle } from 'lucide-react';

interface ChatHeaderProps {
  user: User;
  onCall?: () => void;
  onVideoCall?: () => void;
  onMenuClick?: () => void;
  className?: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  user,
  onCall,
  onVideoCall,
  onMenuClick,
  className = '',
}) => {
  const formatLastSeen = (date?: Date) => {
    if (!date) return '';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`flex items-center justify-between p-4 border-b border-gray-200 bg-white ${className}`}>
      <div className="flex items-center space-x-3">
        <div className="relative">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-gray-600" />
            </div>
          )}
          <div className="absolute bottom-0 right-0">
            <Circle
              className={`w-3 h-3 fill-current ${
                user.isOnline ? 'text-green-500' : 'text-gray-400'
              }`}
            />
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{user.name}</h3>
          <p className="text-sm text-gray-500">
            {user.isOnline ? 'Online' : `Last seen ${formatLastSeen(user.lastSeen)}`}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {onCall && (
          <button
            onClick={onCall}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Voice call"
          >
            <Phone className="w-5 h-5" />
          </button>
        )}
        
        {onVideoCall && (
          <button
            onClick={onVideoCall}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Video call"
          >
            <Video className="w-5 h-5" />
          </button>
        )}
        
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="More options"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
