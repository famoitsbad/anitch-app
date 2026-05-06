import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../lib/AppContext'

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
    <div style={styles.wrap}>
      <div style={styles.card}>
        {/* Lang toggle */}
        <div style={styles.langRow}>
          <button style={{...styles.langBtn, ...(lang==='en'?styles.langActive:{})}} onClick={()=>switchLang('en')}>EN</button>
          <button style={{...styles.langBtn, ...(lang==='zh'?styles.langActive:{})}} onClick={()=>switchLang('zh')}>繁中</button>
        </div>
        {/* Logo */}
        <div style={styles.logoWrap}>
          <div style={styles.logoDot}/>
          <div style={styles.logo}>Anitch</div>
          <div style={styles.logoSub}>{t.appSubtitle}</div>
        </div>
        <div style={styles.welcome}>{t.auth.welcome} <span style={{color:'#5A7A55',fontStyle:'italic'}}>Anitch</span></div>
        <div style={styles.welcomeSub}>{t.auth.welcomeSub}</div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {mode === 'signup' && (
            <input style={styles.input} type="text" placeholder={t.auth.name} value={name} onChange={e=>setName(e.target.value)} required />
          )}
          <input style={styles.input} type="email" placeholder={t.auth.email} value={email} onChange={e=>setEmail(e.target.value)} required />
          <input style={styles.input} type="password" placeholder={t.auth.password} value={password} onChange={e=>setPassword(e.target.value)} required />
          {error && <div style={styles.error}>{error}</div>}
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? (mode==='login'?t.auth.loggingIn:t.auth.signingUp) : (mode==='login'?t.auth.login:t.auth.signup)}
          </button>
        </form>

        <div style={styles.switchRow}>
          <span style={styles.switchText}>{mode==='login'?t.auth.noAccount:t.auth.hasAccount}</span>
          <button style={styles.switchBtn} onClick={()=>{setMode(mode==='login'?'signup':'login');setError('')}}>
            {mode==='login'?t.auth.signupLink:t.auth.loginLink}
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  wrap: { minHeight:'100vh', background:'#FAF6F0', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' },
  card: { background:'white', borderRadius:'24px', padding:'32px 28px', width:'100%', maxWidth:'380px', boxShadow:'0 8px 40px rgba(42,31,26,0.12)', border:'1px solid #E8DDD8' },
  langRow: { display:'flex', gap:'8px', justifyContent:'flex-end', marginBottom:'20px' },
  langBtn: { padding:'4px 12px', borderRadius:'12px', border:'1.5px solid #E8DDD8', background:'transparent', fontSize:'12px', cursor:'pointer', color:'#B09A92', fontWeight:'500' },
  langActive: { background:'#5A7A55', borderColor:'#5A7A55', color:'white' },
  logoWrap: { display:'flex', alignItems:'center', gap:'8px', marginBottom:'20px' },
  logoDot: { width:'10px', height:'10px', borderRadius:'50%', background:'#E8A898' },
  logo: { fontFamily:'Georgia,serif', fontSize:'22px', fontWeight:'700', color:'#2A1F1A' },
  logoSub: { fontSize:'12px', color:'#B09A92' },
  welcome: { fontFamily:'Georgia,serif', fontSize:'22px', fontWeight:'400', color:'#2A1F1A', marginBottom:'6px' },
  welcomeSub: { fontSize:'13px', color:'#B09A92', marginBottom:'24px' },
  form: { display:'flex', flexDirection:'column', gap:'12px', marginBottom:'16px' },
  input: { padding:'12px 14px', borderRadius:'12px', border:'1.5px solid #E8DDD8', fontSize:'14px', fontFamily:'inherit', outline:'none', color:'#2A1F1A', background:'#FFF9F4' },
  error: { background:'#FFE0DD', color:'#B03020', padding:'10px 14px', borderRadius:'10px', fontSize:'13px' },
  btn: { padding:'14px', borderRadius:'14px', background:'#5A7A55', color:'white', fontSize:'15px', fontWeight:'600', border:'none', cursor:'pointer', fontFamily:'inherit' },
  switchRow: { display:'flex', alignItems:'center', gap:'6px', justifyContent:'center' },
  switchText: { fontSize:'13px', color:'#B09A92' },
  switchBtn: { fontSize:'13px', color:'#5A7A55', fontWeight:'600', background:'none', border:'none', cursor:'pointer', padding:'0' },
}
