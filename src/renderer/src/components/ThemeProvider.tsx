import React, { createContext, useContext, useEffect, useState } from 'react'

export type Appearance = 'light' | 'dark'
export type BaseColor = 'zinc' | 'slate' | 'stone' | 'gray' | 'neutral'
export type PrimaryColor = 'blue' | 'rose' | 'green' | 'orange' | 'violet'
export type Font = 'sans' | 'mono' | 'serif'
export type Radius = '0' | '0.3' | '0.5' | '0.75' | '1.0'

export interface ThemeConfig {
  appearance: Appearance
  baseColor: BaseColor
  primaryColor: PrimaryColor
  font: Font
  radius: Radius
}

interface ThemeProviderProps {
  children: React.ReactNode
  defaultConfig?: ThemeConfig
  storageKey?: string
}

interface ThemeProviderState {
  config: ThemeConfig
  setConfig: (config: ThemeConfig) => void
}

const defaultConfig: ThemeConfig = {
  appearance: 'dark',
  baseColor: 'slate',
  primaryColor: 'blue',
  font: 'sans',
  radius: '0.5'
}

const ThemeProviderContext = createContext<ThemeProviderState>({
  config: defaultConfig,
  setConfig: () => null
})

export function ThemeProvider({
  children,
  storageKey = 'vite-ui-theme',
  ...props
}: ThemeProviderProps) {
  const [config, setConfig] = useState<ThemeConfig>(() => {
    const saved = localStorage.getItem(storageKey)
    if (!saved) return defaultConfig
    
    try {
      // Handle potential legacy string values that aren't valid JSON objects
      const parsed = JSON.parse(saved)
      if (typeof parsed === 'object' && parsed !== null) {
        return { ...defaultConfig, ...parsed }
      }
      return defaultConfig
    } catch (e) {
      console.warn('Failed to parse theme config, resetting to default', e)
      return defaultConfig
    }
  })

  useEffect(() => {
    const root = window.document.documentElement

    // 1. Handle Appearance & Base Color
    root.classList.remove('light', 'dark', 'zinc', 'slate', 'stone', 'gray', 'neutral')
    root.classList.add(config.appearance)
    root.classList.add(config.baseColor)

    // 2. Handle Primary Color
    root.classList.remove('primary-blue', 'primary-rose', 'primary-green', 'primary-orange', 'primary-violet')
    root.classList.add(`primary-${config.primaryColor}`)

    // 3. Handle Font
    root.classList.remove('font-sans', 'font-mono', 'font-serif')
    root.classList.add(`font-${config.font}`)

    // 4. Handle Radius
    root.style.setProperty('--radius', `${config.radius}rem`)
  }, [config])

  const value = {
    config,
    setConfig: (newConfig: ThemeConfig) => {
      localStorage.setItem(storageKey, JSON.stringify(newConfig))
      setConfig(newConfig)
    }
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
}