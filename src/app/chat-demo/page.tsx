'use client';

import React, { useState } from 'react';
import { ChatContainer } from '../../components/chat/ChatContainer';
import { User } from '../../types/chat';
import '../../styles/chat.css';

const ChatDemoPage: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<User>();
  const [showSidebar, setShowSidebar] = useState(true);

  // Mock current user (in a real app, this would come from authentication)
  const currentUserId = 'current-user';

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
  };

  const handleSidebarToggle = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-screen flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Energy Trade Chat</h1>
              <p className="text-sm text-gray-600">Real-time negotiations for energy trading</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Demo Mode - WebSocket connection simulated
              </span>
              <button
                onClick={handleSidebarToggle}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {showSidebar ? 'Hide' : 'Show'} Sidebar
              </button>
            </div>
          </div>
        </header>

        {/* Chat Container */}
        <main className="flex-1 overflow-hidden">
          <ChatContainer
            currentUserId={currentUserId}
            selectedUser={selectedUser}
            onUserSelect={handleUserSelect}
            showSidebar={showSidebar}
            onSidebarToggle={handleSidebarToggle}
            className="h-full"
          />
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              <span className="font-medium">Features:</span> Real-time messaging • File sharing • Emoji support • Typing indicators • Online status
            </div>
            <div>
              Built for CurrentDao Energy Marketplace
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ChatDemoPage;
