import { ValidationResult } from '../types';
import { ERROR_MESSAGES, DEFAULT_MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from './constants';

/**
 * Validates file extension against whitelist
 */
export function validateFileExtension(
  fileName: string,
  allowedExtensions: string[] = ALLOWED_FILE_TYPES.extensions
): boolean {
  const extension = '.' + fileName.split('.').pop()?.toLowerCase();
  return allowedExtensions.some(
    (allowed) => allowed.toLowerCase() === extension
  );
}

/**
 * Validates file MIME type against whitelist
 */
export function validateFileMimeType(
  mimeType: string,
  allowedMimeTypes: string[] = ALLOWED_FILE_TYPES.mimeTypes
): boolean {
  // Check exact match
  if (allowedMimeTypes.includes(mimeType)) {
    return true;
  }

  // Check wildcard match (e.g., "image/*")
  const [category] = mimeType.split('/');
  return allowedMimeTypes.some((allowed) => {
    if (allowed.endsWith('/*')) {
      const [allowedCategory] = allowed.split('/');
      return category === allowedCategory;
    }
    return false;
  });
}

/**
 * Validates file size
 */
export function validateFileSize(
  fileSize: number,
  maxSize: number = DEFAULT_MAX_FILE_SIZE
): boolean {
  return fileSize > 0 && fileSize <= maxSize;
}

/**
 * Formats file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Comprehensive file validation
 */
export function validateFile(
  file: File,
  config: {
    maxFileSize?: number;
    allowedExtensions?: string[];
    allowedMimeTypes?: string[];
  } = {}
): ValidationResult {
  const {
    maxFileSize = DEFAULT_MAX_FILE_SIZE,
    allowedExtensions = ALLOWED_FILE_TYPES.extensions,
    allowedMimeTypes = ALLOWED_FILE_TYPES.mimeTypes,
  } = config;

  // Validate file size
  if (!validateFileSize(file.size, maxFileSize)) {
    return {
      isValid: false,
      error: `${ERROR_MESSAGES.FILE_TOO_LARGE} (${formatFileSize(maxFileSize)})`,
    };
  }

  // Validate file extension
  if (!validateFileExtension(file.name, allowedExtensions)) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.INVALID_EXTENSION,
    };
  }

  // Validate MIME type
  if (!validateFileMimeType(file.type, allowedMimeTypes)) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.INVALID_FILE_TYPE,
    };
  }

  return {
    isValid: true,
  };
}

/**
 * Validates total size of files
 */
export function validateTotalSize(
  files: File[],
  maxTotalSize: number
): ValidationResult {
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  if (totalSize > maxTotalSize) {
    return {
      isValid: false,
      error: `${ERROR_MESSAGES.TOTAL_SIZE_EXCEEDED} (${formatFileSize(maxTotalSize)})`,
    };
  }

  return {
    isValid: true,
  };
}

/**
 * Checks if filename might be malicious (basic check)
 */
export function isSuspiciousFilename(filename: string): boolean {
  // Check for null bytes
  if (filename.includes('\0')) return true;

  // Check for path traversal attempts
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return true;
  }

  // Check for hidden files (starting with .)
  if (filename.startsWith('.')) return true;

  // Check for executable extensions that might be disguised
  const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.com', '.scr', '.pif', '.app', '.sh', '.run'];
  const lowerFilename = filename.toLowerCase();

  for (const ext of suspiciousExtensions) {
    if (lowerFilename.includes(ext)) return true;
  }

  return false;
}

/**
 * Generates a unique ID for a file
 */
export function generateFileId(file: File): string {
  return `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
