import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../lib/AppContext'
import { theme, fonts } from '../lib/theme'

export default function Auth() {
  const { t, lang, switchLang } = useApp()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) { setError(error.message) }
      else if (data.user) {
        await supabase.from('profiles').insert({ id: data.user.id, name, language: lang })
      }
    }
    setLoading(false)
  }

  return (
    <div style={s.wrap}>
      <div style={s.topBar}>
        <div style={s.logo}>anitch™</div>
        <div style={s.langRow}>
          <button style={{...s.langBtn,...(lang==='en'?s.langActive:{})}} onClick={()=>switchLang('en')}>EN</button>
          <button style={{...s.langBtn,...(lang==='zh'?s.langActive:{})}} onClick={()=>switchLang('zh')}>繁中</button>
        </div>
      </div>
      <div style={s.content}>
        <div style={s.card}>
          <div style={s.tagline}>FREEDOM FROM ECZEMA</div>
          <div style={s.headline}>{mode==='login'?t.auth.welcome:(lang==='zh'?'建立帳號':'Create Account')}</div>
          <div style={s.subline}>{t.auth.welcomeSub}</div>
          <form onSubmit={handleSubmit} style={s.form}>
            {mode==='signup'&&(
              <div style={s.field}>
                <label style={s.label}>{t.auth.name}</label>
                <input style={s.input} type="text" placeholder={lang==='zh'?'請輸入您的名字':'Your name'} value={name} onChange={e=>setName(e.target.value)} required/>
              </div>
            )}
            <div style={s.field}>
              <label style={s.label}>{t.auth.email}</label>
              <input style={s.input} type="email" placeholder="hello@example.com" value={email} onChange={e=>setEmail(e.target.value)} required/>
            </div>
            <div style={s.field}>
              <label style={s.label}>{t.auth.password}</label>
              <input style={s.input} type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} required/>
            </div>
            {error&&<div style={s.error}>{error}</div>}
            <button style={s.btn} type="submit" disabled={loading}>
              {loading?'...':(mode==='login'?t.auth.login:t.auth.signup)}
            </button>
          </form>
          <div style={s.switchRow}>
            <span style={s.switchText}>{mode==='login'?t.auth.noAccount:t.auth.hasAccount}</span>
            <button style={s.switchBtn} onClick={()=>{setMode(mode==='login'?'signup':'login');setError('')}}>
              {mode==='login'?t.auth.signupLink:t.auth.loginLink}
            </button>
          </div>
        </div>
        <div style={s.badges}>
          {['DERMATOLOGIST TESTED','STEROID-FREE','SCIENCE-DRIVEN'].map(b=>(
            <span key={b} style={s.badge}>{b}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

const s = {
  wrap:{minHeight:'100vh',background:theme.lightGrey,display:'flex',flexDirection:'column',fontFamily:fonts.body},
  topBar:{background:theme.green,padding:'16px 20px',display:'flex',alignItems:'center',justifyContent:'space-between'},
  logo:{color:'white',fontSize:'22px',fontWeight:'800',letterSpacing:'-0.02em'},
  langRow:{display:'flex',gap:'6px'},
  langBtn:{padding:'4px 12px',borderRadius:'4px',border:'1px solid rgba(255,255,255,0.3)',background:'transparent',fontSize:'11px',cursor:'pointer',color:'rgba(255,255,255,0.7)',fontWeight:'600',letterSpacing:'0.05em',fontFamily:fonts.label},
  langActive:{background:'white',color:theme.green,border:'1px solid white'},
  content:{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px 20px'},
  card:{background:'white',borderRadius:'12px',padding:'28px 24px',width:'100%',maxWidth:'380px',boxShadow:`0 4px 24px ${theme.shadow}`,border:`1px solid ${theme.border}`},
  tagline:{fontSize:'10px',fontWeight:'700',letterSpacing:'0.15em',color:theme.green,marginBottom:'10px',fontFamily:fonts.label},
  headline:{fontSize:'26px',fontWeight:'800',color:theme.textPrimary,marginBottom:'6px',letterSpacing:'-0.02em'},
  subline:{fontSize:'13px',color:theme.textMuted,marginBottom:'24px',lineHeight:'1.5'},
  form:{display:'flex',flexDirection:'column',gap:'14px',marginBottom:'20px'},
  field:{display:'flex',flexDirection:'column',gap:'6px'},
  label:{fontSize:'11px',fontWeight:'700',color:theme.textSecondary,letterSpacing:'0.06em',textTransform:'uppercase',fontFamily:fonts.label},
  input:{padding:'12px 14px',borderRadius:'8px',border:`1.5px solid ${theme.border}`,fontSize:'14px',fontFamily:fonts.body,outline:'none',color:theme.textPrimary,background:theme.lightGrey},
  error:{background:'#FFE8E8',color:'#C0392B',padding:'10px 14px',borderRadius:'8px',fontSize:'13px',fontWeight:'500'},
  btn:{padding:'14px',borderRadius:'8px',background:theme.green,color:'white',fontSize:'14px',fontWeight:'700',border:'none',cursor:'pointer',fontFamily:fonts.body,letterSpacing:'0.04em',marginTop:'4px'},
  switchRow:{display:'flex',alignItems:'center',gap:'6px',justifyContent:'center'},
  switchText:{fontSize:'13px',color:theme.textMuted},
  switchBtn:{fontSize:'13px',color:theme.green,fontWeight:'700',background:'none',border:'none',cursor:'pointer',padding:'0'},
  badges:{display:'flex',gap:'8px',marginTop:'20px',flexWrap:'wrap',justifyContent:'center'},
  badge:{fontSize:'9px',fontWeight:'700',letterSpacing:'0.1em',color:theme.textMuted,border:`1px solid ${theme.border}`,padding:'4px 10px',borderRadius:'20px',background:'white',fontFamily:fonts.label},
}
