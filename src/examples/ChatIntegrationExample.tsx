'use client';

import React, { useState, useEffect } from 'react';
import { ChatContainer } from '../components/chat/ChatContainer';
import { useChat } from '../hooks/useChat';
import { User, Message } from '../types/chat';
import '../styles/chat.css';

/**
 * Example component showing how to integrate the chat system
 * into an existing application with authentication and real user data
 */
export const ChatIntegrationExample: React.FC = () => {
  // In a real app, this would come from your authentication system
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);

  // Mock authentication - replace with your actual auth logic
  useEffect(() => {
    // Simulate user authentication
    const mockCurrentUser: User = {
      id: 'trader-001',
      name: 'Energy Trader',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=trader',
      isOnline: true,
    };
    setCurrentUser(mockCurrentUser);
  }, []);

  // Mock user data - replace with your actual user management
  const availableUsers: User[] = [
    {
      id: 'seller-001',
      name: 'Solar Energy Co.',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=solar',
      isOnline: true,
    },
    {
      id: 'buyer-001',
      name: 'Grid Operator',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=grid',
      isOnline: false,
      lastSeen: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    },
    {
      id: 'trader-002',
      name: 'Wind Power Inc.',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wind',
      isOnline: true,
    },
  ];

  // Custom chat hook integration with your backend
  const chatHook = useChat(currentUser?.id || '');

  // Handle new messages - integrate with your notification system
  useEffect(() => {
    if (chatHook.messages.length > 0) {
      const lastMessage = chatHook.messages[chatHook.messages.length - 1];
      
      // Only notify for messages from other users
      if (lastMessage.senderId !== currentUser?.id) {
        // Send notification (browser notification, in-app notification, etc.)
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('New Message', {
            body: `${lastMessage.senderName}: ${lastMessage.content}`,
            icon: '/favicon.ico',
          });
        }
        
        // Update unread count in your UI
        console.log('New message received:', lastMessage);
      }
    }
  }, [chatHook.messages, currentUser]);

  // Handle user selection
  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    
    // Load chat history for this user
    chatHook.loadChatHistory(user.id);
    
    // Mark messages as read
    chatHook.messages
      .filter(msg => msg.senderId === user.id && !msg.isRead)
      .forEach(msg => chatHook.markAsRead(msg.id));
  };

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Custom Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-900">Energy Trading Chat</h1>
            <span className="text-sm text-gray-500">
              Welcome, {currentUser.name}
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${chatHook.error ? 'bg-red-500' : chatHook.isLoading ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
              <span className="text-sm text-gray-600">
                {chatHook.error ? 'Connection Error' : chatHook.isLoading ? 'Connecting...' : 'Connected'}
              </span>
            </div>

            {/* Sidebar Toggle */}
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              {showSidebar ? 'Hide' : 'Show'} Users
            </button>
          </div>
        </div>
      </header>

      {/* Error Display */}
      {chatHook.error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">{chatHook.error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => window.location.reload()}
                className="text-red-500 hover:text-red-700"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <main className="flex-1 overflow-hidden">
        <ChatContainer
          currentUserId={currentUser.id}
          selectedUser={selectedUser}
          onUserSelect={handleUserSelect}
          showSidebar={showSidebar}
          onSidebarToggle={() => setShowSidebar(!showSidebar)}
          className="h-full"
        />
      </main>

      {/* Custom Footer with Stats */}
      <footer className="bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>Online Users: {availableUsers.filter(u => u.isOnline).length}</span>
            <span>Total Messages: {chatHook.messages.length}</span>
            <span>Active Room: {selectedUser ? selectedUser.name : 'None'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs">CurrentDao Energy Marketplace</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Example of how to use this in a page component
export default function ChatPage() {
  return <ChatIntegrationExample />;
}
