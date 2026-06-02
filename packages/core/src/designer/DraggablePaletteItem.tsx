import React from 'react'
import { useDraggable } from '@dnd-kit/core'

let _counter = 0

export interface DraggablePaletteItemProps {
  fieldType: string
  label: string
  defaultProps?: Record<string, unknown>
  extraData?: Record<string, unknown>
  children: React.ReactNode
}

export const DraggablePaletteItem: React.FC<DraggablePaletteItemProps> = ({
  fieldType,
  label,
  defaultProps,
  extraData,
  children,
}) => {
  _counter++
  const id = `draggable-palette-${fieldType}-${_counter}`

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data: {
      source: 'palette' as const,
      fieldType,
      label,
      defaultProps: defaultProps || {},
      extraData: extraData || {},
    },
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
        userSelect: 'none',
      }}
    >
      {children}
    </div>
  )
}