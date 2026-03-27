'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Camera, Loader2 } from 'lucide-react';
import { AvatarUploadProps } from '@/types/profile';

export function AvatarUpload({ 
  currentAvatar, 
  onUpload, 
  isLoading = false, 
  className = '' 
}: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!preview || !fileInputRef.current?.files?.[0]) return;
    
    setIsProcessing(true);
    try {
      const file = fileInputRef.current.files[0];
      const avatarUrl = await onUpload(file);
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [preview, onUpload]);

  const handleCancel = useCallback(() => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Avatar */}
      <div className="flex flex-col items-center space-y-2">
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 border-4 border-white dark:border-gray-800 shadow-lg">
            {currentAvatar ? (
              <img
                src={currentAvatar}
                alt="Current avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Camera className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
          <button
            onClick={handleClick}
            disabled={isLoading || isProcessing}
            className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading || isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Click to change avatar
        </p>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Preview Avatar</h3>
              <button
                onClick={handleCancel}
                disabled={isProcessing}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Preview Image */}
            <div className="flex justify-center">
              <div className="w-48 h-48 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* File Info */}
            <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
              {fileInputRef.current?.files?.[0] && (
                <p>
                  {fileInputRef.current.files[0].name} •{' '}
                  {(fileInputRef.current.files[0].size / 1024 / 1024).toFixed(2)} MB
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={handleCancel}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  'Upload Avatar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drag and Drop Area (alternative upload method) */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        } ${isLoading || isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
          Drop image here or click to browse
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          PNG, JPG, GIF up to 5MB
        </p>
      </div>

      {/* Guidelines */}
      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
        <p className="font-medium">Avatar Guidelines:</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Use a clear photo of your face</li>
          <li>Minimum size: 200x200 pixels</li>
          <li>Maximum file size: 5MB</li>
          <li>Supported formats: PNG, JPG, GIF</li>
          <li>Avatar will be displayed as a circle</li>
        </ul>
      </div>
    </div>
  );
}
