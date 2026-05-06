import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useApp } from '../lib/AppContext'

const SYMPTOM_KEYS = ['itching','redness','dryness','weeping','swelling','burning']
const SYMPTOM_ICONS = { itching:'🔥', redness:'🌹', dryness:'🌵', weeping:'💧', swelling:'🧊', burning:'⚡' }
const FOOD_TRIGGERS = ['dairy','gluten','eggs','nuts','alcohol','spicy','seafood']
const ENV_TRIGGERS = ['pollen','cold','heat','pets','dust','pollution']
const LIFE_TRIGGERS = ['sleep','stress','newProduct','exercise','emotion']
const ZONE_MAP = [
  {key:'head',cx:50,cy:18,rx:16,ry:17,type:'ellipse'},
  {key:'neck',x:43,y:34,w:14,h:10,type:'rect'},
  {key:'leftArm',x:13,y:48,w:14,h:55,type:'rect'},
  {key:'rightArm',x:73,y:48,w:14,h:55,type:'rect'},
  {key:'torso',x:30,y:44,w:40,h:60,type:'rect'},
  {key:'leftLeg',x:30,y:108,w:17,h:70,type:'rect'},
  {key:'rightLeg',x:53,y:108,w:17,h:70,type:'rect'},
  {key:'hands',cx:20,cy:111,rx:7,ry:5,type:'ellipse',extra:{cx2:80}},
  {key:'feet',cx:38,cy:183,rx:8,ry:5,type:'ellipse',extra:{cx2:62}},
]
const ZONE_COLORS = { mild:'#FFE08A', moderate:'#E8A898', severe:'#E86A5A' }

export default function Log() {
  const { user, t } = useApp()
  const navigate = useNavigate()
  const [severity, setSeverity] = useState(4)
  const [zoneMode, setZoneMode] = useState('mild')
  const [zones, setZones] = useState({})
  const [symptoms, setSymptoms] = useState([])
  const [triggers, setTriggers] = useState([])
  const [notes, setNotes] = useState('')
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const trackRef = useRef()
  const fileRef = useRef()

  function handleTrackClick(e) {
    const rect = trackRef.current.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    setSeverity(Math.round(pct * 9))
  }

  function toggleZone(key) {
    setZones(prev => {
      const next = {...prev}
      if (next[key] === zoneMode) delete next[key]
      else next[key] = zoneMode
      return next
    })
  }

  function toggleSymptom(s) {
    setSymptoms(prev => prev.includes(s) ? prev.filter(x=>x!==s) : [...prev,s])
  }

  function toggleTrigger(tr) {
    setTriggers(prev => prev.includes(tr) ? prev.filter(x=>x!==tr) : [...prev,tr])
  }

  function handlePhoto(e) {
    const file = e.target.files[0]
    if (!file) return
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  async function handleSave() {
    setSaving(true)
    let photoUrl = null
    if (photo) {
      const path = `${user.id}/${Date.now()}-${photo.name}`
      const { data } = await supabase.storage.from('skin-photos').upload(path, photo)
      if (data) photoUrl = path
    }
    const today = new Date().toISOString().split('T')[0]
    await supabase.from('entries').upsert({
      user_id: user.id, date: today, severity,
      symptoms, triggers, affected_zones: zones, notes, photo_url: photoUrl
    }, { onConflict: 'user_id,date' })
    setSaved(true); setSaving(false)
    setTimeout(() => navigate('/'), 1200)
  }

  const thumbPct = severity / 9
  const sevDesc = t.log.sevDesc[severity]

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.title}>{t.log.title}</div>
        <div style={styles.sub}>{t.log.sub}</div>
      </div>

      {/* Severity */}
      <div style={styles.card}>
        <div style={styles.cardLabel}>🌡️ {t.log.severity}</div>
        <div style={styles.sevRow}>
          <div style={styles.sevLabel}>{t.log.noneToSevere}</div>
          <div style={styles.track} ref={trackRef} onClick={handleTrackClick}>
            <div style={{...styles.thumb, left:`calc(${thumbPct*88+2}% - 10px)`}}/>
          </div>
          <div style={styles.sevVal}>{severity}</div>
        </div>
        <div style={styles.sevDesc}>{sevDesc}</div>
      </div>

      {/* Body Map */}
      <div style={styles.card}>
        <div style={styles.cardLabel}>🫀 {t.log.bodyMap}</div>
        <div style={styles.bodyMapSub}>{t.log.bodyMapSub}</div>
        <div style={styles.bodyRow}>
          <svg viewBox="0 0 100 220" style={{width:'130px',flexShrink:0}} xmlns="http://www.w3.org/2000/svg">
            {ZONE_MAP.map(z => {
              const fill = zones[z.key] ? ZONE_COLORS[zones[z.key]] : '#FAF6F0'
              const stroke = '#E8DDD8'
              if (z.type==='ellipse') return (
                <g key={z.key} onClick={()=>toggleZone(z.key)} style={{cursor:'pointer'}}>
                  <ellipse fill={fill} stroke={stroke} strokeWidth="1.5" cx={z.cx} cy={z.cy} rx={z.rx} ry={z.ry}/>
                  {z.extra?.cx2 && <ellipse fill={fill} stroke={stroke} strokeWidth="1.5" cx={z.extra.cx2} cy={z.cy} rx={z.rx} ry={z.ry}/>}
                </g>
              )
              return <rect key={z.key} onClick={()=>toggleZone(z.key)} style={{cursor:'pointer'}} fill={fill} stroke={stroke} strokeWidth="1.5" x={z.x} y={z.y} width={z.w} height={z.h} rx="7"/>
            })}
          </svg>
          <div style={{flex:1}}>
            {['mild','moderate','severe'].map(m=>(
              <div key={m} style={{...styles.legendItem, ...(zoneMode===m?styles.legendActive:{})}} onClick={()=>setZoneMode(m)}>
                <div style={{...styles.legendDot, background:ZONE_COLORS[m]}}/>
                <div style={styles.legendText}>{t.log[m]}</div>
              </div>
            ))}
            {Object.keys(zones).length > 0 && (
              <div style={styles.affectedList}>
                {Object.entries(zones).map(([z,mode])=>(
                  <span key={z} style={{...styles.affectedTag, background:ZONE_COLORS[mode]+'33', borderColor:ZONE_COLORS[mode]}}>
                    {t.zones[z]} <span style={{cursor:'pointer'}} onClick={()=>setZones(p=>{const n={...p};delete n[z];return n})}>×</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Symptoms */}
      <div style={styles.card}>
        <div style={styles.cardLabel}>✦ {t.symptoms && 'Symptoms'} {t.log.symptoms}</div>
        <div style={styles.symptomGrid}>
          {SYMPTOM_KEYS.map(s=>(
            <div key={s} style={{...styles.symptomItem,...(symptoms.includes(s)?styles.symptomOn:{})}} onClick={()=>toggleSymptom(s)}>
              <span style={{fontSize:'16px'}}>{SYMPTOM_ICONS[s]}</span>
              <span style={{flex:1,fontSize:'12px'}}>{t.symptoms[s]}</span>
              <div style={{...styles.check,...(symptoms.includes(s)?styles.checkOn:{})}}>{symptoms.includes(s)?'✓':''}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Triggers */}
      <div style={styles.card}>
        <div style={styles.cardLabel}>🔍 {t.log.triggers}</div>
        {[
          {label:t.log.food, keys:FOOD_TRIGGERS},
          {label:t.log.environment, keys:ENV_TRIGGERS},
          {label:t.log.lifestyle, keys:LIFE_TRIGGERS},
        ].map(group=>(
          <div key={group.label} style={styles.triggerGroup}>
            <div style={styles.triggerLabel}>{group.label}</div>
            <div style={styles.chips}>
              {group.keys.map(tr=>(
                <div key={tr} style={{...styles.chip,...(triggers.includes(tr)?styles.chipOn:{})}} onClick={()=>toggleTrigger(tr)}>
                  {t.triggers[tr]}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Photo Upload */}
      <div style={styles.card}>
        <div style={styles.cardLabel}>📸 {t.log.photo}</div>
        <div style={styles.photoSub}>{t.log.photoSub}</div>
        <input type="file" accept="image/*" capture="environment" ref={fileRef} onChange={handlePhoto} style={{display:'none'}}/>
        {photoPreview ? (
          <div style={{position:'relative'}}>
            <img src={photoPreview} alt="skin" style={styles.photoPreview}/>
            <button style={styles.removePhoto} onClick={()=>{setPhoto(null);setPhotoPreview(null)}}>×</button>
          </div>
        ) : (
          <div style={styles.photoBtn} onClick={()=>fileRef.current.click()}>
            <div style={{fontSize:'32px',marginBottom:'8px'}}>📷</div>
            <div style={{fontSize:'13px',color:'#B09A92'}}>Tap to take or upload a photo</div>
          </div>
        )}
      </div>

      {/* Notes */}
      <div style={styles.card}>
        <div style={styles.cardLabel}>✍️ {t.log.notes}</div>
        <textarea style={styles.textarea} placeholder={t.log.notesPlaceholder} value={notes} onChange={e=>setNotes(e.target.value)}/>
      </div>

      {/* Save */}
      <button style={{...styles.saveBtn, background: saved?'#5A7A55':'#C4704A'}} onClick={handleSave} disabled={saving||saved}>
        {saved ? t.log.saved : saving ? t.log.saving : t.log.save}
      </button>
    </div>
  )
}

const styles = {
  page: { padding:'16px 16px 100px', maxWidth:'500px', margin:'0 auto' },
  header: { marginBottom:'20px', paddingTop:'8px' },
  title: { fontFamily:'Georgia,serif', fontSize:'22px', fontWeight:'400', color:'#2A1F1A', marginBottom:'4px' },
  sub: { fontSize:'13px', color:'#B09A92' },
  card: { background:'white', border:'1px solid #E8DDD8', borderRadius:'16px', padding:'16px', marginBottom:'14px', boxShadow:'0 2px 8px rgba(42,31,26,0.06)' },
  cardLabel: { fontSize:'11px', fontWeight:'500', letterSpacing:'0.08em', textTransform:'uppercase', color:'#B09A92', marginBottom:'12px', display:'flex', alignItems:'center', gap:'6px' },
  sevRow: { display:'flex', alignItems:'center', gap:'10px', marginBottom:'6px' },
  sevLabel: { fontSize:'12px', color:'#7A6560', minWidth:'70px' },
  track: { flex:1, height:'8px', borderRadius:'4px', background:'linear-gradient(to right,#C5D9C2,#E8C84A,#E8A04A,#E86A5A)', position:'relative', cursor:'pointer' },
  thumb: { width:'20px', height:'20px', borderRadius:'50%', background:'white', border:'3px solid #C4704A', position:'absolute', top:'50%', transform:'translateY(-50%)', boxShadow:'0 2px 6px rgba(0,0,0,0.2)', pointerEvents:'none' },
  sevVal: { fontFamily:'Georgia,serif', fontSize:'24px', fontWeight:'700', color:'#C4704A', minWidth:'32px', textAlign:'right' },
  sevDesc: { fontSize:'12px', color:'#B09A92', marginTop:'2px' },
  bodyMapSub: { fontSize:'11px', color:'#B09A92', marginBottom:'12px' },
  bodyRow: { display:'flex', gap:'16px', alignItems:'flex-start' },
  legendItem: { display:'flex', alignItems:'center', gap:'8px', padding:'6px 10px', borderRadius:'8px', border:'1.5px solid transparent', cursor:'pointer', marginBottom:'6px', transition:'all 0.2s' },
  legendActive: { border:'1.5px solid #8FAF8A', background:'#C5D9C2' },
  legendDot: { width:'12px', height:'12px', borderRadius:'3px', flexShrink:0 },
  legendText: { fontSize:'11px', color:'#7A6560' },
  affectedList: { marginTop:'10px', display:'flex', flexWrap:'wrap', gap:'4px' },
  affectedTag: { display:'inline-flex', alignItems:'center', gap:'4px', fontSize:'11px', fontWeight:'500', padding:'3px 8px', borderRadius:'12px', border:'1px solid', color:'#2A1F1A' },
  symptomGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' },
  symptomItem: { display:'flex', alignItems:'center', gap:'8px', padding:'10px', border:'1.5px solid #E8DDD8', borderRadius:'10px', cursor:'pointer', transition:'all 0.2s' },
  symptomOn: { background:'#C5D9C2', borderColor:'#8FAF8A' },
  check: { width:'16px', height:'16px', border:'1.5px solid #E8DDD8', borderRadius:'4px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', flexShrink:0 },
  checkOn: { background:'#5A7A55', borderColor:'#5A7A55', color:'white' },
  triggerGroup: { marginBottom:'12px' },
  triggerLabel: { fontSize:'11px', color:'#B09A92', fontWeight:'500', marginBottom:'8px' },
  chips: { display:'flex', flexWrap:'wrap', gap:'6px' },
  chip: { padding:'6px 12px', border:'1.5px solid #E8DDD8', borderRadius:'20px', fontSize:'12px', color:'#7A6560', cursor:'pointer', background:'white', transition:'all 0.2s' },
  chipOn: { background:'#C4704A', borderColor:'#C4704A', color:'white' },
  photoSub: { fontSize:'12px', color:'#B09A92', marginBottom:'12px' },
  photoBtn: { border:'2px dashed #E8DDD8', borderRadius:'12px', padding:'24px', textAlign:'center', cursor:'pointer', background:'#FFF9F4' },
  photoPreview: { width:'100%', borderRadius:'12px', maxHeight:'200px', objectFit:'cover' },
  removePhoto: { position:'absolute', top:'8px', right:'8px', background:'rgba(0,0,0,0.5)', color:'white', border:'none', borderRadius:'50%', width:'28px', height:'28px', fontSize:'16px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' },
  textarea: { width:'100%', border:'1.5px solid #E8DDD8', borderRadius:'12px', padding:'12px', fontFamily:'inherit', fontSize:'13px', color:'#2A1F1A', resize:'none', height:'80px', outline:'none', background:'#FFF9F4' },
  saveBtn: { width:'100%', color:'white', border:'none', borderRadius:'16px', padding:'18px', fontSize:'16px', fontWeight:'600', cursor:'pointer', fontFamily:'inherit', boxShadow:'0 4px 20px rgba(196,112,74,0.25)', transition:'all 0.2s' },
}
