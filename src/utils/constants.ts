import { AllowedFileTypes, FileBoxConfig } from '../types';

/**
 * Default file size limits
 */
export const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const DEFAULT_MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB

/**
 * Allowed file types based on requirements
 */
export const ALLOWED_FILE_TYPES: AllowedFileTypes = {
  extensions: [
    // Documents
    '.pdf',
    '.txt',
    '.docx',
    '.xlsx',
    '.pptx',
    '.html',
    '.md',
    '.json',
    // Images
    '.jpg',
    '.jpeg',
    '.png',
    '.webp',
    '.gif',
    '.svg',
    '.bmp',
    '.heif',
    // Audio
    '.mp3',
    '.wav',
    '.ogg',
    '.aiff',
    '.aac',
    '.flac',
    // Video
    '.mov',
    '.mp4',
    '.avi',
    '.wmv',
    '.mkv',
  ],
  mimeTypes: [
    // Documents
    'application/pdf',
    'text/plain',
    'text/html',
    'text/markdown',
    'application/json',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    // Images (all image types)
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    'image/heif',
    // Audio (all audio types)
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/aiff',
    'audio/aac',
    'audio/flac',
    // Video (all video types)
    'video/quicktime',
    'video/mp4',
    'video/x-msvideo',
    'video/x-ms-wmv',
    'video/x-matroska',
  ],
  categories: {
    documents: [
      'application/pdf',
      'text/plain',
      'text/html',
      'text/markdown',
      'application/json',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ],
    images: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'image/bmp',
      'image/heif',
    ],
    audio: [
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      'audio/aiff',
      'audio/aac',
      'audio/flac',
    ],
    video: [
      'video/quicktime',
      'video/mp4',
      'video/x-msvideo',
      'video/x-ms-wmv',
      'video/x-matroska',
    ],
  },
};

/**
 * Default FileBox configuration
 */
export const DEFAULT_CONFIG: Required<FileBoxConfig> = {
  maxFileSize: DEFAULT_MAX_FILE_SIZE,
  maxTotalSize: DEFAULT_MAX_TOTAL_SIZE,
  maxFiles: -1, // unlimited
  allowedExtensions: ALLOWED_FILE_TYPES.extensions,
  allowedMimeTypes: ALLOWED_FILE_TYPES.mimeTypes,
  virusScanner: {
    enabled: true,
    timeout: 30000, // 30 seconds
  },
};

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  FILE_TOO_LARGE: 'File size exceeds the maximum allowed size',
  TOTAL_SIZE_EXCEEDED: 'Total archive size exceeds the maximum allowed size',
  INVALID_FILE_TYPE: 'File type is not allowed',
  INVALID_EXTENSION: 'File extension is not allowed',
  VIRUS_DETECTED: 'File failed security scan',
  SCAN_ERROR: 'Error occurred during file scanning',
  ZIP_ERROR: 'Error occurred while creating archive',
  MAX_FILES_EXCEEDED: 'Maximum number of files exceeded',
  NO_FILES: 'No files to archive',
};

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  FILE_VALIDATED: 'File validated successfully',
  SCAN_PASSED: 'File passed security scan',
  ARCHIVE_CREATED: 'Archive created successfully',
};
