import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../lib/AppContext';
import { supabase } from '../lib/supabase';
import { t } from '../i18n/translations';
import LearnSection from '../components/LearnSection';

function s(lang, path, ...a) { return t(lang, path, ...a); }

function fmtDate(d) { return d.toISOString().slice(0, 10); }
function today() { return fmtDate(new Date()); }

const ANITCH_TIPS = {
  en: [
    { cond: e => e.symptoms?.includes('dryness'), tip: 'Your skin has been dry lately. Try Barrier Rescue Balm tonight.' },
    { cond: e => e.symptoms?.includes('oozing'), tip: 'Oozing detected. Barrier Restore Face Cream can help calm inflammation.' },
    { cond: () => true, tip: 'Consistent moisturising is key. Apply Barrier Repair Body Cream after every shower.' },
  ],
  zh: [
    { cond: e => e.symptoms?.includes('dryness'), tip: '最近皮膚乾燥，試試今晚使用Barrier Rescue Balm。' },
    { cond: e => e.symptoms?.includes('oozing'), tip: '發現有滲液，Barrier Restore Face Cream有助紓緩。' },
    { cond: () => true, tip: '持續護膚是關鍵，每次沐浴後使用Barrier Repair Body Cream。' },
  ],
};

export default function Home() {
  const { th, lang, user, profile, setTodayEntry } = useApp();
  const location = useLocation();
  const [entries, setEntries] = useState([]);
  const [month, setMonth] = useState(new Date());
  useEffect(() => {
    async function loadEntries() {
      const from = new Date(); from.setMonth(from.getMonth() - 2);
      const { data } = await supabase.from('entries')
        .select('*').eq('user_id', user.id)
        .gte('date', fmtDate(from)).order('date', { ascending: false });
      const all = data || [];
      setEntries(all);
      const todayRec = all.find(e => e.date === today()) || null;
      setTodayEntry(todayRec);
    }
    if (user) loadEntries(); // eslint-disable-line react-hooks/exhaustive-deps
  }, [user, location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Calendar logic
  const yr = month.getFullYear();
  const mo = month.getMonth();
  const firstDay = new Date(yr, mo, 1).getDay();
  const daysInMonth = new Date(yr, mo + 1, 0).getDate();
  const loggedDates = new Set(entries.map(e => e.date));
  const todayStr = today();

  function calDayStyle(day) {
    const ds = `${yr}-${String(mo+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const isToday = ds === todayStr;
    const isLogged = loggedDates.has(ds);
    const isPast = ds < todayStr;
    const isFuture = ds > todayStr;
    let bg = 'transparent', color = th.text, border = 'none', fontWeight = 400;
    if (isLogged && isToday) { bg = th.green; color = '#fff'; border = `2px solid ${th.orange}`; fontWeight = 700; }
    else if (isLogged) { bg = th.green; color = '#fff'; fontWeight = 700; }
    else if (isToday) { bg = th.orange; color = '#fff'; fontWeight = 700; }
    else if (isFuture) { color = '#888'; }
    else if (isPast) { color = '#bbb'; }
    return { bg, color, border, fontWeight };
  }

  // Streak
  let streak = 0;
  const d = new Date(); d.setDate(d.getDate() - 1);
  if (loggedDates.has(todayStr)) {
    streak = 1;
    let cur = new Date(); cur.setDate(cur.getDate() - 1);
    while (loggedDates.has(fmtDate(cur))) { streak++; cur.setDate(cur.getDate() - 1); }
  }

  // Stats
  const scored = entries.filter(e => e.easi_score != null);
  const avgEasi = scored.length > 0 ? (scored.reduce((s, e) => s + e.easi_score, 0) / scored.length).toFixed(1) : '—';
  const flareDays = scored.filter(e => e.easi_score >= 7).length;

  // Anitch tip
  let tip = '';
  if (entries.length > 0) {
    const recent = entries[0];
    const tips = ANITCH_TIPS[lang] || ANITCH_TIPS.en;
    const matched = tips.find(t => t.cond(recent));
    tip = matched ? matched.tip : tips[tips.length - 1].tip;
  }

  // Rewards
  const r15done = streak >= 15;
  const r30done = streak >= 30;

  const cardStyle = {
    background: th.card, borderRadius: 16, padding: '16px',
    marginBottom: 12, boxShadow: `0 2px 8px ${th.shadow}`,
  };

  const initials = (profile?.name || 'A').slice(0, 1).toUpperCase();

  return (
    <div style={{ background: th.bg, minHeight: '100vh', paddingBottom: 90 }}>
      {/* Header */}
      <div style={{ background: th.headerBg, padding: '52px 20px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>
            {profile?.name
              ? (entries.length > 1 ? s(lang, 'home.greetingReturn', profile.name) : s(lang, 'home.greeting', profile.name))
              : 'anitch™'}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>
            {new Date().toLocaleDateString(lang === 'zh' ? 'zh-HK' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: th.orange, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontWeight: 700, fontSize: 16, color: '#fff',
        }}>{initials}</div>
      </div>

      <div style={{ padding: '16px 16px 0' }}>

        {/* Calendar + Rewards card */}
        <div style={cardStyle}>
          {/* Month nav */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <button onClick={() => setMonth(new Date(yr, mo - 1, 1))}
              style={{ background: 'none', border: 'none', fontSize: 18, color: th.textSub, cursor: 'pointer', padding: '0 8px' }}>‹</button>
            <div style={{ fontWeight: 700, fontSize: 14, color: th.text }}>
              {month.toLocaleDateString(lang === 'zh' ? 'zh-HK' : 'en-US', { month: 'long', year: 'numeric' })}
              {streak > 0 && (
                <span style={{ marginLeft: 8, background: th.orangeLight, color: th.orange, borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
                  🔥 {streak} {s(lang, 'home.streak')}
                </span>
              )}
            </div>
            <button onClick={() => setMonth(new Date(yr, mo + 1, 1))}
              style={{ background: 'none', border: 'none', fontSize: 18, color: th.textSub, cursor: 'pointer', padding: '0 8px' }}>›</button>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
            {(lang === 'zh' ? ['日','一','二','三','四','五','六'] : ['S','M','T','W','T','F','S']).map((d, i) => (
              <div key={i} style={{ textAlign: 'center', fontSize: 10, color: th.textMuted, fontWeight: 600 }}>{d}</div>
            ))}
          </div>

          {/* Calendar days */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
            {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} />)}
            {Array(daysInMonth).fill(null).map((_, i) => {
              const day = i + 1;
              const { bg, color, border, fontWeight } = calDayStyle(day);
              return (
                <div key={day} style={{
                  aspectRatio: '1', borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  background: bg, color, border, fontWeight,
                  fontSize: 11,
                }}>{day}</div>
              );
            })}
          </div>

          {/* Rewards */}
          <div style={{ borderTop: `1px solid ${th.border}`, marginTop: 12, paddingTop: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: th.text, marginBottom: 8 }}>
              {s(lang, 'home.rewards')}
            </div>
            {[
              { days: 15, label: s(lang, 'home.r15'), done: r15done },
              { days: 30, label: s(lang, 'home.r30'), done: r30done },
            ].map(r => (
              <div key={r.days} style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6,
                padding: '8px 10px', borderRadius: 10,
                background: r.done ? th.greenLight : th.bg,
              }}>
                <span style={{ fontSize: 14 }}>{r.done ? '🔓' : '🔒'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: th.text }}>{r.label}</div>
                  <div style={{ height: 4, background: th.border, borderRadius: 2, marginTop: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, (streak / r.days) * 100)}%`, height: '100%', background: r.done ? th.green : th.orange, borderRadius: 2 }} />
                  </div>
                </div>
                {r.done && <span style={{ fontSize: 11, color: th.green, fontWeight: 700 }}>✓</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          {[
            { val: avgEasi, label: s(lang, 'home.avgEasi') },
            { val: flareDays, label: s(lang, 'home.flareDays') },
            { val: entries.length, label: s(lang, 'home.daysLogged') },
          ].map((item, i) => (
            <div key={i} style={{ flex: 1, background: th.card, borderRadius: 12, padding: '12px 8px', textAlign: 'center', boxShadow: `0 2px 6px ${th.shadow}` }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: th.green }}>{item.val}</div>
              <div style={{ fontSize: 11, color: th.textSub, marginTop: 2 }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* View Insights nudge */}
        <div style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, padding: '12px 16px' }}>
          <div>
            <div style={{ fontSize: 12, color: th.textSub }}>{lang === 'zh' ? '想查看EASI趨勢？' : 'Want to see your EASI trend?'}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: th.green }}>{s(lang, 'home.viewInsights')}</div>
          </div>
          <div style={{ fontSize: 20, color: th.green }}>📊</div>
        </div>

        {/* Anitch tip */}
        {tip && (
          <div style={{ background: th.cream, borderRadius: 14, padding: '14px 16px', marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#a05a00', marginBottom: 4 }}>{s(lang, 'home.tip')}</div>
            <div style={{ fontSize: 13, color: '#7a4a00', lineHeight: 1.5 }}>{tip}</div>
          </div>
        )}

        {/* Learn section */}
        <LearnSection />
      </div>
    </div>
  );
}
