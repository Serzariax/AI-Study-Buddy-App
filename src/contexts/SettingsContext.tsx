import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'es' | 'fr';
export type FontFamily = 'default' | 'dyslexic' | 'serif' | 'mono';

interface SettingsContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  fontFamily: FontFamily;
  setFontFamily: (family: FontFamily) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) return JSON.parse(saved);
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [fontSize, setFontSizeState] = useState(() => {
    const saved = localStorage.getItem('fontSize');
    return saved ? parseInt(saved) : 16;
  });

  const [fontFamily, setFontFamilyState] = useState<FontFamily>(() => {
    const saved = localStorage.getItem('fontFamily');
    return (saved as FontFamily) || 'default';
  });

  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    document.documentElement.style.setProperty('--font-size', `${fontSize}px`);
    localStorage.setItem('fontSize', fontSize.toString());
  }, [fontSize]);

  useEffect(() => {
    const fontFamilyMap = {
      default: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      dyslexic: '"OpenDyslexic", sans-serif',
      serif: 'Georgia, serif',
      mono: '"Courier New", monospace',
    };
    document.documentElement.style.setProperty('font-family', fontFamilyMap[fontFamily]);
    localStorage.setItem('fontFamily', fontFamily);
  }, [fontFamily]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const setFontSize = (size: number) => setFontSizeState(Math.max(12, Math.min(24, size)));
  const setFontFamily = (family: FontFamily) => setFontFamilyState(family);
  const setLanguage = (lang: Language) => setLanguageState(lang);

  return (
    <SettingsContext.Provider
      value={{
        darkMode,
        toggleDarkMode,
        fontSize,
        setFontSize,
        fontFamily,
        setFontFamily,
        language,
        setLanguage,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
