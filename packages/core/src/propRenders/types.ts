import type { DesignerWidgets } from '../types/adapter'

export interface PropsRenderProps {
  widgets: DesignerWidgets & Required<Pick<DesignerWidgets, 'ButtonGroup' | 'TextArea'>>
  values: Record<string, unknown>
  onChange: (key: string, value: unknown) => void
}
