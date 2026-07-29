// Pre-generates a static shell (a copy of dist/admin/index.html) at
// dist/admin/<route>/index.html for every admin sub-route.
//
// Why: the Netlify site has a legacy site-level redirect (/* -> /index.html)
// that overrides netlify.toml and would otherwise serve the PUBLIC page on a
// hard refresh / direct link to an admin sub-route (e.g. /admin/leads).
// Netlify resolves real files before applying any redirect, so shipping a real
// index.html at each route path guarantees the admin SPA loads there; React
// Router then renders the correct view from window.location.pathname.
//
// Keep ROUTES in sync with the child routes in src/App.tsx.
import { copyFileSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const adminDir = join(projectRoot, 'dist', 'admin')
const shell = join(adminDir, 'index.html')

// Admin routes that must be reachable via hard refresh / direct URL.
const ROUTES = [
  'login',
  'leads',
  'clients',
  'projects',
  'revenue',
  'quotes',
  'time',
  'renewals',
  'blog',
  'docs',
  'checklists',
  'planner',
  'photography',
  'testimonials',
  'media',
  'settings',
]

// Fail loudly if the admin build is missing — better than silently shipping
// broken deep links.
readFileSync(shell)

for (const route of ROUTES) {
  const dir = join(adminDir, route)
  mkdirSync(dir, { recursive: true })
  copyFileSync(shell, join(dir, 'index.html'))
}

console.log(`[gen-admin-routes] Wrote ${ROUTES.length} admin route shells under dist/admin/`)
