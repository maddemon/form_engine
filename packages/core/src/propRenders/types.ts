import type { DesignerWidgets } from '../types/adapter'

export interface PropsRenderProps {
  widgets: DesignerWidgets
  values: Record<string, unknown>
  onChange: (key: string, value: unknown) => void
}
