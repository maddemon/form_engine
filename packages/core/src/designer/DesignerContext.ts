import React, { createContext, useContext } from 'react'
import type { SelectedFieldId, DesignerAction } from '../types/designer'
import type { DeviceScene, FormEngineAdapter } from '../types/adapter'
import type { FormConfig } from '../types/schema'

export interface DesignerContextValue {
  dispatch: React.Dispatch<DesignerAction>
  selectedFieldId: SelectedFieldId
  onSelectField: (id: string | null) => void
  scene: DeviceScene
  formConfig: FormConfig
  /** 画布 adapter（跟随 scene 切换） */
  adapter: FormEngineAdapter
  /** 属性面板 widgets 所用的 desktop adapter（始终优先 desktop） */
  desktopAdapter: FormEngineAdapter
}

const DesignerContext = createContext<DesignerContextValue | null>(null)

export function useDesignerContext(): DesignerContextValue {
  const ctx = useContext(DesignerContext)
  if (!ctx) throw new Error('useDesignerContext must be used inside DesignerContext.Provider')
  return ctx
}

export { DesignerContext }
