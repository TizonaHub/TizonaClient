import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
 watch: {
  // ignored: ['**/public/directories']  //*1
 }
  },
  build: {
    minify: true,
  },
  resolve: {
    alias: {
      '@assets': path.resolve(__dirname, './src/assets'),
      '@src': path.resolve(__dirname, './src/'),
    },
  },
})

/**
 * -1 -> On windows, when I tried to rename a folder which had another folder named the same, 
 * I couldn't delete it because something was using the child folder. 
 * When I stopped development server, I was able to
 * delete It. Adding this avoids this problem
 */
