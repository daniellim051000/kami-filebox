import { useState, useCallback } from 'react';
import { FileItem, FileStatus, VirusScannerConfig } from '../types';
import { scanFile } from '../services/virusScanner';

// Concurrent scanning configuration
const CONCURRENT_SCAN_LIMIT = 3;

/**
 * Process items concurrently with a concurrency limit
 */
async function processWithConcurrency<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R>,
  limit: number
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let currentIndex = 0;

  async function runNext(): Promise<void> {
    const index = currentIndex++;
    if (index >= items.length) return;

    results[index] = await processor(items[index], index);
    await runNext();
  }

  // Start initial batch of concurrent operations
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => runNext())
  );

  return results;
}

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
        // Filter files that need scanning
        const filesToScan = fileItems.filter(
          (item) =>
            item.status !== FileStatus.VALID &&
            item.status !== FileStatus.INFECTED &&
            item.status !== FileStatus.INVALID
        );

        // If no files need scanning, return original items
        if (filesToScan.length === 0) {
          return fileItems;
        }

        // Scan files concurrently with limit
        const scannedResults = await processWithConcurrency(
          filesToScan,
          async (fileItem, index) => {
            // Update to scanning status
            if (onProgress) {
              onProgress(index, { ...fileItem, status: FileStatus.SCANNING });
            }

            // Scan the file
            const scannedFile = await scanSingleFile(fileItem);

            // Report progress
            if (onProgress) {
              onProgress(index, scannedFile);
            }

            return scannedFile;
          },
          CONCURRENT_SCAN_LIMIT
        );

        // Merge scanned results back with original items
        const scannedMap = new Map(
          scannedResults.map((item) => [item.id, item])
        );

        return fileItems.map((item) => scannedMap.get(item.id) || item);
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
