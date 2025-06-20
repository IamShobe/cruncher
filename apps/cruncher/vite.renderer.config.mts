import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths';
import process from 'process';
import { tanstackRouter } from '@tanstack/router-plugin/vite'

// is production
const isProduction = process.env.NODE_ENV === 'production';

// https://vitejs.dev/config
export default defineConfig({
    plugins: [
        tanstackRouter({
            target: 'react',
            // autoCodeSplitting: true,
        }),
        tsconfigPaths(),
        react(),
    ],
    resolve: {
        extensions: ['.js', '.ts', '.jsx', '.tsx'],
    },
});
