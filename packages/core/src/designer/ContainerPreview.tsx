import { useDroppable } from '@dnd-kit/core'
import React from 'react'
import type { FormFieldSchema } from '../types/schema'
import { useStyle } from '../styles'

interface ContainerPreviewProps {
  field: FormFieldSchema
  children?: React.ReactNode
  onSelectField?: (id: string | null) => void
}

export const ContainerPreview: React.FC<ContainerPreviewProps> = ({ field, children, onSelectField }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `container-${field.id}`,
    data: { parentId: field.id },
  })
  const { token } = useStyle()
  return (
    <div
      ref={setNodeRef}
      onClick={(e) => {
        e.stopPropagation()
        onSelectField?.(field.id!)
      }}
      style={{
        position: 'relative',
        minHeight: token('containerMinHeight'),
        padding: token('spacingSm'),
        border: isOver ? '2px solid var(--fe-primary)' : '1px dashed var(--fe-border-primary)',
        borderRadius: 'var(--fe-border-radius-sm)',
        background: isOver ? 'var(--fe-primary-hover-bg)' : 'var(--fe-bg-tertiary)',
      }}
    >
      {children}
    </div>
  )
}
