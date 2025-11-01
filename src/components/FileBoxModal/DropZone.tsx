'use client';

import React from 'react';
import { useDropzone } from 'react-dropzone';

interface DropZoneProps {
  onFilesAdded: (files: File[]) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  disabled?: boolean;
}

export function DropZone({
  onFilesAdded,
  accept,
  maxSize,
  disabled = false,
}: DropZoneProps) {
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop: onFilesAdded,
    accept,
    maxSize,
    disabled,
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        relative border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
        transition-all duration-200 ease-in-out
        ${
          isDragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
            : isDragReject
            ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
            : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center justify-center space-y-4">
        {/* Upload Icon */}
        <svg
          className={`w-16 h-16 transition-colors ${
            isDragActive
              ? 'text-blue-500'
              : isDragReject
              ? 'text-red-500'
              : 'text-gray-400 dark:text-gray-600'
          }`}
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

        {/* Text */}
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
            {isDragActive
              ? 'Drop files here'
              : isDragReject
              ? 'Some files are not supported'
              : 'Drop files here or click to browse'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Supported files: PDF, Images, Audio, Video, Documents
          </p>
        </div>

        {/* Browse Button */}
        {!isDragActive && (
          <button
            type="button"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg
                     font-medium transition-colors focus:outline-none focus:ring-2
                     focus:ring-blue-500 focus:ring-offset-2"
            disabled={disabled}
          >
            Browse Files
          </button>
        )}
      </div>
    </div>
  );
}
