import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../lib/AppContext'
import { theme, fonts } from '../lib/theme'
import { Home, BarChart2, ClipboardEdit, History, UserCircle } from 'lucide-react'

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useApp()

  const left = [
    { path: '/', icon: Home, label: t.nav.home },
    { path: '/insights', icon: BarChart2, label: t.nav.insights },
  ]
  const right = [
    { path: '/history', icon: History, label: t.nav.history },
    { path: '/profile', icon: UserCircle, label: t.nav.profile },
  ]

  function Tab({ path, icon: Icon, label }) {
    const active = location.pathname === path
    return (
      <button style={s.tab} onClick={() => navigate(path)}>
        {active && <div style={s.activePill} />}
        <Icon size={22} strokeWidth={active ? 2.5 : 1.8} color={active ? theme.green : '#9CA3AF'} style={{ position: 'relative', zIndex: 1 }} />
        <div style={{ ...s.label, ...(active ? s.labelActive : {}), position: 'relative', zIndex: 1 }}>{label}</div>
      </button>
    )
  }

  const isLog = location.pathname === '/log'

  return (
    <nav style={s.nav}>
      {left.map(tab => <Tab key={tab.path} {...tab} />)}

      {/* Raised Log FAB */}
      <div style={s.fabWrap}>
        <button
          style={{ ...s.fab, ...(isLog ? s.fabActive : {}) }}
          onClick={() => navigate('/log')}
          aria-label={t.nav.log}
        >
          <ClipboardEdit size={24} strokeWidth={2} color="white" />
        </button>
        <div style={{ ...s.label, color: isLog ? theme.green : '#9CA3AF', fontWeight: isLog ? '700' : '500', marginTop: '3px' }}>
          {t.nav.log}
        </div>
      </div>

      {right.map(tab => <Tab key={tab.path} {...tab} />)}
    </nav>
  )
}

const s = {
  nav: {
    position: 'fixed', bottom: 0, left: 0, right: 0,
    background: 'rgba(255,255,255,0.97)',
    backdropFilter: 'blur(12px)',
    borderTop: `1px solid ${theme.border}`,
    display: 'flex',
    alignItems: 'flex-end',
    padding: `0 0 env(safe-area-inset-bottom, 12px)`,
    zIndex: 100,
    maxWidth: '500px',
    margin: '0 auto',
    boxShadow: '0 -2px 12px rgba(0,75,57,0.06)',
    minHeight: '60px',
  },
  tab: {
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
    background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0',
    position: 'relative', fontFamily: fonts.body,
  },
  activePill: {
    position: 'absolute', top: '4px', width: '36px', height: '32px', borderRadius: '10px',
    background: theme.greenLight,
  },
  fabWrap: {
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
    paddingBottom: '6px',
  },
  fab: {
    width: '52px', height: '52px', borderRadius: '16px',
    background: theme.green,
    border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginTop: '-22px',
    boxShadow: '0 6px 20px rgba(0,75,57,0.45)',
    transition: 'transform 0.15s, box-shadow 0.15s',
  },
  fabActive: {
    boxShadow: '0 4px 12px rgba(0,75,57,0.35)',
    transform: 'scale(0.96)',
  },
  label: { fontSize: '10px', color: '#9CA3AF', fontWeight: '500', letterSpacing: '0.02em', fontFamily: fonts.body },
  labelActive: { color: theme.green, fontWeight: '700' },
}
