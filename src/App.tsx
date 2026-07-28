import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import DashboardLayout from './components/DashboardLayout'
import Dashboard from './pages/admin/Dashboard'
import Leads from './pages/admin/Leads'
import Clients from './pages/admin/Clients'
import Projects from './pages/admin/Projects'
import Revenue from './pages/admin/Revenue'
import Quotes from './pages/admin/Quotes'
import TimeTracker from './pages/admin/TimeTracker'
import Renewals from './pages/admin/Renewals'
import Blog from './pages/admin/Blog'
import Docs from './pages/admin/Docs'
import Checklists from './pages/admin/Checklists'
import Planner from './pages/admin/Planner'
import Photography from './pages/admin/Photography'
import Testimonials from './pages/admin/Testimonials'
import MediaLibrary from './pages/admin/MediaLibrary'
import PortalSettings from './pages/admin/PortalSettings'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth()
  if (loading) return (
    <div style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--brand)',fontFamily:'var(--font-ui)' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:48,height:48,borderRadius:'50%',border:'2px solid rgba(197,164,75,0.2)',borderTopColor:'var(--accent)',animation:'spin 0.8s linear infinite',margin:'0 auto 16px' }}/>
        <div style={{ fontSize:14,color:'var(--muted)' }}>Loading...</div>
      </div>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) return (
    <div style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--brand)',fontFamily:'var(--font-ui)',textAlign:'center',padding:40 }}>
      <div>
        <div style={{ fontSize:18,color:'#FC8181',marginBottom:12 }}>Access Denied</div>
        <div style={{ fontSize:14,color:'var(--muted)' }}>Your account is not authorized. Contact angel@finessemedia.pro.</div>
      </div>
    </div>
  )
  return <>{children}</>
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="leads" element={<Leads />} />
            <Route path="clients" element={<Clients />} />
            <Route path="projects" element={<Projects />} />
            <Route path="revenue" element={<Revenue />} />
            <Route path="quotes" element={<Quotes />} />
            <Route path="time" element={<TimeTracker />} />
            <Route path="renewals" element={<Renewals />} />
            <Route path="blog" element={<Blog />} />
            <Route path="docs" element={<Docs />} />
            <Route path="checklists" element={<Checklists />} />
            <Route path="planner" element={<Planner />} />
            <Route path="photography" element={<Photography />} />
            <Route path="testimonials" element={<Testimonials />} />
            <Route path="media" element={<MediaLibrary />} />
            <Route path="settings" element={<PortalSettings />} />
          </Route>
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
