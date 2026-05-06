import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useApp } from '../lib/AppContext'
import { theme, fonts } from '../lib/theme'
import { LOGO_BASE64 } from '../lib/logo'

export default function Home() {
  const { user, profile, t, lang } = useApp()
  const navigate = useNavigate()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [todayLogged, setTodayLogged] = useState(false)
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

  const avg = entries.length ? (entries.reduce((s,e)=>s+e.severity,0)/entries.length).toFixed(1) : '—'
  const flares = entries.filter(e=>e.severity>=6).length
  const streak = calcStreak(entries)
  const isFirstTime = entries.length === 0
  const name = profile?.name || ''

  // Greeting logic
  function getGreeting() {
    if (isFirstTime) {
      return isZh
        ? `你好，${name || ''}！讓我們開始這段旅程吧 🌿`
        : `Hello${name ? `, ${name}` : ''}! Let's start our journey 🌿`
    }
    return isZh
      ? `歡迎回來，${name || ''}！`
      : `Welcome back${name ? `, ${name}` : ''}!`
  }

  function getSubGreeting() {
    if (isFirstTime) return isZh ? '今天是記錄皮膚狀況的第一天 ✨' : 'Today is your first day of tracking ✨'
    return isZh ? t.home.sub : t.home.sub
  }

  const last7 = Array.from({length:7},(_,i)=>{
    const d = new Date(); d.setDate(d.getDate()-6+i)
    const ds = d.toISOString().split('T')[0]
    const entry = entries.find(e=>e.date===ds)
    return { day: t.days[d.getDay()], val: entry?.severity??0, has:!!entry }
  })

  if (loading) return <div style={s.loading}><img src={LOGO_BASE64} alt="anitch" style={s.loadLogo}/></div>

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <img src={LOGO_BASE64} alt="anitch" style={s.logo}/>
        <div style={s.avatar}>{name?name[0].toUpperCase():'A'}</div>
      </div>

      {/* Greeting */}
      <div style={s.greetWrap}>
        <div style={s.greet}>{getGreeting()}</div>
        <div style={s.greetSub}>{getSubGreeting()}</div>
      </div>

      {/* Streak */}
      {streak > 0 && (
        <div style={s.streakCard}>
          <div style={s.streakLeft}>
            <div style={s.streakNum}>{streak}</div>
            <div style={s.streakLabel}>{isZh?`天連續記錄 🔥`:`day streak 🔥`}</div>
          </div>
          <div style={s.streakRight}>
            <div style={s.streakSub}>{isZh?'繼續保持！':'Keep it going!'}</div>
            <div style={s.streakBar}><div style={{...s.streakFill,width:`${Math.min(100,streak/30*100)}%`}}/></div>
          </div>
        </div>
      )}

      {/* Stats */}
      {entries.length > 0 && (
        <div style={s.statsRow}>
          <div style={s.stat}>
            <div style={{...s.statVal,color:flares>5?theme.orange:theme.textPrimary}}>{avg}</div>
            <div style={s.statLabel}>{t.home.avgSeverity}</div>
          </div>
          <div style={s.statDiv}/>
          <div style={s.stat}>
            <div style={{...s.statVal,color:flares>5?theme.orange:theme.textPrimary}}>{flares}</div>
            <div style={s.statLabel}>{t.home.flareDays}</div>
          </div>
          <div style={s.statDiv}/>
          <div style={s.stat}>
            <div style={{...s.statVal,color:theme.green}}>{entries.length}</div>
            <div style={s.statLabel}>{t.home.daysLogged}</div>
          </div>
        </div>
      )}

      {/* Chart */}
      {entries.length > 0 && (
        <div style={s.card}>
          <div style={s.cardLabel}>{t.home.last7}</div>
          <div style={s.chartRow}>
            {last7.map((d,i)=>(
              <div key={i} style={s.barCol}>
                <div style={{...s.bar,height:`${Math.max(3,d.val/10*64)}px`,background:d.val>=6?theme.orange:d.val>0?theme.green:theme.border,opacity:d.has?1:0.3}}/>
                <div style={s.barDay}>{d.day}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* First time empty state */}
      {isFirstTime && (
        <div style={s.firstTimeCard}>
          <div style={{fontSize:'32px',marginBottom:'12px'}}>🌿</div>
          <div style={s.firstTimeTitle}>{isZh?'歡迎來到 Anitch 日記':'Welcome to Anitch Diary'}</div>
          <div style={s.firstTimeSub}>{isZh?'每天記錄一次，慢慢揭開皮膚規律的秘密。':'Log once a day to slowly reveal your skin patterns.'}</div>
        </div>
      )}

      {/* CTA */}
      <button style={{...s.logBtn,background:todayLogged?theme.greenMid:theme.green}} onClick={()=>navigate('/log')}>
        {todayLogged?(isZh?'✓ 今日已記錄':'✓ Today already logged'):(isZh?'✦ 記錄今日狀況':'✦ Log Today\'s Condition')}
      </button>
    </div>
  )
}

function calcStreak(entries) {
  if (!entries.length) return 0
  const dates = entries.map(e=>e.date).sort().reverse()
  let streak = 0; const check = new Date()
  for (let i=0;i<60;i++) {
    const ds = check.toISOString().split('T')[0]
    if (dates.includes(ds)) streak++; else if (i>0) break
    check.setDate(check.getDate()-1)
  }
  return streak
}

const s = {
  page:{background:theme.lightGrey,minHeight:'100vh',fontFamily:fonts.body,paddingBottom:'100px'},
  loading:{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:theme.green},
  loadLogo:{height:'32px',width:'auto',objectFit:'contain'},
  header:{background:theme.green,padding:'14px 20px 20px',display:'flex',alignItems:'center',justifyContent:'space-between'},
  logo:{height:'24px',width:'auto',objectFit:'contain'},
  avatar:{width:'34px',height:'34px',borderRadius:'50%',background:'rgba(255,255,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px',fontWeight:'700',color:'white',border:'2px solid rgba(255,255,255,0.4)'},
  greetWrap:{background:theme.green,padding:'0 20px 24px'},
  greet:{fontSize:'20px',fontWeight:'700',color:'white',letterSpacing:'-0.01em',marginBottom:'4px',lineHeight:'1.3'},
  greetSub:{fontSize:'13px',color:'rgba(255,255,255,0.65)'},
  streakCard:{margin:'16px 16px 0',background:'white',borderRadius:'12px',padding:'14px 16px',display:'flex',alignItems:'center',gap:'14px',boxShadow:`0 4px 16px ${theme.shadow}`,border:`1px solid ${theme.border}`},
  streakLeft:{textAlign:'center',minWidth:'48px'},
  streakNum:{fontSize:'28px',fontWeight:'800',color:theme.green,lineHeight:1},
  streakLabel:{fontSize:'10px',color:theme.textMuted,fontWeight:'600',letterSpacing:'0.04em'},
  streakRight:{flex:1},
  streakSub:{fontSize:'12px',color:theme.textSecondary,marginBottom:'8px',fontWeight:'500'},
  streakBar:{height:'4px',background:theme.lightGrey,borderRadius:'2px',overflow:'hidden'},
  streakFill:{height:'100%',background:theme.green,borderRadius:'2px'},
  statsRow:{background:'white',margin:'12px 16px 0',borderRadius:'12px',padding:'16px',display:'flex',alignItems:'center',boxShadow:`0 1px 4px ${theme.shadow}`,border:`1px solid ${theme.border}`},
  stat:{flex:1,textAlign:'center'},
  statVal:{fontSize:'24px',fontWeight:'800',lineHeight:1,marginBottom:'4px'},
  statLabel:{fontSize:'10px',color:theme.textMuted,textTransform:'uppercase',letterSpacing:'0.08em',fontWeight:'600',fontFamily:fonts.label},
  statDiv:{width:'1px',height:'36px',background:theme.border},
  card:{background:'white',margin:'12px 16px 0',borderRadius:'12px',padding:'16px',boxShadow:`0 1px 4px ${theme.shadow}`,border:`1px solid ${theme.border}`},
  cardLabel:{fontSize:'10px',fontWeight:'700',letterSpacing:'0.1em',textTransform:'uppercase',color:theme.textMuted,marginBottom:'12px',fontFamily:fonts.label},
  chartRow:{display:'flex',alignItems:'flex-end',gap:'6px',height:'72px'},
  barCol:{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',justifyContent:'flex-end'},
  bar:{width:'100%',borderRadius:'3px 3px 0 0',transition:'height 0.3s'},
  barDay:{fontSize:'9px',color:theme.textMuted,fontWeight:'600'},
  firstTimeCard:{margin:'16px 16px 0',background:'white',borderRadius:'12px',padding:'28px 20px',textAlign:'center',boxShadow:`0 1px 4px ${theme.shadow}`,border:`1px solid ${theme.border}`},
  firstTimeTitle:{fontSize:'16px',fontWeight:'700',color:theme.textPrimary,marginBottom:'8px'},
  firstTimeSub:{fontSize:'13px',color:theme.textMuted,lineHeight:'1.6'},
  logBtn:{display:'block',margin:'16px 16px 0',width:'calc(100% - 32px)',color:'white',border:'none',borderRadius:'8px',padding:'16px',fontSize:'14px',fontWeight:'700',cursor:'pointer',fontFamily:fonts.body,letterSpacing:'0.04em'},
}
