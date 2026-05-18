import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../lib/AppContext'
import { LOGO_BASE64 } from '../lib/logo'

export default function Insights() {
  const { user, t, th, lang } = useApp()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [chartWindow, setChartWindow] = useState(14) // 7 | 14 | 30
  const isZh = lang === 'zh'

  useEffect(() => { loadEntries() }, [user])

  async function loadEntries() {
    const ago = new Date(); ago.setDate(ago.getDate() - 30)
    const { data } = await supabase.from('entries').select('*').eq('user_id', user.id)
      .gte('date', ago.toISOString().split('T')[0]).order('date', { ascending: true })
    setEntries(data || [])
    setLoading(false)
  }

  const disclaimer = isZh
    ? '⚕️ 數據只供參考，不能作醫療意見，有任何健康問題請以求醫為準。'
    : '⚕️ Data is for reference only and does not constitute medical advice. Please consult a doctor for any health concerns.'

  // Correlation analysis — the "meaningful insight" engine
  function generateInsights() {
    if (entries.length < 5) return []
    const insights = []
    const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date))

    // Stress → next day flare
    let stressNextFlare = 0, stressDays = 0
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i].triggers?.includes('stress')) {
        stressDays++
        if (sorted[i + 1]?.severity >= 6) stressNextFlare++
      }
    }
    if (stressDays >= 2 && stressNextFlare / stressDays >= 0.5) {
      insights.push({
        icon: '😮‍💨',
        text: isZh
          ? `我們發現您在壓力較大的隔天，有 ${Math.round(stressNextFlare / stressDays * 100)}% 的機率出現皮膚發作。建議在壓力大的日子早點休息。`
          : `We noticed that ${Math.round(stressNextFlare / stressDays * 100)}% of the time, your skin flares the day after a high-stress day. Try to rest earlier on stressful days.`
      })
    }

    // Poor sleep → flare
    let sleepFlare = 0, sleepDays = 0
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i].triggers?.includes('sleep')) {
        sleepDays++
        if (sorted[i + 1]?.severity >= 5) sleepFlare++
      }
    }
    if (sleepDays >= 2 && sleepFlare / sleepDays >= 0.5) {
      insights.push({
        icon: '😴',
        text: isZh
          ? `睡眠不足後的次日，您的皮膚狀況往往較差。良好的睡眠是皮膚修復的關鍵。`
          : `Your skin tends to worsen the day after poor sleep. Quality sleep is key to skin recovery.`
      })
    }

    // Food trigger
    const foodTriggers = ['dairy', 'gluten', 'eggs', 'nuts', 'alcohol', 'spicy', 'seafood']
    const foodCounts = {}
    entries.filter(e => e.severity >= 6).forEach(e =>
      (e.triggers || []).filter(tr => foodTriggers.includes(tr)).forEach(tr => {
        foodCounts[tr] = (foodCounts[tr] || 0) + 1
      })
    )
    const topFood = Object.entries(foodCounts).sort((a, b) => b[1] - a[1])[0]
    if (topFood && topFood[1] >= 2) {
      const foodName = t.triggers[topFood[0]] || topFood[0]
      insights.push({
        icon: '🍽️',
        text: isZh
          ? `${foodName} 在您的高嚴重度發作日中出現了 ${topFood[1]} 次，建議嘗試減少攝取並觀察皮膚反應。`
          : `${foodName} appeared ${topFood[1]} times during your high-severity flare days. Try reducing it and observe your skin response.`
      })
    }

    // Moisturiser consistency
    const logsWithMoisturiser = entries.filter(e => e.skincare_applied?.some(p => p.toLowerCase().includes('moistur') || p.includes('保濕')))
    const avgSevWithMoisturiser = logsWithMoisturiser.length ? logsWithMoisturiser.reduce((s, e) => s + e.severity, 0) / logsWithMoisturiser.length : 0
    const logsWithout = entries.filter(e => !e.skincare_applied?.some(p => p.toLowerCase().includes('moistur') || p.includes('保濕')))
    const avgSevWithout = logsWithout.length ? logsWithout.reduce((s, e) => s + e.severity, 0) / logsWithout.length : 0
    if (logsWithMoisturiser.length >= 3 && logsWithout.length >= 3 && avgSevWithMoisturiser < avgSevWithout - 0.8) {
      insights.push({
        icon: '💧',
        text: isZh
          ? `使用保濕產品的日子，您的平均嚴重度為 ${avgSevWithMoisturiser.toFixed(1)}，沒有使用則為 ${avgSevWithout.toFixed(1)}。保濕確實有幫助！`
          : `On days you moisturise, your avg severity is ${avgSevWithMoisturiser.toFixed(1)} vs ${avgSevWithout.toFixed(1)} on days without. Moisturising is working!`
      })
    }

    // Stable trend
    const last5 = sorted.slice(-5)
    const firstAvg = sorted.slice(0, 5).reduce((s, e) => s + e.severity, 0) / Math.min(5, sorted.length)
    const lastAvg = last5.reduce((s, e) => s + e.severity, 0) / last5.length
    if (lastAvg < firstAvg - 1 && sorted.length >= 10) {
      insights.push({
        icon: '📈',
        text: isZh
          ? `好消息！您的皮膚狀況正在改善中。最近5天的平均嚴重度（${lastAvg.toFixed(1)}）比記錄初期（${firstAvg.toFixed(1)}）明顯下降。`
          : `Great news! Your skin is improving. Your recent 5-day average severity (${lastAvg.toFixed(1)}) is notably lower than when you started (${firstAvg.toFixed(1)}).`
      })
    }

    return insights
  }

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#004B39' }}><img src={LOGO_BASE64} alt="anitch" style={{ height: '28px' }} /></div>

  const insights = generateInsights()
  // Use EASI score if available, otherwise fall back to normalized severity
  const getScore = (e) => e.easi_score !== undefined && e.easi_score !== null ? e.easi_score : (e.severity / 9 * 72)
  const avg = entries.length ? (entries.reduce((s, e) => s + getScore(e), 0) / entries.length).toFixed(1) : '—'
  const avgLabel = entries.some(e => e.easi_score !== undefined) ? `${avg} / 72` : avg
  const flares = entries.filter(e => e.easi_score !== undefined ? e.easi_score >= 16 : e.severity >= 6).length
  const chartDays = Array.from({ length: chartWindow }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (chartWindow - 1) + i)
    const ds = d.toISOString().split('T')[0]
    const entry = entries.find(e => e.date === ds)
    const val = entry ? (entry.easi_score !== undefined ? entry.easi_score / 72 * 9 : entry.severity) : 0
    const label = chartWindow <= 14 ? `${d.getMonth()+1}/${d.getDate()}` : t.days[d.getDay()]
    return { label, val, has: !!entry, score: entry?.easi_score ?? (entry ? entry.severity : null) }
  })
  const trigCounts = {}
  entries.forEach(e => (e.triggers || []).forEach(tr => { trigCounts[tr] = (trigCounts[tr] || 0) + 1 }))
  const topTriggers = Object.entries(trigCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const skincareCounts = {}
  entries.forEach(e => (e.skincare_applied || []).forEach(p => { skincareCounts[p] = (skincareCounts[p] || 0) + 1 }))
  const topSkincare = Object.entries(skincareCounts).sort((a, b) => b[1] - a[1]).slice(0, 4)

  const SKINCARE_ZH = {
    'Moisturiser': '保濕霜',
    'Serum': '精華液',
    'Toner': '爽膚水',
    'Sunscreen': '防曬霜',
    'Barrier Rescue Balm': '屏障急救軟膏',
    'Barrier Restore Face Cream': '屏障修復面霜',
    'Barrier Repair Body Cream': '屏障修復身體乳霜',
    'Spot treatment': '局部護理',
    'Steroid cream': '類固醇藥膏',
  }
  function skincareLabel(name) {
    if (!isZh) return name
    return SKINCARE_ZH[name] || name
  }

  const card = { background: th.white, borderRadius: '12px', padding: '16px', marginBottom: '12px', boxShadow: `0 1px 4px ${th.shadow}`, border: `1px solid ${th.border}` }
  const cardLabel = { fontSize: '10px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: th.textMuted, marginBottom: '12px', display: 'block' }

  return (
    <div style={{ background: th.lightGrey, minHeight: '100vh', fontFamily: "'Lato',sans-serif" }}>
      <div style={{ background: th.green, padding: 'env(safe-area-inset-top, 14px) 20px 20px', paddingTop: 'max(14px, env(safe-area-inset-top))' }}>
        <img src={LOGO_BASE64} alt="anitch" style={{ height: '22px', width: 'auto', marginBottom: '12px' }} />
        <div style={{ fontSize: '22px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>{t.insights.title}</div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.75)', lineHeight: '1.5', background: 'rgba(0,0,0,0.15)', borderRadius: '6px', padding: '8px 12px', border: '1px solid rgba(255,255,255,0.15)' }}>{disclaimer}</div>
      </div>

      {entries.length < 3 ? (
        <div style={{ padding: '16px' }}>
          <div style={{ ...card, textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>📊</div>
            <div style={{ fontSize: '14px', color: th.textMuted, lineHeight: '1.6' }}>{t.insights.noData}</div>
          </div>
        </div>
      ) : (
        <div style={{ padding: '16px 14px 100px' }}>
          {/* Stats */}
          <div style={{ ...card, display: 'flex', alignItems: 'center' }}>
            {[
              { val: entries.some(e => e.easi_score !== undefined) ? `${avg}/72` : avg, label: isZh ? '平均EASI分數' : 'Avg EASI Score', color: th.textPrimary },
              { val: flares, label: t.insights.flareDays, color: flares > 5 ? th.orange : th.textPrimary },
              { val: entries.length, label: t.insights.daysLogged, color: th.green },
            ].map((stat, i) => (
              <React.Fragment key={i}>
                {i > 0 && <div style={{ width: '1px', height: '36px', background: th.border }} />}
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: stat.color, lineHeight: 1, marginBottom: '4px' }}>{stat.val}</div>
                  <div style={{ fontSize: '10px', color: th.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '600' }}>{stat.label}</div>
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* AI-style correlation insights */}
          {insights.length > 0 && (
            <div style={card}>
              <span style={cardLabel}>🧠 {isZh ? '皮膚規律洞察' : 'Skin Pattern Insights'}</span>
              <div style={{ fontSize: '11px', color: th.textMuted, marginBottom: '12px' }}>
                {isZh ? '根據您的記錄數據，我們發現：' : 'Based on your logged data, we noticed:'}
              </div>
              {insights.map((insight, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px', background: th.greenLight, borderRadius: '10px', marginBottom: i < insights.length - 1 ? '8px' : 0, border: `1px solid ${th.greenSoft}` }}>
                  <div style={{ fontSize: '20px', flexShrink: 0 }}>{insight.icon}</div>
                  <div style={{ fontSize: '13px', color: th.greenDark, lineHeight: '1.5' }}>{insight.text}</div>
                </div>
              ))}
            </div>
          )}

          {/* Combined trend chart — 7/14/30 toggle */}
          <div style={card}>
            <span style={cardLabel}>📈 {isZh ? '嚴重程度趨勢' : 'Severity Trend'}</span>
            {/* Toggle buttons */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
              {[7, 14, 30].map(w => (
                <div key={w} onClick={() => setChartWindow(w)} style={{
                  flex: 1, textAlign: 'center', padding: '6px 0', borderRadius: '6px', fontSize: '12px', fontWeight: chartWindow === w ? '700' : '500', cursor: 'pointer',
                  background: chartWindow === w ? th.green : th.white,
                  color: chartWindow === w ? 'white' : th.textMuted,
                  border: `1.5px solid ${chartWindow === w ? th.green : th.border}`,
                }}>
                  {isZh ? `${w}天` : `${w}d`}
                </div>
              ))}
            </div>
            {/* Bars */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: chartWindow <= 14 ? '4px' : '2px', height: '90px', marginBottom: '8px' }}>
              {chartDays.map((d, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', justifyContent: 'flex-end' }}>
                  <div style={{ width: '100%', borderRadius: '3px 3px 0 0', height: `${Math.max(3, d.val / 10 * 80)}px`, background: d.val >= 7 ? th.orange : d.val > 0 ? th.green : th.border, opacity: d.has ? 1 : 0.25, transition: 'height 0.3s' }} />
                  {chartWindow <= 14 && <div style={{ fontSize: '7px', color: th.textMuted, fontWeight: '600', whiteSpace: 'nowrap' }}>{d.label}</div>}
                </div>
              ))}
            </div>
            {/* Legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '2px', background: th.green, marginRight: '4px' }} />
              <span style={{ fontSize: '10px', color: th.textMuted, marginRight: '12px' }}>{isZh ? '輕微 (EASI<7)' : 'Mild (EASI<7)'}</span>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '2px', background: th.orange, marginRight: '4px' }} />
              <span style={{ fontSize: '10px', color: th.textMuted, marginRight: '12px' }}>{isZh ? '中度及以上' : 'Moderate+'}</span>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '2px', background: th.border, marginRight: '4px' }} />
              <span style={{ fontSize: '10px', color: th.textMuted }}>{isZh ? '未記錄' : 'No log'}</span>
            </div>
          </div>

          {/* Top triggers */}
          {topTriggers.length > 0 && (
            <div style={card}>
              <span style={cardLabel}>⚠️ {t.insights.topTriggers}</span>
              {topTriggers.map(([tr, count]) => {
                const pct = count / entries.length
                const barColor = pct >= 0.7 ? '#C0392B' : pct >= 0.5 ? th.orange : th.greenMid
                return (
                  <div key={tr} style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '8px', marginBottom: '8px', borderBottom: `1px solid ${th.lightGrey}` }}>
                    <div style={{ fontSize: '12px', color: th.textPrimary, flex: '0 0 130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: '500' }}>{t.triggers[tr] || tr}</div>
                    <div style={{ flex: 1, height: '6px', background: th.lightGrey, borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct * 100}%`, background: barColor, borderRadius: '3px' }} />
                    </div>
                    <div style={{ fontSize: '11px', color: th.textSecondary, minWidth: '32px', textAlign: 'right', fontWeight: '700' }}>{Math.round(pct * 100)}%</div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Skincare consistency */}
          {topSkincare.length > 0 && (
            <div style={card}>
              <span style={cardLabel}>🧴 {isZh ? '護膚習慣' : 'Skincare Consistency'}</span>
              {topSkincare.map(([p, count]) => {
                const pct = count / entries.length
                return (
                  <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '8px', marginBottom: '8px', borderBottom: `1px solid ${th.lightGrey}` }}>
                    <div style={{ fontSize: '12px', color: th.textPrimary, flex: '0 0 130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: '500' }}>{p}</div>
                    <div style={{ flex: 1, height: '6px', background: th.lightGrey, borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct * 100}%`, background: th.green, borderRadius: '3px' }} />
                    </div>
                    <div style={{ fontSize: '11px', color: th.textSecondary, minWidth: '32px', textAlign: 'right', fontWeight: '700' }}>{Math.round(pct * 100)}%</div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Disclaimer - no export, tracker only */}
          <div style={{ background: th.greenLight, borderRadius: '12px', padding: '16px', border: `1px solid ${th.greenSoft}`, marginBottom: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: th.green, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
              📋 {isZh ? '關於此數據' : 'About This Data'}
            </div>
            <div style={{ fontSize: '12px', color: th.greenDark, lineHeight: '1.6' }}>
              {isZh
                ? 'Anitch 濕疹日記是一個個人追蹤工具，所有數據僅供您自己參考。如有任何皮膚健康疑慮，請諮詢皮膚科醫生。'
                : 'Anitch Eczema Diary is a personal tracking tool. All data is for your own reference only. Please consult a dermatologist for any skin health concerns.'
              }
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
