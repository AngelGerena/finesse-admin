import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Users, FolderKanban, DollarSign, MessageSquare, Clock, RefreshCw } from 'lucide-react'

interface Stats {
  leads: number; clients: number; projects: number; revenue: number;
  pendingRenewals: number; hoursThisMonth: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ leads: 0, clients: 0, projects: 0, revenue: 0, pendingRenewals: 0, hoursThisMonth: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [leadsR, clientsR, projectsR, revenueR, renewalsR, timeR] = await Promise.all([
        supabase.from('leads').select('id', { count: 'exact', head: true }).is('deleted_at', null).eq('status', 'new'),
        supabase.from('clients').select('id', { count: 'exact', head: true }).is('deleted_at', null),
        supabase.from('projects').select('id', { count: 'exact', head: true }).is('deleted_at', null).in('status', ['planning', 'in_progress', 'review']),
        supabase.from('revenue').select('amount'),
        supabase.from('renewals').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('time_entries').select('hours').gte('date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
      ])
      const totalRevenue = (revenueR.data || []).reduce((sum, r) => sum + Number(r.amount || 0), 0)
      const totalHours = (timeR.data || []).reduce((sum, t) => sum + Number(t.hours || 0), 0)
      setStats({
        leads: leadsR.count || 0,
        clients: clientsR.count || 0,
        projects: projectsR.count || 0,
        revenue: totalRevenue,
        pendingRenewals: renewalsR.count || 0,
        hoursThisMonth: totalHours
      })
      setLoading(false)
    }
    load()
  }, [])

  const cards = [
    { label: 'New Leads', value: stats.leads, icon: MessageSquare, color: '#C5A44B' },
    { label: 'Active Clients', value: stats.clients, icon: Users, color: '#6B8CAE' },
    { label: 'Active Projects', value: stats.projects, icon: FolderKanban, color: '#8BAA97' },
    { label: 'Total Revenue', value: `$${stats.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: '#C5A44B' },
    { label: 'Active Renewals', value: stats.pendingRenewals, icon: RefreshCw, color: '#6B8CAE' },
    { label: 'Hours This Month', value: stats.hoursThisMonth.toFixed(1), icon: Clock, color: '#8BAA97' },
  ]

  if (loading) return <div style={{ color: 'var(--muted)', padding: 40, textAlign: 'center' }}>Loading dashboard...</div>

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300, color: 'var(--text)', margin: 0 }}>
          Welcome back, <em style={{ color: 'var(--accent)' }}>Angel.</em>
        </h2>
        <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>Here is your business at a glance.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {cards.map(card => {
          const Icon = card.icon
          return (
            <div key={card.label} style={{
              background: 'var(--surface-card)', border: '1px solid var(--line)',
              borderRadius: 12, padding: '24px 20px', transition: 'all 0.2s'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: `${card.color}15`, border: `1px solid ${card.color}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Icon size={20} color={card.color} />
                </div>
              </div>
              <div style={{ fontSize: 28, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>{card.value}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 4 }}>{card.label}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
