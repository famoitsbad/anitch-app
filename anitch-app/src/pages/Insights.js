import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../lib/AppContext'
import { theme, fonts } from '../lib/theme'
import { LOGO_BASE64 } from '../lib/logo'

export default function Insights() {
  const {user,t,lang} = useApp()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const isZh = lang === 'zh'

  useEffect(()=>{loadEntries()},[user])

  async function loadEntries(){
    const ago=new Date();ago.setDate(ago.getDate()-30)
    const {data}=await supabase.from('entries').select('*').eq('user_id',user.id).gte('date',ago.toISOString().split('T')[0]).order('date',{ascending:true})
    setEntries(data||[])
    setLoading(false)
  }

  if(loading)return<div style={s.loading}><img src={LOGO_BASE64} alt="anitch" style={s.loadLogo}/></div>

  const disclaimer = isZh
    ? '⚕️ 數據只供參考，不能作醫療意見，有任何健康問題請以求醫為準。'
    : '⚕️ Data is for reference only and does not constitute medical advice. Please consult a doctor for any health concerns.'

  if(entries.length<3)return(
    <div style={s.page}>
      <div style={s.header}>
        <img src={LOGO_BASE64} alt="anitch" style={s.logo}/>
        <div style={s.title}>{t.insights.title}</div>
        <div style={s.disclaimer}>{disclaimer}</div>
      </div>
      <div style={s.body}>
        <div style={s.emptyCard}>
          <div style={{fontSize:'36px',marginBottom:'12px'}}>📊</div>
          <div style={{fontSize:'14px',color:theme.textMuted,textAlign:'center',lineHeight:'1.6'}}>{t.insights.noData}</div>
        </div>
      </div>
    </div>
  )

  const avg=(entries.reduce((s,e)=>s+e.severity,0)/entries.length).toFixed(1)
  const flares=entries.filter(e=>e.severity>=6).length
  const last14=Array.from({length:14},(_,i)=>{
    const d=new Date();d.setDate(d.getDate()-13+i)
    const ds=d.toISOString().split('T')[0]
    const entry=entries.find(e=>e.date===ds)
    return{day:t.days[d.getDay()],val:entry?.severity??0,has:!!entry}
  })
  const trigCounts={}
  entries.forEach(e=>(e.triggers||[]).forEach(tr=>{trigCounts[tr]=(trigCounts[tr]||0)+1}))
  const topTriggers=Object.entries(trigCounts).sort((a,b)=>b[1]-a[1]).slice(0,5)

  // Top skincare products
  const skincareCounts={}
  entries.forEach(e=>(e.skincare_applied||[]).forEach(p=>{skincareCounts[p]=(skincareCounts[p]||0)+1}))
  const topSkincare=Object.entries(skincareCounts).sort((a,b)=>b[1]-a[1]).slice(0,4)

  return(
    <div style={s.page}>
      <div style={s.header}>
        <img src={LOGO_BASE64} alt="anitch" style={s.logo}/>
        <div style={s.title}>{t.insights.title}</div>
        <div style={s.disclaimer}>{disclaimer}</div>
      </div>
      <div style={s.body}>
        {/* Stats */}
        <div style={s.statsRow}>
          <div style={s.stat}>
            <div style={s.statVal}>{avg}</div>
            <div style={s.statLabel}>{t.insights.avgSeverity}</div>
          </div>
          <div style={s.statDiv}/>
          <div style={s.stat}>
            <div style={{...s.statVal,color:flares>5?theme.orange:theme.textPrimary}}>{flares}</div>
            <div style={s.statLabel}>{t.insights.flareDays}</div>
          </div>
          <div style={s.statDiv}/>
          <div style={s.stat}>
            <div style={{...s.statVal,color:theme.green}}>{entries.length}</div>
            <div style={s.statLabel}>{t.insights.daysLogged}</div>
          </div>
        </div>

        {/* Chart */}
        <div style={s.card}>
          <div style={s.cardLabel}>📈 {t.insights.chart}</div>
          <div style={s.chartRow}>
            {last14.map((d,i)=>(
              <div key={i} style={s.barCol}>
                <div style={{...s.bar,height:`${Math.max(3,d.val/10*80)}px`,background:d.val>=7?theme.orange:d.val>0?theme.green:theme.border,opacity:d.has?1:0.3}}/>
                <div style={s.barDay}>{d.day}</div>
              </div>
            ))}
          </div>
          <div style={s.chartLegend}>
            <span style={{display:'inline-block',width:'8px',height:'8px',borderRadius:'2px',background:theme.green,marginRight:'4px'}}/>
            <span style={{fontSize:'10px',color:theme.textMuted,marginRight:'12px'}}>{isZh?'輕微':'Low'}</span>
            <span style={{display:'inline-block',width:'8px',height:'8px',borderRadius:'2px',background:theme.orange,marginRight:'4px'}}/>
            <span style={{fontSize:'10px',color:theme.textMuted}}>{isZh?'發作':'Flare'}</span>
          </div>
        </div>

        {/* Top triggers */}
        {topTriggers.length>0&&(
          <div style={s.card}>
            <div style={s.cardLabel}>⚠️ {t.insights.topTriggers}</div>
            {topTriggers.map(([tr,count])=>{
              const pct=count/entries.length
              const barColor=pct>=0.7?'#C0392B':pct>=0.5?theme.orange:theme.greenMid
              return(
                <div key={tr} style={s.trigRow}>
                  <div style={s.trigName}>{t.triggers[tr]||tr}</div>
                  <div style={s.trigBarWrap}><div style={{...s.trigBar,width:`${pct*100}%`,background:barColor}}/></div>
                  <div style={s.trigPct}>{Math.round(pct*100)}%</div>
                </div>
              )
            })}
          </div>
        )}

        {/* Skincare consistency */}
        {topSkincare.length>0&&(
          <div style={s.card}>
            <div style={s.cardLabel}>🧴 {isZh?'護膚習慣':'Skincare Consistency'}</div>
            {topSkincare.map(([p,count])=>{
              const pct=count/entries.length
              return(
                <div key={p} style={s.trigRow}>
                  <div style={s.trigName}>{p}</div>
                  <div style={s.trigBarWrap}><div style={{...s.trigBar,width:`${pct*100}%`,background:theme.green}}/></div>
                  <div style={s.trigPct}>{Math.round(pct*100)}%</div>
                </div>
              )
            })}
          </div>
        )}

        <button style={s.exportBtn} onClick={()=>alert(isZh?'PDF匯出功能即將推出！':'PDF export coming soon!')}>
          {t.insights.export}
        </button>
      </div>
    </div>
  )
}

const s={
  page:{background:theme.lightGrey,minHeight:'100vh',fontFamily:fonts.body},
  loading:{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:theme.green},
  loadLogo:{height:'28px',width:'auto'},
  header:{background:theme.green,padding:'14px 20px 20px'},
  logo:{height:'22px',width:'auto',objectFit:'contain',marginBottom:'12px'},
  title:{fontSize:'22px',fontWeight:'700',color:'white',marginBottom:'8px'},
  disclaimer:{fontSize:'11px',color:'rgba(255,255,255,0.75)',lineHeight:'1.5',background:'rgba(0,0,0,0.15)',borderRadius:'6px',padding:'8px 12px',border:'1px solid rgba(255,255,255,0.15)'},
  body:{padding:'14px 14px 100px'},
  emptyCard:{background:'white',borderRadius:'12px',padding:'40px 20px',display:'flex',flexDirection:'column',alignItems:'center',boxShadow:`0 1px 4px ${theme.shadow}`,border:`1px solid ${theme.border}`},
  statsRow:{background:'white',borderRadius:'12px',padding:'16px',display:'flex',alignItems:'center',marginBottom:'12px',boxShadow:`0 1px 4px ${theme.shadow}`,border:`1px solid ${theme.border}`},
  stat:{flex:1,textAlign:'center'},
  statVal:{fontSize:'24px',fontWeight:'800',color:theme.textPrimary,lineHeight:1,marginBottom:'4px'},
  statLabel:{fontSize:'10px',color:theme.textMuted,textTransform:'uppercase',letterSpacing:'0.08em',fontWeight:'600',fontFamily:fonts.label},
  statDiv:{width:'1px',height:'36px',background:theme.border},
  card:{background:'white',borderRadius:'12px',padding:'16px',marginBottom:'12px',boxShadow:`0 1px 4px ${theme.shadow}`,border:`1px solid ${theme.border}`},
  cardLabel:{fontSize:'10px',fontWeight:'700',letterSpacing:'0.12em',textTransform:'uppercase',color:theme.textMuted,marginBottom:'12px',fontFamily:fonts.label},
  chartRow:{display:'flex',alignItems:'flex-end',gap:'4px',height:'90px',marginBottom:'8px'},
  barCol:{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',justifyContent:'flex-end'},
  bar:{width:'100%',borderRadius:'3px 3px 0 0',transition:'height 0.3s'},
  barDay:{fontSize:'8px',color:theme.textMuted,fontWeight:'600'},
  chartLegend:{display:'flex',alignItems:'center'},
  trigRow:{display:'flex',alignItems:'center',gap:'10px',paddingBottom:'8px',marginBottom:'8px',borderBottom:`1px solid ${theme.lightGrey}`},
  trigName:{fontSize:'12px',color:theme.textPrimary,flex:'0 0 130px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontWeight:'500'},
  trigBarWrap:{flex:1,height:'6px',background:theme.lightGrey,borderRadius:'3px',overflow:'hidden'},
  trigBar:{height:'100%',borderRadius:'3px',transition:'width 0.5s'},
  trigPct:{fontSize:'11px',color:theme.textSecondary,minWidth:'32px',textAlign:'right',fontWeight:'700'},
  exportBtn:{width:'100%',background:theme.green,color:'white',border:'none',borderRadius:'8px',padding:'16px',fontSize:'14px',fontWeight:'700',cursor:'pointer',fontFamily:fonts.body,letterSpacing:'0.04em'},
}
