import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../lib/AppContext';
import { t } from '../i18n/translations';

export default function BottomNav() {
  const { th, lang, todayEntry } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  function goLog() {
    if (todayEntry) {
      navigate('/log', { state: { existingEntry: todayEntry } });
    } else {
      navigate('/log');
    }
  }

  const tabs = [
    { path: '/', icon: '🏠', label: t(lang, 'nav.home') },
    { path: '/insights', icon: '📊', label: t(lang, 'nav.insights') },
    null, // FAB placeholder
    { path: '/history', icon: '📋', label: t(lang, 'nav.history') },
    { path: '/profile', icon: '👤', label: t(lang, 'nav.profile') },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      background: th.navBg, borderTop: `1px solid ${th.border}`,
      display: 'flex', alignItems: 'flex-end',
      paddingBottom: 'env(safe-area-inset-bottom)',
      boxShadow: `0 -2px 12px ${th.shadow}`,
    }}>
      {tabs.map((tab, i) => {
        if (!tab) {
          // FAB
          return (
            <div key="fab" style={{ flex: 1, display: 'flex', justifyContent: 'center', paddingBottom: 6 }}>
              <button onClick={goLog} style={{
                width: 52, height: 52, borderRadius: 16,
                background: '#004B39', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, cursor: 'pointer', flexShrink: 0,
                boxShadow: '0 6px 20px rgba(0,75,57,0.45)',
                transform: 'translateY(-10px)',
                position: 'relative',
              }}>
                {todayEntry ? '✏️' : '➕'}
              </button>
            </div>
          );
        }
        return (
          <button key={tab.path} onClick={() => navigate(tab.path)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', padding: '8px 0 10px',
              background: 'none', border: 'none', cursor: 'pointer',
              color: isActive(tab.path) ? '#004B39' : th.textMuted,
            }}>
            <span style={{ fontSize: 20 }}>{tab.icon}</span>
            <span style={{ fontSize: 10, marginTop: 2, fontWeight: isActive(tab.path) ? 700 : 400 }}>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
