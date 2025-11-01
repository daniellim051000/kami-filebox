import { useState, useCallback } from 'react';
import { FileItem, FileStatus } from '../types';
import { createZipArchive } from '../services/zipService';

export function useZipArchive() {
  const [creating, setCreating] = useState(false);
  const [progress, setProgress] = useState(0);

  const createArchive = useCallback(
    async (fileItems: FileItem[]): Promise<{ blob: Blob; filenames: string[] }> => {
      setCreating(true);
      setProgress(0);

      try {
        // Filter only valid files
        const validFiles = fileItems
          .filter((item) => item.status === FileStatus.VALID)
          .map((item) => item.file);

        if (validFiles.length === 0) {
          throw new Error('No valid files to archive');
        }

        // Create ZIP archive
        const result = await createZipArchive(validFiles, (prog) => {
          setProgress(prog);
        });

        setProgress(100);
        return result;
      } finally {
        setCreating(false);
        setProgress(0);
      }
    },
    []
  );

  return {
    createArchive,
    creating,
    progress,
  };
}
