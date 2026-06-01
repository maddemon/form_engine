import React from 'react'
import type { FormFieldSchema } from '../types/schema'
import { FieldRenderer } from '../renderer/FieldRenderer'
import defaultAdapter from '../renderer/defaultAdapter'
import { isContainerComponent } from '../types/component-category'
import { useDesignerContext } from './DesignerContext'
import { FieldItem } from './FieldItem'
import { ContainerPreview } from './ContainerPreview'
import { writeDragData, readDragData, isCanvasDrag } from '../types/designer-drag'

interface NestedFieldProps {
  field: FormFieldSchema
  parentContainerId?: string
  childIndex?: number
}

export const NestedField: React.FC<NestedFieldProps> = ({ field, parentContainerId, childIndex }) => {
  const { dispatch, selectedFieldId } = useDesignerContext()
  const isContainer = isContainerComponent(field.type)

  const content = isContainer
    ? <ContainerPreview field={field} />
    : <FieldRenderer field={field} value={undefined} onChange={() => {}} options={[]} disabled={false} adapter={defaultAdapter} />

  const hasDragHandlers = parentContainerId !== undefined && childIndex !== undefined

  const dragHandlers = hasDragHandlers
    ? {
        onDragStart: (e: React.DragEvent) => {
          writeDragData(e, { source: 'canvas', index: childIndex!, fieldId: field.id, fromParentId: parentContainerId })
        },
        onDrop: (e: React.DragEvent) => {
          e.preventDefault()
          const data = readDragData(e)
          if (!data || !isCanvasDrag(data) || !data.fromParentId) return
          if (data.fieldId === parentContainerId) return
          dispatch({
            type: 'MOVE_FIELD',
            fromIndex: data.index,
            toIndex: 0,
            fromParentId: data.fromParentId,
            toParentId: parentContainerId,
          })
        },
      }
    : undefined

  return (
    <FieldItem
      field={field}
      isSelected={selectedFieldId === field.id}
      withDragHandlers={hasDragHandlers}
      onDragStart={dragHandlers?.onDragStart}
      onDrop={dragHandlers?.onDrop}
    >
      {content}
    </FieldItem>
  )
}
