import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Widget build configuration - outputs single IIFE bundle
export default defineConfig({
    plugins: [react()],
    define: {
        'process.env.NODE_ENV': JSON.stringify('production'),
    },
    build: {
        lib: {
            entry: 'src/index.tsx',
            name: 'NexusAIWidget',
            fileName: () => 'widget.js',
            formats: ['iife'],
        },
        rollupOptions: {
            // Bundle everything into a single file
            output: {
                inlineDynamicImports: true,
                manualChunks: undefined,
            },
        },
        cssCodeSplit: false,
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
            },
        },
    },
})
