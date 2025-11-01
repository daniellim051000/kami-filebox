import { useCallback } from 'react';
import { FileBoxConfig } from '../types';
import { validateFile, validateTotalSize } from '../utils/fileValidation';
import { DEFAULT_CONFIG } from '../utils/constants';

export function useFileValidation(config?: FileBoxConfig) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  const validateSingleFile = useCallback(
    (file: File) => {
      return validateFile(file, {
        maxFileSize: mergedConfig.maxFileSize,
        allowedExtensions: mergedConfig.allowedExtensions,
        allowedMimeTypes: mergedConfig.allowedMimeTypes,
      });
    },
    [mergedConfig]
  );

  const validateFiles = useCallback(
    (files: File[], existingFiles: File[] = []) => {
      const results = files.map((file) => ({
        file,
        result: validateSingleFile(file),
      }));

      // Check total size
      const allFiles = [...existingFiles, ...files.filter((_, i) => results[i].result.isValid)];
      const totalSizeResult = validateTotalSize(allFiles, mergedConfig.maxTotalSize);

      return {
        results,
        totalSizeResult,
      };
    },
    [validateSingleFile, mergedConfig.maxTotalSize]
  );

  const checkMaxFiles = useCallback(
    (currentCount: number, newCount: number) => {
      if (mergedConfig.maxFiles <= 0) return true; // Unlimited
      return currentCount + newCount <= mergedConfig.maxFiles;
    },
    [mergedConfig.maxFiles]
  );

  return {
    validateSingleFile,
    validateFiles,
    checkMaxFiles,
    config: mergedConfig,
  };
}
