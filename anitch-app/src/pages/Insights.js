import React, { useState, useEffect } from 'react';
import { useApp } from '../lib/AppContext';
import { supabase } from '../lib/supabase';
import { t } from '../i18n/translations';

function s(lang, path, ...a) { return t(lang, path, ...a); }

function subDays(n) {
  const d = new Date(); d.setDate(d.getDate() - n); return d;
}
function fmtDate(d) { return d.toISOString().slice(0, 10); }
function shortLabel(dateStr, lang) {
  const d = new Date(dateStr + 'T00:00:00');
  if (lang === 'zh') return `${d.getMonth()+1}/${d.getDate()}`;
  return `${d.getMonth()+1}/${d.getDate()}`;
}

export default function Insights() {
  const { th, lang, user } = useApp();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [window, setWindow] = useState(14); // 7 | 14 | 30

  useEffect(() => {
    if (user) loadEntries();
  }, [user]);

  async function loadEntries() {
    setLoading(true);
    const from = fmtDate(subDays(30));
    const { data } = await supabase.from('entries')
      .select('*').eq('user_id', user.id)
      .gte('date', from).order('date', { ascending: true });
    setEntries(data || []);
    setLoading(false);
  }

  // Build date array for selected window
  function getWindowDates() {
    const dates = [];
    for (let i = window - 1; i >= 0; i--) {
      dates.push(fmtDate(subDays(i)));
    }
    return dates;
  }

  const dates = getWindowDates();
  const entryMap = {};
  entries.forEach(e => { entryMap[e.date] = e; });

  // Stats from all loaded entries
  const scoredEntries = entries.filter(e => e.easi_score != null);
  const avgEasi = scoredEntries.length > 0
    ? (scoredEntries.reduce((s, e) => s + e.easi_score, 0) / scoredEntries.length).toFixed(1) : '—';
  const flareDays = scoredEntries.filter(e => e.easi_score >= 7).length;
  const daysLogged = entries.length;

  // Chart data for selected window
  const chartData = dates.map(d => ({
    date: d, label: shortLabel(d, lang),
    entry: entryMap[d] || null,
    score: entryMap[d]?.easi_score ?? null,
  }));

  const maxScore = 16; // cap for visual scale
  function barHeight(score) {
    if (score == null) return 0;
    return Math.min(72, (score / maxScore) * 72);
  }
  function barColor(score) {
    if (score == null) return th.border;
    return score >= 7 ? th.orange : th.green;
  }

  // Trend detection
  function getTrend() {
    const windowed = dates.map(d => entryMap[d]?.easi_score ?? null).filter(v => v != null);
    if (windowed.length < 4) return null;
    const half = Math.floor(windowed.length / 2);
    const first = windowed.slice(0, half).reduce((a, b) => a + b, 0) / half;
    const second = windowed.slice(half).reduce((a, b) => a + b, 0) / (windowed.length - half);
    if (second < first - 0.5) return 'improving';
    if (second > first + 0.5) return 'worsening';
    return 'stable';
  }
  const trend = getTrend();

  // Top triggers
  const triggerCounts = {};
  entries.forEach(e => {
    (e.triggers || []).forEach(tr => {
      triggerCounts[tr] = (triggerCounts[tr] || 0) + 1;
    });
  });
  const topTriggers = Object.entries(triggerCounts)
    .sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Skincare consistency
  const skincareEntries = entries.filter(e => e.skincare_applied && e.skincare_applied.length > 0);
  const skincareRate = entries.length > 0
    ? Math.round((skincareEntries.length / entries.length) * 100) : 0;

  // Correlation patterns (rule-based)
  const patterns = [];
  const stressFlare = entries.filter((e, i) => {
    if (!e.triggers?.includes('stress')) return false;
    const next = entries[i + 1];
    return next && next.easi_score >= 7;
  }).length;
  if (stressFlare >= 2) patterns.push(lang === 'zh'
    ? `壓力後次日爆發出現 ${stressFlare} 次` : `Stress linked to next-day flares ${stressFlare} times`);

  const goodSkincare = skincareEntries.filter(e => e.easi_score != null && e.easi_score < 7).length;
  if (skincareEntries.length >= 3 && goodSkincare / skincareEntries.length > 0.6)
    patterns.push(lang === 'zh' ? '護膚一致性與皮膚改善有關' : 'Good skincare consistency linked to better skin days');

  if (avgEasi !== '—' && parseFloat(avgEasi) < 4)
    patterns.push(lang === 'zh' ? '整體控制良好，繼續保持！' : 'Overall good control — keep it up!');

  const headerStyle = {
    background: th.headerBg, color: th.headerText,
    padding: '52px 20px 16px', fontSize: 18, fontWeight: 700,
  };
  const cardStyle = {
    background: th.card, borderRadius: 14, padding: '16px',
    marginBottom: 12, boxShadow: `0 2px 8px ${th.shadow}`,
  };
  const labelStyle = { fontSize: 12, color: th.textSub, marginBottom: 2 };
  const valStyle = { fontSize: 22, fontWeight: 700, color: th.green };

  const toggleBtnStyle = (sel) => ({
    flex: 1, padding: '7px 0', borderRadius: 8, fontSize: 13, fontWeight: sel ? 700 : 400,
    border: `1.5px solid ${sel ? th.green : th.border}`,
    background: sel ? th.green : th.card, color: sel ? '#fff' : th.textSub,
    cursor: 'pointer', transition: 'all 0.15s',
  });

  if (loading) return (
    <div style={{ background: th.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: th.textSub, fontSize: 14 }}>{lang === 'zh' ? '載入中…' : 'Loading…'}</div>
    </div>
  );

  if (entries.length < 3) return (
    <div style={{ background: th.bg, minHeight: '100vh' }}>
      <div style={headerStyle}>{s(lang, 'insights.title')}</div>
      <div style={{ padding: '40px 20px', textAlign: 'center', color: th.textSub }}>
        {s(lang, 'insights.noData')}
      </div>
    </div>
  );

  return (
    <div style={{ background: th.bg, minHeight: '100vh', paddingBottom: 90 }}>
      <div style={headerStyle}>{s(lang, 'insights.title')}</div>
      <div style={{ padding: '16px 16px 0' }}>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          {[
            { val: avgEasi, label: s(lang, 'home.avgEasi') },
            { val: flareDays, label: s(lang, 'home.flareDays') },
            { val: daysLogged, label: s(lang, 'home.daysLogged') },
          ].map((item, i) => (
            <div key={i} style={{ ...cardStyle, flex: 1, textAlign: 'center', marginBottom: 0, padding: '12px 8px' }}>
              <div style={valStyle}>{item.val}</div>
              <div style={labelStyle}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* === COMBINED TREND CHART === */}
        <div style={cardStyle}>
          <div style={{ fontSize: 14, fontWeight: 700, color: th.text, marginBottom: 12 }}>
            {s(lang, 'insights.trend')}
          </div>

          {/* Toggle 7/14/30 */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
            {[7, 14, 30].map(w => (
              <button key={w} style={toggleBtnStyle(window === w)} onClick={() => setWindow(w)}>
                {s(lang, `insights.d${w}`)}
              </button>
            ))}
          </div>

          {/* Bar chart */}
          <div style={{
            display: 'flex', alignItems: 'flex-end', gap: window <= 14 ? 4 : 2,
            height: 80, overflowX: 'auto', paddingBottom: 2,
          }}>
            {chartData.map((d, i) => (
              <div key={i} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                minWidth: window <= 14 ? 18 : 10, flex: 1,
              }}>
                <div style={{
                  width: '100%', borderRadius: '3px 3px 0 0',
                  height: d.score != null ? barHeight(d.score) : 4,
                  background: barColor(d.score),
                  opacity: d.score == null ? 0.25 : 1,
                  transition: 'height 0.3s ease',
                  minHeight: 4,
                }} />
                {window <= 14 && (
                  <div style={{ fontSize: 8, color: th.textMuted, marginTop: 2, whiteSpace: 'nowrap' }}>
                    {d.label}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
            {[
              { color: th.green, label: s(lang, 'insights.mild') },
              { color: th.orange, label: s(lang, 'insights.moderate') },
              { color: th.border, label: s(lang, 'insights.noLog') },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: th.textSub }}>{item.label}</span>
              </div>
            ))}
          </div>

          {/* Trend badge */}
          {trend && (
            <div style={{
              marginTop: 12, background: trend === 'improving' ? th.greenLight : trend === 'worsening' ? th.orangeLight : th.bg,
              borderRadius: 10, padding: '10px 12px',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ fontSize: 16 }}>
                {trend === 'improving' ? '📉' : trend === 'worsening' ? '📈' : '➡️'}
              </span>
              <span style={{ fontSize: 13, color: trend === 'improving' ? th.green : trend === 'worsening' ? '#c05a00' : th.textSub, fontWeight: 600 }}>
                {s(lang, `insights.${trend}`)}
              </span>
            </div>
          )}
        </div>

        {/* Top triggers */}
        {topTriggers.length > 0 && (
          <div style={cardStyle}>
            <div style={{ fontSize: 14, fontWeight: 700, color: th.text, marginBottom: 12 }}>
              {s(lang, 'insights.topTriggers')}
            </div>
            {topTriggers.map(([trigger, count]) => {
              const pct = Math.round((count / Math.max(...topTriggers.map(t => t[1]))) * 100);
              return (
                <div key={trigger} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ color: th.text }}>{trigger}</span>
                    <span style={{ color: th.textSub }}>{count}×</span>
                  </div>
                  <div style={{ height: 6, background: th.border, borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: th.orange, borderRadius: 3 }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Skincare consistency */}
        <div style={cardStyle}>
          <div style={{ fontSize: 14, fontWeight: 700, color: th.text, marginBottom: 10 }}>
            {s(lang, 'insights.skincareConsistency')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: th.green }}>{skincareRate}%</div>
            <div style={{ flex: 1 }}>
              <div style={{ height: 8, background: th.border, borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${skincareRate}%`, height: '100%', background: th.green, borderRadius: 4 }} />
              </div>
              <div style={{ fontSize: 12, color: th.textSub, marginTop: 4 }}>
                {skincareEntries.length} / {entries.length} {lang === 'zh' ? '天有護膚' : 'days with skincare'}
              </div>
            </div>
          </div>
        </div>

        {/* Pattern insights */}
        {patterns.length > 0 && (
          <div style={cardStyle}>
            <div style={{ fontSize: 14, fontWeight: 700, color: th.text, marginBottom: 10 }}>
              {s(lang, 'insights.correlations')}
            </div>
            {patterns.map((p, i) => (
              <div key={i} style={{
                display: 'flex', gap: 10, alignItems: 'flex-start',
                padding: '8px 0', borderBottom: i < patterns.length - 1 ? `1px solid ${th.border}` : 'none',
              }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>💡</span>
                <span style={{ fontSize: 13, color: th.text, lineHeight: 1.4 }}>{p}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ fontSize: 11, color: th.textMuted, textAlign: 'center', marginTop: 8 }}>
          {lang === 'zh' ? '本應用僅供個人追蹤，不提供醫療建議。' : 'Personal tracker only. Not medical advice.'}
        </div>
      </div>
    </div>
  );
}
