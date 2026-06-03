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
  adapter: FormEngineAdapter
}

const DesignerContext = createContext<DesignerContextValue | null>(null)

export function useDesignerContext(): DesignerContextValue {
  const ctx = useContext(DesignerContext)
  if (!ctx) throw new Error('useDesignerContext must be used inside DesignerContext.Provider')
  return ctx
}

export { DesignerContext }
