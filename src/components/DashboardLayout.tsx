import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, UserCheck, DollarSign, FolderKanban,
  FileText, Clock, RefreshCw, Star, CheckSquare, Calendar,
  Camera, BookOpen, Briefcase, Settings, LogOut, Menu, X,
  Image, MessageSquare
} from 'lucide-react'

const NAV_ITEMS = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/leads', label: 'Leads', icon: MessageSquare },
  { path: '/admin/clients', label: 'Clients', icon: UserCheck },
  { path: '/admin/projects', label: 'Projects', icon: FolderKanban },
  { path: '/admin/revenue', label: 'Revenue', icon: DollarSign },
  { path: '/admin/quotes', label: 'Quotes', icon: Briefcase },
  { path: '/admin/time', label: 'Time Tracker', icon: Clock },
  { path: '/admin/renewals', label: 'Renewals', icon: RefreshCw },
  { path: '/admin/blog', label: 'Blog', icon: BookOpen },
  { path: '/admin/docs', label: 'Docs', icon: FileText },
  { path: '/admin/checklists', label: 'Checklists', icon: CheckSquare },
  { path: '/admin/planner', label: 'Planner', icon: Calendar },
  { path: '/admin/photography', label: 'Photography', icon: Camera },
  { path: '/admin/testimonials', label: 'Testimonials', icon: Star },
  { path: '/admin/media', label: 'Media Library', icon: Image },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function DashboardLayout() {
  const { displayName, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function handleNav(path: string) {
    navigate(path)
    setSidebarOpen(false)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface)', fontFamily: 'var(--font-ui)' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: 260, flexShrink: 0, background: 'var(--brand)',
        borderRight: '1px solid var(--line)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, bottom: 0, left: sidebarOpen ? 0 : -260,
        zIndex: 50, transition: 'left 0.25s ease',
        ...(typeof window !== 'undefined' && window.innerWidth > 768 ? { left: 0, position: 'relative' as const } : {})
      }}>
        {/* Brand header */}
        <div style={{
          padding: '24px 20px', borderBottom: '1px solid var(--line)',
          display: 'flex', alignItems: 'center', gap: 12
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-deep))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: 'var(--brand)', flexShrink: 0
          }}>FM</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Finesse Media</div>
            <div style={{ fontSize: 10, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>Admin Portal</div>
          </div>
          <button onClick={() => setSidebarOpen(false)} style={{
            marginLeft: 'auto', background: 'none', border: 'none',
            color: 'var(--muted)', cursor: 'pointer', display: 'none'
          }} className="mobile-close">
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
          {NAV_ITEMS.map(item => {
            const active = location.pathname === item.path ||
              (item.path !== '/admin' && location.pathname.startsWith(item.path))
            const Icon = item.icon
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  width: '100%', padding: '11px 20px', border: 'none',
                  borderLeft: `3px solid ${active ? 'var(--accent)' : 'transparent'}`,
                  background: active ? 'rgba(197,164,75,0.12)' : 'transparent',
                  color: active ? 'var(--accent)' : 'var(--muted)',
                  fontSize: 14, fontFamily: 'var(--font-ui)',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.2s'
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--line)' }}>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
            Signed in as <span style={{ color: 'var(--accent)' }}>{displayName || 'Admin'}</span>
          </div>
          <button onClick={signOut} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'none', border: 'none', color: 'var(--muted)',
            cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-ui)',
            padding: 0
          }}>
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        <header style={{
          height: 56, padding: '0 24px',
          borderBottom: '1px solid var(--line)',
          display: 'flex', alignItems: 'center', gap: 16,
          background: 'var(--surface-card)'
        }}>
          <button onClick={() => setSidebarOpen(true)} style={{
            background: 'none', border: 'none', color: 'var(--text)',
            cursor: 'pointer', padding: 4
          }} className="mobile-menu">
            <Menu size={22} />
          </button>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600,
            color: 'var(--text)'
          }}>
            {NAV_ITEMS.find(n =>
              location.pathname === n.path ||
              (n.path !== '/admin' && location.pathname.startsWith(n.path))
            )?.label || 'Dashboard'}
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
