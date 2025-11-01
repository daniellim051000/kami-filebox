import JSZip from 'jszip';
import { ERROR_MESSAGES } from '../utils/constants';

/**
 * Creates a ZIP archive from an array of files
 */
export async function createZipArchive(
  files: File[],
  onProgress?: (progress: number) => void
): Promise<{ blob: Blob; filenames: string[] }> {
  try {
    if (!files || files.length === 0) {
      throw new Error(ERROR_MESSAGES.NO_FILES);
    }

    const zip = new JSZip();
    const filenames: string[] = [];

    // Add files to ZIP
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const arrayBuffer = await file.arrayBuffer();

      // Handle duplicate filenames by appending a number
      let filename = file.name;
      let counter = 1;
      while (filenames.includes(filename)) {
        const nameParts = file.name.split('.');
        const ext = nameParts.pop();
        const baseName = nameParts.join('.');
        filename = `${baseName}_${counter}.${ext}`;
        counter++;
      }

      zip.file(filename, arrayBuffer);
      filenames.push(filename);

      // Report progress
      if (onProgress) {
        const progress = ((i + 1) / files.length) * 50; // 0-50% for adding files
        onProgress(progress);
      }
    }

    // Generate ZIP blob
    const blob = await zip.generateAsync(
      {
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: {
          level: 6, // Medium compression
        },
      },
      (metadata) => {
        // Report progress for ZIP generation (50-100%)
        if (onProgress) {
          const progress = 50 + metadata.percent / 2;
          onProgress(progress);
        }
      }
    );

    return {
      blob,
      filenames,
    };
  } catch (error) {
    throw new Error(
      `${ERROR_MESSAGES.ZIP_ERROR}: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

/**
 * Downloads a blob as a file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates a filename for the ZIP archive
 */
export function generateZipFilename(prefix: string = 'filebox'): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  return `${prefix}-${timestamp}.zip`;
}
