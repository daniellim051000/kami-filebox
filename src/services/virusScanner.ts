import { ScanResult, VirusScannerConfig } from '../types';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants';
import { isSuspiciousFilename } from '../utils/fileValidation';

/**
 * Client-side file security scanner
 * Performs basic security checks without actual virus scanning
 * For production use, integrate with a server-side virus scanning API
 */

/**
 * Checks file header (magic bytes) to verify file type matches extension
 */
async function verifyFileSignature(file: File): Promise<boolean> {
  try {
    const blob = file.slice(0, 4);
    const arrayBuffer = await blob.arrayBuffer();
    const header = new Uint8Array(arrayBuffer);

    // Common file signatures
    const signatures: { [key: string]: number[][] } = {
      pdf: [[0x25, 0x50, 0x44, 0x46]], // %PDF
      png: [[0x89, 0x50, 0x4e, 0x47]], // PNG
      jpg: [[0xff, 0xd8, 0xff]], // JPEG
      gif: [[0x47, 0x49, 0x46, 0x38]], // GIF8
      zip: [[0x50, 0x4b, 0x03, 0x04]], // PK
      mp3: [[0xff, 0xfb], [0x49, 0x44, 0x33]], // MP3 or ID3
      mp4: [[0x66, 0x74, 0x79, 0x70]], // ftyp (at offset 4)
      webp: [[0x57, 0x45, 0x42, 0x50]], // WEBP
    };

    // For files with known signatures, verify them
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext && signatures[ext]) {
      const validSignatures = signatures[ext];
      const matchesSignature = validSignatures.some((sig) =>
        sig.every((byte, i) => header[i] === byte)
      );

      // If we have a signature for this type but it doesn't match, it's suspicious
      if (!matchesSignature && ext !== 'txt' && ext !== 'json' && ext !== 'md') {
        return false;
      }
    }

    return true;
  } catch {
    // If we can't read the file, consider it suspicious
    return false;
  }
}

/**
 * Checks for potentially malicious content in text files
 */
async function scanTextContent(file: File): Promise<boolean> {
  // Only scan small text files to avoid performance issues
  if (file.size > 1024 * 1024) return true; // Skip files > 1MB

  const fileType = file.type;
  if (
    !fileType.startsWith('text/') &&
    !fileType.includes('json') &&
    !fileType.includes('markdown')
  ) {
    return true; // Not a text file, skip content scan
  }

  try {
    const text = await file.text();

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /<script[^>]*>[\s\S]*?<\/script>/gi, // Script tags
      /javascript:/gi, // JavaScript protocol
      /on\w+\s*=/gi, // Event handlers (onclick, onload, etc.)
      /eval\s*\(/gi, // eval function
      /base64/gi, // Base64 encoding (often used to hide malicious code)
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(text)) {
        return false;
      }
    }

    return true;
  } catch {
    return true; // If we can't read it, let it pass
  }
}

/**
 * Performs client-side security checks on a file
 * This is NOT a replacement for proper virus scanning!
 */
export async function scanFile(
  file: File,
  config?: VirusScannerConfig
): Promise<ScanResult> {
  try {
    // Check if scanning is enabled
    if (config?.enabled === false) {
      return {
        isClean: true,
        details: 'Scanning disabled',
      };
    }

    // Check for suspicious filename
    if (isSuspiciousFilename(file.name)) {
      return {
        isClean: false,
        error: ERROR_MESSAGES.VIRUS_DETECTED,
        details: 'Suspicious filename detected',
      };
    }

    // Verify file signature matches extension
    const signatureValid = await verifyFileSignature(file);
    if (!signatureValid) {
      return {
        isClean: false,
        error: ERROR_MESSAGES.VIRUS_DETECTED,
        details: 'File signature does not match extension',
      };
    }

    // Scan text content for suspicious patterns
    const contentSafe = await scanTextContent(file);
    if (!contentSafe) {
      return {
        isClean: false,
        error: ERROR_MESSAGES.VIRUS_DETECTED,
        details: 'Suspicious content detected',
      };
    }

    // If API endpoint is provided, use server-side scanning
    if (config?.apiEndpoint) {
      return await scanFileWithAPI(file, config);
    }

    // All checks passed
    return {
      isClean: true,
      details: SUCCESS_MESSAGES.SCAN_PASSED,
    };
  } catch (error) {
    return {
      isClean: false,
      error: ERROR_MESSAGES.SCAN_ERROR,
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Scans file using server-side API
 */
async function scanFileWithAPI(
  file: File,
  config: VirusScannerConfig
): Promise<ScanResult> {
  if (!config.apiEndpoint) {
    throw new Error('API endpoint not configured');
  }

  try {
    const formData = new FormData();
    formData.append('file', file);

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, config.timeout || 30000);

    const response = await fetch(config.apiEndpoint, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const result = await response.json();

    return {
      isClean: result.isClean || result.safe || !result.infected,
      error: result.error,
      details: result.details || result.message,
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        isClean: false,
        error: ERROR_MESSAGES.SCAN_ERROR,
        details: 'Scan timeout',
      };
    }

    throw error;
  }
}

/**
 * Scans multiple files in parallel with concurrency limit
 */
export async function scanFiles(
  files: File[],
  config?: VirusScannerConfig,
  onProgress?: (fileIndex: number, result: ScanResult) => void,
  concurrency: number = 3
): Promise<ScanResult[]> {
  const results: ScanResult[] = [];
  const queue = [...files];

  async function processFile(index: number): Promise<void> {
    const file = queue[index];
    const result = await scanFile(file, config);
    results[index] = result;
    onProgress?.(index, result);
  }

  // Process files with concurrency limit
  const chunks: Promise<void>[][] = [];
  for (let i = 0; i < queue.length; i += concurrency) {
    const chunk = queue.slice(i, i + concurrency).map((_, idx) => processFile(i + idx));
    chunks.push(chunk);
  }

  for (const chunk of chunks) {
    await Promise.all(chunk);
  }

  return results;
}
