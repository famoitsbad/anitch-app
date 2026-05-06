import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider, useApp } from './lib/AppContext'
import Auth from './pages/Auth'
import Home from './pages/Home'
import Log from './pages/Log'
import History from './pages/History'
import Insights from './pages/Insights'
import Profile from './pages/Profile'
import BottomNav from './components/BottomNav'

function AppInner() {
  const { user, loading } = useApp()
  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#FAF6F0', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'16px' }}>
      <div style={{ fontFamily:'Georgia,serif', fontSize:'32px', color:'#5A7A55' }}>Anitch</div>
      <div style={{ fontSize:'24px' }}>🌿</div>
    </div>
  )
  if (!user) return <Auth />
  return (
    <BrowserRouter>
      <div style={{ background:'#FAF6F0', minHeight:'100vh', maxWidth:'500px', margin:'0 auto', position:'relative' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/log" element={<Log />} />
          <Route path="/history" element={<History />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  )
}

export default function App() {
  return <AppProvider><AppInner /></AppProvider>
}
