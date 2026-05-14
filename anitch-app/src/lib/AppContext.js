import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';
import { lightTheme, darkTheme } from './theme';

const AppContext = createContext({});

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [lang, setLang] = useState('zh');
  const [darkMode, setDarkMode] = useState(false);
  const [todayEntry, setTodayEntry] = useState(null);
  const th = darkMode ? darkTheme : lightTheme;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      else { setProfile(null); setTodayEntry(null); }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(uid) {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single();
    if (data) {
      setProfile(data);
      if (data.language) setLang(data.language);
      if (data.dark_mode !== undefined) setDarkMode(data.dark_mode);
    }
  }

  async function toggleDarkMode() {
    const next = !darkMode;
    setDarkMode(next);
    if (user) await supabase.from('profiles').update({ dark_mode: next }).eq('id', user.id);
  }

  async function toggleLang() {
    const next = lang === 'en' ? 'zh' : 'en';
    setLang(next);
    if (user) await supabase.from('profiles').update({ language: next }).eq('id', user.id);
  }

  return (
    <AppContext.Provider value={{ user, profile, setProfile, lang, toggleLang, darkMode, toggleDarkMode, th, todayEntry, setTodayEntry }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() { return useContext(AppContext); }
