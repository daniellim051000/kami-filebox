import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'next'],
  treeshake: true,
  minify: true,
  // Inject CSS into JS bundle for auto-import
  injectStyle: true,
  // Handle CSS files
  esbuildOptions(options) {
    options.loader = {
      ...options.loader,
      '.css': 'css',
    };
  },
});
