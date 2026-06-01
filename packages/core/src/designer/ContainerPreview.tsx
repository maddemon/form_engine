import React from 'react'
import type { FormFieldSchema } from '../types/schema'
import { useDesignerContext } from './DesignerContext'
import { createFieldFromPalette } from './FieldList'
import { NestedField } from './NestedField'
import { readDragData, isPaletteDrag, isCanvasDrag, toPaletteItem } from '../types/designer-drag'

interface ContainerPreviewProps {
  field: FormFieldSchema
}

export const ContainerPreview: React.FC<ContainerPreviewProps> = ({ field }) => {
  const { scene, dispatch } = useDesignerContext()
  const compProps = field.componentProps as Record<string, unknown> | undefined
  const gap = Number(compProps?.gap) || 8
  const childCount = field.children?.length || 0
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
    border: '1px dashed #d9d9d9',
    borderRadius: 4,
    background: '#fafafa',
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

  const handleDropOnContainer = (e: React.DragEvent, parentId: string) => {
    e.preventDefault()
    e.stopPropagation()
    const data = readDragData(e)
    if (!data) return

    if (isPaletteDrag(data)) {
      const newField = createFieldFromPalette(toPaletteItem(data))
      dispatch({ type: 'ADD_FIELD', field: newField, index: 0, parentId })
    } else if (isCanvasDrag(data)) {
      if (data.fieldId === parentId) return
      dispatch({
        type: 'MOVE_FIELD',
        fromIndex: data.index,
        toIndex: 0,
        fromParentId: data.fromParentId,
        toParentId: parentId,
      })
    }
  }

  return (
    <div
      style={containerStyle}
      onDragOver={e => { e.preventDefault(); e.stopPropagation(); e.currentTarget.style.borderColor = '#1890ff'; e.currentTarget.style.background = '#f0f5ff' }}
      onDragLeave={e => { e.currentTarget.style.borderColor = '#d9d9d9'; e.currentTarget.style.background = '#fafafa' }}
      onDrop={e => { e.currentTarget.style.borderColor = '#d9d9d9'; e.currentTarget.style.background = '#fafafa'; handleDropOnContainer(e, field.id!) }}
    >
      {field.children?.length ? (
        field.children.map((child, i) => (
          <div key={child.id || i} style={{ width: isGrid ? childWidth : undefined, minWidth: 0 }}>
            <NestedField field={child} parentContainerId={field.id} childIndex={i} />
          </div>
        ))
      ) : (
        <div style={{ fontSize: 12, color: '#bbb', textAlign: 'center', padding: 16, userSelect: 'none', width: '100%' }}>
          拖入组件到此容器
        </div>
      )}
    </div>
  )
}
