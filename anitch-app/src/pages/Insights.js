import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../lib/AppContext'

export default function Insights() {
  const { user, t } = useApp()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadEntries() }, [user])

  async function loadEntries() {
    const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const { data } = await supabase.from('entries').select('*')
      .eq('user_id', user.id).gte('date', thirtyDaysAgo.toISOString().split('T')[0]).order('date', { ascending: true })
    setEntries(data || [])
    setLoading(false)
  }

  if (loading) return <div style={styles.loading}>🌿</div>

  if (entries.length < 3) return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.title}>{t.insights.title}</div>
        <div style={styles.sub}>{t.insights.sub}</div>
      </div>
      <div style={styles.emptyCard}>
        <div style={{fontSize:'40px',marginBottom:'12px'}}>📊</div>
        <div style={{fontSize:'14px',color:'#B09A92',textAlign:'center'}}>{t.insights.noData}</div>
      </div>
    </div>
  )

  const avgSeverity = (entries.reduce((s,e)=>s+e.severity,0)/entries.length).toFixed(1)
  const flareDays = entries.filter(e=>e.severity>=6).length

  // 14-day chart
  const last14 = Array.from({length:14},(_,i)=>{
    const d = new Date(); d.setDate(d.getDate()-13+i)
    const ds = d.toISOString().split('T')[0]
    const entry = entries.find(e=>e.date===ds)
    return { day: t.days[d.getDay()], val: entry?.severity ?? 0, hasData: !!entry }
  })

  // Top triggers
  const triggerCounts = {}
  entries.forEach(e=>(e.triggers||[]).forEach(tr=>{ triggerCounts[tr]=(triggerCounts[tr]||0)+1 }))
  const topTriggers = Object.entries(triggerCounts).sort((a,b)=>b[1]-a[1]).slice(0,5)
  const maxTrigger = topTriggers[0]?.[1] || 1

  function triggerColor(pct) {
    if (pct >= 0.7) return '#E86A5A'
    if (pct >= 0.5) return '#E8A04A'
    return '#E8A898'
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.title}>{t.insights.title}</div>
        <div style={styles.sub}>{t.insights.sub}</div>
      </div>

      {/* Stats grid */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statVal}>{avgSeverity}</div>
          <div style={styles.statLabel}>{t.insights.avgSeverity}</div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statVal, color:flareDays>5?'#E86A5A':'#2A1F1A'}}>{flareDays}</div>
          <div style={styles.statLabel}>{t.insights.flareDays}</div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statVal, color:'#5A7A55'}}>{entries.length}</div>
          <div style={styles.statLabel}>{t.insights.daysLogged}</div>
        </div>
      </div>

      {/* 14-day chart */}
      <div style={styles.card}>
        <div style={styles.cardLabel}>📈 {t.insights.chart}</div>
        <div style={styles.chartRow}>
          {last14.map((d,i)=>(
            <div key={i} style={styles.barCol}>
              <div style={{
                ...styles.bar,
                height:`${Math.max(4,d.val/10*80)}px`,
                background: d.val>=7?'#E8A898':d.val>0?'#C5D9C2':'#F0EDE8',
                opacity: d.hasData?1:0.4
              }}/>
              <div style={styles.barDay}>{d.day}</div>
            </div>
          ))}
        </div>
        <div style={styles.chartLegend}>
          <span style={styles.legendDot('C5D9C2')}/>Low &nbsp;
          <span style={styles.legendDot('E8A898')}/>Flare
        </div>
      </div>

      {/* Top triggers */}
      {topTriggers.length > 0 && (
        <div style={styles.card}>
          <div style={styles.cardLabel}>⚠️ {t.insights.topTriggers}</div>
          {topTriggers.map(([tr, count])=>{
            const pct = count/entries.length
            return (
              <div key={tr} style={styles.trigRow}>
                <div style={styles.trigName}>{t.triggers[tr] || tr}</div>
                <div style={styles.trigBarWrap}>
                  <div style={{...styles.trigBar, width:`${pct*100}%`, background:triggerColor(pct)}}/>
                </div>
                <div style={styles.trigPct}>{Math.round(pct*100)}%</div>
              </div>
            )
          })}
        </div>
      )}

      {/* Export btn */}
      <button style={styles.exportBtn} onClick={()=>alert('PDF export coming soon! / PDF匯出功能即將推出！')}>
        {t.insights.export}
      </button>
    </div>
  )
}

const styles = {
  page: { padding:'16px 16px 100px', maxWidth:'500px', margin:'0 auto' },
  loading: { display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', fontSize:'40px' },
  header: { marginBottom:'20px', paddingTop:'8px' },
  title: { fontFamily:'Georgia,serif', fontSize:'22px', fontWeight:'400', color:'#2A1F1A', marginBottom:'4px' },
  sub: { fontSize:'13px', color:'#B09A92' },
  emptyCard: { background:'white', border:'1px solid #E8DDD8', borderRadius:'16px', padding:'40px 20px', display:'flex', flexDirection:'column', alignItems:'center', boxShadow:'0 2px 8px rgba(42,31,26,0.06)' },
  statsGrid: { display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px', marginBottom:'16px' },
  statCard: { background:'white', border:'1px solid #E8DDD8', borderRadius:'14px', padding:'14px 10px', textAlign:'center', boxShadow:'0 2px 8px rgba(42,31,26,0.06)' },
  statVal: { fontFamily:'Georgia,serif', fontSize:'26px', fontWeight:'700', color:'#2A1F1A', lineHeight:1, marginBottom:'4px' },
  statLabel: { fontSize:'10px', color:'#B09A92', textTransform:'uppercase', letterSpacing:'0.06em' },
  card: { background:'white', border:'1px solid #E8DDD8', borderRadius:'16px', padding:'16px', marginBottom:'14px', boxShadow:'0 2px 8px rgba(42,31,26,0.06)' },
  cardLabel: { fontSize:'11px', fontWeight:'500', letterSpacing:'0.08em', textTransform:'uppercase', color:'#B09A92', marginBottom:'12px' },
  chartRow: { display:'flex', alignItems:'flex-end', gap:'4px', height:'90px', marginBottom:'8px' },
  barCol: { flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', justifyContent:'flex-end' },
  bar: { width:'100%', borderRadius:'3px 3px 0 0', transition:'height 0.3s', minHeight:'4px' },
  barDay: { fontSize:'8px', color:'#B09A92' },
  chartLegend: { fontSize:'10px', color:'#B09A92', display:'flex', alignItems:'center', gap:'4px' },
  legendDot: (c)=>({ display:'inline-block', width:'8px', height:'8px', borderRadius:'2px', background:`#${c}`, marginRight:'2px' }),
  trigRow: { display:'flex', alignItems:'center', gap:'10px', paddingBottom:'8px', marginBottom:'8px', borderBottom:'1px solid #F0EDE8' },
  trigName: { fontSize:'12px', color:'#2A1F1A', flex:'0 0 120px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
  trigBarWrap: { flex:1, height:'6px', background:'#FAF6F0', borderRadius:'3px', overflow:'hidden' },
  trigBar: { height:'100%', borderRadius:'3px', transition:'width 0.5s' },
  trigPct: { fontSize:'11px', color:'#7A6560', minWidth:'32px', textAlign:'right', fontWeight:'500' },
  exportBtn: { width:'100%', background:'#C4704A', color:'white', border:'none', borderRadius:'16px', padding:'16px', fontSize:'15px', fontWeight:'600', cursor:'pointer', fontFamily:'inherit' },
}
