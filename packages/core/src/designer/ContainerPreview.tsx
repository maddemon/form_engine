import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { FormFieldSchema } from '../types/schema'
import { useDesignerContext } from './DesignerContext'
import { NestedField } from './NestedField'

interface ContainerPreviewProps {
  field: FormFieldSchema
}

export const ContainerPreview: React.FC<ContainerPreviewProps> = ({ field }) => {
  const { scene } = useDesignerContext()
  const dropId = `${field.id}__container`
  const { setNodeRef, isOver } = useDroppable({ id: dropId })
  const children = field.children || []
  const childIds = React.useMemo(() => children.map(c => c.id!), [children])

  const compProps = field.componentProps as Record<string, unknown> | undefined
  const gap = Number(compProps?.gap) || 8
  const childCount = children.length
  const isMobile = scene === 'mobile'

  const isGrid = field.type === 'grid'
  const isFlex = field.type === 'flex'
  const columns = Number(compProps?.columns) || 24
  const eachSpan = isMobile || childCount === 0 ? columns : Math.floor(columns / childCount)
  const childWidthPct = (eachSpan / columns) * 100
  const childWidth = childCount > 1
    ? `calc(${childWidthPct}% - ${gap * (childCount - 1) / childCount}px)`
    : `${childWidthPct}%`

  const containerStyle: React.CSSProperties = {
    minHeight: 60,
    position: 'relative',
    border: isOver ? '2px solid #1890ff' : '1px dashed #d9d9d9',
    borderRadius: 4,
    background: isOver ? '#f0f5ff' : '#fafafa',
    padding: 8,
    gap: `${gap}px`,
  }

  if (isGrid) {
    containerStyle.display = 'flex'
    containerStyle.flexWrap = 'wrap'
  } else if (isFlex) {
    containerStyle.display = 'flex'
    containerStyle.flexWrap = (compProps?.wrap as string) === 'wrap' ? 'wrap' : 'nowrap'
    containerStyle.flexDirection = (compProps?.direction as React.CSSProperties['flexDirection']) || 'row'
  } else {
    containerStyle.display = 'flex'
    containerStyle.flexDirection = 'column'
  }

  return (
    <div ref={setNodeRef} style={containerStyle}>
      {childCount > 0 ? (
        <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
          {children.map((child, i) => (
            <div key={child.id || i} style={{ width: isGrid ? childWidth : undefined, minWidth: 0 }}>
              <NestedField field={child} parentContainerId={field.id} childIndex={i} />
            </div>
          ))}
        </SortableContext>
      ) : (
        <div style={{ fontSize: 12, color: '#bbb', textAlign: 'center', padding: 16, userSelect: 'none', width: '100%' }}>
          拖入组件到此容器
        </div>
      )}
    </div>
  )
}
