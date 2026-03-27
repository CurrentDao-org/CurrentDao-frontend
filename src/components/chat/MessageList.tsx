import React, { useEffect, useRef } from 'react';
import { Message, User } from '../../types/chat';
import { User as UserIcon, Check, CheckCheck, Download, Image, FileText } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  users: User[];
  onImageClick?: (imageUrl: string) => void;
  onFileDownload?: (fileUrl: string, fileName: string) => void;
  className?: string;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  users,
  onImageClick,
  onFileDownload,
  className = '',
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getUserById = (userId: string): User | undefined => {
    return users.find(user => user.id === userId);
  };

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [date: string]: Message[] } = {};
    
    messages.forEach(message => {
      const dateKey = message.timestamp.toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });

    return groups;
  };

  const renderMessageContent = (message: Message) => {
    switch (message.type) {
      case 'text':
        return (
          <p className="text-gray-800 break-words whitespace-pre-wrap">
            {message.content}
          </p>
        );

      case 'image':
        return (
          <div className="space-y-2">
            <p className="text-gray-800">{message.content}</p>
            {message.fileUrl && (
              <div 
                className="cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => onImageClick?.(message.fileUrl!)}
              >
                <img
                  src={message.fileUrl}
                  alt={message.fileName || 'Shared image'}
                  className="max-w-xs rounded-lg shadow-md"
                  loading="lazy"
                />
              </div>
            )}
          </div>
        );

      case 'file':
        return (
          <div className="space-y-2">
            <p className="text-gray-800">{message.content}</p>
            {message.fileUrl && (
              <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                   onClick={() => onFileDownload?.(message.fileUrl!, message.fileName!)}>
                <FileText className="w-5 h-5 text-gray-600" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {message.fileName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {message.fileSize ? `${(message.fileSize / 1024).toFixed(1)} KB` : 'Unknown size'}
                  </p>
                </div>
                <Download className="w-4 h-4 text-gray-600" />
              </div>
            )}
          </div>
        );

      default:
        return <p className="text-gray-800">{message.content}</p>;
    }
  };

  const renderMessageStatus = (message: Message) => {
    if (message.senderId !== currentUserId) return null;

    if (message.isRead) {
      return <CheckCheck className="w-4 h-4 text-blue-500" />;
    } else if (message.readAt) {
      return <CheckCheck className="w-4 h-4 text-gray-400" />;
    } else {
      return <Check className="w-4 h-4 text-gray-400" />;
    }
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${className}`}>
      {Object.entries(messageGroups).map(([dateKey, dateMessages]) => (
        <div key={dateKey}>
          <div className="flex items-center justify-center my-4">
            <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
              {formatDate(dateMessages[0].timestamp)}
            </div>
          </div>
          
          <div className="space-y-3">
            {dateMessages.map((message) => {
              const isOwnMessage = message.senderId === currentUserId;
              const user = getUserById(message.senderId);
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex space-x-2 max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {!isOwnMessage && (
                      <div className="flex-shrink-0">
                        {user?.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <UserIcon className="w-4 h-4 text-gray-600" />
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`px-4 py-2 rounded-2xl ${
                          isOwnMessage
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {renderMessageContent(message)}
                      </div>
                      
                      <div className={`flex items-center space-x-1 mt-1 text-xs text-gray-500 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <span>{formatMessageTime(message.timestamp)}</span>
                        {message.isEdited && <span>(edited)</span>}
                        {renderMessageStatus(message)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      
      <div ref={messagesEndRef} />
    </div>
  );
};
