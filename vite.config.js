import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths';
import process from 'process';
import { resolve } from 'path';
import dts from 'vite-plugin-dts'
import { comlink } from "vite-plugin-comlink";

// is production
// @ts-expect-error
const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  plugins: [
    react(),
    comlink(),
    tsconfigPaths(),
    dts({ include: ['lib', 'src'], rollupTypes: true, tsconfigPath: './tsconfig.app.json' }),
  ],
  worker: {
    plugins: [comlink(), tsconfigPaths()],
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx'],
    alias: {
      '~': "./src",
    }
  },
  build: {
    copyPublicDir: false,
    outDir: 'build',
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
    lib: {
      entry: resolve(__dirname, 'lib/main.ts'),
      formats: ['es']
    }
  },
});