import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [tailwindcss()],
    // Set base to the GitHub Pages repository path
    base: '/ParticlesSimulations/',
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    three: ['three'],
                },
            },
        },
    },
});
