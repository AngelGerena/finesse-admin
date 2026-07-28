import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  isAdmin: boolean
  role: string | null
  displayName: string | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [role, setRole] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function checkAdminStatus(userId: string) {
    const { data, error } = await supabase
      .from('admin_users')
      .select('role, display_name')
      .eq('user_id', userId)
      .single()
    if (data && !error) {
      setIsAdmin(true)
      setRole(data.role)
      setDisplayName(data.display_name)
    } else {
      setIsAdmin(false)
      setRole(null)
      setDisplayName(null)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setUser(s?.user ?? null)
      if (s?.user) {
        setTimeout(() => checkAdminStatus(s.user.id), 0)
      }
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      setUser(s?.user ?? null)
      if (s?.user) {
        setTimeout(() => checkAdminStatus(s.user.id), 0)
      } else {
        setIsAdmin(false)
        setRole(null)
        setDisplayName(null)
      }
    })
    const timeout = setTimeout(() => setLoading(false), 5000)
    return () => { subscription.unsubscribe(); clearTimeout(timeout) }
  }, [])

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return { error: null }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setIsAdmin(false)
    setRole(null)
    setDisplayName(null)
  }

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, role, displayName, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
