import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../lib/AppContext'
import { LOGO_BASE64 } from '../lib/logo'

export default function Profile() {
  const { user, profile, t, th, lang, switchLang, loadProfile, darkMode, toggleDarkMode } = useApp()
  const [saved, setSaved] = useState(false)
  const [editName, setEditName] = useState(profile?.name || '')
  const [savingName, setSavingName] = useState(false)
  const [notifTime, setNotifTime] = useState(localStorage.getItem('anitch_notif_time') || '20:00')
  const [notifStatus, setNotifStatus] = useState(localStorage.getItem('anitch_notif_enabled') === 'true' ? 'enabled' : 'idle')
  const [showNotifDialog, setShowNotifDialog] = useState(false)
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

  function scheduleNotification(time) {
    const [h, m] = time.split(':').map(Number)
    const now = new Date()
    const next = new Date()
    next.setHours(h, m, 0, 0)
    if (next <= now) next.setDate(next.getDate() + 1)
    const ms = next - now
    const existingId = localStorage.getItem('anitch_notif_timeout')
    if (existingId) clearTimeout(parseInt(existingId))
    const id = setTimeout(() => {
      new Notification('Anitch 🌿', {
        body: isZh ? '今天記錄了皮膚狀況嗎？花1分鐘記錄一下吧！' : 'Have you logged your skin today? Take 1 minute to check in!',
        icon: '/anitch-logo.png',
      })
      scheduleNotification(time)
    }, ms)
    localStorage.setItem('anitch_notif_timeout', id.toString())
  }

  async function confirmNotifications() {
    setShowNotifDialog(false)

    // Check browser support
    if (!('Notification' in window)) {
      // iOS Safari PWA check
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      if (isIOS && !isStandalone) {
        alert(isZh
          ? '💡 iOS提示：\n請先點擊Safari底部的「分享」圖示，然後選擇「加入主畫面」，安裝後再重新開啟此App並設定提醒。'
          : '💡 iOS Tip:\nTap the Share icon in Safari, select "Add to Home Screen", then reopen the app and set up reminders.')
      } else {
        alert(isZh ? '您的瀏覽器暫不支援通知功能。' : 'Your browser does not support notifications yet.')
      }
      return
    }

    // Already denied
    if (Notification.permission === 'denied') {
      alert(isZh
        ? '⚠️ 通知已被封鎖\n\n請按照以下步驟開啟：\n1. 前往手機「設定」\n2. 找到您的瀏覽器（Safari/Chrome）\n3. 通知 → 允許此網站'
        : '⚠️ Notifications are blocked.\n\nTo enable:\n1. Go to your phone Settings\n2. Find your browser (Safari/Chrome)\n3. Notifications → Allow this site')
      return
    }

    // Already granted — just schedule
    if (Notification.permission === 'granted') {
      scheduleNotification(notifTime)
      localStorage.setItem('anitch_notif_enabled', 'true')
      localStorage.setItem('anitch_notif_time', notifTime)
      setNotifStatus('enabled')
      return
    }

    // Request permission (default state)
    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        scheduleNotification(notifTime)
        localStorage.setItem('anitch_notif_enabled', 'true')
        localStorage.setItem('anitch_notif_time', notifTime)
        setNotifStatus('enabled')
      } else if (permission === 'denied') {
        setNotifStatus('denied')
        alert(isZh
          ? '您選擇了不允許通知。如需更改，請在手機設定中手動開啟。'
          : 'You chose to block notifications. To change this, go to your device settings.')
      } else {
        // dismissed — just close
        setNotifStatus('idle')
      }
    } catch (err) {
      console.error('Notification error:', err)
      alert(isZh ? '開啟通知時發生錯誤，請稍後再試。' : 'Error enabling notifications. Please try again later.')
    }
  }

  function disableNotifications() {
    const id = localStorage.getItem('anitch_notif_timeout')
    if (id) clearTimeout(parseInt(id))
    localStorage.removeItem('anitch_notif_enabled')
    localStorage.removeItem('anitch_notif_timeout')
    setNotifStatus('idle')
  }

  const card = { background: th.white, borderRadius: '12px', padding: '16px', marginBottom: '12px', boxShadow: `0 1px 4px ${th.shadow}`, border: `1px solid ${th.border}` }
  const cardLabel = { fontSize: '10px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: th.textMuted, marginBottom: '12px', display: 'block' }

  return (
    <div style={{ background: th.lightGrey, minHeight: '100vh', fontFamily: "'Lato',sans-serif" }}>

      {/* Notification confirmation dialog */}
      {showNotifDialog && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ background: th.white, borderRadius: '16px', padding: '28px 24px', maxWidth: '320px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize: '36px', textAlign: 'center', marginBottom: '14px' }}>🔔</div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: th.textPrimary, marginBottom: '10px', textAlign: 'center', letterSpacing: '-0.01em' }}>
              {isZh ? '開啟每日提醒' : 'Enable Daily Reminder'}
            </div>
            <div style={{ fontSize: '13px', color: th.textMuted, lineHeight: '1.6', marginBottom: '20px', textAlign: 'center' }}>
              {isZh
                ? 'Anitch 將在您選擇的時間每天提醒您記錄皮膚狀況。您可以隨時關閉此提醒。'
                : 'Anitch will remind you to log your skin condition every day at your chosen time. You can turn this off anytime.'}
            </div>

            {/* Time picker */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: th.textSecondary, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>
                {isZh ? '提醒時間' : 'Reminder Time'}
              </div>
              <input
                type="time"
                value={notifTime}
                onChange={e => setNotifTime(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', border: `1.5px solid ${th.border}`, borderRadius: '8px', fontSize: '20px', fontWeight: '700', color: th.green, background: th.lightGrey, outline: 'none', textAlign: 'center', fontFamily: "'Lato',sans-serif" }}
              />
            </div>

            {/* Privacy note */}
            <div style={{ background: th.greenLight, borderRadius: '8px', padding: '10px 12px', fontSize: '11px', color: th.greenDark, marginBottom: '20px', lineHeight: '1.5', border: `1px solid ${th.greenSoft}` }}>
              🔒 {isZh
                ? '提醒功能完全在您的裝置上運行，我們不會收集任何通知相關數據。'
                : 'Reminders run entirely on your device. We do not collect any notification data.'}
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                style={{ flex: 1, padding: '13px', borderRadius: '8px', border: `1.5px solid ${th.border}`, background: th.white, color: th.textSecondary, fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                onClick={() => setShowNotifDialog(false)}>
                {isZh ? '取消' : 'Cancel'}
              </button>
              <button
                style={{ flex: 1, padding: '13px', borderRadius: '8px', border: 'none', background: th.green, color: 'white', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}
                onClick={confirmNotifications}>
                {isZh ? '確認開啟' : 'Enable'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ background: th.green, padding: 'env(safe-area-inset-top, 14px) 20px 24px', paddingTop: 'max(14px, env(safe-area-inset-top))' }}>
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
            <div style={{ fontSize: '18px', fontWeight: '700', color: th.textPrimary }}>{profile?.name || 'Anitch User'}</div>
            <div style={{ fontSize: '12px', color: th.textMuted, marginTop: '2px' }}>{user?.email}</div>
          </div>
        </div>

        {/* Change Name */}
        <div style={card}>
          <span style={cardLabel}>✏️ {isZh ? '更改名字' : 'Change Name'}</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input style={{ flex: 1, padding: '12px 14px', border: `1.5px solid ${th.border}`, borderRadius: '8px', fontSize: '14px', outline: 'none', color: th.textPrimary, background: th.lightGrey }}
              type="text" value={editName} onChange={e => setEditName(e.target.value)} placeholder={isZh ? '輸入您的名字' : 'Enter your name'} />
            <button style={{ padding: '12px 16px', background: th.green, color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' }}
              onClick={saveName} disabled={savingName}>
              {savingName ? '...' : (isZh ? '儲存' : 'Save')}
            </button>
          </div>
        </div>

        {/* Language */}
        <div style={card}>
          <span style={cardLabel}>🌍 {t.profile.language}</span>
          <div style={{ display: 'flex', gap: '10px' }}>
            {[['en','English'],['zh','繁體中文']].map(([code, label]) => (
              <button key={code}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: `1.5px solid ${lang === code ? th.green : th.border}`, background: lang === code ? th.green : th.white, color: lang === code ? 'white' : th.textSecondary, fontSize: '14px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' }}
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
            <span style={{ fontSize: '14px', color: th.textSecondary, fontWeight: '500' }}>
              {darkMode ? (isZh ? '夜間模式已開啟 🌙' : 'Dark Mode On 🌙') : (isZh ? '日間模式 ☀️' : 'Light Mode ☀️')}
            </span>
            <div style={{ width: '52px', height: '30px', borderRadius: '15px', background: darkMode ? th.green : th.border, position: 'relative', cursor: 'pointer', transition: 'background 0.3s' }} onClick={toggleDarkMode}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', left: darkMode ? '25px' : '3px', transition: 'left 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div style={card}>
          <span style={cardLabel}>🔔 {t.profile.notifications}</span>

          {notifStatus === 'enabled' ? (
            /* Already enabled state */
            <div>
              <div style={{ background: th.greenLight, borderRadius: '8px', padding: '12px 14px', border: `1px solid ${th.greenSoft}`, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ fontSize: '20px' }}>✅</div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: th.green }}>
                    {isZh ? '每日提醒已開啟' : 'Daily reminders enabled'}
                  </div>
                  <div style={{ fontSize: '12px', color: th.textMuted }}>
                    {isZh ? `每天 ${notifTime} 提醒您記錄` : `You'll be reminded daily at ${notifTime}`}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="time" value={notifTime}
                  onChange={e => { setNotifTime(e.target.value); localStorage.setItem('anitch_notif_time', e.target.value); scheduleNotification(e.target.value) }}
                  style={{ flex: 1, padding: '10px', border: `1.5px solid ${th.border}`, borderRadius: '8px', fontSize: '16px', fontWeight: '700', color: th.green, background: th.lightGrey, outline: 'none', textAlign: 'center' }} />
                <button style={{ padding: '10px 14px', background: 'transparent', color: '#C0392B', border: '1.5px solid #C0392B', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}
                  onClick={disableNotifications}>
                  {isZh ? '關閉提醒' : 'Turn Off'}
                </button>
              </div>
            </div>
          ) : (
            /* Not enabled state */
            <div>
              <div style={{ fontSize: '12px', color: th.textMuted, marginBottom: '12px', lineHeight: '1.6' }}>
                {isZh
                  ? '開啟每日提醒，讓 Anitch 在固定時間提示您記錄皮膚狀況，養成追蹤習慣。'
                  : 'Enable a daily reminder and let Anitch prompt you to log your skin condition at a consistent time each day.'}
              </div>
              <button style={{ width: '100%', padding: '14px', background: th.green, color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', letterSpacing: '0.04em' }}
                onClick={() => setShowNotifDialog(true)}>
                🔔 {isZh ? '設定每日提醒' : 'Set Up Daily Reminder'}
              </button>
            </div>
          )}
        </div>

        <button style={{ width: '100%', color: 'white', border: 'none', borderRadius: '8px', padding: '14px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', marginBottom: '12px', letterSpacing: '0.04em', background: saved ? th.greenMid : th.green }}
          onClick={saveSettings}>
          {saved ? (isZh ? '已儲存！' : 'Saved!') : t.profile.save}
        </button>

        <div style={{ height: '1px', background: th.border, margin: '8px 0 14px' }} />

        {/* Anitch brand info */}
        <div style={{ ...card, textAlign: 'center' }}>
          <img src={LOGO_BASE64} alt="anitch" style={{ height: '20px', width: 'auto', marginBottom: '10px' }} />
          <div style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.15em', color: th.green, textTransform: 'uppercase', marginBottom: '10px' }}>
            {isZh ? '擺脫濕疹困擾' : 'Freedom from Eczema'}
          </div>
          <div style={{ fontSize: '12px', color: th.textMuted, lineHeight: '1.6', marginBottom: '16px' }}>
            {isZh ? 'Anitch® 是一個以科學為基礎的濕疹護膚品牌，致力於改善濕疹患者的生活質量。' : 'Anitch® is a science-driven eczema skincare brand dedicated to improving the lives of those with eczema-prone skin.'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            <a href="https://www.anitch.com/zh" target="_blank" rel="noopener noreferrer" style={{ display: 'block', padding: '10px 16px', background: th.greenLight, color: th.green, borderRadius: '8px', fontSize: '13px', fontWeight: '700', textDecoration: 'none', border: `1px solid ${th.greenSoft}` }}>
              🌐 {isZh ? '官方網站' : 'Official Website'}
            </a>
            <a href="https://www.instagram.com/anitch.hk/" target="_blank" rel="noopener noreferrer" style={{ display: 'block', padding: '10px 16px', background: th.greenLight, color: th.green, borderRadius: '8px', fontSize: '13px', fontWeight: '700', textDecoration: 'none', border: `1px solid ${th.greenSoft}` }}>
              📸 @anitch.hk
            </a>
          </div>
          <div style={{ fontSize: '11px', color: th.textLight }}>Eczema Diary v1.0 · © 2026 Anitch®</div>
        </div>

        <div style={{ height: '1px', background: th.border, margin: '8px 0 14px' }} />

        {/* Logout last */}
        <button style={{ width: '100%', background: 'transparent', color: '#C0392B', border: '1.5px solid #C0392B', borderRadius: '8px', padding: '14px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', marginBottom: '12px', letterSpacing: '0.04em' }}
          onClick={handleLogout}>
          🚪 {t.profile.logout}
        </button>
      </div>
    </div>
  )
}
