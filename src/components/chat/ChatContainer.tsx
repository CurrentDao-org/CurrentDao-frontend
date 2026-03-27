import React, { useState, useEffect } from 'react';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { EmojiPicker } from './EmojiPicker';
import { useChat } from '../../hooks/useChat';
import { User, Message } from '../../types/chat';
import { Search, Users, Settings, X, Phone, Video } from 'lucide-react';

interface ChatContainerProps {
  currentUserId: string;
  selectedUser?: User;
  onUserSelect?: (user: User) => void;
  className?: string;
  showSidebar?: boolean;
  onSidebarToggle?: () => void;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  currentUserId,
  selectedUser,
  onUserSelect,
  className = '',
  showSidebar = true,
  onSidebarToggle,
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const {
    messages,
    chatRooms,
    activeRoom,
    onlineUsers,
    typingUsers,
    isLoading,
    error,
    sendMessage,
    sendTypingIndicator,
    markAsRead,
    loadChatHistory,
    setActiveRoom,
    searchMessages,
    uploadFile,
  } = useChat(currentUserId);

  // Mock users for demo
  const mockUsers: User[] = [
    { id: 'user1', name: 'Alice Johnson', avatar: '', isOnline: true },
    { id: 'user2', name: 'Bob Smith', avatar: '', isOnline: false, lastSeen: new Date(Date.now() - 3600000) },
    { id: 'user3', name: 'Carol White', avatar: '', isOnline: true },
    { id: 'user4', name: 'David Brown', avatar: '', isOnline: false, lastSeen: new Date(Date.now() - 7200000) },
  ];

  const allUsers = [...mockUsers, ...onlineUsers];
  const currentUser = selectedUser || allUsers[0];

  useEffect(() => {
    if (currentUser) {
      setActiveRoom(currentUser.id);
    }
  }, [currentUser, setActiveRoom]);

  const handleEmojiSelect = (emoji: string) => {
    // This would be handled by the MessageInput component
    setShowEmojiPicker(false);
  };

  const handleImageClick = (imageUrl: string) => {
    window.open(imageUrl, '_blank');
  };

  const handleFileDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredMessages = searchQuery ? searchMessages(searchQuery) : messages;
  const typingUserNames = typingUsers
    .filter(user => user.userId !== currentUserId)
    .map(user => user.userName)
    .join(', ');

  return (
    <div className={`flex h-full bg-gray-50 ${className}`}>
      {/* Sidebar */}
      {showSidebar && (
        <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
                <button
                  onClick={onSidebarToggle}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {showSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          {/* User List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Online Users
              </h3>
              {allUsers.filter(user => user.isOnline).map((user) => (
                <button
                  key={user.id}
                  onClick={() => onUserSelect?.(user)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors ${
                    currentUser?.id === user.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="relative">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-gray-600" />
                      </div>
                    )}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-green-600">Online</p>
                  </div>
                </button>
              ))}

              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-4">
                Offline Users
              </h3>
              {allUsers.filter(user => !user.isOnline).map((user) => (
                <button
                  key={user.id}
                  onClick={() => onUserSelect?.(user)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors ${
                    currentUser?.id === user.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="relative">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-gray-600" />
                      </div>
                    )}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-gray-400 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">
                      Last seen {user.lastSeen ? user.lastSeen.toLocaleTimeString() : 'Unknown'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentUser ? (
          <>
            {/* Chat Header */}
            <ChatHeader
              user={currentUser}
              onCall={() => console.log('Voice call initiated')}
              onVideoCall={() => console.log('Video call initiated')}
              onMenuClick={() => console.log('Menu clicked')}
            />

            {/* Messages */}
            <MessageList
              messages={filteredMessages}
              currentUserId={currentUserId}
              users={allUsers}
              onImageClick={handleImageClick}
              onFileDownload={handleFileDownload}
              className="flex-1"
            />

            {/* Typing Indicator */}
            {typingUserNames && (
              <div className="px-4 py-2 text-sm text-gray-500 italic">
                {typingUserNames} {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </div>
            )}

            {/* Message Input */}
            <div className="relative">
              <MessageInput
                onSendMessage={sendMessage}
                onTypingIndicator={sendTypingIndicator}
                disabled={isLoading}
                showEmojiPicker={showEmojiPicker}
                onEmojiToggle={() => setShowEmojiPicker(!showEmojiPicker)}
              />

              {/* Emoji Picker */}
              {showEmojiPicker && (
                <EmojiPicker
                  onEmojiSelect={handleEmojiSelect}
                  onClose={() => setShowEmojiPicker(false)}
                />
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="absolute top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg">
                {error}
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-500">Choose a user from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
