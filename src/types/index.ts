/**
 * Status of file validation/scanning
 */
export enum FileStatus {
  PENDING = 'pending',
  VALIDATING = 'validating',
  SCANNING = 'scanning',
  VALID = 'valid',
  INVALID = 'invalid',
  INFECTED = 'infected',
}

/**
 * Represents a file in the FileBox
 */
export interface FileItem {
  id: string;
  file: File;
  status: FileStatus;
  error?: string;
  progress?: number;
}

/**
 * Result of file validation
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Result of virus scanning
 */
export interface ScanResult {
  isClean: boolean;
  error?: string;
  details?: string;
}

/**
 * Configuration for virus scanner
 */
export interface VirusScannerConfig {
  enabled?: boolean;
  apiEndpoint?: string;
  timeout?: number;
}

/**
 * Configuration options for FileBox
 */
export interface FileBoxConfig {
  maxFileSize?: number; // in bytes, default 10MB
  maxTotalSize?: number; // in bytes, default 50MB
  maxFiles?: number; // default unlimited
  allowedExtensions?: string[];
  allowedMimeTypes?: string[];
  virusScanner?: VirusScannerConfig;
}

/**
 * Props for FileBoxModal component
 */
export interface FileBoxModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Callback when archive is created successfully */
  onComplete: (zipBlob: Blob, filenames: string[]) => void;
  /** Optional configuration */
  config?: FileBoxConfig;
  /** Optional custom class name */
  className?: string;
}

/**
 * Allowed file types configuration
 */
export interface AllowedFileTypes {
  extensions: string[];
  mimeTypes: string[];
  categories: {
    documents: string[];
    images: string[];
    audio: string[];
    video: string[];
  };
}
