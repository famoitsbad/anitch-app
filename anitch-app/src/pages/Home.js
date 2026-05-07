import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useApp } from '../lib/AppContext'
import { LOGO_BASE64 } from '../lib/logo'

const ENCOURAGEMENTS_EN = [
  "Today, take care of your skin — and yourself. 🌿",
  "Small steps every day lead to big changes. Keep going!",
  "Remember to moisturise after your shower today 💧",
  "Your skin is healing, even on the hard days.",
  "You're not alone in this journey. Anitch is with you. 🌱",
  "Every log brings you closer to understanding your skin.",
  "Rest well tonight — sleep is one of the best remedies.",
]
const ENCOURAGEMENTS_ZH = [
  "今天，好好照顧您的皮膚——也照顧自己。🌿",
  "每天一小步，累積大改變。繼續加油！",
  "記得洗完澡後塗保濕霜 💧",
  "您的皮膚正在修復中，即使在困難的日子裡。",
  "您在這段旅程中並不孤單，Anitch 與您同行。🌱",
  "每一次記錄都讓您更了解自己的皮膚。",
  "今晚好好休息——睡眠是最好的良藥之一。",
]

export default function Home() {
  const { user, profile, t, th, lang } = useApp()
  const navigate = useNavigate()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [todayLogged, setTodayLogged] = useState(false)
  const [copyingYesterday, setCopyingYesterday] = useState(false)
  const isZh = lang === 'zh'

  useEffect(() => { loadEntries() }, [user])

  async function loadEntries() {
    const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const { data } = await supabase.from('entries').select('*')
      .eq('user_id', user.id).gte('date', thirtyDaysAgo.toISOString().split('T')[0]).order('date', { ascending: false })
    setEntries(data || [])
    const today = new Date().toISOString().split('T')[0]
    setTodayLogged(data?.some(e => e.date === today))
    setLoading(false)
  }

  // Same as yesterday — copy yesterday's entry to today
  async function handleSameAsYesterday() {
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1)
    const yd = yesterday.toISOString().split('T')[0]
    const yEntry = entries.find(e => e.date === yd)
    if (!yEntry) { alert(isZh ? '找不到昨天的記錄' : 'No entry found for yesterday'); return }
    setCopyingYesterday(true)
    const today = new Date().toISOString().split('T')[0]
    await supabase.from('entries').upsert({
      user_id: user.id, date: today,
      severity: yEntry.severity, symptoms: yEntry.symptoms,
      triggers: yEntry.triggers, affected_zones: yEntry.affected_zones,
      notes: isZh ? '（與昨天相同）' : '(Same as yesterday)',
      skincare_applied: yEntry.skincare_applied || [],
    }, { onConflict: 'user_id,date' })
    setCopyingYesterday(false)
    setTodayLogged(true)
    loadEntries()
  }

  const avg = entries.length ? (entries.reduce((s, e) => s + e.severity, 0) / entries.length).toFixed(1) : '—'
  const flares = entries.filter(e => e.severity >= 6).length
  const streak = calcStreak(entries)
  const stableStreak = calcStableStreak(entries)
  const isFirstTime = entries.length === 0
  const name = profile?.name || ''

  // Random daily encouragement
  const dayIndex = new Date().getDate() % 7
  const encouragement = isZh ? ENCOURAGEMENTS_ZH[dayIndex] : ENCOURAGEMENTS_EN[dayIndex]

  function getGreeting() {
    if (isFirstTime) return isZh ? `你好${name ? `，${name}` : ''}！讓我們開始這段旅程吧 🌿` : `Hello${name ? `, ${name}` : ''}! Let's start our journey 🌿`
    return isZh ? `歡迎回來${name ? `，${name}` : ''}！` : `Welcome back${name ? `, ${name}` : ''}!`
  }

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - 6 + i)
    const ds = d.toISOString().split('T')[0]
    const entry = entries.find(e => e.date === ds)
    return { day: t.days[d.getDay()], val: entry?.severity ?? 0, has: !!entry }
  })

  // Anitch product tip based on recent dryness
  const recentDryness = entries.slice(0, 3).some(e => e.symptoms?.includes('dryness'))
  const recentOozing = entries.slice(0, 3).some(e => e.symptoms?.includes('weeping'))
  function getProductTip() {
    if (recentOozing) return isZh ? '根據您近期的記錄，Anitch Barrier Rescue Balm 可能特別適合您現在的皮膚狀況。' : 'Based on your recent logs, Anitch Barrier Rescue Balm may be especially suitable for your current skin condition.'
    if (recentDryness) return isZh ? '您近期記錄顯示皮膚較乾燥，Anitch Barrier Restore Face Cream 或 Barrier Repair Body Cream 可提供深層保濕。' : 'Your recent logs show dryness. Anitch Barrier Restore Face Cream or Barrier Repair Body Cream may help with deep hydration.'
    return null
  }
  const productTip = entries.length >= 3 ? getProductTip() : null

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#004B39' }}><img src={LOGO_BASE64} alt="anitch" style={{ height: '32px' }} /></div>

  return (
    <div style={{ background: th.lightGrey, minHeight: '100vh', fontFamily: "'Lato',sans-serif", paddingBottom: '100px' }}>
      {/* Header */}
      <div style={{ background: th.green, padding: '14px 20px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <img src={LOGO_BASE64} alt="anitch" style={{ height: '24px', width: 'auto' }} />
        <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: 'white', border: '2px solid rgba(255,255,255,0.4)' }}>
          {name ? name[0].toUpperCase() : 'A'}
        </div>
      </div>

      {/* Greeting */}
      <div style={{ background: th.green, padding: '0 20px 20px' }}>
        <div style={{ fontSize: '20px', fontWeight: '700', color: 'white', marginBottom: '6px', lineHeight: '1.3' }}>{getGreeting()}</div>
        {/* Daily encouragement */}
        <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: 'rgba(255,255,255,0.9)', lineHeight: '1.5', fontStyle: 'italic' }}>
          {encouragement}
        </div>
      </div>

      <div style={{ padding: '14px 14px 0' }}>
        {/* Streak */}
        {streak > 0 && (
          <div style={{ background: th.white, borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: `0 1px 4px ${th.shadow}`, border: `1px solid ${th.border}`, marginBottom: '12px' }}>
            <div style={{ textAlign: 'center', minWidth: '48px' }}>
              <div style={{ fontSize: '28px', fontWeight: '800', color: th.green, lineHeight: 1 }}>{streak}</div>
              <div style={{ fontSize: '10px', color: th.textMuted, fontWeight: '600' }}>{isZh ? '天連續 🔥' : 'day streak 🔥'}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: th.textSecondary, marginBottom: '8px', fontWeight: '500' }}>{isZh ? '繼續保持！' : 'Keep it going!'}</div>
              <div style={{ height: '4px', background: th.lightGrey, borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(100, streak / 30 * 100)}%`, background: th.green, borderRadius: '2px' }} />
              </div>
            </div>
          </div>
        )}

        {/* 7-day stable badge */}
        {stableStreak >= 7 && (
          <div style={{ background: 'linear-gradient(135deg,#004B39,#1A6B54)', borderRadius: '12px', padding: '14px 16px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '28px' }}>🏅</div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: 'white', marginBottom: '2px' }}>
                {isZh ? '皮膚屏障修復中！' : 'Skin Barrier Recovering!'}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)' }}>
                {isZh ? `您已連續 ${stableStreak} 天狀況穩定，繼續加油 💪` : `${stableStreak} stable days in a row. Amazing progress 💪`}
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        {entries.length > 0 && (
          <div style={{ background: th.white, borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', marginBottom: '12px', boxShadow: `0 1px 4px ${th.shadow}`, border: `1px solid ${th.border}` }}>
            {[
              { val: avg, label: t.home.avgSeverity, color: th.textPrimary },
              { val: flares, label: t.home.flareDays, color: flares > 5 ? th.orange : th.textPrimary },
              { val: entries.length, label: t.home.daysLogged, color: th.green },
            ].map((stat, i) => (
              <React.Fragment key={i}>
                {i > 0 && <div style={{ width: '1px', height: '36px', background: th.border }} />}
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '800', lineHeight: 1, marginBottom: '4px', color: stat.color }}>{stat.val}</div>
                  <div style={{ fontSize: '10px', color: th.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '600' }}>{stat.label}</div>
                </div>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Chart */}
        {entries.length > 0 && (
          <div style={{ background: th.white, borderRadius: '12px', padding: '16px', marginBottom: '12px', boxShadow: `0 1px 4px ${th.shadow}`, border: `1px solid ${th.border}` }}>
            <div style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: th.textMuted, marginBottom: '12px' }}>{t.home.last7}</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '72px' }}>
              {last7.map((d, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                  <div style={{ width: '100%', borderRadius: '3px 3px 0 0', height: `${Math.max(3, d.val / 10 * 64)}px`, background: d.val >= 6 ? th.orange : d.val > 0 ? th.green : th.border, opacity: d.has ? 1 : 0.3, transition: 'height 0.3s' }} />
                  <div style={{ fontSize: '9px', color: th.textMuted, fontWeight: '600' }}>{d.day}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Anitch product tip */}
        {productTip && (
          <div style={{ background: th.greenLight, borderRadius: '12px', padding: '14px 16px', marginBottom: '12px', border: `1px solid ${th.greenSoft}` }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: th.green, marginBottom: '6px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              💡 {isZh ? 'Anitch 產品建議' : 'Anitch Product Tip'}
            </div>
            <div style={{ fontSize: '13px', color: th.greenDark, lineHeight: '1.5' }}>{productTip}</div>
          </div>
        )}

        {/* First time */}
        {isFirstTime && (
          <div style={{ background: th.white, borderRadius: '12px', padding: '28px 20px', textAlign: 'center', marginBottom: '12px', boxShadow: `0 1px 4px ${th.shadow}`, border: `1px solid ${th.border}` }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🌿</div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: th.textPrimary, marginBottom: '8px' }}>{isZh ? '歡迎來到 Anitch 日記' : 'Welcome to Anitch Diary'}</div>
            <div style={{ fontSize: '13px', color: th.textMuted, lineHeight: '1.6' }}>{isZh ? '每天記錄一次，慢慢揭開皮膚規律的秘密。' : 'Log once a day to slowly reveal your skin patterns.'}</div>
          </div>
        )}

        {/* Log button — if today logged, open for editing with existing data */}
        <button style={{ width: '100%', color: 'white', border: 'none', borderRadius: '8px', padding: '16px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', letterSpacing: '0.04em', marginBottom: '10px', background: th.green }}
          onClick={() => {
            if (todayLogged) {
              const today = new Date().toISOString().split('T')[0]
              const todayEntry = entries.find(e => e.date === today)
              navigate('/log', { state: { existingEntry: todayEntry } })
            } else {
              navigate('/log')
            }
          }}>
          {todayLogged ? (isZh ? '✏️ 編輯今日記錄' : '✏️ Edit Today\'s Entry') : (isZh ? '✦ 記錄今日狀況' : '✦ Log Today\'s Condition')}
        </button>

        {/* Same as yesterday */}
        {!todayLogged && entries.length > 0 && (
          <button style={{ width: '100%', background: th.white, color: th.green, border: `1.5px solid ${th.green}`, borderRadius: '8px', padding: '13px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', letterSpacing: '0.04em' }}
            onClick={handleSameAsYesterday} disabled={copyingYesterday}>
            {copyingYesterday ? '...' : (isZh ? '📋 跟昨天一樣' : '📋 Same as Yesterday')}
          </button>
        )}
      </div>
    </div>
  )
}

function calcStreak(entries) {
  if (!entries.length) return 0
  const dates = entries.map(e => e.date).sort().reverse()
  let streak = 0; const check = new Date()
  for (let i = 0; i < 60; i++) {
    const ds = check.toISOString().split('T')[0]
    if (dates.includes(ds)) streak++; else if (i > 0) break
    check.setDate(check.getDate() - 1)
  }
  return streak
}

function calcStableStreak(entries) {
  // Count consecutive days with severity <= 4
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date))
  let streak = 0
  for (const e of sorted) {
    if (e.severity <= 4) streak++; else break
  }
  return streak
}
