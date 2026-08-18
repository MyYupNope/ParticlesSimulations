import { defineConfig } from 'vite';

export default defineConfig({
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
