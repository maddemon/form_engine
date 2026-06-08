import type { BaseComponentProps, ComponentRegistration } from '../../types/component'

export interface TableColumnConfig {
  id: string
  key: string
  title: string
  dataIndex: string
  width?: number
  align?: 'left' | 'center' | 'right'
  fixed?: 'left' | 'right'
  sortable?: boolean
}

export interface TableProps extends BaseComponentProps {
  columns: TableColumnConfig[]
  dataSource?: Record<string, unknown>[]
  bordered?: boolean
  size?: 'small' | 'middle' | 'large'
  pagination?: boolean | { pageSize?: number; showSizeChanger?: boolean }
  emptyText?: string
  rowKey?: string
  loading?: boolean
}

export const meta: ComponentRegistration = {
  label: '表格',
  category: 'display',
  icon: 'Table',
  defaultProps: {
    componentProps: {
      columns: [
        { id: 'col_1', key: 'name', title: '名称', dataIndex: 'name' },
        { id: 'col_2', key: 'age', title: '年龄', dataIndex: 'age' },
      ],
      bordered: true,
      size: 'middle',
    },
  },
  eventDeclarations: [],
}
