// Copies the public static site (static-site/) into dist/ AFTER `vite build`
// has emitted the admin portal into dist/admin/. Runs on Netlify (Linux) and
// locally (Windows/macOS) via Node's built-in fs — no shell-specific commands.
//
// Order matters: vite build writes dist/admin/ first, then this overlays the
// public site at dist/ root without touching dist/admin/.
import { cpSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(projectRoot, 'static-site')
const dest = join(projectRoot, 'dist')

if (!existsSync(src)) {
  console.error(`[copy-static] Expected static-site/ at ${src} but it does not exist.`)
  process.exit(1)
}

cpSync(src, dest, { recursive: true })
console.log('[copy-static] Copied static-site/ -> dist/ (public site now at dist root)')
