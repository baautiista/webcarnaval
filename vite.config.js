import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        agrupaciones: resolve(__dirname, 'agrupaciones.html'),
        agrupacion: resolve(__dirname, 'agrupacion.html'),
        autores: resolve(__dirname, 'autores.html'),
        autor: resolve(__dirname, 'autor.html'),
        componentes: resolve(__dirname, 'componentes.html'),
        persona: resolve(__dirname, 'persona.html'),
        fototeca: resolve(__dirname, 'fototeca.html'),
        videos: resolve(__dirname, 'videos.html'),
        municipios: resolve(__dirname, 'municipios.html'),
        municipio: resolve(__dirname, 'municipio.html'),
        cronologia: resolve(__dirname, 'cronologia.html'),
        aporta: resolve(__dirname, 'aporta.html'),
        proyecto: resolve(__dirname, 'proyecto.html'),
        admin: resolve(__dirname, 'admin.html'),
      }
    }
  },
  // Silence the non-module script warnings — JS files use window globals intentionally
  logLevel: 'error'
});
