import type { SupportedLocale, ThemeMode } from '@form-engine/core'
import { createContext, useContext } from 'react'

interface AppContextValue {
  locale: SupportedLocale
  themeMode: ThemeMode
  isDark: boolean
}

const AppContext = createContext<AppContextValue>({
  locale: 'zh-CN',
  themeMode: 'system',
  isDark: false,
})

export const AppProvider = AppContext.Provider
export const useAppContext = () => useContext(AppContext)
