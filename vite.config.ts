import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages serves from https://<user>.github.io/<repo>/
export default defineConfig({
  base: '/claudecertificationfoundation/',
  plugins: [react(), tailwindcss()],
})
