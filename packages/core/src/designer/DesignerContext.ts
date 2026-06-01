import React, { createContext, useContext } from 'react'
import type { SelectedFieldId, DesignerAction } from '../types/designer'
import type { DeviceScene } from '../registry/componentRegistry'

export interface DesignerContextValue {
  dispatch: React.Dispatch<DesignerAction>
  selectedFieldId: SelectedFieldId
  onSelectField: (id: string | null) => void
  scene: DeviceScene
}

const DesignerContext = createContext<DesignerContextValue | null>(null)

export function useDesignerContext(): DesignerContextValue {
  const ctx = useContext(DesignerContext)
  if (!ctx) throw new Error('useDesignerContext must be used inside DesignerContext.Provider')
  return ctx
}

export { DesignerContext }
