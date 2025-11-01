'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import toast, { Toaster } from 'react-hot-toast';
import { FileBoxModalProps, FileItem, FileStatus } from '../../types';
import { DropZone } from './DropZone';
import { FileList } from './FileList';
import { StyleInjector } from '../StyleInjector';
import { useFileValidation } from '../../hooks/useFileValidation';
import { useVirusScanner } from '../../hooks/useVirusScanner';
import { useZipArchive } from '../../hooks/useZipArchive';
import { generateFileId } from '../../utils/fileValidation';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../utils/constants';

export function FileBoxModal({
  isOpen,
  onClose,
  onComplete,
  config,
  className = '',
}: FileBoxModalProps) {
  const [fileItems, setFileItems] = useState<FileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const { validateFiles, checkMaxFiles, config: validationConfig } = useFileValidation(config);
  const { scanFiles, scanning } = useVirusScanner(config?.virusScanner);
  const { createArchive, creating, progress: archiveProgress } = useZipArchive();

  // Handle files added from dropzone
  const handleFilesAdded = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      // Check max files limit
      if (!checkMaxFiles(fileItems.length, files.length)) {
        toast.error(ERROR_MESSAGES.MAX_FILES_EXCEEDED);
        return;
      }

      // Validate files
      const existingFiles = fileItems.map((item) => item.file);
      const { results, totalSizeResult } = validateFiles(files, existingFiles);

      // Check total size
      if (!totalSizeResult.isValid) {
        toast.error(totalSizeResult.error || ERROR_MESSAGES.TOTAL_SIZE_EXCEEDED);
      }

      // Create file items
      const newFileItems: FileItem[] = results.map(({ file, result }) => ({
        id: generateFileId(file),
        file,
        status: result.isValid ? FileStatus.VALIDATING : FileStatus.INVALID,
        error: result.error,
      }));

      // Show validation errors
      const invalidFiles = newFileItems.filter((item) => item.status === FileStatus.INVALID);
      invalidFiles.forEach((item) => {
        toast.error(`${item.file.name}: ${item.error}`);
      });

      // Show success for valid files
      const validFiles = newFileItems.filter((item) => item.status === FileStatus.VALIDATING);
      if (validFiles.length > 0) {
        toast.success(`${validFiles.length} file(s) added for scanning`);
      }

      // Add to state
      setFileItems((prev) => [...prev, ...newFileItems]);

      // Start scanning valid files
      const filesToScan = newFileItems.filter((item) => item.status === FileStatus.VALIDATING);
      if (filesToScan.length > 0) {
        scanFilesAsync(filesToScan);
      }
    },
    [fileItems, checkMaxFiles, validateFiles]
  );

  // Scan files asynchronously
  const scanFilesAsync = useCallback(
    async (filesToScan: FileItem[]) => {
      const scannedFiles = await scanFiles(filesToScan, (index, updatedFile) => {
        setFileItems((prev) =>
          prev.map((item) => (item.id === updatedFile.id ? updatedFile : item))
        );
      });

      // Update all scanned files at once
      setFileItems((prev) =>
        prev.map((item) => {
          const scanned = scannedFiles.find((sf) => sf.id === item.id);
          return scanned || item;
        })
      );

      // Show toast notifications for scan results
      const cleanFiles = scannedFiles.filter((item) => item.status === FileStatus.VALID);
      const infectedFiles = scannedFiles.filter((item) => item.status === FileStatus.INFECTED);

      if (cleanFiles.length > 0) {
        toast.success(`${cleanFiles.length} file(s) passed security scan`);
      }

      if (infectedFiles.length > 0) {
        infectedFiles.forEach((item) => {
          toast.error(`${item.file.name}: ${item.error || ERROR_MESSAGES.VIRUS_DETECTED}`);
        });
      }
    },
    [scanFiles]
  );

  // Remove file
  const handleRemoveFile = useCallback((fileId: string) => {
    setFileItems((prev) => prev.filter((item) => item.id !== fileId));
    toast.success('File removed');
  }, []);

  // Create archive
  const handleCreateArchive = useCallback(async () => {
    const validFiles = fileItems.filter((item) => item.status === FileStatus.VALID);

    if (validFiles.length === 0) {
      toast.error('No valid files to archive');
      return;
    }

    setIsProcessing(true);

    try {
      const { blob, filenames } = await createArchive(fileItems);
      toast.success(SUCCESS_MESSAGES.ARCHIVE_CREATED);

      // Call completion callback
      onComplete(blob, filenames);

      // Reset and close
      setFileItems([]);
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : ERROR_MESSAGES.ZIP_ERROR
      );
    } finally {
      setIsProcessing(false);
    }
  }, [fileItems, createArchive, onComplete, onClose]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFileItems([]);
      setIsProcessing(false);
    }
  }, [isOpen]);

  const validFilesCount = fileItems.filter((item) => item.status === FileStatus.VALID).length;
  const isCreatingDisabled =
    validFilesCount === 0 || scanning || creating || isProcessing;

  return (
    <>
      <StyleInjector />
      <Toaster position="top-right" />
      <Dialog open={isOpen} onClose={onClose} className="relative z-50" data-filebox-modal>
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        {/* Modal */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel
            className={`
              mx-auto max-w-3xl w-full rounded-xl bg-white dark:bg-gray-900
              shadow-2xl p-6 ${className}
            `}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                FileBox - Create Archive
              </DialogTitle>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                         transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Drop Zone */}
            <div className="mb-6">
              <DropZone
                onFilesAdded={handleFilesAdded}
                accept={{
                  'application/pdf': ['.pdf'],
                  'text/*': ['.txt', '.md', '.html', '.json'],
                  'application/vnd.openxmlformats-officedocument.*': ['.docx', '.xlsx', '.pptx'],
                  'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.heif'],
                  'audio/*': ['.mp3', '.wav', '.ogg', '.aiff', '.aac', '.flac'],
                  'video/*': ['.mov', '.mp4', '.avi', '.wmv', '.mkv'],
                }}
                maxSize={validationConfig.maxFileSize}
                disabled={scanning || creating || isProcessing}
              />
            </div>

            {/* File List */}
            <div className="mb-6">
              <FileList files={fileItems} onRemoveFile={handleRemoveFile} />
            </div>

            {/* Archive Progress */}
            {creating && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Creating archive...
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {Math.round(archiveProgress)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${archiveProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col text-sm text-gray-600 dark:text-gray-400">
                {validFilesCount > 0 && (
                  <span>{validFilesCount} file(s) ready to archive</span>
                )}
                <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Developed by Daniel Lim
                </span>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  disabled={isProcessing}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100
                           dark:hover:bg-gray-800 rounded-lg transition-colors font-medium
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateArchive}
                  disabled={isCreatingDisabled}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg
                           font-medium transition-colors disabled:opacity-50
                           disabled:cursor-not-allowed focus:outline-none focus:ring-2
                           focus:ring-blue-500 focus:ring-offset-2"
                >
                  {creating ? 'Creating...' : 'Create Archive'}
                </button>
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
