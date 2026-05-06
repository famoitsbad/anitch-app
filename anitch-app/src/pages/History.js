import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../lib/AppContext'
import { theme, fonts } from '../lib/theme'
import { LOGO_BASE64 } from '../lib/logo'

export default function History() {
  const {user,t,lang} = useApp()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [photoUrls, setPhotoUrls] = useState({})
  const isZh = lang === 'zh'

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

  // Bilingual date display per Anitch_中英文雙語日期佈局方案 spec
  function DateDisplay({ dateStr }) {
    const d = new Date(dateStr + 'T00:00:00')
    const day = d.getDate().toString().padStart(2, '0')
    const monthEN = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][d.getMonth()]
    const monthZH = `${d.getMonth()+1}月`
    const weekEN = ['SUN','MON','TUE','WED','THU','FRI','SAT'][d.getDay()]
    const weekZH = ['週日','週一','週二','週三','週四','週五','週六'][d.getDay()]

    return (
      <div style={dateS.wrap}>
        {/* Large day number */}
        <div style={dateS.day}>{day}</div>
        {/* Month + weekday stacked */}
        <div style={dateS.rightCol}>
          <span style={{...dateS.month,...(isZh?{}:dateS.monthEN)}}>
            {isZh ? monthZH : monthEN}
          </span>
          <span style={{...dateS.week,...(isZh?{}:dateS.weekEN)}}>
            {isZh ? weekZH : weekEN}
          </span>
        </div>
      </div>
    )
  }

  if(loading)return<div style={s.loading}><img src={LOGO_BASE64} alt="anitch" style={s.loadLogo}/></div>

  return(
    <div style={s.page}>
      <div style={s.header}>
        <img src={LOGO_BASE64} alt="anitch" style={s.logo}/>
        <div style={s.title}>{t.history.title}</div>
        <div style={s.sub}>{t.history.sub}</div>
      </div>
      <div style={s.body}>
        {entries.length===0&&<div style={s.empty}>{t.history.noEntries}</div>}
        {entries.map(e=>(
          <div key={e.id} style={s.entry}>
            <DateDisplay dateStr={e.date}/>
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
              {e.skincare_applied?.length>0&&(
                <div style={s.tagsRow}>
                  {e.skincare_applied.slice(0,2).map(p=><span key={p} style={{...s.tag,...s.tagGreen}}>🧴 {p}</span>)}
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
        ))}
      </div>
    </div>
  )
}

// Date display styles per bilingual layout spec
const dateS = {
  wrap:{display:'flex',alignItems:'center',gap:'8px',minWidth:'72px'},
  day:{fontSize:'26px',fontWeight:'800',color:theme.green,lineHeight:1,fontFamily:fonts.heading,letterSpacing:'-0.02em',fontVariantNumeric:'tabular-nums'},
  rightCol:{display:'flex',flexDirection:'column',borderLeft:`1px solid ${theme.border}`,paddingLeft:'8px',lineHeight:'1.3'},
  month:{fontWeight:'700',color:theme.textSecondary,fontSize:'12px'},
  monthEN:{textTransform:'uppercase',letterSpacing:'-0.02em',fontSize:'11px'},
  week:{color:theme.textMuted,fontSize:'10px'},
  weekEN:{textTransform:'uppercase',letterSpacing:'0.06em',fontSize:'9px'},
}

const s = {
  page:{background:theme.lightGrey,minHeight:'100vh',fontFamily:fonts.body},
  loading:{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:theme.green},
  loadLogo:{height:'28px',width:'auto'},
  header:{background:theme.green,padding:'14px 20px 24px'},
  logo:{height:'22px',width:'auto',objectFit:'contain',marginBottom:'12px'},
  title:{fontSize:'22px',fontWeight:'700',color:'white',marginBottom:'4px'},
  sub:{fontSize:'13px',color:'rgba(255,255,255,0.65)'},
  body:{padding:'14px 14px 100px'},
  empty:{textAlign:'center',color:theme.textMuted,padding:'60px 20px',fontSize:'14px'},
  entry:{background:'white',borderRadius:'12px',padding:'14px',marginBottom:'10px',display:'flex',gap:'12px',boxShadow:`0 1px 4px ${theme.shadow}`,border:`1px solid ${theme.border}`},
  content:{flex:1,minWidth:0},
  topRow:{marginBottom:'6px'},
  score:{fontSize:'11px',fontWeight:'700',padding:'3px 10px',borderRadius:'4px',display:'inline-block',border:'1px solid'},
  tagsRow:{display:'flex',flexWrap:'wrap',gap:'4px',marginBottom:'4px'},
  tag:{fontSize:'10px',color:theme.textMuted,background:theme.lightGrey,padding:'2px 8px',borderRadius:'4px',border:`1px solid ${theme.border}`,fontWeight:'500'},
  tagOrange:{background:'#FEF0E3',borderColor:'#FCCFA0',color:theme.orangeDark},
  tagGreen:{background:theme.greenLight,borderColor:theme.greenSoft,color:theme.green},
  notes:{fontSize:'11px',color:theme.textMuted,fontStyle:'italic',marginTop:'4px'},
  photoCol:{flexShrink:0},
  photo:{width:'50px',height:'50px',borderRadius:'8px',objectFit:'cover',border:`1px solid ${theme.border}`},
  noPhoto:{width:'50px',height:'50px',borderRadius:'8px',background:theme.lightGrey,border:`1px solid ${theme.border}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px'},
}
