/**
 * 基础组件 Props 定义
 * 集中定义所有组件的基类 Props
 * 命名参考 antd、material-ui 等知名库
 */

import type { OptionItem, FormRule, VisibleWhen } from './schema'

// ============================
// 基础 Props
// ============================

/** 所有组件的基类 Props */
export interface BaseComponentProps {
  // 标识
  id?: string
  className?: string
  style?: React.CSSProperties
  
  // 状态
  disabled?: boolean
  hidden?: boolean
  readOnly?: boolean
  
  // 事件
  onClick?: (event: React.MouseEvent) => void
  onBlur?: () => void
  onFocus?: () => void
  
  // 扩展
  [key: string]: unknown
}

/**
 * 表单组件的基类 Props（泛型）
 * @template TValue - 组件值的类型
 */
export interface BaseFormComponentProps<TValue = any> extends BaseComponentProps {
  // 值相关
  value?: TValue
  defaultValue?: TValue
  /**
   * 值变化回调
   * 注意：子接口应该重新定义这个类型，提供更精确的类型
   */
  onChange?: (value: any) => void
  
  // 表单相关
  name?: string
  required?: boolean
  placeholder?: string
  
  // 校验
  rules?: FormRule[]
  
  // 联动
  visibleWhen?: VisibleWhen
  disabledWhen?: VisibleWhen
}

/** 布局组件的基类 Props */
export interface BaseLayoutComponentProps extends BaseComponentProps {
  children?: React.ReactNode
  
  // 布局相关
  padding?: number | string
  margin?: number | string
  gap?: number
}
