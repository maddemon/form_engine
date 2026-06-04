import type { PaletteItem } from './designer'
import type { FieldType } from './schema'

export type PaletteDragData = {
  source: 'palette'
  fieldType: string
  label: string
  defaultProps: Record<string, unknown>
  extraData?: Record<string, unknown>
}

export type CanvasDragData = {
  source: 'canvas'
  fieldId: string
}

export type DesignerDragData = PaletteDragData | CanvasDragData

export function isPaletteDrag(data: DesignerDragData): data is PaletteDragData {
  return data.source === 'palette'
}

export function isCanvasDrag(data: DesignerDragData): data is CanvasDragData {
  return data.source === 'canvas'
}

export function toPaletteItem(data: PaletteDragData): PaletteItem {
  return {
    type: data.fieldType as FieldType,
    label: data.label,
    defaultProps: data.defaultProps,
    extraData: data.extraData,
  }
}
