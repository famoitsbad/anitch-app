import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './lib/AppContext';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Log from './pages/Log';
import History from './pages/History';
import Insights from './pages/Insights';
import Profile from './pages/Profile';
import BottomNav from './components/BottomNav';

function Splash() {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#004B39',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', zIndex: 999,
    }}>
      <div style={{ fontSize: 38, fontWeight: 900, color: '#fff', letterSpacing: -1 }}>anitch™</div>
      <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', marginTop: 6 }}>eczema diary</div>
      <div style={{ display: 'flex', gap: 8, marginTop: 28 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 7, height: 7, borderRadius: '50%', background: 'rgba(255,255,255,0.5)',
            animation: `pulse 1.2s ${i * 0.2}s ease-in-out infinite`,
          }} />
        ))}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }`}</style>
    </div>
  );
}

function AppInner() {
  const { user } = useApp();
  const [splash, setSplash] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setSplash(false), 1800);
    return () => clearTimeout(t);
  }, []);

  if (splash) return <Splash />;
  if (!user) return <Auth />;

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/log" element={<Log />} />
        <Route path="/history" element={<History />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <BottomNav />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </AppProvider>
  );
}
