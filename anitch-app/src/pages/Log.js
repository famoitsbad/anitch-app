import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useApp } from '../lib/AppContext'
import { theme, fonts } from '../lib/theme'
import { LOGO_BASE64 } from '../lib/logo'

const SYMPTOM_KEYS = ['itching','redness','dryness','weeping','swelling','burning']
const SYMPTOM_ICONS = {itching:'🔥',redness:'🌹',dryness:'🌵',weeping:'💧',swelling:'🧊',burning:'⚡'}
const FOOD_TRIGGERS = ['dairy','gluten','eggs','nuts','alcohol','spicy','seafood']
const ENV_TRIGGERS = ['pollen','cold','heat','pets','dust','pollution']
const LIFE_TRIGGERS = ['sleep','stress','newProduct','exercise','emotion']
const SKINCARE_PRODUCTS_EN = ['Toner','Moisturiser','Serum','Sunscreen','Eye Cream','Facial Oil']
const SKINCARE_PRODUCTS_ZH = ['化妝水','保濕乳液','精華液','防曬霜','眼霜','臉部精油']
const ZONE_COLORS = {mild:'#F7EBD5',moderate:theme.orange,severe:'#C0392B'}
const ZONE_MAP = [
  {key:'head',type:'e',cx:50,cy:18,rx:16,ry:17},
  {key:'neck',type:'r',x:43,y:34,w:14,h:10},
  {key:'leftArm',type:'r',x:13,y:48,w:14,h:55},
  {key:'rightArm',type:'r',x:73,y:48,w:14,h:55},
  {key:'torso',type:'r',x:30,y:44,w:40,h:60},
  {key:'leftLeg',type:'r',x:30,y:108,w:17,h:70},
  {key:'rightLeg',type:'r',x:53,y:108,w:17,h:70},
  {key:'hands',type:'e',cx:20,cy:111,rx:7,ry:5,cx2:80},
  {key:'feet',type:'e',cx:38,cy:183,rx:8,ry:5,cx2:62},
]

const THANK_YOU_MESSAGES_EN = [
  "Thank you for checking in today 🌿",
  "Small daily notes can slowly reveal your skin patterns.",
  "You're taking care of yourself step by step.",
  "Your skin journey deserves patience and kindness.",
  "Tracking consistently helps you understand your flare-ups better.",
  "Every entry brings you one step closer to understanding your skin.",
  "You showed up for yourself today — that matters. 🌱",
]
const THANK_YOU_MESSAGES_ZH = [
  "感謝您今天的記錄 🌿",
  "每天的小記錄，慢慢揭開皮膚的規律。",
  "您正在一步一步地照顧自己。",
  "您的皮膚旅程需要耐心與溫柔。",
  "持續追蹤有助於您更好地了解皮膚狀況。",
  "每一筆記錄都讓您更了解自己的皮膚。",
  "今天您為自己而來——這很重要。🌱",
]

export default function Log() {
  const {user,t,lang} = useApp()
  const navigate = useNavigate()
  const isZh = lang === 'zh'
  const [severity, setSeverity] = useState(4)
  const [zoneMode, setZoneMode] = useState('mild')
  const [zones, setZones] = useState({})
  const [symptoms, setSymptoms] = useState([])
  const [triggers, setTriggers] = useState([])
  const [skincareApplied, setSkincareApplied] = useState([])
  const [skincareOther, setSkincareOther] = useState('')
  const [notes, setNotes] = useState('')
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [thankYouMsg, setThankYouMsg] = useState('')
  const trackRef = useRef()
  const fileRef = useRef()

  const skincareProducts = isZh ? SKINCARE_PRODUCTS_ZH : SKINCARE_PRODUCTS_EN

  function handleTrackClick(e) {
    const rect = trackRef.current.getBoundingClientRect()
    setSeverity(Math.round(Math.max(0,Math.min(1,(e.clientX-rect.left)/rect.width))*9))
  }
  function toggleZone(key){setZones(prev=>{const n={...prev};n[key]===zoneMode?delete n[key]:n[key]=zoneMode;return n})}
  function toggleSymptom(s){setSymptoms(p=>p.includes(s)?p.filter(x=>x!==s):[...p,s])}
  function toggleTrigger(tr){setTriggers(p=>p.includes(tr)?p.filter(x=>x!==tr):[...p,tr])}
  function toggleSkincare(p){setSkincareApplied(prev=>prev.includes(p)?prev.filter(x=>x!==p):[...prev,p])}
  function handlePhoto(e){const f=e.target.files[0];if(!f)return;setPhoto(f);setPhotoPreview(URL.createObjectURL(f))}

  async function handleSave() {
    setSaving(true)
    let photoUrl = null
    if(photo){
      const path=`${user.id}/${Date.now()}-${photo.name}`
      const {data}=await supabase.storage.from('skin-photos').upload(path,photo)
      if(data)photoUrl=path
    }
    const today=new Date().toISOString().split('T')[0]
    const msgs = isZh ? THANK_YOU_MESSAGES_ZH : THANK_YOU_MESSAGES_EN
    setThankYouMsg(msgs[Math.floor(Math.random()*msgs.length)])
    await supabase.from('entries').upsert({
      user_id:user.id,date:today,severity,symptoms,triggers,
      affected_zones:zones,notes,photo_url:photoUrl,
      skincare_applied:[...skincareApplied,...(skincareOther?[skincareOther]:[])]
    },{onConflict:'user_id,date'})
    setSaved(true);setSaving(false)
    setTimeout(()=>navigate('/'),2500)
  }

  const sevPct = severity/9
  const sevColor = severity<=3?theme.green:severity<=6?theme.orange:'#C0392B'

  if (saved) return (
    <div style={s.thankYouWrap}>
      <div style={s.thankYouCard}>
        <img src={LOGO_BASE64} alt="anitch" style={s.tyLogo}/>
        <div style={s.tyEmoji}>🌿</div>
        <div style={s.tyMsg}>{thankYouMsg}</div>
        <div style={s.tySubMsg}>{isZh?'記錄已儲存，正在返回主頁...':'Entry saved, returning to home...'}</div>
        <div style={s.tyDots}>
          <span style={s.dot}/><span style={{...s.dot,...s.dot2}}/><span style={{...s.dot,...s.dot3}}/>
        </div>
      </div>
    </div>
  )

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.headerTop}>
          <img src={LOGO_BASE64} alt="anitch" style={s.logo}/>
          <div style={s.dateText}>{new Date().toLocaleDateString(isZh?'zh-TW':'en-GB',{day:'numeric',month:'short',year:'numeric'})}</div>
        </div>
        <div style={s.title}>{t.log.title}</div>
        <div style={s.sub}>{t.log.sub}</div>
      </div>

      <div style={s.body}>
        {/* Severity */}
        <div style={s.card}>
          <div style={s.cardLabel}>🌡 {t.log.severity}</div>
          <div style={s.sevRow}>
            <div style={s.sevRangeLabel}>{t.log.noneToSevere}</div>
            <div style={{...s.sevBig,color:sevColor}}>{severity}</div>
          </div>
          <div style={s.track} ref={trackRef} onClick={handleTrackClick}>
            <div style={{...s.trackFill,width:`${sevPct*100}%`,background:sevColor}}/>
            <div style={{...s.thumb,left:`calc(${sevPct*92+2}% - 10px)`,borderColor:sevColor}}/>
          </div>
          <div style={s.sevDesc}>{t.log.sevDesc[severity]}</div>
        </div>

        {/* Body Map */}
        <div style={s.card}>
          <div style={s.cardLabel}>🫀 {t.log.bodyMap}</div>
          <div style={s.bodyMapSub}>{t.log.bodyMapSub}</div>
          <div style={s.bodyRow}>
            <svg viewBox="0 0 100 220" style={{width:'120px',flexShrink:0}}>
              {ZONE_MAP.map(z=>{
                const fill=zones[z.key]?ZONE_COLORS[zones[z.key]]:'#F9F9FB'
                const stroke=zones[z.key]?ZONE_COLORS[zones[z.key]]:theme.border
                return z.type==='e'?(
                  <g key={z.key} onClick={()=>toggleZone(z.key)} style={{cursor:'pointer'}}>
                    <ellipse fill={fill} stroke={stroke} strokeWidth="1.5" cx={z.cx} cy={z.cy} rx={z.rx} ry={z.ry}/>
                    {z.cx2&&<ellipse fill={fill} stroke={stroke} strokeWidth="1.5" cx={z.cx2} cy={z.cy} rx={z.rx} ry={z.ry}/>}
                  </g>
                ):<rect key={z.key} onClick={()=>toggleZone(z.key)} style={{cursor:'pointer'}} fill={fill} stroke={stroke} strokeWidth="1.5" x={z.x} y={z.y} width={z.w} height={z.h} rx="7"/>
              })}
            </svg>
            <div style={{flex:1}}>
              {[['mild',t.log.mild],['moderate',t.log.moderate],['severe',t.log.severe]].map(([m,label])=>(
                <div key={m} style={{...s.legendItem,...(zoneMode===m?{...s.legendActive,borderColor:ZONE_COLORS[m]}:{})}} onClick={()=>setZoneMode(m)}>
                  <div style={{width:'10px',height:'10px',borderRadius:'2px',background:ZONE_COLORS[m],flexShrink:0}}/>
                  <span style={{fontSize:'11px',color:theme.textSecondary}}>{label}</span>
                </div>
              ))}
              {Object.keys(zones).length>0&&(
                <div style={s.affectedList}>
                  {Object.entries(zones).map(([z,m])=>(
                    <span key={z} style={{...s.affTag,background:ZONE_COLORS[m]+'22',borderColor:ZONE_COLORS[m]}}>
                      {t.zones[z]} <span style={{cursor:'pointer'}} onClick={()=>setZones(p=>{const n={...p};delete n[z];return n})}>×</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Symptoms */}
        <div style={s.card}>
          <div style={s.cardLabel}>✦ {t.log.symptoms}</div>
          <div style={s.symptomGrid}>
            {SYMPTOM_KEYS.map(sk=>(
              <div key={sk} style={{...s.symItem,...(symptoms.includes(sk)?s.symOn:{})}} onClick={()=>toggleSymptom(sk)}>
                <span>{SYMPTOM_ICONS[sk]}</span>
                <span style={{fontSize:'12px',flex:1}}>{t.symptoms[sk]}</span>
                <div style={{...s.check,...(symptoms.includes(sk)?s.checkOn:{})}}>{symptoms.includes(sk)?'✓':''}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Triggers */}
        <div style={s.card}>
          <div style={s.cardLabel}>🔍 {t.log.triggers}</div>
          {[[t.log.food,FOOD_TRIGGERS],[t.log.environment,ENV_TRIGGERS],[t.log.lifestyle,LIFE_TRIGGERS]].map(([label,keys])=>(
            <div key={label} style={s.trigGroup}>
              <div style={s.trigLabel}>{label}</div>
              <div style={s.chips}>
                {keys.map(tr=>(
                  <div key={tr} style={{...s.chip,...(triggers.includes(tr)?s.chipOn:{})}} onClick={()=>toggleTrigger(tr)}>
                    {t.triggers[tr]}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Skincare Routine */}
          <div style={s.trigGroup}>
            <div style={s.trigLabel}>
              🧴 {isZh?'護膚程序':'Skincare Routine'}
            </div>
            <div style={s.skincareNote}>{isZh?'今天使用了哪些護膚品？':'Which skincare products did you use today?'}</div>
            <div style={s.chips}>
              {skincareProducts.map(p=>(
                <div key={p} style={{...s.chip,...(skincareApplied.includes(p)?s.chipGreen:{})}} onClick={()=>toggleSkincare(p)}>
                  {p}
                </div>
              ))}
            </div>
            <div style={s.otherRow}>
              <span style={s.otherLabel}>{isZh?'其他：':'Other:'}</span>
              <input style={s.otherInput} type="text" placeholder={isZh?'請輸入其他產品...':'Enter other products...'} value={skincareOther} onChange={e=>setSkincareOther(e.target.value)}/>
            </div>
          </div>
        </div>

        {/* Photo */}
        <div style={s.card}>
          <div style={s.cardLabel}>📸 {t.log.photo}</div>
          <div style={s.privacyNote}>
            🔒 {isZh
              ? '私隱聲明：我們不會收集此部分的任何數據。照片只有您本人可以查看，以保護您的私隱。'
              : 'Privacy Notice: We do not collect any data from this section. Only you can see your photos, to protect your privacy.'
            }
          </div>
          <input type="file" accept="image/*" capture="environment" ref={fileRef} onChange={handlePhoto} style={{display:'none'}}/>
          {photoPreview?(
            <div style={{position:'relative',marginTop:'10px'}}>
              <img src={photoPreview} alt="skin" style={s.photoImg}/>
              <button style={s.removePhoto} onClick={()=>{setPhoto(null);setPhotoPreview(null)}}>×</button>
            </div>
          ):(
            <div style={s.photoBtn} onClick={()=>fileRef.current.click()}>
              <div style={{fontSize:'28px',marginBottom:'6px'}}>📷</div>
              <div style={{fontSize:'12px',color:theme.textMuted}}>{isZh?'點擊拍照或上傳':'Tap to take or upload a photo'}</div>
            </div>
          )}
        </div>

        {/* Notes */}
        <div style={s.card}>
          <div style={s.cardLabel}>✍️ {t.log.notes}</div>
          <textarea style={s.textarea} placeholder={t.log.notesPlaceholder} value={notes} onChange={e=>setNotes(e.target.value)}/>
        </div>

        <button style={{...s.saveBtn,background:theme.green}} onClick={handleSave} disabled={saving}>
          {saving?t.log.saving:t.log.save}
        </button>
      </div>
    </div>
  )
}

const s = {
  page:{background:theme.lightGrey,minHeight:'100vh',fontFamily:fonts.body},
  thankYouWrap:{minHeight:'100vh',background:theme.green,display:'flex',alignItems:'center',justifyContent:'center',padding:'24px'},
  thankYouCard:{background:'white',borderRadius:'20px',padding:'40px 28px',textAlign:'center',maxWidth:'320px',width:'100%',boxShadow:'0 20px 60px rgba(0,0,0,0.2)'},
  tyLogo:{height:'22px',width:'auto',marginBottom:'20px',filter:'invert(1) sepia(1) saturate(5) hue-rotate(100deg)'},
  tyEmoji:{fontSize:'40px',marginBottom:'16px'},
  tyMsg:{fontSize:'18px',fontWeight:'700',color:theme.textPrimary,marginBottom:'10px',lineHeight:'1.4',letterSpacing:'-0.01em'},
  tySubMsg:{fontSize:'13px',color:theme.textMuted,marginBottom:'20px'},
  tyDots:{display:'flex',gap:'6px',justifyContent:'center'},
  dot:{width:'8px',height:'8px',borderRadius:'50%',background:theme.green,animation:'pulse 1.4s infinite'},
  dot2:{animationDelay:'0.2s'},
  dot3:{animationDelay:'0.4s'},
  header:{background:theme.green,padding:'14px 20px 24px'},
  headerTop:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'12px'},
  logo:{height:'22px',width:'auto',objectFit:'contain'},
  dateText:{fontSize:'11px',color:'rgba(255,255,255,0.6)',fontWeight:'500'},
  title:{fontSize:'20px',fontWeight:'700',color:'white',letterSpacing:'-0.01em',marginBottom:'4px'},
  sub:{fontSize:'13px',color:'rgba(255,255,255,0.65)'},
  body:{padding:'14px 14px 100px'},
  card:{background:'white',borderRadius:'12px',padding:'16px',marginBottom:'12px',boxShadow:`0 1px 4px ${theme.shadow}`,border:`1px solid ${theme.border}`},
  cardLabel:{fontSize:'10px',fontWeight:'700',letterSpacing:'0.12em',textTransform:'uppercase',color:theme.textMuted,marginBottom:'12px',fontFamily:fonts.label},
  sevRow:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'10px'},
  sevRangeLabel:{fontSize:'12px',color:theme.textMuted},
  sevBig:{fontSize:'28px',fontWeight:'800',letterSpacing:'-0.02em'},
  track:{height:'6px',borderRadius:'3px',background:theme.lightGrey,position:'relative',cursor:'pointer',marginBottom:'8px'},
  trackFill:{height:'100%',borderRadius:'3px',position:'absolute',top:0,left:0,transition:'width 0.1s'},
  thumb:{width:'18px',height:'18px',borderRadius:'50%',background:'white',border:'2px solid',position:'absolute',top:'50%',transform:'translateY(-50%)',boxShadow:'0 2px 6px rgba(0,0,0,0.2)',pointerEvents:'none'},
  sevDesc:{fontSize:'12px',color:theme.textMuted,marginTop:'4px'},
  bodyMapSub:{fontSize:'11px',color:theme.textMuted,marginBottom:'12px'},
  bodyRow:{display:'flex',gap:'14px',alignItems:'flex-start'},
  legendItem:{display:'flex',alignItems:'center',gap:'8px',padding:'6px 10px',borderRadius:'6px',border:'1.5px solid transparent',cursor:'pointer',marginBottom:'6px'},
  legendActive:{background:theme.lightGrey},
  affectedList:{marginTop:'10px',display:'flex',flexWrap:'wrap',gap:'4px'},
  affTag:{display:'inline-flex',alignItems:'center',gap:'4px',fontSize:'11px',fontWeight:'600',padding:'3px 8px',borderRadius:'4px',border:'1px solid'},
  symptomGrid:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'},
  symItem:{display:'flex',alignItems:'center',gap:'8px',padding:'10px',border:`1.5px solid ${theme.border}`,borderRadius:'8px',cursor:'pointer',transition:'all 0.15s',fontSize:'13px',color:theme.textSecondary},
  symOn:{background:theme.greenLight,borderColor:theme.green,color:theme.green},
  check:{width:'16px',height:'16px',border:`1.5px solid ${theme.border}`,borderRadius:'4px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',flexShrink:0},
  checkOn:{background:theme.green,borderColor:theme.green,color:'white'},
  trigGroup:{marginBottom:'14px'},
  trigLabel:{fontSize:'11px',color:theme.textSecondary,fontWeight:'700',marginBottom:'6px',letterSpacing:'0.04em'},
  skincareNote:{fontSize:'11px',color:theme.textMuted,marginBottom:'8px'},
  chips:{display:'flex',flexWrap:'wrap',gap:'6px'},
  chip:{padding:'6px 12px',border:`1.5px solid ${theme.border}`,borderRadius:'6px',fontSize:'12px',color:theme.textSecondary,cursor:'pointer',background:'white',fontWeight:'500',transition:'all 0.15s'},
  chipOn:{background:theme.green,borderColor:theme.green,color:'white'},
  chipGreen:{background:theme.greenLight,borderColor:theme.green,color:theme.green,fontWeight:'700'},
  otherRow:{display:'flex',alignItems:'center',gap:'8px',marginTop:'8px'},
  otherLabel:{fontSize:'12px',color:theme.textMuted,whiteSpace:'nowrap',fontWeight:'600'},
  otherInput:{flex:1,padding:'8px 12px',border:`1.5px solid ${theme.border}`,borderRadius:'6px',fontSize:'12px',fontFamily:fonts.body,outline:'none',background:theme.lightGrey,color:theme.textPrimary},
  privacyNote:{background:'#EAF5EF',border:`1px solid ${theme.greenSoft}`,borderRadius:'8px',padding:'10px 12px',fontSize:'12px',color:theme.greenDark,marginBottom:'12px',lineHeight:'1.5'},
  photoBtn:{border:`2px dashed ${theme.border}`,borderRadius:'10px',padding:'24px',textAlign:'center',cursor:'pointer',background:theme.lightGrey,marginTop:'4px'},
  photoImg:{width:'100%',borderRadius:'10px',maxHeight:'200px',objectFit:'cover'},
  removePhoto:{position:'absolute',top:'8px',right:'8px',background:'rgba(0,0,0,0.5)',color:'white',border:'none',borderRadius:'50%',width:'28px',height:'28px',fontSize:'16px',cursor:'pointer'},
  textarea:{width:'100%',border:`1.5px solid ${theme.border}`,borderRadius:'8px',padding:'12px',fontFamily:fonts.body,fontSize:'13px',color:theme.textPrimary,resize:'none',height:'80px',outline:'none',background:theme.lightGrey},
  saveBtn:{width:'100%',color:'white',border:'none',borderRadius:'8px',padding:'16px',fontSize:'14px',fontWeight:'700',cursor:'pointer',fontFamily:fonts.body,letterSpacing:'0.04em',transition:'all 0.2s'},
}
