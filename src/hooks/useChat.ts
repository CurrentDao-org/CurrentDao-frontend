import { useState, useEffect, useCallback, useRef } from 'react';
import { useWebSocket } from './useWebSocket';
import { uploadFile, FileUploadError } from '../utils/fileUpload';
import { 
  Message, 
  ChatRoom, 
  User, 
  TypingIndicator, 
  ChatState, 
  ChatHookReturn, 
  WebSocketChatMessage 
} from '../types/chat';

const WS_URL = process.env.NEXT_PUBLIC_CHAT_WS_URL || 'ws://localhost:8080/chat';

export function useChat(currentUserId: string): ChatHookReturn {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    chatRooms: [],
    activeRoomId: null,
    onlineUsers: [],
    typingUsers: [],
    isLoading: false,
    error: null,
  });

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { sendChatMessage, isConnected, error } = useWebSocket<WebSocketChatMessage>({
    url: WS_URL,
    onMessage: handleWebSocketMessage,
    mockInterval: 10000,
    mockDataGenerator: generateMockMessage,
  });

  function handleWebSocketMessage(message: WebSocketChatMessage) {
    switch (message.type) {
      case 'new_message':
        handleNewMessage(message.payload);
        break;
      case 'typing_indicator':
        handleTypingIndicator(message.payload);
        break;
      case 'user_status':
        handleUserStatus(message.payload);
        break;
      case 'read_receipt':
        handleReadReceipt(message.payload);
        break;
    }
  }

  function handleNewMessage(payload: Message) {
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, payload],
      chatRooms: prev.chatRooms.map(room => 
        room.id === payload.receiverId || room.participants.some(p => p.id === payload.senderId)
          ? { ...room, lastMessage: payload, updatedAt: new Date() }
          : room
      ),
    }));
  }

  function handleTypingIndicator(payload: TypingIndicator) {
    setChatState(prev => {
      const existingIndex = prev.typingUsers.findIndex(u => u.userId === payload.userId);
      let newTypingUsers: TypingIndicator[];

      if (payload.isTyping) {
        if (existingIndex >= 0) {
          newTypingUsers = prev.typingUsers.map((u, index) => 
            index === existingIndex ? payload : u
          );
        } else {
          newTypingUsers = [...prev.typingUsers, payload];
        }
      } else {
        newTypingUsers = prev.typingUsers.filter(u => u.userId !== payload.userId);
      }

      return { ...prev, typingUsers: newTypingUsers };
    });
  }

  function handleUserStatus(payload: User) {
    setChatState(prev => ({
      ...prev,
      onlineUsers: payload.isOnline 
        ? [...prev.onlineUsers.filter(u => u.id !== payload.id), payload]
        : prev.onlineUsers.filter(u => u.id !== payload.id),
    }));
  }

  function handleReadReceipt(payload: { messageId: string; userId: string }) {
    setChatState(prev => ({
      ...prev,
      messages: prev.messages.map(msg => 
        msg.id === payload.messageId 
          ? { ...msg, isRead: true, readAt: new Date() }
          : msg
      ),
    }));
  }

  function generateMockMessage(): WebSocketChatMessage {
    const mockUsers: User[] = [
      { id: 'user1', name: 'Alice', isOnline: true },
      { id: 'user2', name: 'Bob', isOnline: false },
    ];
    
    const mockMessage: Message = {
      id: `msg_${Date.now()}`,
      senderId: 'user1',
      receiverId: currentUserId,
      content: 'This is a mock message for testing',
      timestamp: new Date(),
      type: 'text',
      isRead: false,
    };

    return {
      type: 'new_message',
      payload: mockMessage,
      roomId: 'room1',
      senderId: 'user1',
      timestamp: new Date(),
    };
  }

  const sendMessage = useCallback(async (content: string, type: Message['type'] = 'text', file?: File) => {
    if (!content.trim() && !file) return;
    if (!isConnected) {
      setChatState(prev => ({ ...prev, error: 'Not connected to chat server' }));
      return;
    }

    const newMessage: Message = {
      id: `msg_${Date.now()}_${Math.random()}`,
      senderId: currentUserId,
      receiverId: chatState.activeRoomId || '',
      content,
      timestamp: new Date(),
      type,
      isRead: false,
    };

    if (file && (type === 'image' || type === 'file')) {
      try {
        const fileResult = await uploadFile(file);
        newMessage.fileUrl = fileResult.url;
        newMessage.fileName = fileResult.fileName;
        newMessage.fileSize = fileResult.fileSize;
      } catch (error) {
        if (error instanceof FileUploadError) {
          setChatState(prev => ({ ...prev, error: error.message }));
        } else {
          setChatState(prev => ({ ...prev, error: 'Failed to upload file' }));
        }
        return;
      }
    }

    const wsMessage: WebSocketChatMessage = {
      type: 'new_message',
      payload: newMessage,
      roomId: chatState.activeRoomId || '',
      senderId: currentUserId,
      timestamp: new Date(),
    };

    sendChatMessage(wsMessage);
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));
  }, [currentUserId, chatState.activeRoomId, isConnected, sendChatMessage]);

  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    if (!chatState.activeRoomId || !isConnected) return;

    const typingPayload: TypingIndicator = {
      userId: currentUserId,
      userName: 'You',
      isTyping,
      timestamp: new Date(),
    };

    const wsMessage: WebSocketChatMessage = {
      type: 'typing_indicator',
      payload: typingPayload,
      roomId: chatState.activeRoomId,
      senderId: currentUserId,
      timestamp: new Date(),
    };

    sendChatMessage(wsMessage);

    if (isTyping) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingIndicator(false);
      }, 3000);
    }
  }, [currentUserId, chatState.activeRoomId, isConnected, sendChatMessage]);

  const markAsRead = useCallback((messageId: string) => {
    const wsMessage: WebSocketChatMessage = {
      type: 'read_receipt',
      payload: { messageId, userId: currentUserId },
      roomId: chatState.activeRoomId || '',
      senderId: currentUserId,
      timestamp: new Date(),
    };

    sendChatMessage(wsMessage);
  }, [currentUserId, chatState.activeRoomId, sendChatMessage]);

  const loadChatHistory = useCallback(async (roomId: string) => {
    setChatState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Mock implementation - replace with actual API call
      const mockMessages: Message[] = [
        {
          id: 'msg_1',
          senderId: 'user1',
          receiverId: currentUserId,
          content: 'Hello! Are you interested in trading energy?',
          timestamp: new Date(Date.now() - 3600000),
          type: 'text',
          isRead: true,
          readAt: new Date(Date.now() - 3500000),
        },
        {
          id: 'msg_2',
          senderId: currentUserId,
          receiverId: 'user1',
          content: 'Yes, I have some excess solar energy available.',
          timestamp: new Date(Date.now() - 3000000),
          type: 'text',
          isRead: true,
        },
      ];

      setChatState(prev => ({
        ...prev,
        messages: mockMessages,
        isLoading: false,
      }));
    } catch (error) {
      setChatState(prev => ({
        ...prev,
        error: 'Failed to load chat history',
        isLoading: false,
      }));
    }
  }, [currentUserId]);

  const setActiveRoom = useCallback((roomId: string) => {
    setChatState(prev => ({ ...prev, activeRoomId: roomId }));
    loadChatHistory(roomId);
  }, [loadChatHistory]);

  const searchMessages = useCallback((query: string): Message[] => {
    if (!query.trim()) return chatState.messages;
    
    return chatState.messages.filter(msg => 
      msg.content.toLowerCase().includes(query.toLowerCase())
    );
  }, [chatState.messages]);

  const uploadFileToServer = useCallback(async (file: File): Promise<string> => {
    const result = await uploadFile(file);
    return result.url;
  }, []);

  const activeRoom = chatState.chatRooms.find(room => room.id === chatState.activeRoomId) || null;

  return {
    messages: chatState.messages,
    chatRooms: chatState.chatRooms,
    activeRoom,
    onlineUsers: chatState.onlineUsers,
    typingUsers: chatState.typingUsers,
    isLoading: chatState.isLoading,
    error: chatState.error || error,
    sendMessage,
    sendTypingIndicator,
    markAsRead,
    loadChatHistory,
    setActiveRoom,
    searchMessages,
    uploadFile: uploadFileToServer,
  };
}
