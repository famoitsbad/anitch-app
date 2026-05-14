import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { translations } from '../i18n/translations'
import { theme, darkTheme } from '../lib/theme'

const AppContext = createContext({})

// Safe localStorage that won't crash in iOS private mode
function safeGet(key, fallback = null) {
  try { return localStorage.getItem(key) ?? fallback } catch { return fallback }
}
function safeSet(key, value) {
  try { localStorage.setItem(key, value) } catch { /* iOS private mode — ignore */ }
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [lang, setLang] = useState(safeGet('anitch_lang', 'zh'))
  const [darkMode, setDarkMode] = useState(safeGet('anitch_dark') === 'true')
  const [loading, setLoading] = useState(true)
  const [todayEntry, setTodayEntry] = useState(null)

  const t = translations[lang]
  const th = darkMode ? darkTheme : theme

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user.id)
      else setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user.id)
      else { setProfile(null); setLoading(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile(userId) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (data) {
      setProfile(data)
      if (data.language) { setLang(data.language); safeSet('anitch_lang', data.language) }
    }
    setLoading(false)
  }

  async function switchLang(l) {
    setLang(l); safeSet('anitch_lang', l)
    if (user) await supabase.from('profiles').upsert({ id: user.id, language: l })
  }

  function toggleDarkMode() {
    const next = !darkMode
    setDarkMode(next)
    safeSet('anitch_dark', next.toString())
  }

  return (
    <AppContext.Provider value={{ user, profile, lang, t, th, loading, darkMode, switchLang, loadProfile, toggleDarkMode, todayEntry, setTodayEntry }}>
      <div style={{ background: th.lightGrey, minHeight: '100vh' }}>
        {children}
      </div>
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
