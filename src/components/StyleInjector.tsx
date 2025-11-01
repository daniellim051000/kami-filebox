'use client';

import { useEffect } from 'react';

/**
 * StyleInjector component
 *
 * Automatically injects the FileBox styles into the document head.
 * This eliminates the need for users to manually import styles.css.
 *
 * Features:
 * - Prevents duplicate style injection
 * - Works with SSR (Next.js compatible)
 * - Injects styles only once per page
 * - Cleans up on unmount if needed
 */
export function StyleInjector() {
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    const STYLE_ID = 'filebox-injected-styles';

    // Check if styles are already injected
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    // Check if user has manually imported styles
    const existingStylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    const hasManualImport = existingStylesheets.some(link =>
      link.getAttribute('href')?.includes('filebox') ||
      link.getAttribute('href')?.includes('styles.css')
    );

    if (hasManualImport) {
      // User has manually imported styles, don't inject
      return;
    }

    // Create and inject style element
    const styleElement = document.createElement('style');
    styleElement.id = STYLE_ID;
    styleElement.setAttribute('data-filebox', 'auto-injected');

    // This will be replaced during the build process with actual CSS content
    // For now, we'll inject a marker that the build tool will replace
    styleElement.textContent = '/* FileBox styles will be injected here during build */';

    document.head.appendChild(styleElement);

    // Cleanup function (optional - styles typically persist for app lifetime)
    return () => {
      // Only remove if this is the last FileBox component instance
      const fileBoxComponents = document.querySelectorAll('[data-filebox-modal]');
      if (fileBoxComponents.length === 0) {
        const element = document.getElementById(STYLE_ID);
        if (element?.getAttribute('data-filebox') === 'auto-injected') {
          element.remove();
        }
      }
    };
  }, []);

  return null;
}
