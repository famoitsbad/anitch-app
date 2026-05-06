import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../lib/AppContext'
import { theme, fonts } from '../lib/theme'

export default function History() {
  const {user,t} = useApp()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [photoUrls, setPhotoUrls] = useState({})

  useEffect(()=>{loadEntries()},[user])

  async function loadEntries() {
    const {data} = await supabase.from('entries').select('*').eq('user_id',user.id).order('date',{ascending:false})
    setEntries(data||[])
    const urls={}
    for(const e of (data||[])){
      if(e.photo_url){
        const {data:url}=await supabase.storage.from('skin-photos').createSignedUrl(e.photo_url,3600)
        if(url)urls[e.id]=url.signedUrl
      }
    }
    setPhotoUrls(urls)
    setLoading(false)
  }

  function scoreStyle(sev){
    if(sev<=3)return{background:'#EAF5EF',color:theme.green,borderColor:'#B8DFC8'}
    if(sev<=6)return{background:'#FEF0E3',color:theme.orangeDark,borderColor:'#FCCFA0'}
    return{background:'#FDECEA',color:'#C0392B',borderColor:'#F5B7B1'}
  }
  function scoreLabel(sev){
    if(sev<=3)return t.scoreLabels?.mild||'Mild'
    if(sev<=6)return t.scoreLabels?.moderate||'Moderate'
    return t.scoreLabels?.severe||'Severe'
  }
  function fmtDate(ds){
    const d=new Date(ds+'T00:00:00')
    return{day:d.getDate(),month:t.months[d.getMonth()],weekday:t.days[d.getDay()]}
  }

  if(loading)return<div style={s.loading}><div style={s.loadLogo}>anitch™</div></div>

  return(
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.logoText}>anitch™</div>
        <div style={s.title}>{t.history.title}</div>
        <div style={s.sub}>{t.history.sub}</div>
      </div>
      <div style={s.body}>
        {entries.length===0&&<div style={s.empty}>{t.history.noEntries}</div>}
        {entries.map(e=>{
          const {day,month,weekday}=fmtDate(e.date)
          return(
            <div key={e.id} style={s.entry}>
              <div style={s.dateCol}>
                <div style={s.weekday}>{weekday}</div>
                <div style={s.day}>{day}</div>
                <div style={s.month}>{month}</div>
              </div>
              <div style={s.content}>
                <div style={s.topRow}>
                  <span style={{...s.score,...scoreStyle(e.severity)}}>
                    {t.history.severity} {e.severity} · {scoreLabel(e.severity)}
                  </span>
                </div>
                {e.symptoms?.length>0&&(
                  <div style={s.tagsRow}>
                    {e.symptoms.map(sym=><span key={sym} style={s.tag}>{t.symptoms[sym]}</span>)}
                  </div>
                )}
                {e.triggers?.length>0&&(
                  <div style={s.tagsRow}>
                    {e.triggers.slice(0,3).map(tr=><span key={tr} style={{...s.tag,...s.tagOrange}}>{t.triggers[tr]}</span>)}
                    {e.triggers.length>3&&<span style={s.tag}>+{e.triggers.length-3}</span>}
                  </div>
                )}
                {e.notes&&<div style={s.notes}>"{e.notes.substring(0,60)}{e.notes.length>60?'...':''}"</div>}
              </div>
              <div style={s.photoCol}>
                {photoUrls[e.id]
                  ?<img src={photoUrls[e.id]} alt="skin" style={s.photo}/>
                  :<div style={s.noPhoto}>📷</div>
                }
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const s={
  page:{background:theme.lightGrey,minHeight:'100vh',fontFamily:fonts.body},
  loading:{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:theme.green},
  loadLogo:{color:'white',fontSize:'32px',fontWeight:'800'},
  header:{background:theme.green,padding:'16px 20px 24px'},
  logoText:{color:'white',fontSize:'18px',fontWeight:'800',letterSpacing:'-0.02em',marginBottom:'12px'},
  title:{fontSize:'22px',fontWeight:'700',color:'white',marginBottom:'4px'},
  sub:{fontSize:'13px',color:'rgba(255,255,255,0.65)'},
  body:{padding:'16px 16px 100px'},
  empty:{textAlign:'center',color:theme.textMuted,padding:'60px 20px',fontSize:'14px'},
  entry:{background:'white',borderRadius:'12px',padding:'14px',marginBottom:'10px',display:'flex',gap:'12px',boxShadow:`0 1px 4px ${theme.shadow}`,border:`1px solid ${theme.border}`},
  dateCol:{textAlign:'center',minWidth:'40px'},
  weekday:{fontSize:'9px',color:theme.textMuted,textTransform:'uppercase',letterSpacing:'0.06em',fontWeight:'600'},
  day:{fontSize:'22px',fontWeight:'800',color:theme.textPrimary,lineHeight:1},
  month:{fontSize:'10px',color:theme.textMuted,textTransform:'uppercase',letterSpacing:'0.04em'},
  content:{flex:1,minWidth:0},
  topRow:{marginBottom:'6px'},
  score:{fontSize:'11px',fontWeight:'700',padding:'3px 10px',borderRadius:'4px',display:'inline-block',border:'1px solid'},
  tagsRow:{display:'flex',flexWrap:'wrap',gap:'4px',marginBottom:'4px'},
  tag:{fontSize:'10px',color:theme.textMuted,background:theme.lightGrey,padding:'2px 8px',borderRadius:'4px',border:`1px solid ${theme.border}`,fontWeight:'500'},
  tagOrange:{background:'#FEF0E3',borderColor:'#FCCFA0',color:theme.orangeDark},
  notes:{fontSize:'11px',color:theme.textMuted,fontStyle:'italic',marginTop:'4px'},
  photoCol:{flexShrink:0},
  photo:{width:'50px',height:'50px',borderRadius:'8px',objectFit:'cover',border:`1px solid ${theme.border}`},
  noPhoto:{width:'50px',height:'50px',borderRadius:'8px',background:theme.lightGrey,border:`1px solid ${theme.border}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px'},
}
