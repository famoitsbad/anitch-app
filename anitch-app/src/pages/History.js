import React, { useState, useEffect } from 'react';
import { useApp } from '../lib/AppContext';
import { supabase } from '../lib/supabase';
import { t } from '../i18n/translations';

function s(lang, path, ...a) { return t(lang, path, ...a); }

function severityColor(score, th) {
  if (score == null) return th.textMuted;
  if (score < 7) return th.green;
  if (score < 16) return th.orange;
  return '#e53e3e';
}

export default function History() {
  const { th, lang, user } = useApp();
  const [entries, setEntries] = useState([]);
  const [selected, setSelected] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compare, setCompare] = useState([]);

  useEffect(() => { if (user) load(); }, [user]);

  async function load() {
    const { data } = await supabase.from('entries').select('*')
      .eq('user_id', user.id).order('date', { ascending: false });
    setEntries(data || []);
  }

  const withPhotos = entries.filter(e => e.photo_url);

  return (
    <div style={{ background: th.bg, minHeight: '100vh', paddingBottom: 90 }}>
      <div style={{ background: th.headerBg, padding: '52px 20px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{s(lang, 'history.title')}</div>
        {withPhotos.length >= 2 && (
          <button onClick={() => setCompareMode(!compareMode)}
            style={{ fontSize: 12, color: '#fff', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}>
            {s(lang, 'history.compare')}
          </button>
        )}
      </div>

      {compareMode && (
        <div style={{ padding: '12px 16px', background: th.card }}>
          <div style={{ fontSize: 13, color: th.textSub, marginBottom: 8 }}>
            {lang === 'zh' ? '選擇兩張照片對比' : 'Select two photos to compare'}
          </div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
            {withPhotos.map(e => (
              <div key={e.id} onClick={() => {
                setCompare(prev => {
                  if (prev.find(x => x.id === e.id)) return prev.filter(x => x.id !== e.id);
                  if (prev.length >= 2) return [prev[1], e];
                  return [...prev, e];
                });
              }} style={{ position: 'relative', flexShrink: 0 }}>
                <img src={e.photo_url} alt="" style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 8,
                  border: `2.5px solid ${compare.find(x => x.id === e.id) ? th.orange : 'transparent'}` }} />
                <div style={{ fontSize: 9, textAlign: 'center', color: th.textSub, marginTop: 2 }}>{e.date.slice(5)}</div>
              </div>
            ))}
          </div>
          {compare.length === 2 && (
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              {compare.map((e, i) => (
                <div key={i} style={{ flex: 1 }}>
                  <img src={e.photo_url} alt="" style={{ width: '100%', borderRadius: 12, aspectRatio: '1', objectFit: 'cover' }} />
                  <div style={{ fontSize: 11, textAlign: 'center', color: th.textSub, marginTop: 4 }}>{e.date}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ padding: '12px 16px 0' }}>
        {entries.length === 0 ? (
          <div style={{ textAlign: 'center', color: th.textSub, marginTop: 60, fontSize: 14 }}>{s(lang, 'history.noEntries')}</div>
        ) : entries.map(e => (
          <div key={e.id} onClick={() => setSelected(e)}
            style={{ background: th.card, borderRadius: 14, padding: '14px 16px', marginBottom: 10,
              boxShadow: `0 2px 6px ${th.shadow}`, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
            {e.photo_url
              ? <img src={e.photo_url} alt="" style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
              : <div style={{ width: 50, height: 50, borderRadius: 8, background: th.greenLight, flexShrink: 0 }} />
            }
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: th.text }}>
                {new Date(e.date + 'T00:00:00').toLocaleDateString(lang === 'zh' ? 'zh-HK' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
              <div style={{ fontSize: 12, color: th.textSub, marginTop: 2 }}>
                {e.easi_score != null && <span style={{ color: severityColor(e.easi_score, th), fontWeight: 600 }}>EASI {e.easi_score}</span>}
                {e.triggers?.length > 0 && <span style={{ marginLeft: 6 }}>· {e.triggers.slice(0,2).join(', ')}</span>}
              </div>
            </div>
            <span style={{ color: th.textMuted, fontSize: 18 }}>›</span>
          </div>
        ))}
      </div>

      {/* Detail modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, overflowY: 'auto' }}
          onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div style={{ background: th.card, margin: '60px 16px 40px', borderRadius: 20, padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: th.text }}>{selected.date}</div>
              <button onClick={() => setSelected(null)}
                style={{ background: th.bg, border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 13, color: th.textSub, cursor: 'pointer' }}>
                {s(lang, 'history.close')}
              </button>
            </div>
            {selected.photo_url && <img src={selected.photo_url} alt="" style={{ width: '100%', borderRadius: 12, marginBottom: 14, objectFit: 'cover', maxHeight: 240 }} />}
            {selected.easi_score != null && (
              <div style={{ textAlign: 'center', marginBottom: 14 }}>
                <div style={{ fontSize: 36, fontWeight: 900, color: severityColor(selected.easi_score, th) }}>{selected.easi_score}</div>
                <div style={{ fontSize: 13, color: th.textSub }}>EASI Score</div>
              </div>
            )}
            {[
              { label: lang === 'zh' ? '症狀' : 'Symptoms', val: selected.symptoms?.join(', ') },
              { label: lang === 'zh' ? '誘因' : 'Triggers', val: selected.triggers?.join(', ') },
              { label: lang === 'zh' ? '護膚' : 'Skincare', val: selected.skincare_applied?.join(', ') },
              { label: lang === 'zh' ? '備註' : 'Notes', val: selected.notes },
            ].filter(r => r.val).map((r, i) => (
              <div key={i} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: `1px solid ${th.border}` }}>
                <div style={{ fontSize: 12, color: th.textSub, marginBottom: 3 }}>{r.label}</div>
                <div style={{ fontSize: 14, color: th.text }}>{r.val}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
