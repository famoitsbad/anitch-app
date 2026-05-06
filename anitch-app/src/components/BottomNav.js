import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../lib/AppContext'
import { theme, fonts } from '../lib/theme'

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useApp()

  const tabs = [
    { path:'/', icon:'🏠', label:t.nav.home },
    { path:'/log', icon:'📝', label:t.nav.log },
    { path:'/history', icon:'📅', label:t.nav.history },
    { path:'/insights', icon:'📊', label:t.nav.insights },
    { path:'/profile', icon:'👤', label:t.nav.profile },
  ]

  return (
    <nav style={s.nav}>
      {tabs.map(tab => {
        const active = location.pathname === tab.path
        return (
          <button key={tab.path} style={s.tab} onClick={() => navigate(tab.path)}>
            {active && <div style={s.activePill}/>}
            <div style={{fontSize:'20px',lineHeight:1,position:'relative',zIndex:1}}>{tab.icon}</div>
            <div style={{...s.label,...(active?s.labelActive:{}),position:'relative',zIndex:1}}>{tab.label}</div>
          </button>
        )
      })}
    </nav>
  )
}

const s = {
  nav:{
    position:'fixed',bottom:0,left:0,right:0,
    background:'rgba(255,255,255,0.97)',
    backdropFilter:'blur(12px)',
    borderTop:`1px solid ${theme.border}`,
    display:'flex',
    padding:'8px 0 env(safe-area-inset-bottom,8px)',
    zIndex:100,
    maxWidth:'500px',
    margin:'0 auto',
    boxShadow:'0 -2px 12px rgba(0,75,57,0.06)',
  },
  tab:{
    flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'2px',
    background:'none',border:'none',cursor:'pointer',padding:'6px 0',
    position:'relative',fontFamily:fonts.body,
  },
  activePill:{
    position:'absolute',top:'4px',width:'32px',height:'32px',borderRadius:'10px',
    background:theme.greenLight,
  },
  label:{fontSize:'10px',color:theme.textMuted,fontWeight:'500',letterSpacing:'0.02em'},
  labelActive:{color:theme.green,fontWeight:'700'},
}
