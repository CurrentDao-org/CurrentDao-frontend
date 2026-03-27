export interface User {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file' | 'emoji';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  isEdited?: boolean;
  editedAt?: Date;
  isRead?: boolean;
  readAt?: Date;
}

export interface ChatRoom {
  id: string;
  participants: User[];
  lastMessage?: Message;
  createdAt: Date;
  updatedAt: Date;
  unreadCount: number;
}

export interface TypingIndicator {
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: Date;
}

export interface ChatMessagePayload {
  type: 'message' | 'typing' | 'online_status' | 'read_receipt';
  data: any;
  roomId: string;
  senderId: string;
  timestamp: Date;
}

export interface ChatState {
  messages: Message[];
  chatRooms: ChatRoom[];
  activeRoomId: string | null;
  onlineUsers: User[];
  typingUsers: TypingIndicator[];
  isLoading: boolean;
  error: string | null;
}

export interface ChatHookReturn {
  messages: Message[];
  chatRooms: ChatRoom[];
  activeRoom: ChatRoom | null;
  onlineUsers: User[];
  typingUsers: TypingIndicator[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string, type?: Message['type'], file?: File) => void;
  sendTypingIndicator: (isTyping: boolean) => void;
  markAsRead: (messageId: string) => void;
  loadChatHistory: (roomId: string) => void;
  setActiveRoom: (roomId: string) => void;
  searchMessages: (query: string) => Message[];
  uploadFile: (file: File) => Promise<string>;
}

export interface WebSocketChatMessage {
  type: 'new_message' | 'typing_indicator' | 'user_status' | 'read_receipt';
  payload: any;
  roomId: string;
  senderId: string;
  timestamp: Date;
}
