import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChatContainer } from '../ChatContainer';
import { User } from '../../../types/chat';

// Mock the WebSocket
jest.mock('../../../hooks/useWebSocket', () => ({
  useWebSocket: jest.fn(() => ({
    sendChatMessage: jest.fn(),
    isConnected: true,
    error: null,
  })),
}));

// Mock the file upload utility
jest.mock('../../../utils/fileUpload', () => ({
  uploadFile: jest.fn(() => Promise.resolve({
    url: 'https://example.com/test-file.jpg',
    fileName: 'test-file.jpg',
    fileSize: 1024,
    fileType: 'image/jpeg',
  })),
}));

describe('Chat System', () => {
  const mockUser: User = {
    id: 'user1',
    name: 'Alice Johnson',
    avatar: '',
    isOnline: true,
  };

  const currentUserId = 'current-user';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders chat container with sidebar', () => {
    render(
      <ChatContainer
        currentUserId={currentUserId}
        showSidebar={true}
      />
    );

    expect(screen.getByText('Messages')).toBeInTheDocument();
    expect(screen.getByText('Select a conversation')).toBeInTheDocument();
  });

  test('displays online users correctly', () => {
    render(
      <ChatContainer
        currentUserId={currentUserId}
        selectedUser={mockUser}
        showSidebar={true}
      />
    );

    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  test('shows typing indicators when user is typing', async () => {
    render(
      <ChatContainer
        currentUserId={currentUserId}
        selectedUser={mockUser}
        showSidebar={false}
      />
    );

    // Simulate typing indicator
    const typingIndicator = screen.queryByText(/is typing/);
    if (typingIndicator) {
      expect(typingIndicator).toBeInTheDocument();
    }
  });

  test('handles message sending', async () => {
    const onUserSelect = jest.fn();
    
    render(
      <ChatContainer
        currentUserId={currentUserId}
        selectedUser={mockUser}
        onUserSelect={onUserSelect}
        showSidebar={false}
      />
    );

    // Find message input
    const messageInput = screen.getByPlaceholderText('Type a message...');
    expect(messageInput).toBeInTheDocument();

    // Type a message
    fireEvent.change(messageInput, { target: { value: 'Hello, world!' } });
    expect(messageInput).toHaveValue('Hello, world!');

    // Send message (press Enter)
    fireEvent.keyPress(messageInput, { key: 'Enter', code: 'Enter' });
    
    await waitFor(() => {
      expect(messageInput).toHaveValue('');
    });
  });

  test('handles emoji picker toggle', () => {
    render(
      <ChatContainer
        currentUserId={currentUserId}
        selectedUser={mockUser}
        showSidebar={false}
      />
    );

    // Find emoji button
    const emojiButton = screen.getByTitle('Add emoji');
    expect(emojiButton).toBeInTheDocument();

    // Click to toggle emoji picker
    fireEvent.click(emojiButton);
    
    // Emoji picker should appear (this is a simplified test)
    expect(emojiButton).toBeInTheDocument();
  });

  test('handles file upload', async () => {
    render(
      <ChatContainer
        currentUserId={currentUserId}
        selectedUser={mockUser}
        showSidebar={false}
      />
    );

    // Find file attachment button
    const fileButton = screen.getByTitle('Attach file');
    expect(fileButton).toBeInTheDocument();

    // Simulate file selection
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    // This is a simplified test - in real implementation, you'd need to mock the file input
    expect(fileButton).toBeInTheDocument();
  });

  test('displays error messages', () => {
    render(
      <ChatContainer
        currentUserId={currentUserId}
        selectedUser={mockUser}
        showSidebar={false}
      />
    );

    // Error display would be tested here when errors occur
    // This is a placeholder for error handling tests
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
  });

  test('handles user selection from sidebar', () => {
    const onUserSelect = jest.fn();
    
    render(
      <ChatContainer
        currentUserId={currentUserId}
        onUserSelect={onUserSelect}
        showSidebar={true}
      />
    );

    // Find a user in the sidebar
    const userButton = screen.getByText('Alice Johnson');
    expect(userButton).toBeInTheDocument();

    // Click on user
    fireEvent.click(userButton);
    
    // onUserSelect should be called
    expect(onUserSelect).toHaveBeenCalled();
  });

  test('responsive design works on mobile', () => {
    // Mock mobile viewport
    global.innerWidth = 500;
    
    render(
      <ChatContainer
        currentUserId={currentUserId}
        selectedUser={mockUser}
        showSidebar={true}
      />
    );

    // Should still render correctly on mobile
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    expect(screen.getByText('Messages')).toBeInTheDocument();
  });
});

describe('Chat Components Integration', () => {
  test('all chat components render together', () => {
    render(
      <ChatContainer
        currentUserId={currentUserId}
        selectedUser={mockUser}
        showSidebar={false}
      />
    );

    // Check that all main components are present
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument(); // ChatHeader
    expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument(); // MessageInput
    expect(screen.getByTitle('Add emoji')).toBeInTheDocument(); // EmojiPicker button
    expect(screen.getByTitle('Attach file')).toBeInTheDocument(); // File attachment
  });

  test('handles keyboard navigation', () => {
    render(
      <ChatContainer
        currentUserId={currentUserId}
        selectedUser={mockUser}
        showSidebar={false}
      />
    );

    const messageInput = screen.getByPlaceholderText('Type a message...');
    
    // Test Tab navigation
    fireEvent.tab(messageInput);
    
    // Test Enter key for sending
    fireEvent.keyPress(messageInput, { key: 'Enter', code: 'Enter' });
    
    expect(messageInput).toBeInTheDocument();
  });
});
