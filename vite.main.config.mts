import { defineConfig } from 'vite';

import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config
export default defineConfig({
    plugins: [
        tsconfigPaths(),
        // {
        //     name: "restart",
        //     closeBundle() {
        //         process.stdin.emit("data", "rs");
        //     },
        // },
    ],
    build: {
        rollupOptions: {
            output: {
                sourcemap: true,
            },
        },
    }
});
