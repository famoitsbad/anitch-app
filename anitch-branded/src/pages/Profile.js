import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../lib/AppContext'
import { theme, fonts } from '../lib/theme'

export default function Profile() {
  const {user,profile,t,lang,switchLang} = useApp()
  const [saved, setSaved] = useState(false)

  async function handleLogout(){await supabase.auth.signOut()}

  async function saveSettings(){
    await supabase.from('profiles').upsert({id:user.id,language:lang})
    setSaved(true);setTimeout(()=>setSaved(false),2000)
  }

  function requestNotifications(){
    if('Notification' in window){
      Notification.requestPermission().then(p=>{
        if(p==='granted')alert(lang==='zh'?'提醒已開啟！':'Reminders enabled!')
        else alert(lang==='zh'?'請在瀏覽器設定中允許通知。':'Please allow notifications in your browser settings.')
      })
    }
  }

  return(
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.logoText}>anitch™</div>
        <div style={s.title}>{t.profile.title}</div>
      </div>

      <div style={s.body}>
        {/* User card */}
        <div style={s.userCard}>
          <div style={s.avatar}>{profile?.name?profile.name[0].toUpperCase():'A'}</div>
          <div>
            <div style={s.userName}>{profile?.name||'Anitch User'}</div>
            <div style={s.userEmail}>{user?.email}</div>
          </div>
        </div>

        {/* Language */}
        <div style={s.card}>
          <div style={s.cardLabel}>🌍 {t.profile.language}</div>
          <div style={s.langRow}>
            <button style={{...s.langBtn,...(lang==='en'?s.langActive:{})}} onClick={()=>switchLang('en')}>
              🇬🇧 English
            </button>
            <button style={{...s.langBtn,...(lang==='zh'?s.langActive:{})}} onClick={()=>switchLang('zh')}>
              🇹🇼 繁體中文
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div style={s.card}>
          <div style={s.cardLabel}>🔔 {t.profile.notifications}</div>
          <div style={s.notifSub}>{t.profile.notifSub}</div>
          <button style={s.notifBtn} onClick={requestNotifications}>
            {lang==='zh'?'啟用每日提醒':'Enable Daily Reminders'}
          </button>
        </div>

        {/* Save */}
        <button style={{...s.saveBtn,background:saved?theme.greenMid:theme.green}} onClick={saveSettings}>
          {saved?t.profile.saved:t.profile.save}
        </button>

        {/* Divider */}
        <div style={s.divider}/>

        {/* Logout */}
        <button style={s.logoutBtn} onClick={handleLogout}>
          {t.profile.logout}
        </button>

        {/* Brand footer */}
        <div style={s.footer}>
          <div style={s.footerLogo}>anitch™</div>
          <div style={s.footerTag}>Freedom from Eczema</div>
          <div style={s.footerVer}>Eczema Diary v1.0 · Science-driven skincare</div>
        </div>
      </div>
    </div>
  )
}

const s={
  page:{background:theme.lightGrey,minHeight:'100vh',fontFamily:fonts.body},
  header:{background:theme.green,padding:'16px 20px 24px'},
  logoText:{color:'white',fontSize:'18px',fontWeight:'800',letterSpacing:'-0.02em',marginBottom:'12px'},
  title:{fontSize:'22px',fontWeight:'700',color:'white'},
  body:{padding:'16px 16px 120px'},
  userCard:{background:'white',borderRadius:'12px',padding:'16px',marginBottom:'12px',display:'flex',alignItems:'center',gap:'14px',boxShadow:`0 1px 4px ${theme.shadow}`,border:`1px solid ${theme.border}`},
  avatar:{width:'48px',height:'48px',borderRadius:'50%',background:theme.green,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',fontWeight:'800',color:'white',flexShrink:0},
  userName:{fontSize:'18px',fontWeight:'700',color:theme.textPrimary,letterSpacing:'-0.01em'},
  userEmail:{fontSize:'12px',color:theme.textMuted,marginTop:'2px'},
  card:{background:'white',borderRadius:'12px',padding:'16px',marginBottom:'12px',boxShadow:`0 1px 4px ${theme.shadow}`,border:`1px solid ${theme.border}`},
  cardLabel:{fontSize:'10px',fontWeight:'700',letterSpacing:'0.12em',textTransform:'uppercase',color:theme.textMuted,marginBottom:'12px',fontFamily:fonts.label},
  langRow:{display:'flex',gap:'10px'},
  langBtn:{flex:1,padding:'12px',borderRadius:'8px',border:`1.5px solid ${theme.border}`,background:'white',fontSize:'13px',cursor:'pointer',fontFamily:fonts.body,color:theme.textSecondary,fontWeight:'600',transition:'all 0.2s'},
  langActive:{background:theme.green,borderColor:theme.green,color:'white'},
  notifSub:{fontSize:'12px',color:theme.textMuted,marginBottom:'12px',lineHeight:'1.5'},
  notifBtn:{width:'100%',padding:'12px',background:theme.greenLight,color:theme.green,border:`1.5px solid ${theme.green}`,borderRadius:'8px',fontSize:'13px',fontWeight:'700',cursor:'pointer',fontFamily:fonts.body,letterSpacing:'0.04em'},
  saveBtn:{width:'100%',color:'white',border:'none',borderRadius:'8px',padding:'14px',fontSize:'14px',fontWeight:'700',cursor:'pointer',fontFamily:fonts.body,marginBottom:'12px',transition:'all 0.2s',letterSpacing:'0.04em'},
  divider:{height:'1px',background:theme.border,margin:'8px 0 14px'},
  logoutBtn:{width:'100%',background:'transparent',color:'#C0392B',border:'1.5px solid #C0392B',borderRadius:'8px',padding:'14px',fontSize:'14px',fontWeight:'700',cursor:'pointer',fontFamily:fonts.body,marginBottom:'32px',letterSpacing:'0.04em'},
  footer:{textAlign:'center',paddingBottom:'20px'},
  footerLogo:{fontSize:'20px',fontWeight:'800',color:theme.green,letterSpacing:'-0.02em',marginBottom:'4px'},
  footerTag:{fontSize:'11px',color:theme.textMuted,letterSpacing:'0.08em',textTransform:'uppercase',fontFamily:fonts.label,marginBottom:'4px'},
  footerVer:{fontSize:'11px',color:theme.border},
}
