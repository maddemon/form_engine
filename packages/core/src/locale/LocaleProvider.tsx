import React, { useMemo } from 'react'
import type { LocalePack } from './types'
import { LocaleContext, type LocaleContextValue } from './LocaleContext'
import { zhCN } from './zh-CN'
import { enUS } from './en-US'
import { deepMerge, flattenLocale, validateLocale } from './utils'

export type SupportedLocale = 'zh-CN' | 'en-US'

const localeMap: Record<string, LocalePack> = {
  'zh-CN': zhCN,
  'en-US': enUS,
}

export interface LocaleProviderProps {
  locale?: SupportedLocale | Partial<LocalePack>
  children: React.ReactNode
}

declare const process: { env: { NODE_ENV?: string } } | undefined

export function LocaleProvider({ locale, children }: LocaleProviderProps) {
  const ctx = useMemo<LocaleContextValue>(() => {
    const merged: LocalePack = !locale
      ? zhCN
      : typeof locale === 'string'
        ? localeMap[locale] ?? zhCN
        : deepMerge(zhCN, locale)

    const flat = flattenLocale(merged)

    if (typeof process !== 'undefined' && process?.env?.NODE_ENV === 'development') {
      const refFlat = flattenLocale(zhCN)
      validateLocale(refFlat, flat)
    }

    return {
      locale: merged,
      t: (key: string) => flat[key],
    }
  }, [locale])

  return (
    <LocaleContext.Provider value={ctx}>
      {children}
    </LocaleContext.Provider>
  )
}
