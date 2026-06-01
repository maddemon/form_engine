import type { PaletteItem } from './designer'

export type PaletteDragData = {
  source: 'palette'
  fieldType: string
  label: string
  defaultProps: Record<string, unknown>
}

export type CanvasDragData = {
  source: 'canvas'
  index: number
  fieldId: string | undefined
  fromParentId?: string
}

export type DesignerDragData = PaletteDragData | CanvasDragData

const DRAG_FORMAT = 'designer-drag'

export function serializeDragData(data: DesignerDragData): string {
  return JSON.stringify(data)
}

export function deserializeDragData(raw: string): DesignerDragData | null {
  try {
    const data = JSON.parse(raw)
    if (data && (data.source === 'palette' || data.source === 'canvas')) {
      return data as DesignerDragData
    }
    return null
  } catch {
    return null
  }
}

export function readDragData(e: React.DragEvent): DesignerDragData | null {
  const raw = e.dataTransfer.getData(DRAG_FORMAT)
  if (!raw) return null
  return deserializeDragData(raw)
}

export function writeDragData(e: React.DragEvent, data: DesignerDragData): void {
  e.dataTransfer.setData(DRAG_FORMAT, serializeDragData(data))
}

export function isPaletteDrag(data: DesignerDragData): data is PaletteDragData {
  return data.source === 'palette'
}

export function isCanvasDrag(data: DesignerDragData): data is CanvasDragData {
  return data.source === 'canvas'
}

export function toPaletteItem(data: PaletteDragData): PaletteItem {
  return {
    type: data.fieldType as any,
    label: data.label,
    defaultProps: data.defaultProps,
  }
}
