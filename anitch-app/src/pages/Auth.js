import React, { useState } from 'react';
import { useApp } from '../lib/AppContext';
import { supabase } from '../lib/supabase';
import { t } from '../i18n/translations';

const PRODUCTS = ['brb', 'brfc', 'brbc'];

export default function Auth() {
  const { th, lang } = useApp();
  const [mode, setMode] = useState('login'); // login | signup
  const [step, setStep] = useState(1); // 1=account 2=eczema 3=done
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [usesAnitch, setUsesAnitch] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const s = (p, ...a) => t(lang, p, ...a);

  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: 10,
    border: `1px solid ${th.inputBorder}`, background: th.inputBg,
    color: th.text, fontSize: 15, outline: 'none',
    boxSizing: 'border-box', marginBottom: 10,
  };

  const btnStyle = {
    width: '100%', padding: '13px', borderRadius: 12,
    background: th.green, color: '#fff', fontWeight: 700,
    fontSize: 15, border: 'none', cursor: 'pointer',
    opacity: loading ? 0.7 : 1,
  };

  const chipStyle = (sel, color) => ({
    padding: '8px 14px', borderRadius: 20, fontSize: 13,
    border: `1.5px solid ${sel ? color : th.border}`,
    background: sel ? color : th.card,
    color: sel ? '#fff' : th.text,
    cursor: 'pointer', fontWeight: sel ? 700 : 400,
    transition: 'all 0.15s',
  });

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true); setError('');
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) { setError(err.message); setLoading(false); }
  }

  async function handleStep1(e) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true); setError('');
    const { data, error: err } = await supabase.auth.signUp({ email, password });
    if (err) { setError(err.message); setLoading(false); return; }
    if (data?.user) {
      await supabase.from('profiles').upsert({ id: data.user.id, name: name.trim(), language: lang });
    }
    setLoading(false);
    setStep(2);
  }

  async function handleStep2() {
    if (!duration || !usesAnitch) { setError(lang === 'zh' ? '請回答所有問題' : 'Please answer all questions.'); return; }
    setLoading(true); setError('');
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({
        eczema_duration: duration,
        uses_anitch: usesAnitch === 'yes',
        anitch_products: usesAnitch === 'yes' ? products : [],
      }).eq('id', user.id);
    }
    setLoading(false);
    setStep(3);
  }

  function toggleProduct(p) {
    setProducts(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  }

  // Progress dots
  function Progress() {
    return (
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {[1,2,3].map(i => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 2,
            background: i < step ? th.green : i === step ? th.orange : th.border,
            transition: 'background 0.3s',
          }} />
        ))}
      </div>
    );
  }

  const wrap = {
    minHeight: '100vh', background: th.bg, display: 'flex',
    flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '24px 20px', boxSizing: 'border-box',
  };

  const card = {
    width: '100%', maxWidth: 400, background: th.card,
    borderRadius: 20, padding: '28px 24px',
    boxShadow: `0 4px 24px ${th.shadow}`,
  };

  // LOGIN
  if (mode === 'login') return (
    <div style={wrap}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 32, fontWeight: 900, color: th.green, letterSpacing: -1 }}>anitch™</div>
        <div style={{ fontSize: 13, color: th.textSub, marginTop: 4 }}>{s('app.tagline')}</div>
      </div>
      <div style={card}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: th.text, margin: '0 0 20px' }}>{s('auth.login')}</h2>
        {error && <div style={{ color: th.danger, fontSize: 13, marginBottom: 12 }}>{error}</div>}
        <form onSubmit={handleLogin}>
          <input style={inputStyle} type="email" placeholder={s('auth.email')} value={email} onChange={e => setEmail(e.target.value)} required />
          <input style={inputStyle} type="password" placeholder={s('auth.password')} value={password} onChange={e => setPassword(e.target.value)} required />
          <button style={btnStyle} disabled={loading}>{loading ? s('auth.loggingIn') : s('auth.login')}</button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: th.textSub, cursor: 'pointer' }}
          onClick={() => { setMode('signup'); setStep(1); setError(''); }}>
          {s('auth.noAccount')}
        </div>
      </div>
    </div>
  );

  // SIGNUP STEP 1 — account
  if (mode === 'signup' && step === 1) return (
    <div style={wrap}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 32, fontWeight: 900, color: th.green, letterSpacing: -1 }}>anitch™</div>
        <div style={{ fontSize: 13, color: th.textSub, marginTop: 4 }}>{s('app.tagline')}</div>
      </div>
      <div style={card}>
        <Progress />
        <h2 style={{ fontSize: 19, fontWeight: 700, color: th.text, margin: '0 0 4px' }}>{s('auth.step1')}</h2>
        <p style={{ fontSize: 13, color: th.textSub, margin: '0 0 20px' }}>{s('auth.step1sub')}</p>
        {error && <div style={{ color: th.danger, fontSize: 13, marginBottom: 12 }}>{error}</div>}
        <form onSubmit={handleStep1}>
          <input style={inputStyle} placeholder={s('auth.name')} value={name} onChange={e => setName(e.target.value)} required />
          <input style={inputStyle} type="email" placeholder={s('auth.email')} value={email} onChange={e => setEmail(e.target.value)} required />
          <input style={inputStyle} type="password" placeholder={s('auth.password')} value={password} onChange={e => setPassword(e.target.value)} required />
          <button style={btnStyle} disabled={loading}>{loading ? s('auth.signingUp') : s('auth.continue')}</button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: th.textSub, cursor: 'pointer' }}
          onClick={() => { setMode('login'); setError(''); }}>
          {s('auth.hasAccount')}
        </div>
      </div>
    </div>
  );

  // SIGNUP STEP 2 — eczema questions (REQUIRED)
  if (mode === 'signup' && step === 2) {
    const durOpts = [
      { key: 'lt1', label: s('auth.dur1') },
      { key: '1to3', label: s('auth.dur2') },
      { key: '3to5', label: s('auth.dur3') },
      { key: '5plus', label: s('auth.dur4') },
    ];
    return (
      <div style={wrap}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 32, fontWeight: 900, color: th.green, letterSpacing: -1 }}>anitch™</div>
        </div>
        <div style={card}>
          <Progress />
          <h2 style={{ fontSize: 19, fontWeight: 700, color: th.text, margin: '0 0 4px' }}>{s('auth.step2')}</h2>
          <p style={{ fontSize: 13, color: th.textSub, margin: '0 0 20px' }}>{s('auth.step2sub')}</p>
          {error && <div style={{ color: th.danger, fontSize: 13, marginBottom: 12 }}>{error}</div>}

          {/* Eczema duration */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: th.orange, flexShrink: 0 }} />
              <div style={{ fontSize: 14, fontWeight: 700, color: th.text }}>{s('auth.eczDuration')}</div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {durOpts.map(o => (
                <div key={o.key} style={chipStyle(duration === o.key, th.green)}
                  onClick={() => setDuration(o.key)}>{o.label}</div>
              ))}
            </div>
          </div>

          {/* Uses Anitch */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: th.orange, flexShrink: 0 }} />
              <div style={{ fontSize: 14, fontWeight: 700, color: th.text }}>{s('auth.usesAnitch')}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['yes','no','notYet'].map(k => (
                <div key={k} style={chipStyle(usesAnitch === k, th.green)}
                  onClick={() => { setUsesAnitch(k); if (k !== 'yes') setProducts([]); }}>
                  {s(`auth.${k}`)}
                </div>
              ))}
            </div>
          </div>

          {/* Which products — only if usesAnitch === yes */}
          {usesAnitch === 'yes' && (
            <div style={{ marginBottom: 20, background: th.greenLight, borderRadius: 12, padding: '14px 14px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: th.green, marginBottom: 10 }}>{s('auth.whichProducts')}</div>
              {PRODUCTS.map(p => (
                <div key={p} onClick={() => toggleProduct(p)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
                    borderBottom: `1px solid ${th.border}`, cursor: 'pointer' }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: 6,
                    border: `2px solid ${products.includes(p) ? th.green : th.border}`,
                    background: products.includes(p) ? th.green : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {products.includes(p) && <span style={{ color: '#fff', fontSize: 12 }}>✓</span>}
                  </div>
                  <span style={{ fontSize: 13, color: th.text }}>{s(`auth.${p}`)}</span>
                </div>
              ))}
            </div>
          )}

          <button style={btnStyle} onClick={handleStep2} disabled={loading}>
            {loading ? s('auth.signingUp') : s('auth.continue')}
          </button>
        </div>
      </div>
    );
  }

  // SIGNUP STEP 3 — done
  if (mode === 'signup' && step === 3) return (
    <div style={wrap}>
      <div style={card}>
        <Progress />
        <div style={{ textAlign: 'center', padding: '20px 0 16px' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🌿</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: th.green, margin: '0 0 8px' }}>{s('auth.allSet')}</h2>
          <p style={{ fontSize: 14, color: th.textSub, margin: 0 }}>{s('auth.allSetSub')}</p>
        </div>
        <div style={{ background: th.cream, borderRadius: 12, padding: '12px 14px', marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: th.textSub }}>{s('auth.profileNote')}</div>
        </div>
        <button style={btnStyle} onClick={async () => {
          // trigger auth state change to navigate to home
          const { data: { user } } = await supabase.auth.getUser();
          if (user) window.location.reload();
        }}>{s('auth.finish')}</button>
      </div>
    </div>
  );

  return null;
}
