export interface FileUploadResult {
  url: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

export interface FileUploadOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  uploadEndpoint?: string;
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB
const DEFAULT_ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
];

export class FileUploadError extends Error {
  constructor(
    message: string,
    public code: 'SIZE_EXCEEDED' | 'INVALID_TYPE' | 'UPLOAD_FAILED' | 'NETWORK_ERROR'
  ) {
    super(message);
    this.name = 'FileUploadError';
  }
}

export async function uploadFile(
  file: File,
  options: FileUploadOptions = {}
): Promise<FileUploadResult> {
  const {
    maxSize = DEFAULT_MAX_SIZE,
    allowedTypes = DEFAULT_ALLOWED_TYPES,
    uploadEndpoint = '/api/upload',
  } = options;

  // Validate file size
  if (file.size > maxSize) {
    throw new FileUploadError(
      `File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds maximum allowed size of ${(maxSize / 1024 / 1024).toFixed(1)}MB`,
      'SIZE_EXCEEDED'
    );
  }

  // Validate file type
  if (!allowedTypes.includes(file.type)) {
    throw new FileUploadError(
      `File type ${file.type} is not allowed`,
      'INVALID_TYPE'
    );
  }

  // Create FormData for upload
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileName', file.name);
  formData.append('fileType', file.type);
  formData.append('fileSize', file.size.toString());

  try {
    // For development, return a mock URL
    if (process.env.NODE_ENV === 'development' || !uploadEndpoint.startsWith('http')) {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      // Generate a mock URL (in production, this would come from the server)
      const mockUrl = `https://cdn.example.com/files/${Date.now()}_${file.name}`;
      
      return {
        url: mockUrl,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      };
    }

    // Production upload
    const response = await fetch(uploadEndpoint, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type header when using FormData, browser sets it automatically with boundary
      },
    });

    if (!response.ok) {
      throw new FileUploadError(
        `Upload failed with status ${response.status}`,
        'UPLOAD_FAILED'
      );
    }

    const result = await response.json();
    
    return {
      url: result.url,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    };

  } catch (error) {
    if (error instanceof FileUploadError) {
      throw error;
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new FileUploadError(
        'Network error during upload',
        'NETWORK_ERROR'
      );
    }
    
    throw new FileUploadError(
      'Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error'),
      'UPLOAD_FAILED'
    );
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileIcon(fileType: string): string {
  if (fileType.startsWith('image/')) {
    return '🖼️';
  } else if (fileType === 'application/pdf') {
    return '📄';
  } else if (fileType.includes('word') || fileType.includes('document')) {
    return '📝';
  } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
    return '📊';
  } else if (fileType.includes('text') || fileType === 'text/plain') {
    return '📃';
  } else if (fileType.includes('zip') || fileType.includes('rar')) {
    return '🗜️';
  } else {
    return '📎';
  }
}

export function isImageFile(fileType: string): boolean {
  return fileType.startsWith('image/');
}

export function isVideoFile(fileType: string): boolean {
  return fileType.startsWith('video/');
}

export function isAudioFile(fileType: string): boolean {
  return fileType.startsWith('audio/');
}

export function validateFileForChat(
  file: File,
  options: FileUploadOptions = {}
): { isValid: boolean; error?: string } {
  const {
    maxSize = DEFAULT_MAX_SIZE,
    allowedTypes = DEFAULT_ALLOWED_TYPES,
  } = options;

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size ${formatFileSize(file.size)} exceeds maximum allowed size of ${formatFileSize(maxSize)}`,
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  // Check for potentially malicious files
  const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com'];
  const fileName = file.name.toLowerCase();
  
  if (dangerousExtensions.some(ext => fileName.endsWith(ext))) {
    return {
      isValid: false,
      error: 'Executable files are not allowed for security reasons',
    };
  }

  return { isValid: true };
}

// Preview utilities
export function createFilePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!isImageFile(file.type)) {
      reject(new Error('Preview is only available for image files'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  });
}

// Download utility
export function downloadFile(url: string, fileName: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Batch upload utility
export async function uploadMultipleFiles(
  files: File[],
  options: FileUploadOptions = {},
  onProgress?: (progress: number, currentFile: string) => void
): Promise<FileUploadResult[]> {
  const results: FileUploadResult[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    try {
      onProgress?.(i / files.length, file.name);
      const result = await uploadFile(file, options);
      results.push(result);
    } catch (error) {
      // Continue with other files even if one fails
      console.error(`Failed to upload ${file.name}:`, error);
      // You could choose to throw here if you want to fail fast
    }
  }
  
  onProgress?.(1, 'Complete');
  return results;
}
