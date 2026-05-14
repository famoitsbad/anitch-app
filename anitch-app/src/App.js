import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider, useApp } from './lib/AppContext'
import Auth from './pages/Auth'
import Home from './pages/Home'
import Log from './pages/Log'
import History from './pages/History'
import Insights from './pages/Insights'
import Profile from './pages/Profile'
import BottomNav from './components/BottomNav'
import { LOGO_BASE64 } from './lib/logo'
import { PageErrorBoundary, AppErrorBoundary } from './components/ErrorBoundary'

function SplashScreen() {
  const [dot, setDot] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setDot(d => (d + 1) % 3), 500)
    return () => clearInterval(id)
  }, [])
  return (
    <div style={{ minHeight:'100vh', background:'#004B39', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', fontFamily:"'Lato',sans-serif" }}>
      <img src={LOGO_BASE64} alt="anitch" style={{ height:'36px', width:'auto', marginBottom:'32px' }} />
      <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.6)', letterSpacing:'0.12em', textTransform:'uppercase', fontWeight:'500', marginBottom:'48px' }}>Eczema Diary</div>
      <div style={{ display:'flex', gap:'8px' }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ width:'7px', height:'7px', borderRadius:'50%', background: i===dot?'white':'rgba(255,255,255,0.25)', transition:'background 0.3s' }} />
        ))}
      </div>
      <div style={{ position:'absolute', bottom:'40px', fontSize:'11px', color:'rgba(255,255,255,0.3)', letterSpacing:'0.08em', textTransform:'uppercase' }}>Freedom from Eczema</div>
    </div>
  )
}

function AppInner() {
  const { user, loading, lang } = useApp()
  if (loading) return <SplashScreen />
  if (!user) return (
    <PageErrorBoundary pageName="Login" lang={lang}>
      <Auth />
    </PageErrorBoundary>
  )
  return (
    <BrowserRouter>
      <div style={{ background:'#F9F9FB', minHeight:'100vh', maxWidth:'500px', margin:'0 auto', position:'relative' }}>
        <Routes>
          <Route path="/" element={
            <PageErrorBoundary pageName="Home" lang={lang}>
              <Home />
            </PageErrorBoundary>
          } />
          <Route path="/log" element={
            <PageErrorBoundary pageName="Log" lang={lang}>
              <Log />
            </PageErrorBoundary>
          } />
          <Route path="/history" element={
            <PageErrorBoundary pageName="History" lang={lang}>
              <History />
            </PageErrorBoundary>
          } />
          <Route path="/insights" element={
            <PageErrorBoundary pageName="Insights" lang={lang}>
              <Insights />
            </PageErrorBoundary>
          } />
          <Route path="/profile" element={
            <PageErrorBoundary pageName="Profile" lang={lang}>
              <Profile />
            </PageErrorBoundary>
          } />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <AppErrorBoundary>
      <AppProvider>
        <AppInner />
      </AppProvider>
    </AppErrorBoundary>
  )
}
