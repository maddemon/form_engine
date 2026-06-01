import type { BaseFormComponentProps, BaseLayoutComponentProps } from '../../types/component-props'

/** Grid / Row / Col */
export interface GridProps extends BaseLayoutComponentProps {
  /** 布局模式 */
  variant?: 'grid' | 'flex'
  /** 列数（grid 模式） */
  columns?: number
  /** 间距 */
  gap?: number | [number, number]
  /** 行配置（可选，用于精细控制） */
  rows?: GridRowConfig[]
  /** 列配置（可选，用于精细控制） */
  cols?: GridColConfig[]
}

export interface GridRowConfig {
  height?: string | number
}

export interface GridColConfig {
  span?: number
  offset?: number
  order?: number
  push?: number
  pull?: number
  xs?: number
  sm?: number
  md?: number
  lg?: number
  xl?: number
  xxl?: number
}


