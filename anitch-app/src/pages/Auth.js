import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../lib/AppContext'
import { theme, fonts } from '../lib/theme'
import { LOGO_BASE64 } from '../lib/logo'

const AGE_RANGES_EN = ['Under 18','18–24','25–34','35–44','45–54','55+']
const AGE_RANGES_ZH = ['18歲以下','18–24歲','25–34歲','35–44歲','45–54歲','55歲以上']
const GENDERS_EN = ['Female','Male','Prefer not to say']
const GENDERS_ZH = ['女性','男性','不願透露']
const DURATIONS_EN = ['Less than 1 year','1–3 years','3–5 years','5–10 years','10+ years']
const DURATIONS_ZH = ['少於1年','1–3年','3–5年','5–10年','10年以上']
const ANITCH_PRODUCTS = ['Barrier Rescue Balm','Barrier Restore Face Cream','Barrier Repair Body Cream']

export default function Auth({ defaultMode = 'login' }) {
  const { t, lang, switchLang } = useApp()
  const [mode, setMode] = useState(defaultMode)
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [ageRange, setAgeRange] = useState('')
  const [gender, setGender] = useState('')
  const [duration, setDuration] = useState('')
  const [usesAnitch, setUsesAnitch] = useState(null)
  const [anitchProducts, setAnitchProducts] = useState([])
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const isZh = lang === 'zh'

  function toggleProduct(p) {
    setAnitchProducts(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])
  }

  // Step 1 — credentials
  async function handleStep1(e) {
    e.preventDefault()
    if (mode === 'login') {
      setLoading(true); setError('')
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      setLoading(false)
    } else {
      if (!agreed) { setError(isZh ? '請同意私隱政策以繼續' : 'Please agree to the Privacy Policy'); return }
      setError(''); setStep(2)
    }
  }

  // Step 2 — eczema questions (required)
  function handleStep2() {
    if (!duration) { setError(isZh ? '請選擇您患濕疹的年期' : 'Please select how long you have had eczema'); return }
    if (usesAnitch === null) { setError(isZh ? '請回答您是否使用 Anitch 產品' : 'Please answer whether you use Anitch products'); return }
    setError(''); setStep(3)
  }

  // Step 3 — demographics (optional) + final save
  async function handleFinish(skip = false) {
    setLoading(true); setError('')
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id, name, language: lang,
        age_range: skip ? '' : ageRange,
        gender: skip ? '' : gender,
        eczema_duration: duration,
        uses_anitch: usesAnitch,
        anitch_products: anitchProducts,
      })
    }
    setLoading(false)
  }

  const StepDots = ({ current, total }) => (
    <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', marginBottom: '14px' }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{ height: '6px', borderRadius: '3px', background: i + 1 === current ? theme.green : theme.border, width: i + 1 === current ? '18px' : '6px', transition: 'all 0.2s' }} />
      ))}
    </div>
  )

  return (
    <div style={s.wrap}>
      <div style={s.topBar}>
        <img src={LOGO_BASE64} alt="anitch" style={s.logo} />
        <div style={s.langRow}>
          <button style={{ ...s.langBtn, ...(lang === 'en' ? s.langActive : {}) }} onClick={() => switchLang('en')}>EN</button>
          <button style={{ ...s.langBtn, ...(lang === 'zh' ? s.langActive : {}) }} onClick={() => switchLang('zh')}>繁中</button>
        </div>
      </div>

      <div style={s.content}>
        <div style={s.card}>
          <div style={s.tagline}>{isZh ? '擺脫濕疹困擾' : 'FREEDOM FROM ECZEMA'}</div>

          {/* ── STEP 1 — Credentials / Login ── */}
          {(mode === 'login' || step === 1) && (
            <>
              {mode === 'signup' && <StepDots current={1} total={3} />}
              <div style={s.headline}>{mode === 'login' ? (isZh ? '歡迎回來' : 'Welcome back') : (isZh ? '建立帳號' : 'Create Account')}</div>
              <div style={s.subline}>{mode === 'login' ? (isZh ? '您的個人濕疹日記' : 'Your personal eczema diary') : (isZh ? '我們應該怎樣稱呼您？' : 'How would you like us to call you?')}</div>
              <form onSubmit={handleStep1} style={s.form}>
                {mode === 'signup' && (
                  <div style={s.field}>
                    <label style={s.label}>{isZh ? '您的名字' : 'Your Name'}</label>
                    <input style={s.input} type="text" placeholder={isZh ? '請輸入您希望我們稱呼您的名字' : 'What should we call you?'} value={name} onChange={e => setName(e.target.value)} required />
                  </div>
                )}
                <div style={s.field}>
                  <label style={s.label}>{isZh ? '電郵地址' : 'Email Address'}</label>
                  <input style={s.input} type="email" placeholder="hello@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div style={s.field}>
                  <label style={s.label}>{isZh ? '密碼' : 'Password'}</label>
                  <input style={s.input} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                {mode === 'signup' && (
                  <div style={s.privacyBox} onClick={() => setAgreed(!agreed)}>
                    <div style={{ ...s.checkbox, ...(agreed ? s.checkboxOn : {}) }}>{agreed && <span style={{ color: 'white', fontSize: '11px' }}>✓</span>}</div>
                    <div style={s.privacyText}>{isZh ? '我同意私隱政策——所有數據均會私密保存，絕不會出售或分享給第三方。' : 'By signing up, I agree to the Privacy Policy — all data is saved privately and will never be sold or shared with third parties.'}</div>
                  </div>
                )}
                {error && <div style={s.error}>{error}</div>}
                <button style={s.btn} type="submit" disabled={loading}>
                  {loading ? '...' : (mode === 'login' ? (isZh ? '登入' : 'Sign In') : (isZh ? '下一步 →' : 'Next →'))}
                </button>
              </form>
            </>
          )}

          {/* ── STEP 2 — Eczema questions (REQUIRED) ── */}
          {mode === 'signup' && step === 2 && (
            <>
              <StepDots current={2} total={3} />
              <div style={{ display: 'inline-block', background: '#FFF3E0', border: '1px solid #F7984C', borderRadius: '4px', padding: '3px 9px', fontSize: '10px', fontWeight: '700', color: '#E07A10', marginBottom: '10px' }}>
                {isZh ? '必填' : 'Required'}
              </div>
              <div style={s.headline}>{isZh ? '關於您的濕疹' : 'About your eczema'}</div>
              <div style={s.subline}>{isZh ? '這有助我們為您提供更個人化的體驗' : 'This helps us personalise your experience'}</div>
              <div style={s.form}>
                <div style={s.field}>
                  <label style={s.label}>{isZh ? '您患濕疹多久了？' : 'How long have you had eczema?'}</label>
                  <div style={s.optGrid}>
                    {(isZh ? DURATIONS_ZH : DURATIONS_EN).map(d => (
                      <div key={d} style={{ ...s.optBtn, ...(duration === d ? s.optActive : {}) }} onClick={() => setDuration(d)}>{d}</div>
                    ))}
                  </div>
                </div>
                <div style={s.field}>
                  <label style={s.label}>{isZh ? '您有使用 Anitch 的產品嗎？' : 'Are you currently using Anitch products?'}</label>
                  <div style={s.optRow}>
                    <div style={{ ...s.optBtn, ...(usesAnitch === true ? s.optActive : {}) }} onClick={() => setUsesAnitch(true)}>{isZh ? '有' : 'Yes'}</div>
                    <div style={{ ...s.optBtn, ...(usesAnitch === false ? s.optActive : {}) }} onClick={() => { setUsesAnitch(false); setAnitchProducts([]) }}>{isZh ? '沒有' : 'No'}</div>
                  </div>
                </div>
                {usesAnitch === true && (
                  <div style={s.field}>
                    <label style={s.label}>{isZh ? '請選擇您使用的產品：' : 'Which Anitch products are you using?'}</label>
                    {ANITCH_PRODUCTS.map(p => (
                      <div key={p} style={{ ...s.productRow, ...(anitchProducts.includes(p) ? s.productRowOn : {}) }} onClick={() => toggleProduct(p)}>
                        <div style={{ ...s.checkbox, ...(anitchProducts.includes(p) ? s.checkboxOn : {}) }}>{anitchProducts.includes(p) && <span style={{ color: 'white', fontSize: '11px' }}>✓</span>}</div>
                        <span style={{ fontSize: '13px', color: theme.textSecondary }}>{p}</span>
                      </div>
                    ))}
                  </div>
                )}
                {error && <div style={s.error}>{error}</div>}
                <button style={s.btn} onClick={handleStep2} disabled={loading}>
                  {loading ? '...' : (isZh ? '下一步 →' : 'Next →')}
                </button>
              </div>
            </>
          )}

          {/* ── STEP 3 — Demographics (OPTIONAL) ── */}
          {mode === 'signup' && step === 3 && (
            <>
              <StepDots current={3} total={3} />
              <div style={{ display: 'inline-block', background: theme.greenLight, border: `1px solid ${theme.greenSoft}`, borderRadius: '4px', padding: '3px 9px', fontSize: '10px', fontWeight: '700', color: theme.green, marginBottom: '10px' }}>
                {isZh ? '選填' : 'Optional'}
              </div>
              <div style={s.headline}>{isZh ? '再多了解您一點' : 'A little more about you'}</div>
              <div style={s.subline}>{isZh ? '有助我們了解用戶群體。您可以跳過並隨時在個人資料中填寫。' : 'Helps us understand our community. You can skip and update in Profile anytime.'}</div>
              <div style={s.form}>
                <div style={s.field}>
                  <label style={s.label}>{isZh ? '年齡範圍' : 'Age Range'}</label>
                  <div style={s.optGrid}>
                    {(isZh ? AGE_RANGES_ZH : AGE_RANGES_EN).map((a, i) => (
                      <div key={a} style={{ ...s.optBtn, ...(ageRange === (isZh ? AGE_RANGES_ZH : AGE_RANGES_EN)[i] ? s.optActive : {}) }} onClick={() => setAgeRange((isZh ? AGE_RANGES_ZH : AGE_RANGES_EN)[i])}>{a}</div>
                    ))}
                  </div>
                </div>
                <div style={s.field}>
                  <label style={s.label}>{isZh ? '性別' : 'Gender'}</label>
                  <div style={s.optRow}>
                    {(isZh ? GENDERS_ZH : GENDERS_EN).map(g => (
                      <div key={g} style={{ ...s.optBtn, ...(gender === g ? s.optActive : {}) }} onClick={() => setGender(g)}>{g}</div>
                    ))}
                  </div>
                </div>
                {error && <div style={s.error}>{error}</div>}
                <button style={s.btn} onClick={() => handleFinish(false)} disabled={loading}>
                  {loading ? '...' : (isZh ? '開始我的旅程 🌿' : 'Start My Journey 🌿')}
                </button>
                <button style={s.skipBtn} onClick={() => handleFinish(true)}>{isZh ? '跳過' : 'Skip for now'}</button>
              </div>
            </>
          )}

          <div style={s.switchRow}>
            <span style={s.switchText}>{mode === 'login' ? (isZh ? '還沒有帳號？' : 'No account?') : (isZh ? '已有帳號？' : 'Have an account?')}</span>
            <button style={s.switchBtn} onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setStep(1); setError('') }}>
              {mode === 'login' ? (isZh ? '立即註冊' : 'Sign up') : (isZh ? '登入' : 'Sign in')}
            </button>
          </div>
        </div>
        <div style={s.badges}>
          {(isZh ? ['皮膚科醫生測試', '無類固醇', '科學驅動'] : ['DERMATOLOGIST TESTED', 'STEROID-FREE', 'SCIENCE-DRIVEN']).map(b => (
            <span key={b} style={s.badge}>{b}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

const s = {
  wrap: { minHeight: '100vh', background: theme.lightGrey, display: 'flex', flexDirection: 'column', fontFamily: fonts.body },
  topBar: { background: theme.green, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { height: '26px', width: 'auto', objectFit: 'contain' },
  langRow: { display: 'flex', gap: '6px' },
  langBtn: { padding: '5px 14px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.3)', background: 'transparent', fontSize: '12px', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  langActive: { background: 'white', color: theme.green, border: '1px solid white' },
  content: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px' },
  card: { background: 'white', borderRadius: '12px', padding: '28px 24px', width: '100%', maxWidth: '380px', boxShadow: `0 4px 24px ${theme.shadow}`, border: `1px solid ${theme.border}` },
  tagline: { fontSize: '10px', fontWeight: '700', letterSpacing: '0.15em', color: theme.green, marginBottom: '10px', fontFamily: fonts.label },
  headline: { fontSize: '24px', fontWeight: '800', color: theme.textPrimary, marginBottom: '6px', letterSpacing: '-0.02em' },
  subline: { fontSize: '13px', color: theme.textMuted, marginBottom: '20px', lineHeight: '1.5' },
  form: { display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '11px', fontWeight: '700', color: theme.textSecondary, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: fonts.label },
  input: { padding: '12px 14px', borderRadius: '8px', border: `1.5px solid ${theme.border}`, fontSize: '14px', fontFamily: fonts.body, outline: 'none', color: theme.textPrimary, background: theme.lightGrey },
  privacyBox: { display: 'flex', gap: '10px', alignItems: 'flex-start', cursor: 'pointer', background: theme.greenLight, borderRadius: '8px', padding: '12px', border: `1px solid ${theme.greenSoft}` },
  checkbox: { width: '18px', height: '18px', borderRadius: '4px', border: `2px solid ${theme.green}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px', background: 'white' },
  checkboxOn: { background: theme.green },
  privacyText: { fontSize: '12px', color: theme.textSecondary, lineHeight: '1.5' },
  error: { background: '#FFE8E8', color: '#C0392B', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '500' },
  btn: { padding: '14px', borderRadius: '8px', background: theme.green, color: 'white', fontSize: '14px', fontWeight: '700', border: 'none', cursor: 'pointer', fontFamily: fonts.body, letterSpacing: '0.04em' },
  skipBtn: { padding: '10px', borderRadius: '8px', background: 'transparent', color: theme.textMuted, fontSize: '13px', border: 'none', cursor: 'pointer', fontFamily: fonts.body, textAlign: 'center' },
  optGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' },
  optRow: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  optBtn: { padding: '8px 12px', borderRadius: '6px', border: `1.5px solid ${theme.border}`, fontSize: '12px', color: theme.textSecondary, cursor: 'pointer', textAlign: 'center', background: 'white', fontWeight: '500', transition: 'all 0.15s' },
  optActive: { background: theme.green, borderColor: theme.green, color: 'white', fontWeight: '700' },
  productRow: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', border: `1.5px solid ${theme.border}`, cursor: 'pointer', marginBottom: '4px', transition: 'all 0.15s' },
  productRowOn: { background: theme.greenLight, borderColor: theme.green },
  switchRow: { display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', marginTop: '4px' },
  switchText: { fontSize: '13px', color: theme.textMuted },
  switchBtn: { fontSize: '13px', color: theme.green, fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer', padding: '0' },
  badges: { display: 'flex', gap: '8px', marginTop: '20px', flexWrap: 'wrap', justifyContent: 'center' },
  badge: { fontSize: '9px', fontWeight: '700', letterSpacing: '0.1em', color: theme.textMuted, border: `1px solid ${theme.border}`, padding: '4px 10px', borderRadius: '20px', background: 'white', fontFamily: fonts.label },
}
