import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../lib/AppContext'
import { theme, fonts } from '../lib/theme'
import { LOGO_BASE64 } from '../lib/logo'

export default function Profile() {
  const {user,profile,t,lang,switchLang,loadProfile} = useApp()
  const [saved, setSaved] = useState(false)
  const [editName, setEditName] = useState(profile?.name || '')
  const [savingName, setSavingName] = useState(false)
  const isZh = lang === 'zh'

  async function handleLogout(){await supabase.auth.signOut()}

  async function saveSettings(){
    await supabase.from('profiles').upsert({id:user.id,language:lang})
    setSaved(true);setTimeout(()=>setSaved(false),2000)
  }

  async function saveName(){
    setSavingName(true)
    await supabase.from('profiles').upsert({id:user.id,name:editName,language:lang})
    if(loadProfile) await loadProfile(user.id)
    setSavingName(false)
    setSaved(true);setTimeout(()=>setSaved(false),2000)
  }

  function requestNotifications(){
    if('Notification' in window){
      Notification.requestPermission().then(p=>{
        if(p==='granted')alert(isZh?'提醒已開啟！':'Reminders enabled!')
        else alert(isZh?'請在瀏覽器設定中允許通知。':'Please allow notifications in your browser settings.')
      })
    }
  }

  return(
    <div style={s.page}>
      <div style={s.header}>
        <img src={LOGO_BASE64} alt="anitch" style={s.logo}/>
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

        {/* Change Name */}
        <div style={s.card}>
          <div style={s.cardLabel}>✏️ {isZh?'更改名字':'Change Name'}</div>
          <div style={s.nameRow}>
            <input
              style={s.nameInput}
              type="text"
              value={editName}
              onChange={e=>setEditName(e.target.value)}
              placeholder={isZh?'輸入您的名字':'Enter your name'}
            />
            <button style={s.nameBtn} onClick={saveName} disabled={savingName}>
              {savingName?'...':(isZh?'儲存':'Save')}
            </button>
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
            {isZh?'啟用每日提醒':'Enable Daily Reminders'}
          </button>
        </div>

        {/* Save settings */}
        <button style={{...s.saveBtn,background:saved?theme.greenMid:theme.green}} onClick={saveSettings}>
          {saved?(isZh?'已儲存！':'Saved!'):t.profile.save}
        </button>

        <div style={s.divider}/>

        {/* Logout */}
        <button style={s.logoutBtn} onClick={handleLogout}>
          🚪 {t.profile.logout}
        </button>

        <div style={s.divider}/>

        {/* Anitch brand info */}
        <div style={s.brandCard}>
          <img src={LOGO_BASE64} alt="anitch" style={s.brandLogo}/>
          <div style={s.brandTagline}>{isZh?'從濕疹中解放':'Freedom from Eczema'}</div>
          <div style={s.brandDesc}>
            {isZh
              ? 'Anitch® 是一個以科學為基礎的濕疹護膚品牌，致力於改善濕疹患者的生活質量。'
              : 'Anitch® is a science-driven eczema skincare brand dedicated to improving the lives of those with eczema-prone skin.'
            }
          </div>
          <div style={s.linkRow}>
            <a href="https://www.anitch.com.au" target="_blank" rel="noopener noreferrer" style={s.link}>
              🌐 {isZh?'官方網站':'Official Website'}
            </a>
            <a href="https://www.instagram.com/AnitchEczemaCare" target="_blank" rel="noopener noreferrer" style={s.link}>
              📸 @AnitchEczemaCare
            </a>
          </div>
          <div style={s.versionText}>Eczema Diary v1.0 · © 2026 Anitch®</div>
        </div>
      </div>
    </div>
  )
}

const s={
  page:{background:theme.lightGrey,minHeight:'100vh',fontFamily:fonts.body},
  header:{background:theme.green,padding:'14px 20px 24px'},
  logo:{height:'22px',width:'auto',objectFit:'contain',marginBottom:'12px'},
  title:{fontSize:'22px',fontWeight:'700',color:'white'},
  body:{padding:'14px 14px 120px'},
  userCard:{background:'white',borderRadius:'12px',padding:'16px',marginBottom:'12px',display:'flex',alignItems:'center',gap:'14px',boxShadow:`0 1px 4px ${theme.shadow}`,border:`1px solid ${theme.border}`},
  avatar:{width:'48px',height:'48px',borderRadius:'50%',background:theme.green,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',fontWeight:'800',color:'white',flexShrink:0},
  userName:{fontSize:'18px',fontWeight:'700',color:theme.textPrimary,letterSpacing:'-0.01em'},
  userEmail:{fontSize:'12px',color:theme.textMuted,marginTop:'2px'},
  card:{background:'white',borderRadius:'12px',padding:'16px',marginBottom:'12px',boxShadow:`0 1px 4px ${theme.shadow}`,border:`1px solid ${theme.border}`},
  cardLabel:{fontSize:'10px',fontWeight:'700',letterSpacing:'0.12em',textTransform:'uppercase',color:theme.textMuted,marginBottom:'12px',fontFamily:fonts.label},
  nameRow:{display:'flex',gap:'8px',alignItems:'center'},
  nameInput:{flex:1,padding:'12px 14px',border:`1.5px solid ${theme.border}`,borderRadius:'8px',fontSize:'14px',fontFamily:fonts.body,outline:'none',color:theme.textPrimary,background:theme.lightGrey},
  nameBtn:{padding:'12px 16px',background:theme.green,color:'white',border:'none',borderRadius:'8px',fontSize:'13px',fontWeight:'700',cursor:'pointer',fontFamily:fonts.body,whiteSpace:'nowrap'},
  langRow:{display:'flex',gap:'10px'},
  langBtn:{flex:1,padding:'12px',borderRadius:'8px',border:`1.5px solid ${theme.border}`,background:'white',fontSize:'13px',cursor:'pointer',fontFamily:fonts.body,color:theme.textSecondary,fontWeight:'600',transition:'all 0.2s'},
  langActive:{background:theme.green,borderColor:theme.green,color:'white'},
  notifSub:{fontSize:'12px',color:theme.textMuted,marginBottom:'12px',lineHeight:'1.5'},
  notifBtn:{width:'100%',padding:'12px',background:theme.greenLight,color:theme.green,border:`1.5px solid ${theme.green}`,borderRadius:'8px',fontSize:'13px',fontWeight:'700',cursor:'pointer',fontFamily:fonts.body,letterSpacing:'0.04em'},
  saveBtn:{width:'100%',color:'white',border:'none',borderRadius:'8px',padding:'14px',fontSize:'14px',fontWeight:'700',cursor:'pointer',fontFamily:fonts.body,marginBottom:'12px',transition:'all 0.2s',letterSpacing:'0.04em'},
  divider:{height:'1px',background:theme.border,margin:'8px 0 14px'},
  logoutBtn:{width:'100%',background:'transparent',color:'#C0392B',border:'1.5px solid #C0392B',borderRadius:'8px',padding:'14px',fontSize:'14px',fontWeight:'700',cursor:'pointer',fontFamily:fonts.body,marginBottom:'12px',letterSpacing:'0.04em'},
  brandCard:{background:'white',borderRadius:'12px',padding:'24px 20px',textAlign:'center',boxShadow:`0 1px 4px ${theme.shadow}`,border:`1px solid ${theme.border}`},
  brandLogo:{height:'20px',width:'auto',marginBottom:'10px',filter:'invert(18%) sepia(72%) saturate(500%) hue-rotate(120deg)'},
  brandTagline:{fontSize:'10px',fontWeight:'700',letterSpacing:'0.15em',color:theme.green,textTransform:'uppercase',marginBottom:'10px',fontFamily:fonts.label},
  brandDesc:{fontSize:'12px',color:theme.textMuted,lineHeight:'1.6',marginBottom:'16px'},
  linkRow:{display:'flex',flexDirection:'column',gap:'8px',marginBottom:'16px'},
  link:{display:'block',padding:'10px 16px',background:theme.greenLight,color:theme.green,borderRadius:'8px',fontSize:'13px',fontWeight:'700',textDecoration:'none',border:`1px solid ${theme.greenSoft}`},
  versionText:{fontSize:'11px',color:theme.textLight},
}
