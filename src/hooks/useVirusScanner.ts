import { useState, useCallback } from 'react';
import { FileItem, FileStatus, VirusScannerConfig } from '../types';
import { scanFile } from '../services/virusScanner';

export function useVirusScanner(config?: VirusScannerConfig) {
  const [scanning, setScanning] = useState(false);

  const scanSingleFile = useCallback(
    async (fileItem: FileItem): Promise<FileItem> => {
      try {
        const result = await scanFile(fileItem.file, config);

        return {
          ...fileItem,
          status: result.isClean ? FileStatus.VALID : FileStatus.INFECTED,
          error: result.error || result.details,
        };
      } catch (error) {
        return {
          ...fileItem,
          status: FileStatus.INFECTED,
          error: error instanceof Error ? error.message : 'Scan failed',
        };
      }
    },
    [config]
  );

  const scanFiles = useCallback(
    async (
      fileItems: FileItem[],
      onProgress?: (index: number, fileItem: FileItem) => void
    ): Promise<FileItem[]> => {
      setScanning(true);

      try {
        const scannedFiles: FileItem[] = [];

        for (let i = 0; i < fileItems.length; i++) {
          const fileItem = fileItems[i];

          // Skip already validated/scanned files
          if (
            fileItem.status === FileStatus.VALID ||
            fileItem.status === FileStatus.INFECTED ||
            fileItem.status === FileStatus.INVALID
          ) {
            scannedFiles.push(fileItem);
            continue;
          }

          // Update to scanning status
          if (onProgress) {
            onProgress(i, { ...fileItem, status: FileStatus.SCANNING });
          }

          // Scan the file
          const scannedFile = await scanSingleFile(fileItem);
          scannedFiles.push(scannedFile);

          // Report progress
          if (onProgress) {
            onProgress(i, scannedFile);
          }
        }

        return scannedFiles;
      } finally {
        setScanning(false);
      }
    },
    [scanSingleFile]
  );

  return {
    scanSingleFile,
    scanFiles,
    scanning,
  };
}
