import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../lib/AppContext'

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
    <nav style={styles.nav}>
      {tabs.map(tab=>{
        const active = location.pathname === tab.path
        return (
          <button key={tab.path} style={styles.tab} onClick={()=>navigate(tab.path)}>
            <div style={{fontSize:'22px',lineHeight:1}}>{tab.icon}</div>
            <div style={{...styles.label,...(active?styles.labelActive:{})}}>{tab.label}</div>
            {active && <div style={styles.dot}/>}
          </button>
        )
      })}
    </nav>
  )
}

const styles = {
  nav: { position:'fixed', bottom:0, left:0, right:0, background:'rgba(255,249,244,0.95)', backdropFilter:'blur(12px)', borderTop:'1px solid #E8DDD8', display:'flex', padding:'8px 0 env(safe-area-inset-bottom,8px)', zIndex:100, maxWidth:'500px', margin:'0 auto' },
  tab: { flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'2px', background:'none', border:'none', cursor:'pointer', padding:'6px 0', position:'relative' },
  label: { fontSize:'10px', color:'#B09A92', fontWeight:'500', fontFamily:'inherit' },
  labelActive: { color:'#5A7A55', fontWeight:'600' },
  dot: { position:'absolute', bottom:'2px', width:'4px', height:'4px', borderRadius:'50%', background:'#5A7A55' },
}
