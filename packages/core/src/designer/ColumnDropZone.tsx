/* check-tokens-disable */
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import type { FormFieldSchema } from '../types/schema'
import { useStyle } from '../styles'
import { NestedField } from './NestedField'

interface ColumnDropZoneProps {
  parentId: string
  columnIndex: number
  children: FormFieldSchema[]
  colWidth: number
  showResizeHandle?: boolean
  onResizeStart?: (columnIndex: number, e: React.MouseEvent) => void
}

export const ColumnDropZone: React.FC<ColumnDropZoneProps> = ({
  parentId,
  columnIndex,
  children: items,
  colWidth,
  showResizeHandle,
  onResizeStart,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `${parentId}__col_${columnIndex}`,
    data: { parentId, columnIndex },
  })
  const { token } = useStyle()
  const childIds = useMemo(() => items.map(c => c.id!), [items])

  return (
    <div
      ref={setNodeRef}
      style={{
        flex: colWidth > 0 ? `0 0 ${colWidth}%` : 1,
        minWidth: 0,
        position: 'relative',
        minHeight: token('containerMinHeight'),
        padding: token('spacingXs'),
        border: isOver ? '2px solid var(--fe-primary)' : '1px dashed var(--fe-border-light)',
        borderRadius: 'var(--fe-border-radius-sm)',
        background: isOver ? 'var(--fe-primary-hover-bg)' : 'transparent',
        transition: 'border-color 0.2s, background 0.2s',
      }}
    >
      {items.length > 0 ? (
        <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
          {items.map((child, index) => (
            <NestedField
              key={child.id}
              field={child}
              parentContainerId={parentId}
              childIndex={index}
            />
          ))}
        </SortableContext>
      ) : (
        <div style={{
          color: 'var(--fe-text-muted)',
          fontSize: token('fontSizeXs'),
          textAlign: 'center',
          padding: token('spacingSm'),
        }}>
          拖拽组件到此处
        </div>
      )}

      {showResizeHandle && (
        <ColumnResizeHandle
          onMouseDown={(e) => onResizeStart?.(columnIndex, e)}
        />
      )}
    </div>
  )
}

interface ColumnResizeHandleProps {
  onMouseDown: (e: React.MouseEvent) => void
}

const ColumnResizeHandle: React.FC<ColumnResizeHandleProps> = ({ onMouseDown }) => {
  return (
    <div
      onMouseDown={onMouseDown}
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: 6,
        cursor: 'col-resize',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{
        width: 2,
        height: '60%',
        background: 'var(--fe-border-primary)',
        borderRadius: 1,
        transition: 'background 0.15s, height 0.15s',
      }} />
    </div>
  )
}

export function useColumnResize(
  columns: number,
  initialWidths: number[],
  onWidthsChange: (widths: number[]) => void,
  minWidth = 10,
) {
  const [resizing, setResizing] = useState<{
    leftIndex: number
    startX: number
    startWidths: number[]
  } | null>(null)

  const handleResizeStart = useCallback((columnIndex: number, e: React.MouseEvent) => {
    e.preventDefault()
    const widths = initialWidths.length === columns
      ? initialWidths
      : Array.from({ length: columns }, () => Math.floor(100 / columns))

    setResizing({
      leftIndex: columnIndex,
      startX: e.clientX,
      startWidths: widths,
    })
  }, [columns, initialWidths])

  useEffect(() => {
    if (!resizing) return

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - resizing.startX
      const totalWidth = document.querySelector('[data-grid-container]')?.clientWidth || 800
      const deltaPercent = (delta / totalWidth) * 100

      const newWidths = [...resizing.startWidths]
      const leftIdx = resizing.leftIndex
      const rightIdx = leftIdx + 1

      if (rightIdx >= newWidths.length) return

      let newLeft = newWidths[leftIdx] + deltaPercent
      let newRight = newWidths[rightIdx] - deltaPercent

      if (newLeft < minWidth) {
        newRight -= (minWidth - newLeft)
        newLeft = minWidth
      }
      if (newRight < minWidth) {
        newLeft -= (minWidth - newRight)
        newRight = minWidth
      }

      newWidths[leftIdx] = Math.round(newLeft * 10) / 10
      newWidths[rightIdx] = Math.round(newRight * 10) / 10
      onWidthsChange(newWidths)
    }

    const handleMouseUp = () => {
      setResizing(null)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [resizing, onWidthsChange, minWidth])

  return { resizing, handleResizeStart }
}