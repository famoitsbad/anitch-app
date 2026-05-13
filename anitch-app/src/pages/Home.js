import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useApp } from '../lib/AppContext'
import LearnSection from '../components/LearnSection'

// ── Eczema / skincare tips (rotate by day of year) ───────────────────────────
const TIPS_EN = [
  { title: 'Moisturise within 3 min after bathing', body: 'Pat skin gently dry then apply your barrier balm immediately — pores absorb moisture best right after a shower.' },
  { title: 'Lukewarm water only', body: 'Hot showers strip your skin\'s natural oils and worsen the itch cycle. Keep bath water cool to warm, and limit to 10 minutes.' },
  { title: 'Wear loose, breathable cotton', body: 'Synthetic fabrics trap heat and create friction. Switch to 100% cotton or bamboo, especially for sleepwear and underwear.' },
  { title: 'Manage stress — your skin feels it too', body: 'Stress is one of the most common eczema triggers. Even 5 minutes of deep breathing or a short walk can help calm a flare.' },
  { title: 'Wash new clothes before wearing', body: 'New garments carry dyes and finishing chemicals. Always wash before first wear to reduce skin irritation risk.' },
  { title: 'Keep your nails short', body: 'Short, smooth nails reduce skin damage when you scratch — and scratching happens even during sleep. File any sharp edges weekly.' },
  { title: 'Change your bed sheets weekly', body: 'Dust mites thrive in bedding and are a leading eczema trigger. Use hot-wash cycles (60°C+) and hypoallergenic covers.' },
  { title: 'Check your laundry detergent', body: 'Fragranced or enzyme-heavy detergents irritate sensitive skin. Switch to a fragrance-free, dermatologically tested formula.' },
  { title: 'Stay hydrated — skin health starts inside', body: 'Dehydration worsens skin dryness. Aim for 6–8 glasses of water per day to support your skin barrier from within.' },
  { title: 'Use a humidifier in dry weather', body: 'Air-conditioned or heated rooms pull moisture from skin. A bedside humidifier set to 45–55% RH can ease overnight dryness.' },
]
const TIPS_ZH = [
  { title: '沐浴後3分鐘內塗保濕霜', body: '輕拍皮膚至半乾後立即塗抹屏障修護霜——毛孔在沐浴後張開，吸收力最強。' },
  { title: '只用微溫水洗澡', body: '熱水會破壞皮膚天然油脂，加劇瘙癢循環。水溫保持微溫，沐浴時間控制在10分鐘內。' },
  { title: '穿著寬鬆透氣的棉質衣物', body: '合成纖維積熱及摩擦皮膚。盡量選擇100%純棉或竹纖維，尤其是睡衣和內衣。' },
  { title: '管理壓力——皮膚感受得到', body: '壓力是最常見的濕疹誘因之一。每天5分鐘深呼吸或散步，有助於平復發作。' },
  { title: '新衣服先洗才穿', body: '新衣服殘留染料和化學整理劑，首次穿著前先洗滌，可減少皮膚刺激風險。' },
  { title: '保持指甲短而光滑', body: '短指甲可減少抓傷造成的皮膚損傷——即使睡著了也會抓。每週修整尖銳邊緣。' },
  { title: '每週換洗床單', body: '塵蟎是主要濕疹誘因之一，喜歡在床上繁殖。用60°C以上熱水清洗，並使用防敏床套。' },
  { title: '留意洗衣液的成分', body: '含香料或酵素的洗衣液容易刺激敏感肌膚。建議改用無香料、皮膚科測試的配方。' },
  { title: '保持水分攝取——健康由內而外', body: '脫水會使皮膚更乾燥。每天目標飲用6至8杯水，由內而外支撐皮膚屏障。' },
  { title: '乾燥天氣使用加濕器', body: '冷氣或暖氣房間會帶走皮膚水分。床頭加濕器維持45–55% RH，可緩解夜間乾燥。' },
]

const MONTH_NAMES_EN = ['January','February','March','April','May','June','July','August','September','October','November','December']
const MONTH_NAMES_ZH = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
const DAY_LABELS_EN = ['S','M','T','W','T','F','S']
const DAY_LABELS_ZH = ['日','一','二','三','四','五','六']

export default function Home() {
  const { user, profile, t, th, lang } = useApp()
  const navigate = useNavigate()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [todayLogged, setTodayLogged] = useState(false)
  const [copyingYesterday, setCopyingYesterday] = useState(false)
  const [calMonth, setCalMonth] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })
  const isZh = lang === 'zh'
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => { loadEntries() }, [user])

  async function loadEntries() {
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
    const { data } = await supabase.from('entries').select('*')
      .eq('user_id', user.id)
      .gte('date', ninetyDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: false })
    setEntries(data || [])
    setTodayLogged(data?.some(e => e.date === today))
    setLoading(false)
  }

  async function handleSameAsYesterday() {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yd = yesterday.toISOString().split('T')[0]
    const yEntry = entries.find(e => e.date === yd)
    if (!yEntry) { alert(isZh ? '找不到昨天的記錄' : 'No entry found for yesterday'); return }
    setCopyingYesterday(true)
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

  // ── Computed values ──────────────────────────────────────────────────────
  const avg = entries.length
    ? (entries.reduce((s, e) => s + (e.easi_score ?? e.severity ?? 0), 0) / entries.length).toFixed(1)
    : '—'
  const flares = entries.filter(e => (e.easi_score ?? e.severity ?? 0) >= 6).length
  const streak = calcStreak(entries)
  const stableStreak = calcStableStreak(entries)
  const isFirstTime = entries.length === 0
  const name = profile?.name || ''

  const reward15Unlocked = streak >= 15
  const reward30Unlocked = streak >= 30

  // Tip of the day — rotates by day of year
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
  const tips = isZh ? TIPS_ZH : TIPS_EN
  const tip = tips[dayOfYear % tips.length]

  function getGreeting() {
    if (isFirstTime)
      return isZh
        ? `你好${name ? `，${name}` : ''}！讓我們開始這段旅程吧`
        : `Hello${name ? `, ${name}` : ''}! Let's start your journey`
    return isZh
      ? `歡迎回來${name ? `，${name}` : ''}！`
      : `Welcome back${name ? `, ${name}` : ''}!`
  }

  // Last 7 days chart
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - 6 + i)
    const ds = d.toISOString().split('T')[0]
    const entry = entries.find(e => e.date === ds)
    return { day: t.days[d.getDay()], val: entry?.easi_score ?? entry?.severity ?? 0, has: !!entry }
  })

  // Product tip
  const recentDryness = entries.slice(0, 3).some(e => e.symptoms?.includes('dryness'))
  const recentOozing = entries.slice(0, 3).some(e => e.symptoms?.includes('weeping'))
  function getProductTip() {
    if (recentOozing) return isZh
      ? '根據您近期的記錄，Anitch Barrier Rescue Balm 可能特別適合您現在的皮膚狀況。'
      : 'Based on your recent logs, Anitch Barrier Rescue Balm may be especially suitable for your current skin condition.'
    if (recentDryness) return isZh
      ? '您近期記錄顯示皮膚較乾燥，Anitch Barrier Restore Face Cream 或 Barrier Repair Body Cream 可提供深層保濕。'
      : 'Your recent logs show dryness. Anitch Barrier Restore Face Cream or Barrier Repair Body Cream may help with deep hydration.'
    return null
  }
  const productTip = entries.length >= 3 ? getProductTip() : null

  // Calendar helpers
  const loggedDates = new Set(entries.map(e => e.date))
  const isCurrentMonth = calMonth.year === new Date().getFullYear() && calMonth.month === new Date().getMonth()
  const monthLabel = isZh
    ? `${calMonth.year}年${MONTH_NAMES_ZH[calMonth.month]}`
    : `${MONTH_NAMES_EN[calMonth.month]} ${calMonth.year}`

  function calDays() {
    const firstDay = new Date(calMonth.year, calMonth.month, 1).getDay()
    const daysInMonth = new Date(calMonth.year, calMonth.month + 1, 0).getDate()
    const cells = []
    for (let i = 0; i < firstDay; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(d)
    return cells
  }

  function prevMonth() {
    setCalMonth(m => m.month === 0 ? { year: m.year - 1, month: 11 } : { ...m, month: m.month - 1 })
  }
  function nextMonth() {
    if (isCurrentMonth) return
    setCalMonth(m => m.month === 11 ? { year: m.year + 1, month: 0 } : { ...m, month: m.month + 1 })
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#004B39' }}>
      <div style={{ color: 'white', fontSize: '16px', fontFamily: "'Lato',sans-serif" }}>Loading…</div>
    </div>
  )

  return (
    <div style={{ background: th.lightGrey, minHeight: '100vh', fontFamily: "'Lato',sans-serif", paddingBottom: '100px' }}>

      {/* ── Header (no logo) ── */}
      <div style={{ background: th.green, paddingTop: 'max(14px, env(safe-area-inset-top))', paddingLeft: '20px', paddingRight: '20px', paddingBottom: '0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: 'white', lineHeight: '1.25' }}>{getGreeting()}</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', marginTop: '2px' }}>
              {new Date().toLocaleDateString(isZh ? 'zh-HK' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
          <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: 'white', border: '2px solid rgba(255,255,255,0.4)', flexShrink: 0 }}>
            {name ? name[0].toUpperCase() : 'A'}
          </div>
        </div>

        {/* ── Tip of the day (replaces encouragement band) ── */}
        <div style={{ background: 'rgba(0,0,0,0.18)', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px' }}>
          <div style={{ fontSize: '9px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.9px', textTransform: 'uppercase', marginBottom: '5px' }}>
            {isZh ? '今日貼士' : 'Tip of the day'}
          </div>
          <div style={{ fontSize: '13px', fontWeight: '700', color: 'white', lineHeight: '1.35', marginBottom: '3px' }}>{tip.title}</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.72)', lineHeight: '1.5' }}>{tip.body}</div>
        </div>
      </div>

      <div style={{ padding: '14px 14px 0' }}>

        {/* ── Log Calendar card ── */}
        <div style={{ background: th.white, borderRadius: '14px', border: `1px solid ${th.border}`, marginBottom: '12px', overflow: 'hidden' }}>

          {/* Card header */}
          <div style={{ padding: '14px 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: th.green, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
              {isZh ? '記錄日曆' : 'Log calendar'}
            </div>
            {streak > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: th.lightGrey, border: `1px solid ${th.border}`, borderRadius: '20px', padding: '3px 10px' }}>
                <span style={{ fontSize: '13px', fontWeight: '800', color: th.orange }}>{streak}</span>
                <span style={{ fontSize: '9px', color: th.textMuted }}>{isZh ? '天連續' : 'day streak'}</span>
              </div>
            )}
          </div>

          {/* Month nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px 6px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: th.textPrimary }}>{monthLabel}</div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button onClick={prevMonth} style={{ background: 'none', border: 'none', fontSize: '18px', color: th.green, cursor: 'pointer', padding: '0 6px', lineHeight: 1 }}>‹</button>
              <button onClick={nextMonth} disabled={isCurrentMonth} style={{ background: 'none', border: 'none', fontSize: '18px', color: isCurrentMonth ? th.textLight : th.green, cursor: isCurrentMonth ? 'default' : 'pointer', padding: '0 6px', lineHeight: 1 }}>›</button>
            </div>
          </div>

          {/* Day labels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', padding: '0 10px', gap: '2px' }}>
            {(isZh ? DAY_LABELS_ZH : DAY_LABELS_EN).map((d, i) => (
              <div key={i} style={{ textAlign: 'center', fontSize: '9px', fontWeight: '700', color: th.textMuted, paddingBottom: '4px' }}>{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', padding: '0 10px 14px', gap: '3px' }}>
            {calDays().map((day, i) => {
              if (!day) return <div key={i} />
              const ds = `${calMonth.year}-${String(calMonth.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const isToday = ds === today
              const isLogged = loggedDates.has(ds)
              const isFuture = ds > today
              let bg = 'transparent'
              let color = isFuture ? th.borderLight : th.textMuted
              let outlineStyle = 'none'
              if (isLogged && isToday) { bg = th.green; color = 'white'; outlineStyle = `2.5px solid ${th.orange}` }
              else if (isLogged) { bg = th.green; color = 'white' }
              else if (isToday) { bg = th.orange; color = 'white' }
              return (
                <div key={i} style={{ width: '30px', height: '30px', borderRadius: '50%', background: bg, color, outline: outlineStyle, outlineOffset: '1px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '600', margin: '0 auto' }}>
                  {day}
                </div>
              )
            })}
          </div>

          {/* Care Rewards */}
          <div style={{ borderTop: `1px solid ${th.borderLight}`, padding: '12px 16px 14px' }}>
            <div style={{ fontSize: '9px', fontWeight: '700', color: th.textMuted, letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: '10px' }}>
              {isZh ? '護膚獎勵' : 'Care rewards'}
            </div>

            {/* 15-day */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: reward15Unlocked ? th.green : th.orangeLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '15px' }}>{reward15Unlocked ? '🔓' : '🎁'}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: reward15Unlocked ? th.green : th.textPrimary, marginBottom: '2px' }}>
                  {reward15Unlocked
                    ? (isZh ? '15天達成 — 點擊領取免費樣品' : '15-day unlocked — tap to claim sample')
                    : (isZh ? '15天連續 — 神秘免費樣品' : '15-day streak — mystery free sample')}
                </div>
                <div style={{ fontSize: '9px', color: th.textMuted, marginBottom: '4px' }}>
                  {reward15Unlocked
                    ? (isZh ? '您的兌換碼已準備好' : 'Your reward code is ready')
                    : (isZh ? `還需 ${Math.max(0, 15 - streak)} 天解鎖` : `${Math.max(0, 15 - streak)} more days to unlock`)}
                </div>
                <div style={{ height: '4px', background: th.lightGrey, borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, (streak / 15) * 100)}%`, background: reward15Unlocked ? th.green : th.orange, borderRadius: '10px', transition: 'width 0.4s' }} />
                </div>
              </div>
              <div style={{ fontSize: '9px', fontWeight: '700', color: reward15Unlocked ? th.green : th.textMuted, flexShrink: 0, minWidth: '24px', textAlign: 'right' }}>
                {reward15Unlocked ? '✓' : `${Math.min(streak, 15)}/15`}
              </div>
            </div>

            {/* 30-day */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: reward30Unlocked ? th.green : '#FFFBEC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '15px' }}>{reward30Unlocked ? '🔓' : '🎟️'}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: reward30Unlocked ? th.green : th.textPrimary, marginBottom: '2px' }}>
                  {reward30Unlocked
                    ? (isZh ? '30天達成 — 點擊領取 $20 優惠券' : '30-day unlocked — tap to claim $20 coupon')
                    : (isZh ? '30天連續 — $20 購物優惠券' : '30-day streak — $20 off coupon')}
                </div>
                <div style={{ fontSize: '9px', color: th.textMuted, marginBottom: '4px' }}>
                  {reward30Unlocked
                    ? (isZh ? '可用於 anitch.com 購物' : 'Redeemable at anitch.com')
                    : (isZh ? `還需 ${Math.max(0, 30 - streak)} 天解鎖` : `${Math.max(0, 30 - streak)} more days to unlock`)}
                </div>
                <div style={{ height: '4px', background: th.lightGrey, borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, (streak / 30) * 100)}%`, background: reward30Unlocked ? th.green : '#c8920a', borderRadius: '10px', transition: 'width 0.4s' }} />
                </div>
              </div>
              <div style={{ fontSize: '9px', fontWeight: '700', color: reward30Unlocked ? th.green : th.textMuted, flexShrink: 0, minWidth: '24px', textAlign: 'right' }}>
                {reward30Unlocked ? '✓' : `${Math.min(streak, 30)}/30`}
              </div>
            </div>
          </div>
        </div>

        {/* ── Stable streak badge ── */}
        {stableStreak >= 7 && (
          <div style={{ background: th.green, borderRadius: '12px', padding: '14px 16px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '26px' }}>🏅</div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: 'white', marginBottom: '2px' }}>
                {isZh ? '皮膚屏障修復中！' : 'Skin barrier recovering!'}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)' }}>
                {isZh ? `您已連續 ${stableStreak} 天狀況穩定，繼續加油` : `${stableStreak} stable days in a row — great progress`}
              </div>
            </div>
          </div>
        )}

        {/* ── Stats ── */}
        {entries.length > 0 && (
          <div style={{ background: th.white, borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', marginBottom: '12px', border: `1px solid ${th.border}` }}>
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

        {/* ── 7-day chart ── */}
        {entries.length > 0 && (
          <div style={{ background: th.white, borderRadius: '12px', padding: '16px', marginBottom: '12px', border: `1px solid ${th.border}` }}>
            <div style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: th.textMuted, marginBottom: '12px' }}>{t.home.last7}</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '72px' }}>
              {last7.map((d, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                  <div style={{ width: '100%', borderRadius: '3px 3px 0 0', height: `${Math.max(3, (d.val / 72) * 64)}px`, background: d.val >= 16 ? th.orange : d.val > 0 ? th.green : th.border, opacity: d.has ? 1 : 0.3, transition: 'height 0.3s' }} />
                  <div style={{ fontSize: '9px', color: th.textMuted, fontWeight: '600' }}>{d.day}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Product tip ── */}
        {productTip && (
          <div style={{ background: th.greenLight, borderRadius: '12px', padding: '14px 16px', marginBottom: '12px', border: `1px solid ${th.greenSoft}` }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: th.green, marginBottom: '6px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {isZh ? 'Anitch 產品建議' : 'Anitch product tip'}
            </div>
            <div style={{ fontSize: '13px', color: th.greenDark, lineHeight: '1.5' }}>{productTip}</div>
          </div>
        )}

        {/* ── First time ── */}
        {isFirstTime && (
          <div style={{ background: th.white, borderRadius: '12px', padding: '28px 20px', textAlign: 'center', marginBottom: '12px', border: `1px solid ${th.border}` }}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: th.textPrimary, marginBottom: '8px' }}>
              {isZh ? '歡迎來到 Anitch 日記' : 'Welcome to Anitch Diary'}
            </div>
            <div style={{ fontSize: '13px', color: th.textMuted, lineHeight: '1.6' }}>
              {isZh ? '每天記錄一次，慢慢揭開皮膚規律的秘密。' : 'Log once a day to slowly reveal your skin patterns.'}
            </div>
          </div>
        )}

        {/* ── Log button ── */}
        <button
          style={{ width: '100%', color: 'white', border: 'none', borderRadius: '8px', padding: '16px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', letterSpacing: '0.04em', marginBottom: '10px', background: todayLogged ? th.textSecondary : th.green }}
          onClick={() => {
            if (todayLogged) {
              const todayEntry = entries.find(e => e.date === today)
              navigate('/log', { state: { existingEntry: todayEntry } })
            } else {
              navigate('/log')
            }
          }}>
          {todayLogged
            ? (isZh ? '✏️ 編輯今日記錄' : '✏️ Edit today\'s entry')
            : (isZh ? '✦ 記錄今日狀況' : '✦ Log today\'s condition')}
        </button>

        {/* ── Same as yesterday ── */}
        {!todayLogged && entries.length > 0 && (
          <button
            style={{ width: '100%', background: th.white, color: th.green, border: `1.5px solid ${th.green}`, borderRadius: '8px', padding: '13px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', letterSpacing: '0.04em' }}
            onClick={handleSameAsYesterday}
            disabled={copyingYesterday}>
            {copyingYesterday ? '...' : (isZh ? '📋 跟昨天一樣' : '📋 Same as yesterday')}
          </button>
        )}
      </div>

      <LearnSection isZh={isZh} th={th} />
      <div style={{ height: '20px' }} />
    </div>
  )
}

function calcStreak(entries) {
  if (!entries.length) return 0
  const dates = entries.map(e => e.date).sort().reverse()
  let streak = 0
  const check = new Date()
  for (let i = 0; i < 90; i++) {
    const ds = check.toISOString().split('T')[0]
    if (dates.includes(ds)) streak++
    else if (i > 0) break
    check.setDate(check.getDate() - 1)
  }
  return streak
}

function calcStableStreak(entries) {
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date))
  let streak = 0
  for (const e of sorted) {
    if ((e.easi_score ?? e.severity ?? 0) <= 4) streak++
    else break
  }
  return streak
}
