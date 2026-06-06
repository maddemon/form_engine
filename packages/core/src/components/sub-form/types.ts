import type { BaseLayoutComponentProps } from '../../types/component-props'

export interface SubFormColumnConfig {
  id: string
  label: string
  /** 像素宽度 */
  width: number
}

export interface SubFormProps extends BaseLayoutComponentProps {
  columns: SubFormColumnConfig[]
  rowMode: 'dynamic' | 'fixed'
  fixedRowCount?: number
}