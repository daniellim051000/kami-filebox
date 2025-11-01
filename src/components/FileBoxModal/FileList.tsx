'use client';

import React from 'react';
import { FileItem, FileStatus } from '../../types';
import { formatFileSize } from '../../utils/fileValidation';

interface FileListProps {
  files: FileItem[];
  onRemoveFile: (fileId: string) => void;
}

export function FileList({ files, onRemoveFile }: FileListProps) {
  if (files.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        No files added yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Selected Files ({files.length})
      </h3>
      <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
        {files.map((fileItem) => (
          <FileListItem
            key={fileItem.id}
            fileItem={fileItem}
            onRemove={() => onRemoveFile(fileItem.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface FileListItemProps {
  fileItem: FileItem;
  onRemove: () => void;
}

function FileListItem({ fileItem, onRemove }: FileListItemProps) {
  const { file, status, error, progress } = fileItem;

  const getStatusIcon = () => {
    switch (status) {
      case FileStatus.VALID:
        return (
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case FileStatus.INVALID:
      case FileStatus.INFECTED:
        return (
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      case FileStatus.VALIDATING:
      case FileStatus.SCANNING:
        return (
          <svg
            className="w-5 h-5 text-blue-500 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  const getStatusText = () => {
    switch (status) {
      case FileStatus.VALIDATING:
        return 'Validating...';
      case FileStatus.SCANNING:
        return 'Scanning...';
      case FileStatus.VALID:
        return 'Ready';
      case FileStatus.INVALID:
        return error || 'Invalid';
      case FileStatus.INFECTED:
        return error || 'Failed scan';
      default:
        return 'Pending';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case FileStatus.VALID:
        return 'text-green-600 dark:text-green-400';
      case FileStatus.INVALID:
      case FileStatus.INFECTED:
        return 'text-red-600 dark:text-red-400';
      case FileStatus.VALIDATING:
      case FileStatus.SCANNING:
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const canRemove = status !== FileStatus.VALIDATING && status !== FileStatus.SCANNING;

  return (
    <div
      className={`
        flex items-center justify-between p-3 rounded-lg border
        ${
          status === FileStatus.VALID
            ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20'
            : status === FileStatus.INVALID || status === FileStatus.INFECTED
            ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20'
            : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
        }
      `}
    >
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        {/* Status Icon */}
        <div className="flex-shrink-0">{getStatusIcon()}</div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {file.name}
          </p>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatFileSize(file.size)}
            </span>
            <span className={`text-xs ${getStatusColor()}`}>{getStatusText()}</span>
          </div>
          {/* Progress bar */}
          {progress !== undefined && progress < 100 && (
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-2">
              <div
                className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Remove Button */}
      {canRemove && (
        <button
          onClick={onRemove}
          className="ml-3 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700
                   transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
          aria-label="Remove file"
        >
          <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
