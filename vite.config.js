import { defineConfig } from 'vitest/config';

export default defineConfig({
    // Caminhos relativos: o app é publicado em subpastas do GitHub Pages
    // (ex.: /Drums/dev/), então URLs de assets precisam ser relativas.
    base: './',
    test: {
        // A lógica testável do engine (timing, hit detection, instrumentos) é pura,
        // então o ambiente Node basta. jsdom só entra se testarmos DOM/canvas depois.
        environment: 'node',
        include: ['src/**/*.{test,spec}.{js,ts}', 'tools/**/*.{test,spec}.{js,ts}'],
    },
});
