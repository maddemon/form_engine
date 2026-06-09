/**
 * Property Slot 注册表
 *
 * 管理属性编辑器 Slot 的注册、查询和兜底。
 * 优先级链：运行时注入 > 全局注册 > Widget 兜底 > 核心兜底
 */

import React from 'react'
import { useLocale } from '../locale'
import { FieldDataSource } from '../types'
import type { DesignerWidgets } from '../types/adapter'
import type { PropertySlotProps, PropertySlots, SlotName } from '../types/property-slot'

/**
 * Slot 注册表（全局单例）
 */
export class PropertySlotRegistry {
  private slots = new Map<SlotName, React.ComponentType<PropertySlotProps>>()

  register(name: SlotName, component: React.ComponentType<PropertySlotProps>): void {
    this.slots.set(name, component)
  }

  get(name: SlotName): React.ComponentType<PropertySlotProps> | undefined {
    return this.slots.get(name)
  }

  has(name: SlotName): boolean {
    return this.slots.has(name)
  }

  unregister(name: SlotName): void {
    this.slots.delete(name)
  }

  clear(): void {
    this.slots.clear()
  }
}

export const propertySlotRegistry = new PropertySlotRegistry()

// ── Widget 适配器：将 DesignerWidgets 中的组件适配为 PropertySlotProps ──

/** 缓存适配后的组件，避免每次渲染创建新组件类型导致 React 卸载/重挂载 */
const expressionInputCache = new WeakMap<React.ComponentType<any>, React.ComponentType<PropertySlotProps>>()
const dataSourceEditorCache = new WeakMap<React.ComponentType<any>, React.ComponentType<PropertySlotProps>>()

/** 将 w.ExpressionInput 适配为 PropertySlotProps */
function adaptExpressionInput(w: DesignerWidgets): React.ComponentType<PropertySlotProps> | null {
  if (!w.ExpressionInput) return null
  const cached = expressionInputCache.get(w.ExpressionInput)
  if (cached) return cached
  const ExpressionInput = w.ExpressionInput
  const Adapted: React.FC<PropertySlotProps> = ({ value, onChange, placeholder, fieldNames }) => (
    <ExpressionInput
      value={typeof value === 'string' ? value : ''}
      onChange={onChange}
      placeholder={placeholder}
      fieldNames={fieldNames}
    />
  )
  Adapted.displayName = 'AdaptedExpressionInput'
  expressionInputCache.set(w.ExpressionInput, Adapted)
  return Adapted
}

/** 将 w.DataSourceEditor 适配为 PropertySlotProps */
function adaptDataSourceEditor(w: DesignerWidgets): React.ComponentType<PropertySlotProps> | null {
  if (!w.DataSourceEditor) return null
  const cached = dataSourceEditorCache.get(w.DataSourceEditor)
  if (cached) return cached
  const DataSourceEditor = w.DataSourceEditor
  const Adapted: React.FC<PropertySlotProps> = ({ value, onChange, context }) => (
    <DataSourceEditor
      value={value as FieldDataSource | undefined}
      onChange={(v) => onChange(v)}
      optionsType={(context?.optionsType as 'flat' | 'tree') ?? 'flat'}
    />
  )
  Adapted.displayName = 'AdaptedDataSourceEditor'
  dataSourceEditorCache.set(w.DataSourceEditor, Adapted)
  return Adapted
}

/**
 * 从 DesignerWidgets 中获取 Widget 层 fallback
 */
function getWidgetFallback(name: SlotName, widgets?: DesignerWidgets): React.ComponentType<PropertySlotProps> | null {
  if (!widgets) return null
  switch (name) {
    case 'expressionEditor':
      return adaptExpressionInput(widgets)
    case 'dataSourceEditor':
      return adaptDataSourceEditor(widgets)
    default:
      return null
  }
}

// ── 核心 fallback 组件（最简实现，不依赖任何 UI 库） ──

/** fallback textarea 公共样式：复用主题变量，响应暗色主题 */
const FALLBACK_TEXTAREA_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '1px 6px',
  borderRadius: 'var(--fe-border-radius-sm)',
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: 'var(--fe-border-primary)',
  fontSize: 'var(--fe-font-size-sm)',
  lineHeight: '18px',
  outline: 'none',
  boxSizing: 'border-box',
  background: 'var(--fe-bg-primary)',
  color: 'var(--fe-text-primary)',
  fontFamily: 'monospace',
  resize: 'vertical',
}

const FallbackExpressionEditor: React.FC<PropertySlotProps> = ({ value, onChange }) => {
  const { locale } = useLocale()
  return (
    <textarea
      value={typeof value === 'string' ? value : ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={locale.designer.propertyPanel.expressionPlaceholder}
      rows={2}
      style={FALLBACK_TEXTAREA_STYLE}
    />
  )
}

const FallbackJsonEditor: React.FC<PropertySlotProps> = ({ value, onChange }) => {
  const { locale } = useLocale()
  return (
    <textarea
      value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
      onChange={(e) => {
        try {
          onChange(JSON.parse(e.target.value))
        } catch {
          onChange(e.target.value)
        }
      }}
      placeholder={locale.designer.propertyPanel.jsonPlaceholder}
      rows={4}
      style={FALLBACK_TEXTAREA_STYLE}
    />
  )
}

const FallbackCodeEditor: React.FC<PropertySlotProps> = ({ value, onChange }) => {
  const { locale } = useLocale()
  return (
    <textarea
      value={typeof value === 'string' ? value : ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={locale.designer.propertyPanel.codePlaceholder}
      rows={2}
      style={FALLBACK_TEXTAREA_STYLE}
    />
  )
}

const FallbackDataSourceEditor: React.FC<PropertySlotProps> = ({ value, onChange }) => (
  <textarea
    value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
    onChange={(e) => {
      try {
        onChange(JSON.parse(e.target.value))
      } catch {
        onChange(e.target.value)
      }
    }}
    placeholder="数据源配置（JSON）"
    rows={4}
    style={FALLBACK_TEXTAREA_STYLE}
  />
)

/**
 * 核心 fallback 映射
 */
export const defaultSlotFallbacks: Record<SlotName, React.ComponentType<PropertySlotProps>> = {
  expressionEditor: FallbackExpressionEditor,
  dataSourceEditor: FallbackDataSourceEditor,
  jsonEditor: FallbackJsonEditor,
  codeEditor: FallbackCodeEditor,
}

/**
 * 解析 Slot 组件
 *
 * 按优先级链查找：
 * 1. 运行时注入（propsRenderProps.slots.xxx）
 * 2. 全局注册（propertySlotRegistry.get('xxx')）
 * 3. Widget 兜底（w.ExpressionInput / w.DataSourceEditor 等）
 * 4. 核心兜底（defaultSlotFallbacks.xxx）
 */
export function resolveSlot(
  name: SlotName,
  slots?: PropertySlots,
  widgets?: DesignerWidgets,
): React.ComponentType<PropertySlotProps> {
  return (
    slots?.[name] ?? propertySlotRegistry.get(name) ?? getWidgetFallback(name, widgets) ?? defaultSlotFallbacks[name]
  )
}
