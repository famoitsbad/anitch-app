import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../lib/AppContext'

export default function History() {
  const { user, t } = useApp()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [photoUrls, setPhotoUrls] = useState({})

  useEffect(() => { loadEntries() }, [user])

  async function loadEntries() {
    const { data } = await supabase.from('entries').select('*')
      .eq('user_id', user.id).order('date', { ascending: false })
    setEntries(data || [])
    // Load photo URLs
    const urls = {}
    for (const e of (data||[])) {
      if (e.photo_url) {
        const { data: url } = await supabase.storage.from('skin-photos').createSignedUrl(e.photo_url, 3600)
        if (url) urls[e.id] = url.signedUrl
      }
    }
    setPhotoUrls(urls)
    setLoading(false)
  }

  function scoreStyle(sev) {
    if (sev <= 3) return { background:'#FFF3C4', color:'#856E00' }
    if (sev <= 6) return { background:'#F5D4CC', color:'#A05A3A' }
    return { background:'#FFE0DD', color:'#B03020' }
  }

  function scoreLabel(sev) {
    if (sev <= 3) return t.scoreLabels?.mild || 'Mild'
    if (sev <= 6) return t.scoreLabels?.moderate || 'Moderate'
    return t.scoreLabels?.severe || 'Severe'
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00')
    return { day: d.getDate(), month: t.months[d.getMonth()] }
  }

  if (loading) return <div style={styles.loading}>🌿</div>

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.title}>{t.history.title}</div>
        <div style={styles.sub}>{t.history.sub}</div>
      </div>

      {entries.length === 0 && <div style={styles.empty}>{t.history.noEntries}</div>}

      {entries.map(e => {
        const { day, month } = formatDate(e.date)
        return (
          <div key={e.id} style={styles.entry}>
            <div style={styles.dateCol}>
              <div style={styles.day}>{day}</div>
              <div style={styles.month}>{month}</div>
            </div>
            <div style={styles.content}>
              <div style={styles.topRow}>
                <span style={{...styles.score, ...scoreStyle(e.severity)}}>
                  {t.history.severity} {e.severity} · {scoreLabel(e.severity)}
                </span>
              </div>
              {e.symptoms?.length > 0 && (
                <div style={styles.tagsRow}>
                  {e.symptoms.map(s=><span key={s} style={styles.tag}>{t.symptoms[s]}</span>)}
                </div>
              )}
              {e.triggers?.length > 0 && (
                <div style={styles.tagsRow}>
                  {e.triggers.slice(0,3).map(tr=><span key={tr} style={{...styles.tag,background:'#FFF3C4',borderColor:'#E8C84A'}}>{t.triggers[tr]}</span>)}
                  {e.triggers.length > 3 && <span style={styles.tag}>+{e.triggers.length-3}</span>}
                </div>
              )}
              {e.notes && <div style={styles.notes}>"{e.notes}"</div>}
            </div>
            <div style={styles.photoCol}>
              {photoUrls[e.id]
                ? <img src={photoUrls[e.id]} alt="skin" style={styles.photo}/>
                : <div style={styles.noPhoto}>📷</div>
              }
            </div>
          </div>
        )
      })}
    </div>
  )
}

const styles = {
  page: { padding:'16px 16px 100px', maxWidth:'500px', margin:'0 auto' },
  loading: { display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', fontSize:'40px' },
  header: { marginBottom:'20px', paddingTop:'8px' },
  title: { fontFamily:'Georgia,serif', fontSize:'22px', fontWeight:'400', color:'#2A1F1A', marginBottom:'4px' },
  sub: { fontSize:'13px', color:'#B09A92' },
  empty: { textAlign:'center', color:'#B09A92', padding:'60px 20px', fontSize:'14px' },
  entry: { background:'white', border:'1px solid #E8DDD8', borderRadius:'16px', padding:'14px', marginBottom:'12px', display:'flex', gap:'12px', boxShadow:'0 2px 8px rgba(42,31,26,0.06)' },
  dateCol: { textAlign:'center', minWidth:'40px' },
  day: { fontFamily:'Georgia,serif', fontSize:'22px', fontWeight:'700', color:'#2A1F1A', lineHeight:1 },
  month: { fontSize:'10px', color:'#B09A92', textTransform:'uppercase', letterSpacing:'0.06em' },
  content: { flex:1, minWidth:0 },
  topRow: { marginBottom:'6px' },
  score: { fontSize:'11px', fontWeight:'600', padding:'3px 10px', borderRadius:'20px', display:'inline-block' },
  tagsRow: { display:'flex', flexWrap:'wrap', gap:'4px', marginBottom:'4px' },
  tag: { fontSize:'11px', color:'#7A6560', background:'#FAF6F0', padding:'2px 8px', borderRadius:'10px', border:'1px solid #E8DDD8' },
  notes: { fontSize:'11px', color:'#B09A92', fontStyle:'italic', marginTop:'4px' },
  photoCol: { flexShrink:0 },
  photo: { width:'52px', height:'52px', borderRadius:'10px', objectFit:'cover', border:'1px solid #E8DDD8' },
  noPhoto: { width:'52px', height:'52px', borderRadius:'10px', background:'#FAF6F0', border:'1px solid #E8DDD8', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px' },
}
