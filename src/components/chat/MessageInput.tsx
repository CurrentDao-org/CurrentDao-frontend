import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Image as ImageIcon, 
  Mic, 
  MicOff,
  X,
  Bold,
  Italic,
  Link
} from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string, type?: 'text' | 'image' | 'file', file?: File) => void;
  onTypingIndicator: (isTyping: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  showEmojiPicker?: boolean;
  onEmojiToggle?: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onTypingIndicator,
  disabled = false,
  placeholder = 'Type a message...',
  className = '',
  showEmojiPicker = false,
  onEmojiToggle,
}) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showFormatting, setShowFormatting] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Send typing indicator
    onTypingIndicator(true);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      onTypingIndicator(false);
    }, 1000);
  };

  const handleSend = () => {
    if (!message.trim() && !selectedFile) return;
    
    let messageType: 'text' | 'image' | 'file' = 'text';
    
    if (selectedFile) {
      if (selectedFile.type.startsWith('image/')) {
        messageType = 'image';
      } else {
        messageType = 'file';
      }
    }
    
    onSendMessage(message.trim(), messageType, selectedFile || undefined);
    setMessage('');
    setSelectedFile(null);
    setIsBold(false);
    setIsItalic(false);
    onTypingIndicator(false);
    
    // Reset file inputs
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('Image size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Voice recording implementation would go here
  };

  const insertFormatting = (type: 'bold' | 'italic') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = message.substring(start, end);
    
    let formattedText = '';
    if (type === 'bold') {
      formattedText = `**${selectedText}**`;
      setIsBold(!isBold);
    } else if (type === 'italic') {
      formattedText = `*${selectedText}*`;
      setIsItalic(!isItalic);
    }

    const newMessage = message.substring(0, start) + formattedText + message.substring(end);
    setMessage(newMessage);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
    }, 0);
  };

  const canSend = (message.trim().length > 0) || selectedFile !== null;

  return (
    <div className={`border-t border-gray-200 bg-white p-4 ${className}`}>
      {/* File preview */}
      {selectedFile && (
        <div className="mb-3 p-2 bg-gray-100 rounded-lg flex items-center space-x-2">
          {selectedFile.type.startsWith('image/') ? (
            <ImageIcon className="w-5 h-5 text-gray-600" />
          ) : (
            <Paperclip className="w-5 h-5 text-gray-600" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {selectedFile.name}
            </p>
            <p className="text-xs text-gray-500">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <button
            onClick={removeSelectedFile}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Formatting toolbar */}
      {showFormatting && (
        <div className="mb-2 flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
          <button
            onClick={() => insertFormatting('bold')}
            className={`p-2 rounded ${isBold ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-200'}`}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertFormatting('italic')}
            className={`p-2 rounded ${isItalic ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-200'}`}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            className="p-2 text-gray-600 hover:bg-gray-200 rounded"
            title="Insert link"
          >
            <Link className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-end space-x-2">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
            title="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => imageInputRef.current?.click()}
            disabled={disabled}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
            title="Send image"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          <button
            onClick={onEmojiToggle}
            disabled={disabled}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
            title="Add emoji"
          >
            <Smile className="w-5 h-5" />
          </button>

          <button
            onClick={() => setShowFormatting(!showFormatting)}
            disabled={disabled}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
            title="Formatting options"
          >
            <Bold className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            disabled={disabled}
            placeholder={placeholder}
            rows={1}
            className="w-full px-4 py-2 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={toggleRecording}
            disabled={disabled}
            className={`p-2 rounded-full transition-colors disabled:opacity-50 ${
              isRecording 
                ? 'text-red-600 hover:bg-red-50' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
            title={isRecording ? 'Stop recording' : 'Start voice recording'}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={handleSend}
            disabled={disabled || !canSend}
            className={`p-2 rounded-full transition-colors disabled:opacity-50 ${
              canSend
                ? 'text-white bg-blue-500 hover:bg-blue-600'
                : 'text-gray-400 bg-gray-200'
            }`}
            title="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        accept="*/*"
        className="hidden"
      />
      <input
        ref={imageInputRef}
        type="file"
        onChange={handleImageSelect}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};
