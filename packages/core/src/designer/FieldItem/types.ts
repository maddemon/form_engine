import type { FormFieldSchema } from '../../types'

export interface FieldItemProps {
  field: FormFieldSchema
  isSelected: boolean
  children: React.ReactNode
  dragListeners?: Record<string, (...args: unknown[]) => void>
  dragAttributes?: Record<string, unknown>
  dragActivatorRef?: (node: HTMLElement | null) => void
  dragNodeRef?: (node: HTMLElement | null) => void
  dragStyle?: React.CSSProperties
}

export interface DragHandleProps {
  dragActivatorRef?: (node: HTMLElement | null) => void
  dragListeners?: Record<string, (...args: unknown[]) => void>
}

export interface FieldActionsProps {
  fieldId: string
  onCopy: () => void
  onRemove: () => void
}
