import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useApp } from '../lib/AppContext'
import { LOGO_BASE64 } from '../lib/logo'

const SYMPTOM_KEYS = ['itching','redness','dryness','weeping','swelling','burning']
const SYMPTOM_ICONS = {itching:'🔥',redness:'🌹',dryness:'🌵',weeping:'💧',swelling:'🧊',burning:'⚡'}
const FOOD_TRIGGERS = ['dairy','gluten','eggs','nuts','alcohol','spicy','seafood']
const ENV_TRIGGERS = ['pollen','cold','heat','pets','dust','pollution']
const LIFE_TRIGGERS = ['sleep','stress','newProduct','exercise','emotion']
const SKINCARE_EN = ['Toner','Moisturiser','Serum','Sunscreen','Eye Cream','Facial Oil']
const SKINCARE_ZH = ['化妝水','保濕乳液','精華液','防曬霜','眼霜','臉部精油']
const ZONE_COLORS = {mild:'#F7EBD5',moderate:'#F7984C',severe:'#C0392B'}
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
const THANK_YOU_EN = ["Thank you for checking in today 🌿","Small daily notes can slowly reveal your skin patterns.","You're taking care of yourself step by step.","Your skin journey deserves patience and kindness.","Tracking consistently helps you understand your flare-ups better.","Every entry brings you one step closer to understanding your skin.","You showed up for yourself today — that matters. 🌱"]
const THANK_YOU_ZH = ["感謝您今天的記錄 🌿","每天的小記錄，慢慢揭開皮膚的規律。","您正在一步一步地照顧自己。","您的皮膚旅程需要耐心與溫柔。","持續追蹤有助於您更好地了解皮膚狀況。","每一筆記錄都讓您更了解自己的皮膚。","今天您為自己而來——這很重要。🌱"]

export default function Log() {
  const { user, t, th, lang, darkMode } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const existingEntry = location.state?.existingEntry || null
  const isEditing = !!existingEntry
  const isZh = lang === 'zh'
  const [severity, setSeverity] = useState(existingEntry?.severity ?? 4)
  const [zoneMode, setZoneMode] = useState('mild')
  const [zones, setZones] = useState(existingEntry?.affected_zones || {})
  const [symptoms, setSymptoms] = useState(existingEntry?.symptoms || [])
  const [triggers, setTriggers] = useState(existingEntry?.triggers || [])
  const [customTrigger, setCustomTrigger] = useState('')
  const [customTriggers, setCustomTriggers] = useState([])
  const [skincareApplied, setSkincareApplied] = useState(existingEntry?.skincare_applied || [])
  const [skincareOther, setSkincareOther] = useState('')
  const [notes, setNotes] = useState(existingEntry?.notes || '')
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [thankYouMsg, setThankYouMsg] = useState('')
  const trackRef = useRef()
  const fileRef = useRef()
  const isDragging = useRef(false)
  const skincareProducts = isZh ? SKINCARE_ZH : SKINCARE_EN

  const updateSeverity = useCallback((clientX) => {
    if (!trackRef.current) return
    const rect = trackRef.current.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    setSeverity(Math.round(pct * 9))
  }, [])

  const handleMouseDown = (e) => { isDragging.current = true; updateSeverity(e.clientX) }
  const handleMouseMove = (e) => { if (isDragging.current) updateSeverity(e.clientX) }
  const handleMouseUp = () => { isDragging.current = false }
  const handleTouchStart = (e) => { e.preventDefault(); updateSeverity(e.touches[0].clientX) }
  const handleTouchMove = (e) => { e.preventDefault(); updateSeverity(e.touches[0].clientX) }

  function toggleZone(key) { setZones(prev => { const n = {...prev}; n[key] === zoneMode ? delete n[key] : n[key] = zoneMode; return n }) }
  function toggleSymptom(s) { setSymptoms(p => p.includes(s) ? p.filter(x=>x!==s) : [...p,s]) }
  function toggleTrigger(tr) { setTriggers(p => p.includes(tr) ? p.filter(x=>x!==tr) : [...p,tr]) }
  function toggleSkincare(p) { setSkincareApplied(prev => prev.includes(p) ? prev.filter(x=>x!==p) : [...prev,p]) }

  function addCustomTrigger() {
    const val = customTrigger.trim()
    if (val && !customTriggers.includes(val)) {
      setCustomTriggers(p => [...p, val])
      setTriggers(p => [...p, val])
    }
    setCustomTrigger('')
  }

  function handlePhoto(e) { const f = e.target.files[0]; if (!f) return; setPhoto(f); setPhotoPreview(URL.createObjectURL(f)) }

  async function handleSave() {
    setSaving(true)
    let photoUrl = null
    if (photo) {
      const ext = photo.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`
      const { data } = await supabase.storage.from('skin-photos').upload(path, photo, { contentType: photo.type, upsert: false })
      if (data) photoUrl = path
    }
    const today = new Date().toISOString().split('T')[0]
    const msgs = isZh ? THANK_YOU_ZH : THANK_YOU_EN
    setThankYouMsg(msgs[Math.floor(Math.random() * msgs.length)])
    await supabase.from('entries').upsert({
      user_id: user.id, date: today, severity, symptoms, triggers,
      affected_zones: zones, notes, photo_url: photoUrl,
      skincare_applied: [...skincareApplied, ...(skincareOther ? [skincareOther] : [])]
    }, { onConflict: 'user_id,date' })
    setSaved(true); setSaving(false)
    setTimeout(() => navigate('/'), 2500)
  }

  const sevPct = severity / 9
  const sevColor = severity <= 3 ? th.green : severity <= 6 ? th.orange : '#C0392B'

  const card = { background: th.white, borderRadius: '12px', padding: '16px', marginBottom: '12px', boxShadow: `0 1px 4px ${th.shadow}`, border: `1px solid ${th.border}` }
  // Body map card uses theme (dark mode compatible)
  const bodyCard = { background: th.white, borderRadius: '12px', padding: '16px', marginBottom: '12px', boxShadow: `0 1px 4px ${th.shadow}`, border: `1px solid ${th.border}` }
  const cardLabel = { fontSize: '10px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: th.textMuted, marginBottom: '12px', display: 'block' }

  if (saved) return (
    <div style={{ minHeight: '100vh', background: th.green, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ background: th.white, borderRadius: '20px', padding: '40px 28px', textAlign: 'center', maxWidth: '320px', width: '100%' }}>
        <img src={LOGO_BASE64} alt="anitch" style={{ height: '22px', width: 'auto', marginBottom: '20px' }} />
        <div style={{ fontSize: '40px', margin: '16px 0' }}>🌿</div>
        <div style={{ fontSize: '18px', fontWeight: '700', color: th.textPrimary, marginBottom: '10px', lineHeight: '1.4' }}>{thankYouMsg}</div>
        <div style={{ fontSize: '13px', color: th.textMuted }}>{isZh ? '記錄已儲存，正在返回主頁...' : 'Entry saved, returning to home...'}</div>
      </div>
    </div>
  )

  return (
    <div style={{ background: th.lightGrey, minHeight: '100vh', fontFamily: "'Lato',sans-serif" }}
      onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      {/* Header */}
      <div style={{ background: th.green, padding: '14px 20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <img src={LOGO_BASE64} alt="anitch" style={{ height: '22px', width: 'auto' }} />
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>{new Date().toLocaleDateString(isZh ? 'zh-TW' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
        </div>
        <div style={{ fontSize: '20px', fontWeight: '700', color: 'white', marginBottom: '4px' }}>{t.log.title}</div>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)' }}>{t.log.sub}</div>
      </div>

      <div style={{ padding: '14px 14px 100px' }}>
        {/* Severity */}
        <div style={card}>
          <span style={cardLabel}>🌡 {t.log.severity}</span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ fontSize: '12px', color: th.textMuted }}>{t.log.noneToSevere}</div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: sevColor }}>{severity}</div>
          </div>
          <div ref={trackRef} style={{ height: '28px', borderRadius: '14px', background: th.lightGrey, position: 'relative', cursor: 'pointer', touchAction: 'none', userSelect: 'none', display: 'flex', alignItems: 'center', marginBottom: '8px' }}
            onMouseDown={handleMouseDown} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove}>
            <div style={{ height: '8px', borderRadius: '4px', position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: `${sevPct * 100}%`, background: sevColor, pointerEvents: 'none' }} />
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: th.white, border: `3px solid ${sevColor}`, position: 'absolute', left: `calc(${sevPct * 88 + 2}%)`, top: '50%', transform: 'translateY(-50%)', boxShadow: '0 2px 8px rgba(0,0,0,0.25)', pointerEvents: 'none' }} />
          </div>
          <div style={{ fontSize: '12px', color: th.textMuted }}>{t.log.sevDesc[severity]}</div>
        </div>

        {/* Body Map — always white for medical clarity */}
        <div style={bodyCard}>
          <span style={cardLabel}>🫀 {t.log.bodyMap}</span>
          <div style={{ fontSize: '11px', color: th.textMuted, marginBottom: '12px' }}>{t.log.bodyMapSub}</div>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <svg viewBox="0 0 100 220" style={{ width: '120px', flexShrink: 0 }}>
              {ZONE_MAP.map(z => {
                const isSelected = !!zones[z.key]
                const fill = zones[z.key] ? ZONE_COLORS[zones[z.key]] : th.lightGrey
                const stroke = zones[z.key] ? ZONE_COLORS[zones[z.key]] : th.border
                // Body figure: white fill + white/light stroke in dark mode
                const zoneFill = zones[z.key] ? ZONE_COLORS[zones[z.key]] : (darkMode ? 'rgba(255,255,255,0.08)' : '#F5F5F5')
                const zoneStroke = zones[z.key] ? ZONE_COLORS[zones[z.key]] : (darkMode ? 'rgba(255,255,255,0.5)' : '#CCCCCC')
                const props = { fill: zoneFill, stroke: zoneStroke, strokeWidth: isSelected ? 2.5 : 1.8, onClick: () => toggleZone(z.key), style: { cursor: 'pointer' } }
                return z.type === 'e' ? (
                  <g key={z.key}>
                    <ellipse {...props} cx={z.cx} cy={z.cy} rx={z.rx} ry={z.ry} />
                    {z.cx2 && <ellipse {...props} cx={z.cx2} cy={z.cy} rx={z.rx} ry={z.ry} />}
                  </g>
                ) : <rect key={z.key} {...props} x={z.x} y={z.y} width={z.w} height={z.h} rx="7" />
              })}
            </svg>
            <div style={{ flex: 1 }}>
              {[['mild', t.log.mild], ['moderate', t.log.moderate], ['severe', t.log.severe]].map(([m, label]) => (
                <div key={m} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', borderRadius: '6px', border: `1.5px solid ${zoneMode === m ? ZONE_COLORS[m] : 'transparent'}`, background: zoneMode === m ? th.lightGrey : 'transparent', cursor: 'pointer', marginBottom: '6px' }}
                  onClick={() => setZoneMode(m)}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: ZONE_COLORS[m], flexShrink: 0 }} />
                  <span style={{ fontSize: '11px', color: th.textSecondary }}>{label}</span>
                </div>
              ))}
              {Object.keys(zones).length > 0 && (
                <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {Object.entries(zones).map(([z, m]) => (
                    <span key={z} style={{ display: 'inline-flex', alignItems: 'center', fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '4px', border: `1px solid ${ZONE_COLORS[m]}`, background: ZONE_COLORS[m] + '22' }}>
                      {t.zones[z]} <span style={{ cursor: 'pointer', marginLeft: '4px' }} onClick={() => setZones(p => { const n = {...p}; delete n[z]; return n })}>×</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Symptoms */}
        <div style={card}>
          <span style={cardLabel}>✦ {t.log.symptoms}</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {SYMPTOM_KEYS.map(sk => (
              <div key={sk} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', border: `1.5px solid ${symptoms.includes(sk) ? th.green : th.border}`, borderRadius: '8px', cursor: 'pointer', background: symptoms.includes(sk) ? th.greenLight : th.white, color: symptoms.includes(sk) ? th.green : th.textSecondary, fontSize: '12px' }}
                onClick={() => toggleSymptom(sk)}>
                <span>{SYMPTOM_ICONS[sk]}</span>
                <span style={{ flex: 1 }}>{t.symptoms[sk]}</span>
                <div style={{ width: '16px', height: '16px', border: `1.5px solid ${symptoms.includes(sk) ? th.green : th.border}`, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', background: symptoms.includes(sk) ? th.green : 'transparent', color: 'white', flexShrink: 0 }}>
                  {symptoms.includes(sk) ? '✓' : ''}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Triggers + Skincare */}
        <div style={card}>
          <span style={cardLabel}>🔍 {t.log.triggers}</span>
          {[[t.log.food, FOOD_TRIGGERS], [t.log.environment, ENV_TRIGGERS], [t.log.lifestyle, LIFE_TRIGGERS]].map(([label, keys]) => (
            <div key={label} style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '11px', color: th.textSecondary, fontWeight: '700', marginBottom: '6px' }}>{label}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {keys.map(tr => (
                  <div key={tr} style={{ padding: '6px 12px', border: `1.5px solid ${triggers.includes(tr) ? th.green : th.border}`, borderRadius: '6px', fontSize: '12px', color: triggers.includes(tr) ? 'white' : th.textSecondary, cursor: 'pointer', background: triggers.includes(tr) ? th.green : th.white, fontWeight: '500' }}
                    onClick={() => toggleTrigger(tr)}>{t.triggers[tr]}</div>
                ))}
              </div>
            </div>
          ))}

          {/* Custom triggers */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '11px', color: th.textSecondary, fontWeight: '700', marginBottom: '6px' }}>
              ✏️ {isZh ? '自定義誘因' : 'Custom Triggers'}
            </div>
            <div style={{ fontSize: '11px', color: th.textMuted, marginBottom: '8px' }}>
              {isZh ? '添加您專屬的誘因標籤（例如：某種洗髮精、貓毛）' : 'Add your own triggers (e.g. a shampoo, cat fur)'}
            </div>
            {customTriggers.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                {customTriggers.map(ct => (
                  <div key={ct} style={{ padding: '6px 12px', border: `1.5px solid ${th.orange}`, borderRadius: '6px', fontSize: '12px', color: 'white', background: th.orange, fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {ct}
                    <span style={{ cursor: 'pointer', opacity: 0.8 }} onClick={() => { setCustomTriggers(p => p.filter(x => x !== ct)); setTriggers(p => p.filter(x => x !== ct)) }}>×</span>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px' }}>
              <input style={{ flex: 1, padding: '8px 12px', border: `1.5px solid ${th.border}`, borderRadius: '6px', fontSize: '12px', outline: 'none', background: th.lightGrey, color: th.textPrimary }}
                type="text" placeholder={isZh ? '輸入後按添加...' : 'Type then tap Add...'} value={customTrigger}
                onChange={e => setCustomTrigger(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomTrigger()} />
              <button style={{ padding: '8px 14px', background: th.green, color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                onClick={addCustomTrigger}>{isZh ? '添加' : 'Add'}</button>
            </div>
          </div>

          {/* Skincare */}
          <div>
            <div style={{ fontSize: '11px', color: th.textSecondary, fontWeight: '700', marginBottom: '6px' }}>🧴 {isZh ? '護膚程序' : 'Skincare Routine'}</div>
            <div style={{ fontSize: '11px', color: th.textMuted, marginBottom: '8px' }}>{isZh ? '今天使用了哪些護膚品？' : 'Which skincare products did you use today?'}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
              {skincareProducts.map(p => (
                <div key={p} style={{ padding: '6px 12px', border: `1.5px solid ${skincareApplied.includes(p) ? th.green : th.border}`, borderRadius: '6px', fontSize: '12px', color: skincareApplied.includes(p) ? th.green : th.textSecondary, cursor: 'pointer', background: skincareApplied.includes(p) ? th.greenLight : th.white, fontWeight: skincareApplied.includes(p) ? '700' : '500' }}
                  onClick={() => toggleSkincare(p)}>{p}</div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: th.textMuted, whiteSpace: 'nowrap', fontWeight: '600' }}>{isZh ? '其他：' : 'Other:'}</span>
              <input style={{ flex: 1, padding: '8px 12px', border: `1.5px solid ${th.border}`, borderRadius: '6px', fontSize: '12px', outline: 'none', background: th.lightGrey }} type="text" placeholder={isZh ? '請輸入其他產品...' : 'Enter other products...'} value={skincareOther} onChange={e => setSkincareOther(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Photo */}
        <div style={card}>
          <span style={cardLabel}>📸 {t.log.photo}</span>
          <div style={{ background: th.greenLight, border: `1px solid ${th.greenSoft}`, borderRadius: '8px', padding: '10px 12px', fontSize: '12px', color: th.greenDark, marginBottom: '12px', lineHeight: '1.5' }}>
            🔒 {isZh ? '私隱聲明：我們不會收集此部分的任何數據。照片只有您本人可以查看，以保護您的私隱。' : 'Privacy Notice: We do not collect any data from this section. Only you can see your photos, to protect your privacy.'}
          </div>
          <input type="file" accept="image/*" capture="environment" ref={fileRef} onChange={handlePhoto} style={{ display: 'none' }} />
          {photoPreview ? (
            <div style={{ position: 'relative' }}>
              <img src={photoPreview} alt="skin" style={{ width: '100%', borderRadius: '10px', maxHeight: '200px', objectFit: 'cover' }} />
              <button style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', fontSize: '16px', cursor: 'pointer' }}
                onClick={() => { setPhoto(null); setPhotoPreview(null) }}>×</button>
            </div>
          ) : (
            <div style={{ border: `2px dashed ${th.border}`, borderRadius: '10px', padding: '24px', textAlign: 'center', cursor: 'pointer', background: th.lightGrey }}
              onClick={() => fileRef.current.click()}>
              <div style={{ fontSize: '28px', marginBottom: '6px' }}>📷</div>
              <div style={{ fontSize: '12px', color: th.textMuted }}>{isZh ? '點擊拍照或上傳' : 'Tap to take or upload a photo'}</div>
            </div>
          )}
        </div>

        {/* Notes */}
        <div style={card}>
          <span style={cardLabel}>✍️ {t.log.notes}</span>
          <textarea style={{ width: '100%', border: `1.5px solid ${th.border}`, borderRadius: '8px', padding: '12px', fontSize: '13px', color: th.textPrimary, resize: 'none', height: '80px', outline: 'none', background: th.lightGrey, fontFamily: "'Lato',sans-serif" }}
            placeholder={t.log.notesPlaceholder} value={notes} onChange={e => setNotes(e.target.value)} />
        </div>

        <button style={{ width: '100%', color: 'white', border: 'none', borderRadius: '8px', padding: '16px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', letterSpacing: '0.04em', background: th.green }}
          onClick={handleSave} disabled={saving}>
          {saving ? t.log.saving : isEditing ? (isZh ? '✦ 更新今日記錄' : '✦ Update Entry') : t.log.save}
        </button>
      </div>
    </div>
  )
}
