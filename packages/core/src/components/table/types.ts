import type { BaseLayoutComponentProps } from '../../types/component-props'

export interface TableProps extends BaseLayoutComponentProps {
  columns: TableColumnConfig[]
  rowMode: 'dynamic' | 'fixed'
  fixedRowCount?: number
}

export interface TableColumnConfig {
  label: string
  width: number
  minWidth?: number
}