import React, { useState } from 'react';
import { useApp } from '../lib/AppContext';
import { supabase } from '../lib/supabase';
import { t } from '../i18n/translations';

function s(lang, path, ...a) { return t(lang, path, ...a); }

export default function Profile() {
  const { th, lang, toggleLang, darkMode, toggleDarkMode, user, profile, setProfile } = useApp();
  const [name, setName] = useState(profile?.name || '');
  const [ageRange, setAgeRange] = useState(profile?.age_range || '');
  const [gender, setGender] = useState(profile?.gender || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    const updates = { name: name.trim(), age_range: ageRange, gender };
    await supabase.from('profiles').update(updates).eq('id', user.id);
    setProfile(prev => ({ ...prev, ...updates }));
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  const rowStyle = {
    background: th.card, borderRadius: 14, padding: '14px 16px',
    marginBottom: 10, boxShadow: `0 2px 6px ${th.shadow}`,
  };
  const labelStyle = { fontSize: 12, color: th.textSub, marginBottom: 6 };
  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 10,
    border: `1px solid ${th.inputBorder}`, background: th.inputBg,
    color: th.text, fontSize: 14, outline: 'none', boxSizing: 'border-box',
  };
  const chipStyle = (sel) => ({
    padding: '7px 12px', borderRadius: 20, fontSize: 12,
    border: `1.5px solid ${sel ? th.green : th.border}`,
    background: sel ? th.green : th.card,
    color: sel ? '#fff' : th.textSub,
    cursor: 'pointer', fontWeight: sel ? 700 : 400,
    flexShrink: 0,
  });

  const ageOpts = s(lang, 'profile.ageOpts');
  const genderOpts = s(lang, 'profile.genderOpts');

  return (
    <div style={{ background: th.bg, minHeight: '100vh', paddingBottom: 90 }}>
      <div style={{ background: th.headerBg, padding: '52px 20px 16px' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{s(lang, 'profile.title')}</div>
      </div>

      <div style={{ padding: '16px' }}>

        {/* Name */}
        <div style={rowStyle}>
          <div style={labelStyle}>{s(lang, 'profile.name')}</div>
          <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} />
        </div>

        {/* Personal info — optional */}
        <div style={{ ...rowStyle }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: th.text }}>{s(lang, 'profile.personalInfo')}</div>
            <div style={{ fontSize: 11, color: th.textMuted, background: th.bg, borderRadius: 20, padding: '2px 8px' }}>
              {s(lang, 'profile.optional')}
            </div>
          </div>

          {/* Age range */}
          <div style={{ marginBottom: 14 }}>
            <div style={labelStyle}>{s(lang, 'profile.ageRange')}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {ageOpts.map(opt => (
                <div key={opt} style={chipStyle(ageRange === opt)} onClick={() => setAgeRange(ageRange === opt ? '' : opt)}>{opt}</div>
              ))}
            </div>
          </div>

          {/* Gender */}
          <div>
            <div style={labelStyle}>{s(lang, 'profile.gender')}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {genderOpts.map(opt => (
                <div key={opt} style={chipStyle(gender === opt)} onClick={() => setGender(gender === opt ? '' : opt)}>{opt}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Language */}
        <div style={{ ...rowStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 14, color: th.text }}>{s(lang, 'profile.language')}</div>
          <button onClick={toggleLang}
            style={{ padding: '7px 16px', borderRadius: 20, border: `1.5px solid ${th.green}`, background: th.greenLight, color: th.green, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            {lang === 'zh' ? 'EN' : '繁中'}
          </button>
        </div>

        {/* Dark mode */}
        <div style={{ ...rowStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 14, color: th.text }}>{s(lang, 'profile.darkMode')}</div>
          <div onClick={toggleDarkMode} style={{
            width: 44, height: 24, borderRadius: 12, position: 'relative', cursor: 'pointer',
            background: darkMode ? th.green : th.border, transition: 'background 0.25s',
          }}>
            <div style={{
              position: 'absolute', top: 2, left: darkMode ? 22 : 2,
              width: 20, height: 20, borderRadius: '50%', background: '#fff',
              transition: 'left 0.25s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
          </div>
        </div>

        {/* Save button */}
        <button onClick={handleSave} disabled={saving}
          style={{ width: '100%', padding: 13, borderRadius: 12, background: th.green, color: '#fff',
            fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', marginBottom: 10, opacity: saving ? 0.7 : 1 }}>
          {saving ? s(lang, 'profile.saving') : saved ? '✓ Saved!' : s(lang, 'profile.save')}
        </button>

        {/* Anitch info */}
        <div style={rowStyle}>
          <div style={{ fontSize: 13, fontWeight: 700, color: th.text, marginBottom: 10 }}>{s(lang, 'profile.anitchInfo')}</div>
          <a href="https://www.anitch.com/zh" target="_blank" rel="noreferrer"
            style={{ display: 'block', fontSize: 13, color: th.green, marginBottom: 6, textDecoration: 'none' }}>
            🌐 {s(lang, 'profile.website')}
          </a>
          <a href="https://www.instagram.com/anitch.hk" target="_blank" rel="noreferrer"
            style={{ display: 'block', fontSize: 13, color: th.green, textDecoration: 'none' }}>
            📷 {s(lang, 'profile.ig')}
          </a>
        </div>

        {/* Logout */}
        <button onClick={handleLogout}
          style={{ width: '100%', padding: 13, borderRadius: 12, background: 'transparent', color: th.danger,
            fontWeight: 700, fontSize: 15, border: `1.5px solid ${th.danger}`, cursor: 'pointer' }}>
          {s(lang, 'profile.logout')}
        </button>
      </div>
    </div>
  );
}
