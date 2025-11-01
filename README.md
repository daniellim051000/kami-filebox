# KAMI FileBox

A secure, client-side file collection and archiving library for Next.js applications. Easily collect, validate, scan, and package multiple files into a ZIP archive with a beautiful modal interface.

## Features

- **Secure File Validation**: Whitelist-based file type validation by extension and MIME type
- **Client-Side Security Scanning**: Basic security checks including file signature verification and content scanning
- **Drag & Drop Interface**: Intuitive file selection with drag-and-drop support
- **ZIP Archive Creation**: Automatic packaging of validated files into a ZIP archive
- **Real-time Status Updates**: Visual feedback for validation and scanning progress
- **Toast Notifications**: User-friendly notifications for all operations
- **TypeScript Support**: Full TypeScript support with comprehensive type definitions
- **Customizable**: Configurable file size limits, allowed types, and scanning options
- **Dark Mode Support**: Built-in dark mode styling

## Development

To run the demo application:

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build the library
npm run build:lib

# Build the Next.js app
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to see the demo.

## Installation

```bash
npm install @daniellim0510/filebox
# or
yarn add @daniellim0510/filebox
# or
pnpm add @daniellim0510/filebox
```

## Quick Start

```tsx
'use client';

import { useState } from 'react';
import { FileBoxModal } from '@daniellim0510/filebox';

export default function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  const handleComplete = (zipBlob: Blob, filenames: string[]) => {
    // Handle the created ZIP archive
    console.log('Archive created with files:', filenames);

    // Download the archive
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'my-archive.zip';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Open FileBox
      </button>

      <FileBoxModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onComplete={handleComplete}
      />
    </>
  );
}
```

## Supported File Types

### Documents
- PDF (`.pdf`)
- Text (`.txt`)
- Word (`.docx`)
- Excel (`.xlsx`)
- PowerPoint (`.pptx`)
- HTML (`.html`)
- Markdown (`.md`)
- JSON (`.json`)

### Images
- JPEG (`.jpg`, `.jpeg`)
- PNG (`.png`)
- GIF (`.gif`)
- WebP (`.webp`)
- SVG (`.svg`)
- BMP (`.bmp`)
- HEIF (`.heif`)

### Audio
- MP3 (`.mp3`)
- WAV (`.wav`)
- OGG (`.ogg`)
- AIFF (`.aiff`)
- AAC (`.aac`)
- FLAC (`.flac`)

### Video
- QuickTime (`.mov`)
- MP4 (`.mp4`)
- AVI (`.avi`)
- WMV (`.wmv`)
- MKV (`.mkv`)

## Configuration

You can customize FileBox behavior by passing a `config` prop:

```tsx
<FileBoxModal
  isOpen={isOpen}
  onClose={onClose}
  onComplete={handleComplete}
  config={{
    maxFileSize: 10 * 1024 * 1024,      // 10MB per file
    maxTotalSize: 50 * 1024 * 1024,     // 50MB total
    maxFiles: 20,                        // Maximum 20 files
    allowedExtensions: ['.pdf', '.jpg'], // Custom allowed extensions
    allowedMimeTypes: ['application/pdf', 'image/jpeg'], // Custom MIME types
    virusScanner: {
      enabled: true,                     // Enable/disable scanning
      apiEndpoint: '/api/scan',          // Custom scan API endpoint
      timeout: 30000,                    // Scan timeout in ms
    },
  }}
/>
```

## API Reference

### FileBoxModal Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | `boolean` | Yes | Controls modal visibility |
| `onClose` | `() => void` | Yes | Callback when modal should close |
| `onComplete` | `(zipBlob: Blob, filenames: string[]) => void` | Yes | Callback when archive is created |
| `config` | `FileBoxConfig` | No | Configuration options |
| `className` | `string` | No | Additional CSS classes |

### FileBoxConfig

```typescript
interface FileBoxConfig {
  maxFileSize?: number;        // Max size per file in bytes (default: 10MB)
  maxTotalSize?: number;       // Max total size in bytes (default: 50MB)
  maxFiles?: number;           // Max number of files (default: unlimited)
  allowedExtensions?: string[]; // Allowed file extensions
  allowedMimeTypes?: string[];  // Allowed MIME types
  virusScanner?: VirusScannerConfig;
}

interface VirusScannerConfig {
  enabled?: boolean;    // Enable scanning (default: true)
  apiEndpoint?: string; // Custom API endpoint for server-side scanning
  timeout?: number;     // Scan timeout in ms (default: 30000)
}
```

## Security Notes

1. **Client-Side Scanning Limitations**: The built-in client-side scanning performs basic security checks but is NOT a replacement for proper virus scanning. For production use, integrate with a server-side virus scanner like ClamAV.

2. **File Validation**: Always validate files on both client and server side. Never trust client-side validation alone.

3. **MIME Type Spoofing**: The library checks both file extensions and MIME types, but determined attackers can still spoof these. Use server-side scanning for critical applications.

4. **File Size Limits**: Configure appropriate file size limits to prevent memory issues and DoS attacks.



## License

MIT

## Author

Daniel Lim

## Repository

[https://github.com/daniellim051000/kami-filebox](https://github.com/daniellim051000/kami-filebox)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please use the [GitHub issue tracker](https://github.com/daniellim051000/kami-filebox/issues).
