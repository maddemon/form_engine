import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import React, { useMemo } from 'react'
import type { FormFieldSchema } from '../types/schema'
import { isContainerComponent } from '../types/component-category'
import { useStyle } from '../styles'
import { NestedField } from './NestedField'

interface ContainerPreviewProps {
  field: FormFieldSchema
}

function isHorizontalLayout(field: FormFieldSchema): boolean {
  if (field.type === 'grid' || field.type === 'flex') return true
  if (field.type === 'container') {
    const layout = field.componentProps?.layout as string | undefined
    return layout === 'horizontal'
  }
  return false
}

function getGridColumns(field: FormFieldSchema): number {
  const columns = field.componentProps?.columns
  return typeof columns === 'number' ? columns : 2
}

export const ContainerPreview: React.FC<ContainerPreviewProps> = ({ field }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `${field.id}__container`,
    data: { parentId: field.id },
  })
  const { token } = useStyle()
  const childIds = useMemo(() => (field.children || []).map(c => c.id!), [field.children])
  const horizontal = isHorizontalLayout(field)
  const gridColumns = field.type === 'grid' ? getGridColumns(field) : 0

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    minHeight: token('containerMinHeight'),
    padding: token('spacingSm'),
    border: isOver ? '2px solid var(--fe-primary)' : '1px dashed var(--fe-border-primary)',
    borderRadius: 'var(--fe-border-radius-sm)',
    background: isOver ? 'var(--fe-primary-hover-bg)' : 'var(--fe-bg-tertiary)',
  }

  if (field.children && field.children.length > 0) {
    return (
      <div ref={setNodeRef} style={containerStyle}>
        <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
          {horizontal ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: gridColumns > 0 ? `repeat(${gridColumns}, 1fr)` : 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: token('spacingSm'),
            }}>
              {field.children.map((child, index) => (
                <NestedField
                  key={child.id}
                  field={child}
                  parentContainerId={field.id!}
                  childIndex={index}
                />
              ))}
            </div>
          ) : (
            field.children.map((child, index) => (
              <NestedField
                key={child.id}
                field={child}
                parentContainerId={field.id!}
                childIndex={index}
              />
            ))
          )}
        </SortableContext>
      </div>
    )
  }

  return (
    <div ref={setNodeRef} style={containerStyle}>
      <div style={{
        color: 'var(--fe-text-muted)',
        fontSize: token('fontSizeSm'),
        textAlign: 'center',
        padding: token('spacingSm'),
      }}>
        拖拽组件到此处
      </div>
    </div>
  )
}
