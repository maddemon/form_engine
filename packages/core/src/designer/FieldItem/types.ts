import type { FormFieldSchema } from '../../types'
import type { DesignerAction } from '../../types/designer'

export interface FieldItemProps {
  field: FormFieldSchema
  isSelected: boolean
  children: React.ReactNode
  dragListeners?: Record<string, Function>
  dragAttributes?: Record<string, any>
  dragActivatorRef?: (node: HTMLElement | null) => void
  dragNodeRef?: (node: HTMLElement | null) => void
  dragStyle?: React.CSSProperties
}

export interface DragHandleProps {
  dragActivatorRef?: (node: HTMLElement | null) => void
  dragListeners?: Record<string, Function>
}

export interface FieldActionsProps {
  fieldId: string
  onCopy: () => void
  onRemove: () => void
}
