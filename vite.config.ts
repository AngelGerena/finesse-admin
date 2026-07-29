import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// The admin portal is served under /admin/ on finessemedia.pro.
// `base` rewrites all asset URLs to /admin/..., and the build is emitted
// into dist/admin/ so the public static site can occupy the dist/ root.
export default defineConfig({
  base: '/admin/',
  plugins: [react()],
  build: {
    outDir: 'dist/admin',
    emptyOutDir: true,
  },
})
