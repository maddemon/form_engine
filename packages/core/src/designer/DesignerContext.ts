import React, { createContext, useContext } from 'react'
import type { SelectedFieldId, DesignerAction } from '../types/designer'
import type { DeviceScene, FormEngineAdapter } from '../types/adapter'
import type { FormConfig } from '../types/schema'

// ============================
// 拆分后的三个 Context
// ============================

/** Dispatch Context（几乎不变） */
export interface DesignerDispatchContextValue {
  dispatch: React.Dispatch<DesignerAction>
}

/** Selection Context（用户交互时变化） */
export interface DesignerSelectionContextValue {
  selectedFieldId: SelectedFieldId
  onSelectField: (id: string | null) => void
}

/** Config Context（配置级，极少变化） */
export interface DesignerConfigContextValue {
  scene: DeviceScene
  formConfig: FormConfig
  /** 画布 adapter（跟随 scene 切换） */
  adapter: FormEngineAdapter
  /** 属性面板 widgets 所用的 desktop adapter（始终优先 desktop） */
  desktopAdapter: FormEngineAdapter
}

const DesignerDispatchContext = createContext<DesignerDispatchContextValue | null>(null)
const DesignerSelectionContext = createContext<DesignerSelectionContextValue | null>(null)
const DesignerConfigContext = createContext<DesignerConfigContextValue | null>(null)

export function useDesignerDispatch(): React.Dispatch<DesignerAction> {
  const ctx = useContext(DesignerDispatchContext)
  if (!ctx) throw new Error('useDesignerDispatch must be used inside DesignerContext.Provider')
  return ctx.dispatch
}

export function useDesignerSelection(): DesignerSelectionContextValue {
  const ctx = useContext(DesignerSelectionContext)
  if (!ctx) throw new Error('useDesignerSelection must be used inside DesignerContext.Provider')
  return ctx
}

export function useDesignerConfig(): DesignerConfigContextValue {
  const ctx = useContext(DesignerConfigContext)
  if (!ctx) throw new Error('useDesignerConfig must be used inside DesignerContext.Provider')
  return ctx
}

// ============================
// 兼容层（保持旧 API 可用，逐步迁移）
// ============================

export interface DesignerContextValue extends DesignerDispatchContextValue, DesignerSelectionContextValue, DesignerConfigContextValue {}

/**
 * @deprecated 请使用 useDesignerDispatch / useDesignerSelection / useDesignerConfig
 */
export function useDesignerContext(): DesignerContextValue {
  const dispatch = useDesignerDispatch()
  const s = useDesignerSelection()
  const c = useDesignerConfig()
  return { dispatch, ...s, ...c }
}

export { DesignerDispatchContext, DesignerSelectionContext, DesignerConfigContext }

/** 兼容旧名称（DesignerContext 单体） */
export const DesignerContext = DesignerDispatchContext
