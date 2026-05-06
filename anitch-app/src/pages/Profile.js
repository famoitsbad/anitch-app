import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../lib/AppContext'

export default function Profile() {
  const { user, profile, t, lang, switchLang } = useApp()
  const [notifTime, setNotifTime] = useState('20:00')
  const [saved, setSaved] = useState(false)

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  async function saveSettings() {
    await supabase.from('profiles').upsert({ id: user.id, language: lang })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function requestNotifications() {
    if ('Notification' in window) {
      Notification.requestPermission().then(p => {
        if (p === 'granted') alert(lang==='zh'?'提醒已開啟！':'Notifications enabled!')
        else alert(lang==='zh'?'請在瀏覽器設定中允許通知。':'Please allow notifications in browser settings.')
      })
    } else {
      alert(lang==='zh'?'您的瀏覽器不支援通知功能。':'Your browser does not support notifications.')
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.title}>{t.profile.title}</div>
      </div>

      {/* User info */}
      <div style={styles.userCard}>
        <div style={styles.avatar}>{profile?.name?profile.name[0].toUpperCase():'🌿'}</div>
        <div>
          <div style={styles.userName}>{profile?.name || 'Anitch User'}</div>
          <div style={styles.userEmail}>{user?.email}</div>
        </div>
      </div>

      {/* Language */}
      <div style={styles.card}>
        <div style={styles.cardLabel}>🌍 {t.profile.language}</div>
        <div style={styles.langRow}>
          <button style={{...styles.langBtn,...(lang==='en'?styles.langActive:{})}} onClick={()=>switchLang('en')}>
            🇬🇧 English
          </button>
          <button style={{...styles.langBtn,...(lang==='zh'?styles.langActive:{})}} onClick={()=>switchLang('zh')}>
            🇹🇼 繁體中文
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div style={styles.card}>
        <div style={styles.cardLabel}>🔔 {t.profile.notifications}</div>
        <div style={styles.notifSub}>{t.profile.notifSub}</div>
        <div style={styles.notifRow}>
          <input type="time" value={notifTime} onChange={e=>setNotifTime(e.target.value)} style={styles.timeInput}/>
          <button style={styles.notifBtn} onClick={requestNotifications}>
            {lang==='zh'?'啟用提醒':'Enable Reminders'}
          </button>
        </div>
      </div>

      {/* Save */}
      <button style={{...styles.saveBtn, background: saved?'#5A7A55':'#8FAF8A'}} onClick={saveSettings}>
        {saved ? t.profile.saved : t.profile.save}
      </button>

      {/* Logout */}
      <div style={styles.divider}/>
      <button style={styles.logoutBtn} onClick={handleLogout}>
        🚪 {t.profile.logout}
      </button>

      {/* App info */}
      <div style={styles.appInfo}>
        <div style={styles.appInfoLogo}>Anitch · {t.appSubtitle}</div>
        <div style={styles.appInfoVer}>Version 1.0.0 · Made with 🌿 for eczema warriors</div>
      </div>
    </div>
  )
}

const styles = {
  page: { padding:'16px 16px 120px', maxWidth:'500px', margin:'0 auto' },
  header: { marginBottom:'20px', paddingTop:'8px' },
  title: { fontFamily:'Georgia,serif', fontSize:'22px', fontWeight:'400', color:'#2A1F1A' },
  userCard: { background:'white', border:'1px solid #E8DDD8', borderRadius:'16px', padding:'16px', marginBottom:'14px', display:'flex', alignItems:'center', gap:'14px', boxShadow:'0 2px 8px rgba(42,31,26,0.06)' },
  avatar: { width:'50px', height:'50px', borderRadius:'50%', background:'#C5D9C2', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', fontWeight:'700', color:'#5A7A55', flexShrink:0 },
  userName: { fontFamily:'Georgia,serif', fontSize:'18px', fontWeight:'600', color:'#2A1F1A' },
  userEmail: { fontSize:'12px', color:'#B09A92', marginTop:'2px' },
  card: { background:'white', border:'1px solid #E8DDD8', borderRadius:'16px', padding:'16px', marginBottom:'14px', boxShadow:'0 2px 8px rgba(42,31,26,0.06)' },
  cardLabel: { fontSize:'11px', fontWeight:'500', letterSpacing:'0.08em', textTransform:'uppercase', color:'#B09A92', marginBottom:'12px' },
  langRow: { display:'flex', gap:'10px' },
  langBtn: { flex:1, padding:'12px', borderRadius:'12px', border:'1.5px solid #E8DDD8', background:'white', fontSize:'14px', cursor:'pointer', fontFamily:'inherit', color:'#7A6560', fontWeight:'500', transition:'all 0.2s' },
  langActive: { background:'#5A7A55', borderColor:'#5A7A55', color:'white' },
  notifSub: { fontSize:'12px', color:'#B09A92', marginBottom:'10px' },
  notifRow: { display:'flex', gap:'10px', alignItems:'center' },
  timeInput: { flex:1, padding:'10px 14px', border:'1.5px solid #E8DDD8', borderRadius:'12px', fontSize:'16px', fontFamily:'inherit', outline:'none', background:'#FFF9F4', color:'#2A1F1A' },
  notifBtn: { padding:'10px 16px', background:'#5A7A55', color:'white', border:'none', borderRadius:'12px', fontSize:'13px', fontWeight:'600', cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap' },
  saveBtn: { width:'100%', color:'white', border:'none', borderRadius:'14px', padding:'16px', fontSize:'15px', fontWeight:'600', cursor:'pointer', fontFamily:'inherit', marginBottom:'12px', transition:'all 0.2s' },
  divider: { height:'1px', background:'#E8DDD8', margin:'8px 0 16px' },
  logoutBtn: { width:'100%', background:'transparent', color:'#E86A5A', border:'1.5px solid #E86A5A', borderRadius:'14px', padding:'14px', fontSize:'15px', fontWeight:'600', cursor:'pointer', fontFamily:'inherit', marginBottom:'24px' },
  appInfo: { textAlign:'center', paddingBottom:'20px' },
  appInfoLogo: { fontFamily:'Georgia,serif', fontSize:'14px', color:'#B09A92', marginBottom:'4px' },
  appInfoVer: { fontSize:'11px', color:'#D0C4BC' },
}
