import type { BaseLayoutComponentProps } from '../../types/component-props'

export interface TableColumnConfig {
  id: string
  label: string
  /** 像素宽度 */
  width: number
}

export interface TableProps extends BaseLayoutComponentProps {
  columns: TableColumnConfig[]
  rowMode: 'dynamic' | 'fixed'
  fixedRowCount?: number
}