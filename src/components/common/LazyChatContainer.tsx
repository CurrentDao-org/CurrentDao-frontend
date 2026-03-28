'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

/**
 * Lazy-loaded ChatContainer component
 * 
 * WHY LAZY LOADED:
 * - Complex chat UI with message lists, emoji picker, file upload
 * - ~14KB component with multiple sub-components
 * - Only needed when user opens chat
 * - Heavy WebSocket and message handling logic
 * 
 * Usage: Only rendered when user navigates to chat page or opens chat modal
 */
export const LazyChatContainer = dynamic(
  () => import('@/components/chat/ChatContainer').then(mod => ({ default: mod.ChatContainer })),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading chat...</span>
      </div>
    ),
    ssr: false, // Chat requires browser APIs
  }
)

/**
 * Default export for convenient importing
 */
export default LazyChatContainer
