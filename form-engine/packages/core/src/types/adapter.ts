/**
 * Form Engine Adapter 接口定义
 * 
 * Adapter 负责将 Form Engine 的组件类型映射到具体的 UI 库组件
 * 并定义属性面板如何渲染组件配置
 */

import * as React from 'react'
import type { ComponentPropsMap } from './component-props'

// ============================
// 字段渲染相关类型
// ============================

/** 字段组件的 Props */
export interface FieldComponentProps {
  /** 字段值 */
  value?: any
  /** 值变化回调 */
  onChange?: (value: any) => void
  /** 字段 Schema */
  fieldSchema?: any
  /** 字段名称 */
  name?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readOnly?: boolean
  /** 占位符 */
  placeholder?: string
  /** 其他属性 */
  [key: string]: any
}

/** 字段渲染函数类型 */
export type FieldRendererFn = (props: FieldComponentProps) => React.ReactElement

// ============================
// 属性面板编辑器类型
// ============================

/** 属性编辑器配置 */
export interface PropEditorConfig {
  /** 编辑器类型 */
  type: 'string' | 'number' | 'boolean' | 'select' | 'color' | 'options' | 'expression' | 'json'
  /** 标签 */
  label: string
  /** 默认值 */
  default?: unknown
  /** 选项（type=select 时使用） */
  options?: { label: string; value: unknown }[]
  /** 是否必填 */
  required?: boolean
  /** 描述信息 */
  description?: string
  /** 条件显示（根据其他属性值） */
  visibleWhen?: Record<string, unknown>
}

// ============================
// Adapter 接口
// ============================

/** 
 * Form Engine Adapter 接口
 * 每个 UI 库（antd、antd-mobile 等）实现一个 adapter
 */
export interface FormEngineAdapter {
  /** Adapter 名称 */
  name: string
  
  /** Adapter 版本 */
  version: string
  
  /** 字段组件映射（type -> React 组件） */
  components: Partial<{
    [K in keyof ComponentPropsMap]: React.ComponentType<ComponentPropsMap[K]>
  }>
  
  /** 属性面板组件（用于设计器） */
  propertyPanel?: {
    /** 渲染属性面板 */
    render: (props: PropertyPanelRenderProps) => React.ReactNode
  }
  
  /** 主题配置（可选） */
  theme?: AdapterTheme
  
  /** 布局组件覆写（可选，如果 UI 库有更好的实现） */
  layout?: {
    Grid?: React.ComponentType<any>
    Container?: React.ComponentType<any>
    Flex?: React.ComponentType<any>
    Collapse?: React.ComponentType<any>
    Tabs?: React.ComponentType<any>
  }

  /**
   * 属性面板小组件（由 adapter 提供，用于设计器属性面板）
   * 如果不提供，core 会用纯 HTML 兜底
   */
  _designerWidgets?: DesignerWidgets
}

// ========================
// 属性面板小组件接口（由 adapter 提供）
// ========================

/** 属性面板使用的基础小组件 */
export interface DesignerWidgets {
  /** 文本输入框 */
  Input: React.ComponentType<{
    value?: string | number
    onChange?: (v: string | number) => void
    placeholder?: string
    disabled?: boolean
    style?: React.CSSProperties
  }>
  /** 下拉选择 */
  Select: React.ComponentType<{
    value?: string
    onChange?: (v: string) => void
    options: { label: string; value: string }[]
    disabled?: boolean
    style?: React.CSSProperties
  }>
  /** 勾选框 */
  Checkbox: React.ComponentType<{
    checked?: boolean
    onChange?: (v: boolean) => void
    disabled?: boolean
    style?: React.CSSProperties
  }>
  /** 数字输入框 */
  NumberInput: React.ComponentType<{
    value?: number
    onChange?: (v: number) => void
    min?: number
    max?: number
    disabled?: boolean
    style?: React.CSSProperties
  }>
}

/** 属性面板渲染 Props */
export interface PropertyPanelRenderProps {
  /** 当前选中的字段 Schema */
  field: any
  /** 字段更新回调 */
  onChange: (updatedField: any) => void
  /** 所有字段（用于联动配置） */
  allFields?: any[]
}

/** Adapter 主题配置 */
export interface AdapterTheme {
  /** 主题 Token（如 Ant Design 的 token） */
  token?: Record<string, unknown>
  /** 组件级 Token */
  components?: Record<string, Record<string, unknown>>
  /** 全局样式覆写 */
  styleOverrides?: Record<string, React.CSSProperties>
}

// ============================
// Adapter 注册
// ============================

/** 已注册的 Adapter */
let currentAdapter: FormEngineAdapter | null = null

/** 注册 Adapter（设置当前使用的 adapter） */
export function registerAdapter(adapter: FormEngineAdapter): void {
  currentAdapter = adapter
}

/** 获取当前 Adapter */
export function getAdapter(): FormEngineAdapter | null {
  return currentAdapter
}

/** 检查是否已注册 Adapter */
export function hasAdapter(): boolean {
  return currentAdapter !== null
}

/** 获取 Adapter 的组件映射 */
export function getAdapterComponents(): FormEngineAdapter['components'] {
  return currentAdapter?.components || {}
}

/** 获取 Adapter 的属性面板渲染器 */
export function getAdapterPropertyPanel() {
  return currentAdapter?.propertyPanel
}

/** 清空 Adapter（用于测试） */
export function clearAdapter(): void {
  currentAdapter = null
}
