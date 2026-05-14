import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../lib/AppContext';
import { supabase } from '../lib/supabase';
import { t } from '../i18n/translations';

function s(lang, path, ...a) { return t(lang, path, ...a); }

const REGIONS = ['head', 'trunk', 'upper', 'lower'];
const REGION_WEIGHTS = { head: 0.1, trunk: 0.3, upper: 0.2, lower: 0.4 };
const SIGNS = ['erythema', 'edema', 'excoriation', 'lichenification'];
const AREA_SCORES = [0, 1, 2, 3, 4, 5, 6];

const FOOD_TRIGGERS = ['🥛 Dairy', '🌾 Gluten', '🥚 Eggs', '🐟 Fish', '🥜 Nuts', '🍫 Chocolate'];
const ENV_TRIGGERS = ['🌿 Pollen', '🐾 Pet dander', '🧺 Dust mites', '🧴 Fragrance', '🌡️ Heat', '❄️ Cold', '💧 Sweat'];
const LIFE_TRIGGERS = ['😰 Stress', '🛏️ Poor sleep', '🏃 Exercise'];
const SKINCARE_OPTS = ['Barrier Rescue Balm', 'Barrier Restore Face Cream', 'Barrier Repair Body Cream', 'Other moisturiser', 'Steroid cream'];

const BODY_ZONES = lang => lang === 'zh'
  ? ['面部', '頸部', '頭皮', '手臂', '手肘', '手腕', '手掌', '軀幹(前)', '軀幹(後)', '大腿', '小腿', '腳踝']
  : ['Face', 'Neck', 'Scalp', 'Arms', 'Elbows', 'Wrists', 'Hands', 'Trunk (front)', 'Trunk (back)', 'Thighs', 'Lower legs', 'Ankles'];

function calcEasi(regions) {
  let total = 0;
  REGIONS.forEach(r => {
    const reg = regions[r] || {};
    const signSum = SIGNS.reduce((s, sign) => s + (reg[sign] || 0), 0);
    const area = reg.area || 0;
    total += signSum * area * REGION_WEIGHTS[r];
  });
  return Math.round(total * 10) / 10;
}

function severityLabel(score, lang) {
  if (score === 0) return lang === 'zh' ? '清晰' : 'Clear';
  if (score < 7) return lang === 'zh' ? '輕微' : 'Mild';
  if (score < 16) return lang === 'zh' ? '中度' : 'Moderate';
  if (score < 29) return lang === 'zh' ? '嚴重' : 'Severe';
  return lang === 'zh' ? '非常嚴重' : 'Very Severe';
}

export default function Log() {
  const { th, lang, user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const existing = location.state?.existingEntry || null;

  const [regions, setRegions] = useState({ head: {}, trunk: {}, upper: {}, lower: {} });
  const [zones, setZones] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [triggers, setTriggers] = useState([]);
  const [customTrigger, setCustomTrigger] = useState('');
  const [skincare, setSkincare] = useState([]);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoUrl, setPhotoUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { // eslint-disable-line react-hooks/exhaustive-deps
    if (existing) {
      if (existing.easi_regions) setRegions(existing.easi_regions);
      if (existing.affected_zones) setZones(existing.affected_zones);
      if (existing.symptoms) setSymptoms(existing.symptoms);
      if (existing.triggers) setTriggers(existing.triggers);
      if (existing.skincare_applied) setSkincare(existing.skincare_applied);
      if (existing.notes) setNotes(existing.notes);
      if (existing.photo_url) setPhotoUrl(existing.photo_url);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const easi = calcEasi(regions);
  const severity = severityLabel(easi, lang);

  function updateSign(region, sign, val) {
    setRegions(prev => ({
      ...prev,
      [region]: { ...prev[region], [sign]: val },
    }));
  }
  function updateArea(region, val) {
    setRegions(prev => ({ ...prev, [region]: { ...prev[region], area: val } }));
  }

  function toggleArr(arr, setArr, val) {
    setArr(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);
  }

  function addCustomTrigger() {
    if (customTrigger.trim()) {
      setTriggers(prev => [...prev, customTrigger.trim()]);
      setCustomTrigger('');
    }
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    let finalPhotoUrl = photoUrl;
    if (photoFile) {
      const ext = photoFile.name.split('.').pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { data: upData } = await supabase.storage.from('skin-photos').upload(path, photoFile, { upsert: true });
      if (upData) {
        const { data: { publicUrl } } = supabase.storage.from('skin-photos').getPublicUrl(path);
        finalPhotoUrl = publicUrl;
      }
    }
    const todayStr = new Date().toISOString().slice(0, 10);
    const payload = {
      user_id: user.id, date: todayStr,
      easi_score: easi, easi_regions: regions,
      affected_zones: zones, symptoms, triggers,
      skincare_applied: skincare, notes, photo_url: finalPhotoUrl,
    };
    await supabase.from('entries').upsert(payload, { onConflict: 'user_id,date' });
    setSaving(false); setSaved(true);
    setTimeout(() => { setSaved(false); navigate('/'); }, 2000);
  }

  if (saved) return (
    <div style={{ background: th.green, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 48 }}>🌿</div>
      <div style={{ color: '#fff', fontWeight: 700, fontSize: 20, marginTop: 16 }}>{s(lang, 'log.saved')}</div>
    </div>
  );

  const headerStyle = {
    background: th.headerBg, color: th.headerText,
    padding: '52px 20px 16px', display: 'flex',
    justifyContent: 'space-between', alignItems: 'center',
  };
  const sectionStyle = { fontSize: 14, fontWeight: 700, color: th.text, margin: '20px 0 10px' };
  const chipStyle = (sel) => ({
    padding: '7px 12px', borderRadius: 20, fontSize: 13,
    border: `1.5px solid ${sel ? th.orange : th.border}`,
    background: sel ? th.orangeLight : th.card,
    color: sel ? th.orange : th.textSub,
    cursor: 'pointer', fontWeight: sel ? 700 : 400,
    flexShrink: 0,
  });

  const regionLabels = s(lang, 'log.regions');
  const signLabels = s(lang, 'log.signs');
  const allZones = BODY_ZONES(lang);
  const symptomOpts = lang === 'zh'
    ? ['乾燥', '瘙癢', '紅腫', '滲液', '脫皮', '增厚']
    : ['dryness', 'itching', 'redness', 'oozing', 'scaling', 'thickening'];

  return (
    <div style={{ background: th.bg, minHeight: '100vh', paddingBottom: 100 }}>
      <div style={headerStyle}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>
          {existing ? s(lang, 'log.edit') : s(lang, 'log.title')}
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
          {new Date().toLocaleDateString(lang === 'zh' ? 'zh-HK' : 'en-US', { month: 'short', day: 'numeric' })}
        </div>
      </div>

      <div style={{ padding: '16px' }}>

        {/* EASI Score display */}
        <div style={{ background: th.card, borderRadius: 16, padding: 16, marginBottom: 16, textAlign: 'center', boxShadow: `0 2px 8px ${th.shadow}` }}>
          <div style={{ fontSize: 12, color: th.textSub }}>{s(lang, 'log.easi')}</div>
          <div style={{ fontSize: 44, fontWeight: 900, color: easi >= 7 ? th.orange : th.green }}>{easi}</div>
          <div style={{ fontSize: 14, color: easi >= 7 ? th.orange : th.green, fontWeight: 600 }}>{severity}</div>
        </div>

        {/* EASI Regions */}
        {REGIONS.map((reg, ri) => (
          <div key={reg} style={{ background: th.card, borderRadius: 14, padding: 14, marginBottom: 12, boxShadow: `0 2px 6px ${th.shadow}` }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: th.text, marginBottom: 10 }}>
              {regionLabels[ri]}
              <span style={{ fontSize: 11, color: th.textSub, fontWeight: 400, marginLeft: 6 }}>
                ×{REGION_WEIGHTS[reg]}
              </span>
            </div>
            {SIGNS.map((sign, si) => (
              <div key={sign} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, color: th.textSub, marginBottom: 5 }}>{signLabels[si]}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[0,1,2,3].map(v => (
                    <div key={v} onClick={() => updateSign(reg, sign, v)}
                      style={{
                        flex: 1, padding: '7px 0', borderRadius: 8, textAlign: 'center',
                        fontSize: 13, fontWeight: (regions[reg][sign] || 0) === v ? 700 : 400,
                        background: (regions[reg][sign] || 0) === v ? th.green : th.bg,
                        color: (regions[reg][sign] || 0) === v ? '#fff' : th.textSub,
                        border: `1px solid ${(regions[reg][sign] || 0) === v ? th.green : th.border}`,
                        cursor: 'pointer',
                      }}>{v}</div>
                  ))}
                </div>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 12, color: th.textSub, marginBottom: 5 }}>{s(lang, 'log.area')} (0–6)</div>
              <div style={{ display: 'flex', gap: 4 }}>
                {AREA_SCORES.map(v => (
                  <div key={v} onClick={() => updateArea(reg, v)}
                    style={{
                      flex: 1, padding: '6px 0', borderRadius: 8, textAlign: 'center',
                      fontSize: 12, fontWeight: (regions[reg].area || 0) === v ? 700 : 400,
                      background: (regions[reg].area || 0) === v ? th.orange : th.bg,
                      color: (regions[reg].area || 0) === v ? '#fff' : th.textSub,
                      border: `1px solid ${(regions[reg].area || 0) === v ? th.orange : th.border}`,
                      cursor: 'pointer',
                    }}>{v}</div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Symptoms */}
        <div style={sectionStyle}>{s(lang, 'log.symptoms')}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {symptomOpts.map(sym => (
            <div key={sym} style={chipStyle(symptoms.includes(sym))} onClick={() => toggleArr(symptoms, setSymptoms, sym)}>{sym}</div>
          ))}
        </div>

        {/* Affected zones */}
        <div style={sectionStyle}>{lang === 'zh' ? '受影響部位' : 'Affected areas'}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {allZones.map(zone => (
            <div key={zone} style={chipStyle(zones.includes(zone))} onClick={() => toggleArr(zones, setZones, zone)}>{zone}</div>
          ))}
        </div>

        {/* Triggers */}
        <div style={sectionStyle}>{s(lang, 'log.triggers')}</div>
        <div style={{ fontSize: 12, color: th.textSub, marginBottom: 6 }}>{lang === 'zh' ? '食物' : 'Food'}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
          {FOOD_TRIGGERS.map(tr => (
            <div key={tr} style={chipStyle(triggers.includes(tr))} onClick={() => toggleArr(triggers, setTriggers, tr)}>{tr}</div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: th.textSub, marginBottom: 6 }}>{lang === 'zh' ? '環境' : 'Environment'}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
          {ENV_TRIGGERS.map(tr => (
            <div key={tr} style={chipStyle(triggers.includes(tr))} onClick={() => toggleArr(triggers, setTriggers, tr)}>{tr}</div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: th.textSub, marginBottom: 6 }}>{lang === 'zh' ? '生活習慣' : 'Lifestyle'}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {LIFE_TRIGGERS.map(tr => (
            <div key={tr} style={chipStyle(triggers.includes(tr))} onClick={() => toggleArr(triggers, setTriggers, tr)}>{tr}</div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input value={customTrigger} onChange={e => setCustomTrigger(e.target.value)}
            placeholder={s(lang, 'log.customTrigger')}
            onKeyDown={e => e.key === 'Enter' && addCustomTrigger()}
            style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: `1px solid ${th.inputBorder}`, background: th.inputBg, color: th.text, fontSize: 14, outline: 'none' }} />
          <button onClick={addCustomTrigger}
            style={{ padding: '10px 16px', borderRadius: 10, background: th.green, color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>+</button>
        </div>

        {/* Skincare */}
        <div style={sectionStyle}>{s(lang, 'log.skincare')}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {SKINCARE_OPTS.map(opt => (
            <div key={opt} style={chipStyle(skincare.includes(opt))} onClick={() => toggleArr(skincare, setSkincare, opt)}>{opt}</div>
          ))}
        </div>

        {/* Photo */}
        <div style={sectionStyle}>{s(lang, 'log.photo')}</div>
        <div style={{ marginBottom: 16 }}>
          <input type="file" accept="image/*" capture="environment"
            onChange={e => { if (e.target.files[0]) setPhotoFile(e.target.files[0]); }}
            style={{ fontSize: 13, color: th.textSub }} />
          {(photoUrl || photoFile) && (
            <div style={{ marginTop: 8 }}>
              <img src={photoFile ? URL.createObjectURL(photoFile) : photoUrl}
                alt="skin" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 10 }} />
            </div>
          )}
          <div style={{ fontSize: 11, color: th.textMuted, marginTop: 6 }}>
            {lang === 'zh' ? '照片安全儲存，只有你能查看。' : 'Photos are stored privately and only visible to you.'}
          </div>
        </div>

        {/* Notes */}
        <div style={sectionStyle}>{s(lang, 'log.notes')}</div>
        <textarea value={notes} onChange={e => setNotes(e.target.value)}
          placeholder={lang === 'zh' ? '今天有什麼特別想記錄的？' : "Anything else you'd like to note?"}
          style={{ width: '100%', minHeight: 80, padding: '12px 14px', borderRadius: 12,
            border: `1px solid ${th.inputBorder}`, background: th.inputBg, color: th.text,
            fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box', marginBottom: 8 }} />

        <div style={{ fontSize: 11, color: th.textMuted, marginBottom: 20 }}>{s(lang, 'log.disclaimer')}</div>

        <button onClick={handleSave} disabled={saving}
          style={{ width: '100%', padding: 15, borderRadius: 14, background: th.green, color: '#fff',
            fontWeight: 700, fontSize: 16, border: 'none', cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.7 : 1 }}>
          {saving ? s(lang, 'log.saving') : s(lang, 'log.save')}
        </button>
      </div>
    </div>
  );
}
