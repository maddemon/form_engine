import type { DesignerWidgets } from '../types/adapter'
import type { PropertySlots } from '../types/property-slot'
import type { FieldDataSource } from '../types/schema'

export interface PropsRenderProps {
  widgets: DesignerWidgets & Required<Pick<DesignerWidgets, 'ButtonGroup' | 'TextArea'>>
  values: Record<string, unknown>
  onChange: (key: string, value: unknown) => void
  /** 当前字段的数据源配置（field.dataSource） */
  dataSource?: FieldDataSource
  /** 数据源变更回调（写入 field.dataSource） */
  onDataSourceChange?: (ds: FieldDataSource) => void
  /** 属性编辑器 Slot（运行时注入，优先级最高） */
  slots?: PropertySlots
}
