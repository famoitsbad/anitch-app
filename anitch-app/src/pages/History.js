import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../lib/AppContext'

export default function History() {
  const { user, t, th, lang } = useApp()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [photoUrls, setPhotoUrls] = useState({})
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [compareMode, setCompareMode] = useState(false)
  const [compareA, setCompareA] = useState(null)
  const [compareB, setCompareB] = useState(null)
  const isZh = lang === 'zh'

  useEffect(() => { loadEntries() }, [user])

  async function loadEntries() {
    const { data } = await supabase.from('entries').select('*').eq('user_id', user.id).order('date', { ascending: false })
    setEntries(data || [])
    const urls = {}
    for (const e of (data || [])) {
      if (e.photo_url) {
        const { data: url } = await supabase.storage.from('skin-photos').createSignedUrl(e.photo_url, 3600)
        if (url) urls[e.id] = url.signedUrl
      }
    }
    setPhotoUrls(urls)
    setLoading(false)
  }

  function scoreStyle(sev) {
    if (sev <= 3) return { background: '#EAF5EF', color: '#004B39', borderColor: '#B8DFC8' }
    if (sev <= 6) return { background: '#FEF0E3', color: '#E07830', borderColor: '#FCCFA0' }
    return { background: '#FDECEA', color: '#C0392B', borderColor: '#F5B7B1' }
  }
  function scoreLabel(sev) {
    if (sev <= 3) return isZh ? '輕度' : 'Mild'
    if (sev <= 6) return isZh ? '中度' : 'Moderate'
    return isZh ? '重度' : 'Severe'
  }

  function DateDisplay({ dateStr }) {
    const d = new Date(dateStr + 'T00:00:00')
    const day = d.getDate().toString().padStart(2, '0')
    const monthEN = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][d.getMonth()]
    const monthZH = `${d.getMonth() + 1}月`
    const weekEN = ['SUN','MON','TUE','WED','THU','FRI','SAT'][d.getDay()]
    const weekZH = ['週日','週一','週二','週三','週四','週五','週六'][d.getDay()]
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '68px' }}>
        <div style={{ fontSize: '24px', fontWeight: '800', color: th.green, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{day}</div>
        <div style={{ display: 'flex', flexDirection: 'column', borderLeft: `1px solid ${th.border}`, paddingLeft: '8px', lineHeight: '1.3' }}>
          <span style={{ fontWeight: '700', color: th.textSecondary, fontSize: isZh ? '12px' : '11px', textTransform: isZh ? 'none' : 'uppercase', letterSpacing: isZh ? 0 : '-0.01em' }}>{isZh ? monthZH : monthEN}</span>
          <span style={{ color: th.textMuted, fontSize: isZh ? '10px' : '9px', textTransform: isZh ? 'none' : 'uppercase', letterSpacing: isZh ? 0 : '0.04em' }}>{isZh ? weekZH : weekEN}</span>
        </div>
      </div>
    )
  }

  function EntryDetail({ entry, onClose }) {
    const photoUrl = photoUrls[entry.id]
    const d = new Date(entry.date + 'T00:00:00')
    const dateStr = isZh
      ? `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
      : d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }} onClick={onClose}>
        <div style={{ background: th.white, borderRadius: '20px 20px 0 0', width: '100%', maxWidth: '500px', margin: '0 auto', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
          <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: th.border, margin: '12px auto 0' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px 0' }}>
            <div style={{ fontSize: '16px', fontWeight: '700', color: th.textPrimary }}>{dateStr}</div>
            <button style={{ background: 'none', border: 'none', fontSize: '18px', color: th.textMuted, cursor: 'pointer' }} onClick={onClose}>✕</button>
          </div>
          <div style={{ overflow: 'auto', padding: '16px 20px 32px' }}>
            {/* Severity */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: th.textMuted, marginBottom: '8px' }}>{isZh ? '整體嚴重程度' : 'Overall Severity'}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ ...scoreStyle(entry.severity), fontSize: '13px', fontWeight: '700', padding: '4px 12px', borderRadius: '6px', border: '1px solid', flexShrink: 0 }}>{entry.severity}/9 · {scoreLabel(entry.severity)}</span>
                <div style={{ flex: 1, height: '8px', background: th.lightGrey, borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(entry.severity / 9) * 100}%`, borderRadius: '4px', background: entry.severity <= 3 ? th.green : entry.severity <= 6 ? th.orange : '#C0392B' }} />
                </div>
              </div>
            </div>
            {/* Photo */}
            {photoUrl && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: th.textMuted, marginBottom: '8px' }}>{isZh ? '皮膚照片' : 'Skin Photo'}</div>
                <img src={photoUrl} alt="skin" style={{ width: '100%', borderRadius: '12px', maxHeight: '250px', objectFit: 'cover' }} />
              </div>
            )}
            {/* Affected areas */}
            {entry.affected_zones && Object.keys(entry.affected_zones).length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: th.textMuted, marginBottom: '8px' }}>{isZh ? '受影響部位' : 'Affected Areas'}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {Object.entries(entry.affected_zones).map(([zone, level]) => (
                    <span key={zone} style={{ fontSize: '12px', fontWeight: '500', padding: '4px 10px', borderRadius: '6px', border: '1px solid', background: level === 'mild' ? '#FFF3C4' : level === 'moderate' ? '#FEF0E3' : '#FFE0DD', color: level === 'mild' ? '#856E00' : level === 'moderate' ? '#E07830' : '#C0392B', borderColor: level === 'mild' ? '#E8C84A' : level === 'moderate' ? '#FCCFA0' : '#F5B7B1' }}>
                      {t.zones[zone] || zone} · {isZh ? (level === 'mild' ? '輕度' : level === 'moderate' ? '中度' : '重度') : level}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {/* Symptoms */}
            {entry.symptoms?.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: th.textMuted, marginBottom: '8px' }}>{isZh ? '症狀' : 'Symptoms'}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {entry.symptoms.map(sym => <span key={sym} style={{ fontSize: '12px', color: th.textSecondary, background: th.lightGrey, padding: '4px 10px', borderRadius: '6px', border: `1px solid ${th.border}`, fontWeight: '500' }}>{t.symptoms[sym] || sym}</span>)}
                </div>
              </div>
            )}
            {/* Triggers */}
            {entry.triggers?.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: th.textMuted, marginBottom: '8px' }}>{isZh ? '誘發因素' : 'Triggers'}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {entry.triggers.map(tr => <span key={tr} style={{ fontSize: '12px', color: '#E07830', background: '#FEF0E3', padding: '4px 10px', borderRadius: '6px', border: '1px solid #FCCFA0', fontWeight: '500' }}>{t.triggers[tr] || tr}</span>)}
                </div>
              </div>
            )}
            {/* Skincare */}
            {entry.skincare_applied?.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: th.textMuted, marginBottom: '8px' }}>{isZh ? '護膚程序' : 'Skincare Applied'}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {entry.skincare_applied.map(p => <span key={p} style={{ fontSize: '12px', color: th.green, background: th.greenLight, padding: '4px 10px', borderRadius: '6px', border: `1px solid ${th.greenSoft}`, fontWeight: '500' }}>🧴 {p}</span>)}
                </div>
              </div>
            )}
            {/* Notes */}
            {entry.notes && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: th.textMuted, marginBottom: '8px' }}>{isZh ? '備注' : 'Notes'}</div>
                <div style={{ fontSize: '14px', color: th.textSecondary, lineHeight: '1.6', background: th.lightGrey, padding: '12px', borderRadius: '8px', fontStyle: 'italic' }}>{entry.notes}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Before & After compare view
  function CompareView() {
    const photosWithEntries = entries.filter(e => photoUrls[e.id])
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: th.green, padding: 'env(safe-area-inset-top, 14px) 20px 14px', paddingTop: 'max(14px, env(safe-area-inset-top))', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ color: 'white', fontWeight: '700', fontSize: '16px' }}>{isZh ? '前後對比' : 'Before & After'}</div>
          <button style={{ background: 'none', border: 'none', color: 'white', fontSize: '18px', cursor: 'pointer' }} onClick={() => { setCompareMode(false); setCompareA(null); setCompareB(null) }}>✕</button>
        </div>
        <div style={{ flex: 1, display: 'flex', gap: '2px', overflow: 'hidden' }}>
          {[{ label: isZh ? '選擇「之前」' : 'Select "Before"', selected: compareA, setter: setCompareA }, { label: isZh ? '選擇「之後」' : 'Select "After"', selected: compareB, setter: setCompareB }].map(({ label, selected, setter }, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px', textAlign: 'center', fontSize: '11px', color: 'white', fontWeight: '600' }}>{label}</div>
              {selected ? (
                <div style={{ flex: 1, position: 'relative' }}>
                  <img src={photoUrls[selected.id]} alt="compare" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', padding: '8px', fontSize: '11px', color: 'white', textAlign: 'center' }}>
                    {new Date(selected.date + 'T00:00:00').toLocaleDateString(isZh ? 'zh-TW' : 'en-GB', { day: 'numeric', month: 'short' })} · {isZh ? '嚴重度' : 'Severity'} {selected.severity}
                  </div>
                  <button style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer' }} onClick={() => setter(null)}>×</button>
                </div>
              ) : (
                <div style={{ flex: 1, overflow: 'auto', background: '#111' }}>
                  {photosWithEntries.map(e => (
                    <div key={e.id} style={{ display: 'flex', gap: '8px', padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', alignItems: 'center' }} onClick={() => setter(e)}>
                      <img src={photoUrls[e.id]} alt="thumb" style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: '12px', color: 'white', fontWeight: '600' }}>{new Date(e.date + 'T00:00:00').toLocaleDateString(isZh ? 'zh-TW' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>{isZh ? '嚴重度' : 'Severity'} {e.severity}</div>
                      </div>
                    </div>
                  ))}
                  {photosWithEntries.length === 0 && <div style={{ padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>{isZh ? '還沒有照片記錄' : 'No photo entries yet'}</div>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#004B39' }}><div style={{ color: 'white', fontSize: '16px', fontFamily: "'Lato',sans-serif" }}>Loading…</div></div>

  const photosCount = entries.filter(e => photoUrls[e.id]).length

  return (
    <div style={{ background: th.lightGrey, minHeight: '100vh', fontFamily: "'Lato',sans-serif" }}>
      {compareMode && <CompareView />}
      {selectedEntry && <EntryDetail entry={selectedEntry} onClose={() => setSelectedEntry(null)} />}

      <div style={{ background: th.green, padding: 'env(safe-area-inset-top, 14px) 20px 24px', paddingTop: 'max(14px, env(safe-area-inset-top))' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '22px', fontWeight: '700', color: 'white', marginBottom: '4px' }}>{t.history.title}</div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)' }}>{isZh ? '點擊記錄查看詳情' : 'Tap any entry to see full details'}</div>
          </div>
          {photosCount >= 2 && (
            <button style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
              onClick={() => setCompareMode(true)}>
              📸 {isZh ? '前後對比' : 'Compare'}
            </button>
          )}
        </div>
      </div>

      <div style={{ padding: '14px 14px 100px' }}>
        {entries.length === 0 && <div style={{ textAlign: 'center', color: th.textMuted, padding: '60px 20px', fontSize: '14px' }}>{t.history.noEntries}</div>}
        {entries.map(e => (
          <div key={e.id} style={{ background: th.white, borderRadius: '12px', padding: '14px', marginBottom: '10px', display: 'flex', gap: '12px', boxShadow: `0 1px 4px ${th.shadow}`, border: `1px solid ${th.border}`, cursor: 'pointer', transition: 'all 0.15s' }}
            onClick={() => setSelectedEntry(e)}>
            <DateDisplay dateStr={e.date} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ marginBottom: '6px' }}>
                <span style={{ ...scoreStyle(e.severity), fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '4px', display: 'inline-block', border: '1px solid' }}>
                  {t.history.severity} {e.severity} · {scoreLabel(e.severity)}
                </span>
              </div>
              {e.symptoms?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '4px' }}>
                  {e.symptoms.slice(0, 3).map(sym => <span key={sym} style={{ fontSize: '10px', color: th.textMuted, background: th.lightGrey, padding: '2px 8px', borderRadius: '4px', border: `1px solid ${th.border}`, fontWeight: '500' }}>{t.symptoms[sym]}</span>)}
                  {e.symptoms.length > 3 && <span style={{ fontSize: '10px', color: th.textMuted, background: th.lightGrey, padding: '2px 8px', borderRadius: '4px', border: `1px solid ${th.border}` }}>+{e.symptoms.length - 3}</span>}
                </div>
              )}
              {e.triggers?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '4px' }}>
                  {e.triggers.slice(0, 2).map(tr => <span key={tr} style={{ fontSize: '10px', color: '#E07830', background: '#FEF0E3', padding: '2px 8px', borderRadius: '4px', border: '1px solid #FCCFA0', fontWeight: '500' }}>{t.triggers[tr]}</span>)}
                  {e.triggers.length > 2 && <span style={{ fontSize: '10px', color: th.textMuted, background: th.lightGrey, padding: '2px 8px', borderRadius: '4px', border: `1px solid ${th.border}` }}>+{e.triggers.length - 2}</span>}
                </div>
              )}
              {e.notes && <div style={{ fontSize: '11px', color: th.textMuted, fontStyle: 'italic', marginTop: '4px' }}>"{e.notes.substring(0, 50)}{e.notes.length > 50 ? '...' : ''}"</div>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              {photoUrls[e.id] ? <img src={photoUrls[e.id]} alt="skin" style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', border: `1px solid ${th.border}` }} /> : <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: th.lightGrey, border: `1px solid ${th.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>{e.photo_url ? '📷' : ' '}</div>}
              <div style={{ fontSize: '18px', color: th.textMuted, fontWeight: '300' }}>›</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
