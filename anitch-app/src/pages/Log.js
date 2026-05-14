import React, { useState, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useApp } from '../lib/AppContext'
import { LOGO_BASE64 } from '../lib/logo'

// ─── EASI SCORING SYSTEM ────────────────────────────────────────────────────
// Based on: Eczema Area and Severity Index (EASI) - HOME Foundation Dec 2016
// Reference: https://www.homeforeczema.org/documents/easi-user-guide-dec-2016-v2.pdf
//
// 4 Body Regions: Head/Neck, Trunk, Upper Extremities, Lower Extremities
// 4 Signs per region: Erythema, Edema/Papulation, Excoriation, Lichenification
// Each sign scored 0-3: 0=None, 1=Mild, 2=Moderate, 3=Severe
// Area score 0-6 based on % involvement per region
// Final EASI = sum of (sign scores × area score × multiplier) for all regions
// Score range: 0-72
//
// Multipliers (age ≥8):
//   Head/Neck: 0.1 | Trunk: 0.3 | Upper Extremities: 0.2 | Lower Extremities: 0.4

const EASI_REGIONS = [
  { key: 'head', multiplier: 0.1 },
  { key: 'trunk', multiplier: 0.3 },
  { key: 'upperLimbs', multiplier: 0.2 },
  { key: 'lowerLimbs', multiplier: 0.4 },
]

const EASI_SIGNS = ['erythema', 'edema', 'excoriation', 'lichenification']

// Area score mapping: % involvement → score 0-6
const AREA_SCORES = [
  { label: '0%', value: 0 },
  { label: '1–9%', value: 1 },
  { label: '10–29%', value: 2 },
  { label: '30–49%', value: 3 },
  { label: '50–69%', value: 4 },
  { label: '70–89%', value: 5 },
  { label: '90–100%', value: 6 },
]

// EASI severity labels
const SEVERITY_LABELS = {
  0: { en: 'Clear', zh: '無症狀', color: '#004B39' },
  1: { en: 'Almost Clear', zh: '接近無症狀', color: '#2ECC8A' },
  7: { en: 'Mild', zh: '輕度', color: '#8FAF8A' },
  16: { en: 'Moderate', zh: '中度', color: '#F7984C' },
  29: { en: 'Severe', zh: '嚴重', color: '#E86A5A' },
  50: { en: 'Very Severe', zh: '非常嚴重', color: '#C0392B' },
}

function getEASILabel(score, isZh) {
  if (score === 0) return isZh ? '無症狀 (EASI: 0)' : 'Clear (EASI: 0)'
  if (score <= 1) return isZh ? `接近無症狀 (EASI: ${score.toFixed(1)})` : `Almost Clear (EASI: ${score.toFixed(1)})`
  if (score <= 7) return isZh ? `輕度 (EASI: ${score.toFixed(1)})` : `Mild (EASI: ${score.toFixed(1)})`
  if (score <= 16) return isZh ? `中度 (EASI: ${score.toFixed(1)})` : `Moderate (EASI: ${score.toFixed(1)})`
  if (score <= 29) return isZh ? `嚴重 (EASI: ${score.toFixed(1)})` : `Severe (EASI: ${score.toFixed(1)})`
  return isZh ? `非常嚴重 (EASI: ${score.toFixed(1)})` : `Very Severe (EASI: ${score.toFixed(1)})`
}

function getEASIColor(score) {
  if (score === 0) return '#004B39'
  if (score <= 1) return '#2ECC8A'
  if (score <= 7) return '#8FAF8A'
  if (score <= 16) return '#F7984C'
  if (score <= 29) return '#E86A5A'
  return '#C0392B'
}

function calculateEASI(regions) {
  let total = 0
  for (const region of EASI_REGIONS) {
    const r = regions[region.key]
    if (!r) continue
    const signSum = (r.erythema || 0) + (r.edema || 0) + (r.excoriation || 0) + (r.lichenification || 0)
    const areaScore = r.areaScore || 0
    total += signSum * areaScore * region.multiplier
  }
  return Math.min(72, Math.round(total * 10) / 10)
}

const FOOD_TRIGGERS = ['dairy','gluten','eggs','nuts','alcohol','spicy','seafood']
const ENV_TRIGGERS = ['pollen','cold','heat','pets','dust','pollution']
const LIFE_TRIGGERS = ['sleep','stress','newProduct','exercise','emotion']
const SKINCARE_EN = ['Toner','Moisturiser','Serum','Sunscreen','Eye Cream','Facial Oil']
const SKINCARE_ZH = ['化妝水','保濕乳液','精華液','防曬霜','眼霜','臉部精油']

const THANK_YOU_EN = ["Thank you for checking in today 🌿","Small daily notes can slowly reveal your skin patterns.","You're taking care of yourself step by step.","Your skin journey deserves patience and kindness.","Tracking consistently helps you understand your flare-ups better.","Every entry brings you one step closer to understanding your skin.","You showed up for yourself today — that matters. 🌱"]
const THANK_YOU_ZH = ["感謝您今天的記錄 🌿","每天的小記錄，慢慢揭開皮膚的規律。","您正在一步一步地照顧自己。","您的皮膚旅程需要耐心與溫柔。","持續追蹤有助於您更好地了解皮膚狀況。","每一筆記錄都讓您更了解自己的皮膚。","今天您為自己而來——這很重要。🌱"]

export default function Log() {
  const { user, t, th, lang, darkMode } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const existingEntry = location.state?.existingEntry || null
  const isEditing = !!existingEntry
  const isZh = lang === 'zh'
  const skincareProducts = isZh ? SKINCARE_ZH : SKINCARE_EN

  // EASI region scores — each region has 4 signs + area score
  const [easiRegions, setEasiRegions] = useState(existingEntry?.easi_regions || {
    head: { erythema: 0, edema: 0, excoriation: 0, lichenification: 0, areaScore: 0 },
    trunk: { erythema: 0, edema: 0, excoriation: 0, lichenification: 0, areaScore: 0 },
    upperLimbs: { erythema: 0, edema: 0, excoriation: 0, lichenification: 0, areaScore: 0 },
    lowerLimbs: { erythema: 0, edema: 0, excoriation: 0, lichenification: 0, areaScore: 0 },
  })

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
  const [activeRegion, setActiveRegion] = useState('head')
  const fileRef = useRef()

  const easiScore = calculateEASI(easiRegions)
  const easiColor = getEASIColor(easiScore)
  const easiLabel = getEASILabel(easiScore, isZh)

  function updateRegion(regionKey, field, value) {
    setEasiRegions(prev => ({
      ...prev,
      [regionKey]: { ...prev[regionKey], [field]: value }
    }))
  }

  function toggleTrigger(tr) { setTriggers(p => p.includes(tr) ? p.filter(x => x !== tr) : [...p, tr]) }
  function toggleSkincare(p) { setSkincareApplied(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]) }
  function addCustomTrigger() {
    const val = customTrigger.trim()
    if (val && !customTriggers.includes(val)) { setCustomTriggers(p => [...p, val]); setTriggers(p => [...p, val]) }
    setCustomTrigger('')
  }
  function handlePhoto(e) { const f = e.target.files[0]; if (!f) return; setPhoto(f); setPhotoPreview(URL.createObjectURL(f)) }

  async function handleSave() {
    setSaving(true)
    let photoUrl = null
    if (photo) {
      const ext = photo.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`
      const { data } = await supabase.storage.from('skin-photos').upload(path, photo, { contentType: photo.type })
      if (data) photoUrl = path
    }
    const today = new Date().toISOString().split('T')[0]
    const msgs = isZh ? THANK_YOU_ZH : THANK_YOU_EN
    setThankYouMsg(msgs[Math.floor(Math.random() * msgs.length)])

    // Derive symptoms from EASI signs for backward compatibility
    const symptoms = []
    for (const r of EASI_REGIONS) {
      const region = easiRegions[r.key]
      if (region.erythema > 0 && !symptoms.includes('redness')) symptoms.push('redness')
      if (region.edema > 0 && !symptoms.includes('swelling')) symptoms.push('swelling')
      if (region.excoriation > 0 && !symptoms.includes('itching')) symptoms.push('itching')
      if (region.lichenification > 0 && !symptoms.includes('dryness')) symptoms.push('dryness')
    }

    await supabase.from('entries').upsert({
      user_id: user.id, date: today,
      severity: Math.round(easiScore / 72 * 9), // normalize for backward compat
      easi_score: easiScore,
      easi_regions: easiRegions,
      symptoms, triggers,
      notes, photo_url: photoUrl,
      skincare_applied: [...skincareApplied, ...(skincareOther ? [skincareOther] : [])]
    }, { onConflict: 'user_id,date' })

    setSaved(true); setSaving(false)
    setTimeout(() => navigate('/'), 2500)
  }

  const regionLabels = {
    head: { en: 'Head & Neck', zh: '頭部及頸部' },
    trunk: { en: 'Trunk', zh: '軀幹' },
    upperLimbs: { en: 'Upper Extremities', zh: '上肢（手臂）' },
    lowerLimbs: { en: 'Lower Extremities', zh: '下肢（腿部）' },
  }
  const signLabels = {
    erythema: { en: 'Erythema (Redness)', zh: '紅斑（發紅）' },
    edema: { en: 'Edema / Papulation (Swelling)', zh: '水腫／丘疹（腫脹）' },
    excoriation: { en: 'Excoriation (Scratch marks)', zh: '抓痕（抓傷）' },
    lichenification: { en: 'Lichenification (Thickened skin)', zh: '苔蘚化（皮膚增厚）' },
  }
  const signScoreLabels = {
    0: { en: 'None', zh: '無' },
    1: { en: 'Mild', zh: '輕度' },
    2: { en: 'Moderate', zh: '中度' },
    3: { en: 'Severe', zh: '嚴重' },
  }

  const card = { background: th.white, borderRadius: '12px', padding: '16px', marginBottom: '12px', boxShadow: `0 1px 4px ${th.shadow}`, border: `1px solid ${th.border}` }
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
    <div style={{ background: th.lightGrey, minHeight: '100vh', fontFamily: "'Lato',sans-serif" }}>
      {/* Header */}
      <div style={{ background: th.green, padding: '14px 20px 24px', paddingTop: 'max(14px, env(safe-area-inset-top))' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <img src={LOGO_BASE64} alt="anitch" style={{ height: '22px', width: 'auto' }} />
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
            {new Date().toLocaleDateString(isZh ? 'zh-TW' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>
        <div style={{ fontSize: '20px', fontWeight: '700', color: 'white', marginBottom: '4px' }}>
          {isEditing ? (isZh ? '✏️ 編輯今日記錄' : '✏️ Edit Today\'s Entry') : (isZh ? '今天皮膚狀況如何？' : 'How\'s your skin today?')}
        </div>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)' }}>
          {isZh ? '以EASI評分系統記錄您的皮膚狀況' : 'Log using the EASI scoring system'}
        </div>
      </div>

      <div style={{ padding: '14px 14px 100px' }}>

        {/* EASI Score Display */}
        <div style={{ ...card, textAlign: 'center', background: th.white }}>
          <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: th.textMuted, marginBottom: '12px' }}>
            📊 {isZh ? 'EASI 總分' : 'EASI Total Score'}
          </div>
          <div style={{ fontSize: '56px', fontWeight: '900', color: easiColor, lineHeight: 1, marginBottom: '8px', letterSpacing: '-0.02em' }}>
            {easiScore.toFixed(1)}
          </div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: easiColor, marginBottom: '8px' }}>{easiLabel}</div>
          {/* Score bar */}
          <div style={{ height: '8px', background: th.lightGrey, borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
            <div style={{ height: '100%', width: `${(easiScore / 72) * 100}%`, borderRadius: '4px', background: `linear-gradient(to right, #004B39, #F7984C, #C0392B)`, transition: 'width 0.4s' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: th.textMuted }}>
            <span>0</span><span>7</span><span>16</span><span>29</span><span>50</span><span>72</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: th.textMuted, marginTop: '2px' }}>
            <span>{isZh?'無':'Clear'}</span>
            <span>{isZh?'輕':'Mild'}</span>
            <span>{isZh?'中':'Mod'}</span>
            <span>{isZh?'重':'Sev'}</span>
            <span>{isZh?'極重':'V.Sev'}</span>
            <span></span>
          </div>
          {/* EASI info */}
          <div style={{ marginTop: '12px', background: th.greenLight, borderRadius: '8px', padding: '8px 12px', fontSize: '11px', color: th.greenDark, border: `1px solid ${th.greenSoft}` }}>
            {isZh
              ? '參考自EASI評分系統（Eczema Area and Severity Index），評分範圍0-72分。'
              : 'Based on EASI (Eczema Area and Severity Index). Score range: 0–72.'
            }
          </div>
        </div>

        {/* EASI Region Tabs */}
        <div style={card}>
          <span style={cardLabel}>
            🫀 {isZh ? '各部位評估（EASI）' : 'Region Assessment (EASI)'}
          </span>
          <div style={{ fontSize: '11px', color: th.textMuted, marginBottom: '14px', lineHeight: '1.5' }}>
            {isZh
              ? '請為每個身體部位評估4項皮膚症狀的嚴重程度（0=無，1=輕度，2=中度，3=嚴重），以及受影響面積。'
              : 'For each body region, rate 4 skin signs (0=None, 1=Mild, 2=Moderate, 3=Severe) and the affected area.'}
          </div>

          {/* Region selector tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '16px' }}>
            {EASI_REGIONS.map(r => {
              const regionScore = calculateEASI({ ...Object.fromEntries(EASI_REGIONS.map(x => [x.key, x.key === r.key ? easiRegions[r.key] : { erythema:0, edema:0, excoriation:0, lichenification:0, areaScore:0 }])) })
              const isActive = activeRegion === r.key
              const hasData = easiRegions[r.key]?.areaScore > 0
              return (
                <div key={r.key}
                  style={{ padding: '8px 10px', borderRadius: '8px', border: `1.5px solid ${isActive ? th.green : th.border}`, background: isActive ? th.greenLight : th.white, cursor: 'pointer', textAlign: 'center' }}
                  onClick={() => setActiveRegion(r.key)}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: isActive ? th.green : th.textSecondary }}>
                    {isZh ? regionLabels[r.key].zh : regionLabels[r.key].en}
                  </div>
                  {hasData && <div style={{ fontSize: '10px', color: th.green, marginTop: '2px' }}>×{r.multiplier}</div>}
                </div>
              )
            })}
          </div>

          {/* Active region scoring */}
          <div style={{ background: th.lightGrey, borderRadius: '10px', padding: '14px' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: th.textPrimary, marginBottom: '14px' }}>
              {isZh ? regionLabels[activeRegion].zh : regionLabels[activeRegion].en}
              <span style={{ fontSize: '11px', color: th.textMuted, fontWeight: '400', marginLeft: '8px' }}>
                ({isZh ? '權重' : 'weight'}: ×{EASI_REGIONS.find(r => r.key === activeRegion)?.multiplier})
              </span>
            </div>

            {/* 4 signs */}
            {EASI_SIGNS.map(sign => (
              <div key={sign} style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: th.textSecondary, marginBottom: '6px' }}>
                  {isZh ? signLabels[sign].zh : signLabels[sign].en}
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[0, 1, 2, 3].map(score => {
                    const isSelected = easiRegions[activeRegion][sign] === score
                    return (
                      <div key={score}
                        style={{ flex: 1, padding: '8px 4px', borderRadius: '8px', border: `1.5px solid ${isSelected ? th.green : th.border}`, background: isSelected ? th.green : th.white, cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}
                        onClick={() => updateRegion(activeRegion, sign, score)}>
                        <div style={{ fontSize: '14px', fontWeight: '800', color: isSelected ? 'white' : th.textSecondary }}>{score}</div>
                        <div style={{ fontSize: '9px', color: isSelected ? 'rgba(255,255,255,0.8)' : th.textMuted, marginTop: '2px' }}>
                          {isZh ? signScoreLabels[score].zh : signScoreLabels[score].en}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

            {/* Area score */}
            <div style={{ marginBottom: '4px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: th.textSecondary, marginBottom: '6px' }}>
                {isZh ? '受影響面積' : 'Area Involved'}
              </div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {AREA_SCORES.map(area => {
                  const isSelected = easiRegions[activeRegion].areaScore === area.value
                  return (
                    <div key={area.value}
                      style={{ padding: '6px 8px', borderRadius: '6px', border: `1.5px solid ${isSelected ? th.green : th.border}`, background: isSelected ? th.green : th.white, cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s', minWidth: '44px' }}
                      onClick={() => updateRegion(activeRegion, 'areaScore', area.value)}>
                      <div style={{ fontSize: '10px', fontWeight: '700', color: isSelected ? 'white' : th.textSecondary }}>{area.label}</div>
                    </div>
                  )
                })}
              </div>
              <div style={{ fontSize: '10px', color: th.textMuted, marginTop: '6px' }}>
                {isZh ? '估計此部位皮膚受影響的面積百分比' : 'Estimate the % of this region affected by eczema'}
              </div>
            </div>
          </div>
        </div>

        {/* Triggers */}
        <div style={card}>
          <span style={cardLabel}>🔍 {t.log.triggers}</span>
          {[[t.log.food, FOOD_TRIGGERS],[t.log.environment, ENV_TRIGGERS],[t.log.lifestyle, LIFE_TRIGGERS]].map(([label, keys]) => (
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
            {customTriggers.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                {customTriggers.map(ct => (
                  <div key={ct} style={{ padding: '6px 12px', border: `1.5px solid ${th.orange}`, borderRadius: '6px', fontSize: '12px', color: 'white', background: th.orange, fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {ct} <span style={{ cursor: 'pointer' }} onClick={() => { setCustomTriggers(p => p.filter(x => x !== ct)); setTriggers(p => p.filter(x => x !== ct)) }}>×</span>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px' }}>
              <input style={{ flex: 1, padding: '8px 12px', border: `1.5px solid ${th.border}`, borderRadius: '6px', fontSize: '12px', outline: 'none', background: th.lightGrey, color: th.textPrimary }}
                type="text" placeholder={isZh ? '輸入後按添加...' : 'Type then tap Add...'} value={customTrigger}
                onChange={e => setCustomTrigger(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustomTrigger()} />
              <button style={{ padding: '8px 14px', background: th.green, color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                onClick={addCustomTrigger}>{isZh ? '添加' : 'Add'}</button>
            </div>
          </div>
          {/* Skincare */}
          <div>
            <div style={{ fontSize: '11px', color: th.textSecondary, fontWeight: '700', marginBottom: '6px' }}>🧴 {isZh ? '護膚程序' : 'Skincare Routine'}</div>
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

        {/* Disclaimer */}
        <div style={{ background: th.lightGrey, borderRadius: '10px', padding: '12px 14px', marginBottom: '14px', border: `1px solid ${th.border}`, fontSize: '11px', color: th.textMuted, lineHeight: '1.6' }}>
          ⚕️ {isZh
            ? 'Anitch 濕疹日記是個人追蹤工具，所有數據僅供參考，不能替代醫療建議。如有疑慮，請諮詢皮膚科醫生。'
            : 'Anitch Eczema Diary is a personal tracking tool. Data is for reference only and cannot replace medical advice. Please consult a dermatologist for any concerns.'}
        </div>

        <button style={{ width: '100%', color: 'white', border: 'none', borderRadius: '8px', padding: '16px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', letterSpacing: '0.04em', background: th.green }}
          onClick={handleSave} disabled={saving}>
          {saving ? t.log.saving : isEditing ? (isZh ? '✦ 更新今日記錄' : '✦ Update Entry') : t.log.save}
        </button>
      </div>
    </div>
  )
}
