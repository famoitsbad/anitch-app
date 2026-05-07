import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../lib/AppContext'
import { LOGO_BASE64 } from '../lib/logo'

export default function Profile() {
  const { user, profile, t, th, lang, switchLang, loadProfile, darkMode, toggleDarkMode } = useApp()
  const [saved, setSaved] = useState(false)
  const [editName, setEditName] = useState(profile?.name || '')
  const [savingName, setSavingName] = useState(false)
  const isZh = lang === 'zh'

  async function handleLogout() { await supabase.auth.signOut() }

  async function saveName() {
    if (!editName.trim()) return
    setSavingName(true)
    await supabase.from('profiles').upsert({ id: user.id, name: editName.trim(), language: lang })
    if (loadProfile) await loadProfile(user.id)
    setSavingName(false)
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  async function saveSettings() {
    await supabase.from('profiles').upsert({ id: user.id, language: lang })
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  function requestNotifications() {
    if ('Notification' in window) {
      Notification.requestPermission().then(p => {
        if (p === 'granted') alert(isZh ? '提醒已開啟！' : 'Reminders enabled!')
        else alert(isZh ? '請在瀏覽器設定中允許通知。' : 'Please allow notifications in your browser settings.')
      })
    }
  }

  const card = { background: th.white, borderRadius: '12px', padding: '16px', marginBottom: '12px', boxShadow: `0 1px 4px ${th.shadow}`, border: `1px solid ${th.border}` }
  const cardLabel = { fontSize: '10px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: th.textMuted, marginBottom: '12px', display: 'block' }

  return (
    <div style={{ background: th.lightGrey, minHeight: '100vh', fontFamily: "'Lato',sans-serif" }}>
      <div style={{ background: th.green, padding: '14px 20px 24px' }}>
        <img src={LOGO_BASE64} alt="anitch" style={{ height: '22px', width: 'auto', marginBottom: '12px' }} />
        <div style={{ fontSize: '22px', fontWeight: '700', color: 'white' }}>{t.profile.title}</div>
      </div>

      <div style={{ padding: '14px 14px 120px' }}>
        {/* User card */}
        <div style={{ ...card, display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: th.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '800', color: 'white', flexShrink: 0 }}>
            {profile?.name ? profile.name[0].toUpperCase() : 'A'}
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: th.textPrimary, letterSpacing: '-0.01em' }}>{profile?.name || 'Anitch User'}</div>
            <div style={{ fontSize: '12px', color: th.textMuted, marginTop: '2px' }}>{user?.email}</div>
          </div>
        </div>

        {/* Change Name */}
        <div style={card}>
          <span style={cardLabel}>✏️ {isZh ? '更改名字' : 'Change Name'}</span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input style={{ flex: 1, padding: '12px 14px', border: `1.5px solid ${th.border}`, borderRadius: '8px', fontSize: '14px', outline: 'none', color: th.textPrimary, background: th.lightGrey }} type="text" value={editName} onChange={e => setEditName(e.target.value)} placeholder={isZh ? '輸入您的名字' : 'Enter your name'} />
            <button style={{ padding: '12px 16px', background: th.green, color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={saveName} disabled={savingName}>
              {savingName ? '...' : saved ? (isZh ? '已儲存✓' : 'Saved✓') : (isZh ? '儲存' : 'Save')}
            </button>
          </div>
        </div>

        {/* Language */}
        <div style={card}>
          <span style={cardLabel}>🌍 {t.profile.language}</span>
          <div style={{ display: 'flex', gap: '10px' }}>
            {[['en', 'English'], ['zh', '繁體中文']].map(([code, label]) => (
              <button key={code} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: `1.5px solid ${lang === code ? th.green : th.border}`, background: lang === code ? th.green : th.white, color: lang === code ? 'white' : th.textSecondary, fontSize: '14px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' }}
                onClick={() => switchLang(code)}>{label}</button>
            ))}
          </div>
        </div>

        {/* Dark Mode */}
        <div style={card}>
          <span style={cardLabel}>🌙 {isZh ? '夜間模式' : 'Dark Mode'}</span>
          <div style={{ fontSize: '12px', color: th.textMuted, marginBottom: '12px', lineHeight: '1.5' }}>
            {isZh ? '夜間模式可減少眼睛疲勞，適合在半夜記錄皮膚狀況時使用。' : 'Dark mode reduces eye strain — perfect for late-night logging when skin flares up.'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '14px', color: th.textSecondary, fontWeight: '500' }}>{darkMode ? (isZh ? '夜間模式已開啟 🌙' : 'Dark Mode On 🌙') : (isZh ? '日間模式 ☀️' : 'Light Mode ☀️')}</span>
            <div style={{ width: '52px', height: '30px', borderRadius: '15px', background: darkMode ? th.green : th.border, position: 'relative', cursor: 'pointer', transition: 'background 0.3s' }} onClick={toggleDarkMode}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', left: darkMode ? '25px' : '3px', transition: 'left 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div style={card}>
          <span style={cardLabel}>🔔 {t.profile.notifications}</span>
          <div style={{ fontSize: '12px', color: th.textMuted, marginBottom: '12px', lineHeight: '1.5' }}>{t.profile.notifSub}</div>
          <button style={{ width: '100%', padding: '12px', background: th.greenLight, color: th.green, border: `1.5px solid ${th.green}`, borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', letterSpacing: '0.04em' }} onClick={requestNotifications}>
            {isZh ? '啟用每日提醒' : 'Enable Daily Reminders'}
          </button>
        </div>

        <button style={{ width: '100%', color: 'white', border: 'none', borderRadius: '8px', padding: '14px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', marginBottom: '12px', letterSpacing: '0.04em', background: saved ? th.greenMid : th.green }} onClick={saveSettings}>
          {saved ? (isZh ? '已儲存！' : 'Saved!') : t.profile.save}
        </button>

        <div style={{ height: '1px', background: th.border, margin: '8px 0 14px' }} />

        {/* Anitch brand info — FIRST */}
        <div style={{ ...card, textAlign: 'center' }}>
          <img src={LOGO_BASE64} alt="anitch" style={{ height: '20px', width: 'auto', marginBottom: '10px' }} />
          <div style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.15em', color: th.green, textTransform: 'uppercase', marginBottom: '10px' }}>
            {isZh ? '從濕疹中解放' : 'Freedom from Eczema'}
          </div>
          <div style={{ fontSize: '12px', color: th.textMuted, lineHeight: '1.6', marginBottom: '16px' }}>
            {isZh ? 'Anitch® 是一個以科學為基礎的濕疹護膚品牌，致力於改善濕疹患者的生活質量。' : 'Anitch® is a science-driven eczema skincare brand dedicated to improving the lives of those with eczema-prone skin.'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            <a href="https://www.anitch.com.au" target="_blank" rel="noopener noreferrer" style={{ display: 'block', padding: '10px 16px', background: th.greenLight, color: th.green, borderRadius: '8px', fontSize: '13px', fontWeight: '700', textDecoration: 'none', border: `1px solid ${th.greenSoft}` }}>
              🌐 {isZh ? '官方網站' : 'Official Website'}
            </a>
            <a href="https://www.instagram.com/AnitchEczemaCare" target="_blank" rel="noopener noreferrer" style={{ display: 'block', padding: '10px 16px', background: th.greenLight, color: th.green, borderRadius: '8px', fontSize: '13px', fontWeight: '700', textDecoration: 'none', border: `1px solid ${th.greenSoft}` }}>
              📸 @AnitchEczemaCare
            </a>
          </div>
          <div style={{ fontSize: '11px', color: th.textLight }}>Eczema Diary v1.0 · © 2026 Anitch®</div>
        </div>

        <div style={{ height: '1px', background: th.border, margin: '8px 0 14px' }} />

        {/* Logout — LAST */}
        <button style={{ width: '100%', background: 'transparent', color: '#C0392B', border: '1.5px solid #C0392B', borderRadius: '8px', padding: '14px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', marginBottom: '12px', letterSpacing: '0.04em' }} onClick={handleLogout}>
          🚪 {t.profile.logout}
        </button>
      </div>
    </div>
  )
}
