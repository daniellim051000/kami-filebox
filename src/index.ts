// Main component export
export { FileBoxModal } from './components/FileBoxModal';

// Type exports
export type {
  FileBoxModalProps,
  FileBoxConfig,
  FileItem,
  FileStatus,
  ValidationResult,
  ScanResult,
  VirusScannerConfig,
  AllowedFileTypes,
} from './types';

// Utility exports
export {
  validateFile,
  validateFileExtension,
  validateFileMimeType,
  validateFileSize,
  validateTotalSize,
  formatFileSize,
  generateFileId,
} from './utils/fileValidation';

// Constant exports
export {
  ALLOWED_FILE_TYPES,
  DEFAULT_MAX_FILE_SIZE,
  DEFAULT_MAX_TOTAL_SIZE,
  DEFAULT_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from './utils/constants';

// Service exports (for advanced users)
export { scanFile, scanFiles } from './services/virusScanner';
export { createZipArchive, downloadBlob, generateZipFilename } from './services/zipService';

// Hook exports (for advanced users)
export { useFileValidation } from './hooks/useFileValidation';
export { useVirusScanner } from './hooks/useVirusScanner';
export { useZipArchive } from './hooks/useZipArchive';
