import { createContext, useContext } from 'react'
import type { LocalePack } from './types'
import { zhCN } from './zh-CN'

export interface LocaleContextValue {
  locale: LocalePack
  t: (key: string) => string | undefined
}

const defaultT: (key: string) => string | undefined = () => undefined

export const LocaleContext = createContext<LocaleContextValue>({
  locale: zhCN,
  t: defaultT,
})

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext)
}
