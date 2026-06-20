import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import * as esbuild from 'esbuild';

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'build-server',
        closeBundle() {
          console.log('Building server.ts with esbuild...');
          try {
            esbuild.buildSync({
              entryPoints: ['server.ts'],
              bundle: true,
              platform: 'node',
              format: 'esm',
              packages: 'external',
              outfile: 'dist/server.js',
              sourcemap: true,
            });
            console.log('server.ts successfully compiled to dist/server.js');
          } catch (e) {
            console.error('Error compiling server.ts with esbuild:', e);
          }
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
