'use client';

import { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import LinkExtension from '@tiptap/extension-link';
import UnderlineExtension from '@tiptap/extension-underline';
import ImageExtension from '@tiptap/extension-image';
import {
  Bold, Italic, Underline, Link, Image, Code, List, ListOrdered,
  Quote, Eye, EyeOff, Upload, Heading1, Heading2, Heading3,
  Save, RotateCcw, Redo, Strikethrough,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { uploadMultipleToIPFS } from '@/utils/ipfsUpload';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
  height?: string;
  previewMode?: 'split' | 'tab' | 'none';
  onFileUpload?: (files: FileList) => void;
  autoSaveKey?: string;
  readOnly?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start writing...',
  maxLength = 5000,
  className,
  height = '400px',
  previewMode = 'tab',
  onFileUpload,
  autoSaveKey = 'dao-proposal-draft',
  readOnly = false,
}: RichTextEditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  const [showDraftNotice, setShowDraftNotice] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [attachments, setAttachments] = useState<{ name: string; cid: string; url: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
      LinkExtension.configure({ openOnClick: false }),
      UnderlineExtension,
      ImageExtension.configure({ allowBase64: true }),
    ],
    content: value,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      setCharCount(text.length);
      setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
      onChange(html);
    },
  });

  // Sync external value changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  // Auto-save
  useEffect(() => {
    if (!autoSaveKey || !value || value === '<p></p>') return;
    const timer = setTimeout(() => {
      localStorage.setItem(autoSaveKey, JSON.stringify({ content: value, timestamp: Date.now() }));
      setShowDraftNotice(true);
      setTimeout(() => setShowDraftNotice(false), 2000);
    }, 2000);
    return () => clearTimeout(timer);
  }, [value, autoSaveKey]);

  // Load draft
  useEffect(() => {
    if (!autoSaveKey || value) return;
    const saved = localStorage.getItem(autoSaveKey);
    if (saved) {
      try {
        const { content, timestamp } = JSON.parse(saved);
        if ((Date.now() - timestamp) / 3600000 < 72 && content) {
          onChange(content);
        }
      } catch {}
    }
  }, []);

  const clearDraft = () => localStorage.removeItem(autoSaveKey);

  // File upload with IPFS
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    if (onFileUpload) onFileUpload(files);

    const results = await uploadMultipleToIPFS(Array.from(files));
    setAttachments(prev => [...prev, ...results.map(r => ({ name: r.name, cid: r.cid, url: r.url }))]);

    // Insert links/images into editor
    results.forEach(r => {
      if (editor) {
        if (r.type.startsWith('image/')) {
          editor.chain().focus().setImage({ src: r.url, alt: r.name }).run();
        } else {
          editor.chain().focus().insertContent(`<p><a href="${r.url}" target="_blank">📎 ${r.name}</a></p>`).run();
        }
      }
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [editor, onFileUpload]);

  if (!editor) return null;

  const currentLength = charCount;
  const ToolBtn = ({ icon, label, onClick, isActive }: { icon: React.ReactNode; label: string; onClick: () => void; isActive?: boolean }) => (
    <button type="button" onClick={onClick} className={cn("p-2 rounded hover:bg-accent", isActive && "bg-accent text-primary")} title={label}>{icon}</button>
  );

  return (
    <div className={cn("border rounded-lg overflow-hidden bg-background", className)}>
      {showDraftNotice && (
        <div className="px-4 py-1.5 bg-primary/10 text-primary text-xs flex justify-between">
          <span><Save className="w-3 h-3 inline mr-1" />Draft saved</span>
          <button onClick={clearDraft} className="hover:underline">Clear</button>
        </div>
      )}

      {/* Toolbar */}
      {!readOnly && (
        <div className="border-b bg-muted p-2 flex flex-wrap items-center gap-1">
          <div className="flex items-center gap-0.5 border-r pr-2">
            <ToolBtn icon={<Bold className="w-4 h-4" />} label="Bold" onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} />
            <ToolBtn icon={<Italic className="w-4 h-4" />} label="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} />
            <ToolBtn icon={<Underline className="w-4 h-4" />} label="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} />
            <ToolBtn icon={<Strikethrough className="w-4 h-4" />} label="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} />
            <ToolBtn icon={<Code className="w-4 h-4" />} label="Code" onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')} />
          </div>
          <div className="flex items-center gap-0.5 border-r pr-2">
            <ToolBtn icon={<Heading1 className="w-4 h-4" />} label="H1" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} />
            <ToolBtn icon={<Heading2 className="w-4 h-4" />} label="H2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} />
            <ToolBtn icon={<Heading3 className="w-4 h-4" />} label="H3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} />
          </div>
          <div className="flex items-center gap-0.5 border-r pr-2">
            <ToolBtn icon={<List className="w-4 h-4" />} label="Bullet List" onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} />
            <ToolBtn icon={<ListOrdered className="w-4 h-4" />} label="Ordered List" onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} />
            <ToolBtn icon={<Quote className="w-4 h-4" />} label="Blockquote" onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} />
          </div>
          <div className="flex items-center gap-0.5 border-r pr-2">
            <ToolBtn icon={<Link className="w-4 h-4" />} label="Link" onClick={() => { const url = prompt('URL:'); if (url) editor.chain().focus().setLink({ href: url }).run(); }} isActive={editor.isActive('link')} />
            <ToolBtn icon={<Image className="w-4 h-4" />} label="Image" onClick={() => fileInputRef.current?.click()} />
            <ToolBtn icon={<Upload className="w-4 h-4" />} label="Upload File" onClick={() => fileInputRef.current?.click()} />
            <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx" multiple className="hidden" onChange={handleFileUpload} />
          </div>
          <div className="flex items-center gap-0.5 border-r pr-2">
            <ToolBtn icon={<RotateCcw className="w-4 h-4" />} label="Undo" onClick={() => editor.chain().focus().undo().run()} />
            <ToolBtn icon={<Redo className="w-4 h-4" />} label="Redo" onClick={() => editor.chain().focus().redo().run()} />
          </div>
          <div className="flex items-center gap-0.5 ml-auto">
            {previewMode !== 'none' && (
              <ToolBtn icon={isPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />} label="Preview" onClick={() => setIsPreview(!isPreview)} />
            )}
          </div>
        </div>
      )}

      {/* Content */}
      {isPreview ? (
        <div className="p-4 overflow-y-auto prose prose-sm max-w-none" style={{ minHeight: height }} dangerouslySetInnerHTML={{ __html: value }} />
      ) : (
        <EditorContent editor={editor} className="prose prose-sm max-w-none" style={{ minHeight: height, padding: '1rem' }} />
      )}

      {/* Attachments list */}
      {attachments.length > 0 && (
        <div className="border-t px-4 py-2 space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Attachments</p>
          {attachments.map((a, i) => (
            <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
              📎 {a.name}
            </a>
          ))}
        </div>
      )}

      {/* Counts */}
      <div className="px-4 py-2 text-xs text-muted-foreground border-t flex justify-between">
        <span>{currentLength}{maxLength ? `/${maxLength}` : ''} chars · {wordCount} words</span>
      </div>
    </div>
  );
}

export default RichTextEditor;