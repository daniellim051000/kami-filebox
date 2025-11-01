'use client';

import { useState } from 'react';
import { FileBoxModal } from '../src/components/FileBoxModal';
import { downloadBlob, generateZipFilename } from '../src/services/zipService';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastArchive, setLastArchive] = useState<{
    filename: string;
    fileCount: number;
  } | null>(null);

  const handleComplete = (zipBlob: Blob, filenames: string[]) => {
    // Generate filename and download
    const filename = generateZipFilename('my-filebox');
    downloadBlob(zipBlob, filename);

    // Store info for display
    setLastArchive({
      filename,
      fileCount: filenames.length,
    });

    console.log('Archive created:', {
      filename,
      size: zipBlob.size,
      files: filenames,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            KAMI FileBox
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            A secure file collection and archiving library for Next.js
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Demo Application
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {/* Demo Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Try It Out
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Click the button below to open the FileBox modal and start collecting files.
              All files are validated, scanned for security, and packaged into a ZIP archive.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700
                       text-white font-semibold rounded-lg shadow-lg
                       transition-all duration-200 transform hover:scale-105
                       focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              Open FileBox
            </button>

            {/* Last Archive Info */}
            {lastArchive && (
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200
                           dark:border-green-800 rounded-lg">
                <div className="flex items-start">
                  <svg
                    className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800 dark:text-green-300">
                      Archive created successfully!
                    </h3>
                    <div className="mt-1 text-sm text-green-700 dark:text-green-400">
                      <p>Filename: {lastArchive.filename}</p>
                      <p>Files: {lastArchive.fileCount}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <svg
                    className="w-6 h-6 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-900 dark:text-white">
                  Security First
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Files are validated and scanned for security threats before archiving.
                Only safe files are included.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <svg
                    className="w-6 h-6 text-purple-600 dark:text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-900 dark:text-white">
                  Drag & Drop
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Intuitive drag-and-drop interface with file browser support for easy file selection.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <svg
                    className="w-6 h-6 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-900 dark:text-white">
                  File Validation
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Automatic validation of file types, sizes, and formats. Only allowed file types are accepted.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <svg
                    className="w-6 h-6 text-orange-600 dark:text-orange-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-900 dark:text-white">
                  ZIP Archive
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                All validated files are packaged into a single ZIP archive for easy download and sharing.
              </p>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800
                        rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
              Supported File Types
            </h3>
            <div className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
              <p><strong>Documents:</strong> PDF, TXT, DOCX, XLSX, PPTX, HTML, MD, JSON</p>
              <p><strong>Images:</strong> JPG, PNG, GIF, WEBP, SVG, BMP, HEIF</p>
              <p><strong>Audio:</strong> MP3, WAV, OGG, AIFF, AAC, FLAC</p>
              <p><strong>Video:</strong> MOV, MP4, AVI, WMV, MKV</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pb-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Developed by Daniel Lim
          </p>
        </div>
      </div>

      {/* FileBox Modal */}
      <FileBoxModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onComplete={handleComplete}
        config={{
          maxFileSize: 10 * 1024 * 1024, // 10MB
          maxTotalSize: 50 * 1024 * 1024, // 50MB
        }}
      />
    </div>
  );
}
