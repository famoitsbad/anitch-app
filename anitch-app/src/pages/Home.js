import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useApp } from '../lib/AppContext'

export default function Home() {
  const { user, profile, t } = useApp()
  const navigate = useNavigate()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [todayLogged, setTodayLogged] = useState(false)

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

  const avgSeverity = entries.length ? (entries.reduce((s,e)=>s+e.severity,0)/entries.length).toFixed(1) : '—'
  const flareDays = entries.filter(e=>e.severity>=6).length
  const streak = calcStreak(entries)

  // Last 7 days for mini chart
  const last7 = Array.from({length:7},(_,i)=>{
    const d = new Date(); d.setDate(d.getDate()-6+i)
    const ds = d.toISOString().split('T')[0]
    const entry = entries.find(e=>e.date===ds)
    return { day: t.days[d.getDay()], val: entry ? entry.severity : 0 }
  })

  const hour = new Date().getHours()
  const greeting = hour < 17 ? t.home.greeting : t.home.greetingEvening
  const name = profile?.name || ''

  if (loading) return <div style={styles.loading}>🌿</div>

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.greeting}>{greeting}{name ? `, ${name}` : ''} 👋</div>
          <div style={styles.sub}>{t.home.sub}</div>
        </div>
        <div style={styles.avatar}>{name?name[0].toUpperCase():'🌿'}</div>
      </div>

      {/* Streak card */}
      {streak > 0 && (
        <div style={styles.streakCard}>
          <div>
            <div style={styles.streakNum}>{streak}</div>
            <div style={styles.streakLabel}>{t.home.streak} 🔥</div>
          </div>
          <div style={{flex:1,padding:'0 16px'}}>
            <div style={styles.streakSub}>{t.home.keepGoing}</div>
            <div style={styles.streakTrack}><div style={{...styles.streakFill,width:`${Math.min(100,streak/30*100)}%`}}/></div>
          </div>
          <div style={{fontSize:'28px'}}>🏆</div>
        </div>
      )}

      {/* Stats */}
      <div style={styles.statsGrid}>
        {[
          { label: t.home.avgSeverity, val: avgSeverity, color: '#2A1F1A' },
          { label: t.home.flareDays, val: flareDays, color: flareDays>5?'#E86A5A':'#2A1F1A' },
          { label: t.home.daysLogged, val: entries.length, color: '#5A7A55' },
        ].map(s=>(
          <div key={s.label} style={styles.statCard}>
            <div style={{...styles.statVal,color:s.color}}>{s.val}</div>
            <div style={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Mini chart */}
      {entries.length > 0 && (
        <div style={styles.card}>
          <div style={styles.cardLabel}>{t.home.last7}</div>
          <div style={styles.chartRow}>
            {last7.map((d,i)=>(
              <div key={i} style={styles.barCol}>
                <div style={{...styles.bar, height:`${Math.max(4,d.val/10*60)}px`, background:d.val>=6?'#E8A898':'#C5D9C2'}}/>
                <div style={styles.barLabel}>{d.day}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {entries.length === 0 && <div style={styles.emptyState}>{t.home.noEntries}</div>}

      {/* Log button */}
      <button
        style={{...styles.logBtn, background: todayLogged ? '#5A7A55' : '#C4704A'}}
        onClick={()=>navigate('/log')}
      >
        {todayLogged ? t.home.todayLogged : t.home.logBtn}
      </button>
    </div>
  )
}

function calcStreak(entries) {
  if (!entries.length) return 0
  const dates = entries.map(e=>e.date).sort().reverse()
  let streak = 0, check = new Date()
  for (let i = 0; i < 60; i++) {
    const ds = check.toISOString().split('T')[0]
    if (dates.includes(ds)) { streak++ } else if (i > 0) break
    check.setDate(check.getDate()-1)
  }
  return streak
}

const styles = {
  page: { padding:'16px 16px 100px', maxWidth:'500px', margin:'0 auto' },
  loading: { display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', fontSize:'40px' },
  header: { display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'20px', paddingTop:'8px' },
  greeting: { fontFamily:'Georgia,serif', fontSize:'22px', fontWeight:'400', color:'#2A1F1A', marginBottom:'4px' },
  sub: { fontSize:'13px', color:'#B09A92' },
  avatar: { width:'40px', height:'40px', borderRadius:'50%', background:'#C5D9C2', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', fontWeight:'600', color:'#5A7A55', flexShrink:0 },
  streakCard: { background:'linear-gradient(135deg,#5A7A55,#3A5A35)', borderRadius:'16px', padding:'16px', marginBottom:'16px', display:'flex', alignItems:'center', gap:'12px' },
  streakNum: { fontFamily:'Georgia,serif', fontSize:'32px', fontWeight:'700', color:'white', lineHeight:1 },
  streakLabel: { fontSize:'11px', color:'rgba(255,255,255,0.75)', marginTop:'2px' },
  streakSub: { fontSize:'11px', color:'rgba(255,255,255,0.6)', marginBottom:'6px' },
  streakTrack: { height:'4px', background:'rgba(255,255,255,0.2)', borderRadius:'2px' },
  streakFill: { height:'100%', background:'rgba(255,255,255,0.7)', borderRadius:'2px' },
  statsGrid: { display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px', marginBottom:'16px' },
  statCard: { background:'white', border:'1px solid #E8DDD8', borderRadius:'14px', padding:'14px 10px', textAlign:'center', boxShadow:'0 2px 8px rgba(42,31,26,0.06)' },
  statVal: { fontFamily:'Georgia,serif', fontSize:'26px', fontWeight:'700', lineHeight:1, marginBottom:'4px' },
  statLabel: { fontSize:'10px', color:'#B09A92', textTransform:'uppercase', letterSpacing:'0.06em' },
  card: { background:'white', border:'1px solid #E8DDD8', borderRadius:'16px', padding:'16px', marginBottom:'16px', boxShadow:'0 2px 8px rgba(42,31,26,0.06)' },
  cardLabel: { fontSize:'11px', textTransform:'uppercase', letterSpacing:'0.08em', color:'#B09A92', marginBottom:'12px', fontWeight:'500' },
  chartRow: { display:'flex', alignItems:'flex-end', gap:'6px', height:'70px' },
  barCol: { flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', justifyContent:'flex-end' },
  bar: { width:'100%', borderRadius:'4px 4px 0 0', minHeight:'4px', transition:'height 0.3s' },
  barLabel: { fontSize:'10px', color:'#B09A92' },
  emptyState: { textAlign:'center', color:'#B09A92', padding:'40px 20px', fontSize:'14px' },
  logBtn: { width:'100%', color:'white', border:'none', borderRadius:'16px', padding:'18px', fontSize:'16px', fontWeight:'600', cursor:'pointer', fontFamily:'inherit', boxShadow:'0 4px 20px rgba(196,112,74,0.3)', marginTop:'8px' },
}
