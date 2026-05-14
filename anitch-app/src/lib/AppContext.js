import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { translations } from '../i18n/translations'
import { theme, darkTheme } from '../lib/theme'

const AppContext = createContext({})

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [lang, setLang] = useState(localStorage.getItem('anitch_lang') || 'en')
  const [darkMode, setDarkMode] = useState(localStorage.getItem('anitch_dark') === 'true')
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
      if (data.language) { setLang(data.language); localStorage.setItem('anitch_lang', data.language) }
    }
    setLoading(false)
  }

  async function switchLang(l) {
    setLang(l); localStorage.setItem('anitch_lang', l)
    if (user) await supabase.from('profiles').upsert({ id: user.id, language: l })
  }

  function toggleDarkMode() {
    const next = !darkMode
    setDarkMode(next)
    localStorage.setItem('anitch_dark', next.toString())
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
