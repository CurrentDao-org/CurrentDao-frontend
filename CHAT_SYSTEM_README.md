# Real-Time Chat System for Energy Trade Negotiations

## Overview

This chat system enables real-time communication between buyers and sellers in the CurrentDao energy marketplace. It supports text messaging, file sharing, emoji reactions, and provides a seamless experience for negotiating energy trades.

## Features

### ✅ Core Features
- **Real-time messaging** - Instant message delivery via WebSocket
- **Chat history persistence** - Messages persist across sessions
- **Online/offline status indicators** - See user availability at a glance
- **Typing indicators** - Know when someone is composing a message
- **File/image sharing** - Share documents and images securely
- **Emoji picker** - Express emotions with a wide range of emojis
- **Markdown support** - Format messages with bold, italic, and links
- **Message search** - Find specific conversations quickly
- **Read receipts** - Know when your messages have been seen
- **Mobile optimization** - Responsive design for all devices

### 🔧 Technical Features
- **TypeScript support** - Full type safety throughout
- **WebSocket communication** - Real-time bidirectional messaging
- **File upload validation** - Security checks and size limits
- **Error handling** - Comprehensive error management
- **Accessibility** - WCAG compliant components
- **Performance optimized** - Efficient rendering and state management

## Architecture

### File Structure
```
src/
├── components/chat/
│   ├── ChatContainer.tsx      # Main chat interface
│   ├── ChatHeader.tsx         # User info and actions
│   ├── MessageList.tsx        # Message display
│   ├── MessageInput.tsx       # Message composition
│   └── EmojiPicker.tsx        # Emoji selection
├── hooks/
│   ├── useChat.ts             # Chat state management
│   └── useWebSocket.ts        # WebSocket communication
├── types/
│   └── chat.ts                # TypeScript definitions
├── utils/
│   └── fileUpload.ts          # File handling utilities
└── styles/
    └── chat.css               # Chat-specific styles
```

### Components

#### ChatContainer
The main component that orchestrates the entire chat interface:
- Manages user selection and sidebar visibility
- Integrates all sub-components
- Handles error states and loading indicators

#### ChatHeader
Displays user information and provides action buttons:
- User avatar with online status indicator
- Voice and video call buttons (ready for implementation)
- Menu options for additional actions

#### MessageList
Renders the conversation history:
- Groups messages by date
- Supports text, image, and file messages
- Shows read receipts and edit status
- Auto-scrolls to new messages

#### MessageInput
Handles message composition and sending:
- Multi-line text input with auto-resize
- File and image attachment support
- Emoji picker integration
- Markdown formatting toolbar
- Voice recording button (ready for implementation)

#### EmojiPicker
Comprehensive emoji selection interface:
- Categorized emojis (Smileys, Gestures, Objects, Symbols, Energy)
- Search functionality
- Energy-specific emojis for the trading context

### Hooks

#### useChat
Central state management for chat functionality:
- WebSocket message handling
- Message history management
- Typing indicators
- File upload integration
- Search functionality

#### useWebSocket
Enhanced WebSocket hook with chat-specific features:
- Automatic reconnection
- Message queuing for offline scenarios
- Chat-specific message types
- Mock mode for development

### Types

Comprehensive TypeScript definitions for:
- User profiles and status
- Message types and metadata
- Chat room structure
- WebSocket message formats
- File upload results

## Usage

### Basic Implementation

```tsx
import { ChatContainer } from '@/components/chat/ChatContainer';
import { User } from '@/types/chat';

function ChatPage() {
  const currentUserId = 'user-123';
  const [selectedUser, setSelectedUser] = useState<User>();

  return (
    <ChatContainer
      currentUserId={currentUserId}
      selectedUser={selectedUser}
      onUserSelect={setSelectedUser}
      showSidebar={true}
      onSidebarToggle={() => {}}
    />
  );
}
```

### Environment Variables

```env
NEXT_PUBLIC_CHAT_WS_URL=ws://localhost:8080/chat
```

### WebSocket Message Format

```typescript
interface WebSocketChatMessage {
  type: 'new_message' | 'typing_indicator' | 'user_status' | 'read_receipt';
  payload: any;
  roomId: string;
  senderId: string;
  timestamp: Date;
}
```

## File Upload

### Supported File Types
- Images: JPEG, PNG, GIF, WebP
- Documents: PDF, DOC, DOCX, XLS, XLSX, CSV
- Text: TXT

### File Size Limits
- Maximum file size: 10MB
- Automatic validation and error handling

### Upload Process
1. File validation (type, size, security)
2. Upload to server or CDN
3. URL generation and storage
4. Message creation with file attachment

## Styling

The chat system uses custom CSS classes defined in `src/styles/chat.css`:

### Key Classes
- `.chat-container` - Main container
- `.chat-sidebar` - User list sidebar
- `.chat-message-list` - Message display area
- `.chat-message-input` - Message composition area
- `.emoji-picker` - Emoji selection interface

### Responsive Design
- Mobile-first approach
- Collapsible sidebar on small screens
- Touch-friendly interface elements
- Optimized layouts for different screen sizes

## Security Considerations

### File Upload Security
- File type validation against allowlist
- File size limits
- Executable file blocking
- Sanitized file names

### Message Security
- XSS prevention in message content
- Sanitized file URLs
- Rate limiting considerations
- Input validation

## Performance Optimizations

### Message Rendering
- Virtual scrolling for large chat histories
- Message grouping by date
- Lazy loading of images
- Efficient state updates

### File Handling
- Progressive file uploads
- Image compression
- Thumbnail generation
- Caching strategies

## Accessibility

### WCAG Compliance
- Semantic HTML structure
- ARIA labels and descriptions
- Keyboard navigation support
- Screen reader compatibility
- High contrast support

### Focus Management
- Logical tab order
- Focus indicators
- Skip links
- Modal focus trapping

## Testing

### Unit Tests
- Component rendering tests
- Hook behavior tests
- Utility function tests
- Type validation tests

### Integration Tests
- WebSocket communication
- File upload flow
- Message synchronization
- Error handling scenarios

### E2E Tests
- Complete chat workflows
- Mobile device testing
- Cross-browser compatibility
- Performance benchmarks

## Browser Support

### Modern Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Mobile Browsers
- iOS Safari 14+
- Chrome Mobile 90+
- Samsung Internet 14+

## Future Enhancements

### Planned Features
- Voice/video calling integration
- Message reactions and threading
- End-to-end encryption
- Message scheduling
- Translation support
- Advanced search with filters

### Performance Improvements
- Message caching strategies
- Offline message queuing
- Image optimization
- Bundle size optimization

## Demo

A live demo is available at `/chat-demo` showcasing all features:
- Real-time messaging simulation
- File upload demonstrations
- Emoji picker functionality
- Mobile responsive design
- Error handling examples

## Contributing

When contributing to the chat system:

1. Follow the established TypeScript patterns
2. Ensure accessibility compliance
3. Add appropriate tests
4. Update documentation
5. Consider mobile experience
6. Validate file upload security

## Support

For issues or questions regarding the chat system:
- Check the demo implementation for usage examples
- Review the TypeScript types for API documentation
- Test file upload functionality with various file types
- Verify WebSocket connection in development environment

---

**Built for CurrentDao Energy Marketplace**  
*Enabling seamless communication for decentralized energy trading*
