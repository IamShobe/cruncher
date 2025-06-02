import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths';
import process from 'process';

// is production
const isProduction = process.env.NODE_ENV === 'production';

// https://vitejs.dev/config
export default defineConfig({
    plugins: [
        react(),
        tsconfigPaths(),
    ],
    resolve: {
        extensions: ['.js', '.ts', '.jsx', '.tsx'],
    },
});
