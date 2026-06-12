import React, { createContext, useContext } from 'react'
import type { SelectedFieldId, DesignerAction } from '../types/designer'
import type { DeviceScene } from '../types/adapter-field'
import type { FormEngineAdapter } from '../types/adapter'
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
  /**
   * mobile adapter（用户在 Designer 上传的）。可选：
   * - 上传时一并注入到 context，让 PropertyPanel 内的 JSX 编辑器能展示移动端可用 scope
   * - 未上传时为 undefined，PropertyPanel 不会展示移动端 scope
   */
  mobileAdapter?: FormEngineAdapter
}

// ── Scene Context ──────────────────────────────────────────────────

export interface DesignerSceneContextValue {
  scene: DeviceScene
}

// ── FormConfig Context ─────────────────────────────────────────────

export interface DesignerFormConfigContextValue {
  formConfig: FormConfig
}

// ── Adapter Context ────────────────────────────────────────────────

export interface DesignerAdapterContextValue {
  /** 画布 adapter（跟随 scene 切换） */
  adapter: FormEngineAdapter
  /** 属性面板 widgets 所用的 desktop adapter（始终优先 desktop） */
  desktopAdapter: FormEngineAdapter
  /**
   * mobile adapter（用户在 Designer 上传的）。可选：
   * - 上传时一并注入到 context，让 PropertyPanel 内的 JSX 编辑器能展示移动端可用 scope
   * - 未上传时为 undefined，PropertyPanel 不会展示移动端 scope
   */
  mobileAdapter?: FormEngineAdapter
}

const DesignerDispatchContext = createContext<DesignerDispatchContextValue | null>(null)
const DesignerSelectionContext = createContext<DesignerSelectionContextValue | null>(null)

/**
 * @deprecated 请使用更细粒度的 DesignerSceneContext / DesignerFormConfigContext / DesignerAdapterContext。
 * 此 Context 保留导出以兼容外部直接 `useContext(DesignerConfigContext)` 的 consumer。
 */
const DesignerConfigContext = createContext<DesignerConfigContextValue | null>(null)

// ── 新增的三个细粒度 Context ──────────────────────────────────────

const DesignerSceneContext = createContext<DesignerSceneContextValue | null>(null)
const DesignerFormConfigContext = createContext<DesignerFormConfigContextValue | null>(null)
const DesignerAdapterContext = createContext<DesignerAdapterContextValue | null>(null)

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

/**
 * @deprecated 请改用 useDesignerScene() / useDesignerFormConfig() / useDesignerAdapters()。
 */
export function useDesignerConfig(): DesignerConfigContextValue {
  const scene = useDesignerScene()
  const formConfig = useDesignerFormConfig()
  const adapters = useDesignerAdapters()
  return { scene, formConfig, ...adapters }
}

/** 仅返回 scene 值，订阅最小粒度 */
export function useDesignerScene(): DeviceScene {
  const ctx = useContext(DesignerSceneContext)
  if (!ctx) throw new Error('useDesignerScene must be used inside DesignerContext.Provider')
  return ctx.scene
}

/** 仅返回 formConfig 值，订阅最小粒度 */
export function useDesignerFormConfig(): FormConfig {
  const ctx = useContext(DesignerFormConfigContext)
  if (!ctx) throw new Error('useDesignerFormConfig must be used inside DesignerContext.Provider')
  return ctx.formConfig
}

/** 返回 adapter / desktopAdapter / mobileAdapter */
export function useDesignerAdapters(): DesignerAdapterContextValue {
  const ctx = useContext(DesignerAdapterContext)
  if (!ctx) throw new Error('useDesignerAdapters must be used inside DesignerContext.Provider')
  return ctx
}

export {
  DesignerDispatchContext,
  DesignerSelectionContext,
  /** @deprecated 请使用 DesignerSceneContext / DesignerFormConfigContext / DesignerAdapterContext */
  DesignerConfigContext,
  DesignerSceneContext,
  DesignerFormConfigContext,
  DesignerAdapterContext,
}
