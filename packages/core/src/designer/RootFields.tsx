import React from 'react'
import type { FormFieldSchema, DesignerAction } from '../types'
import { FieldRenderer } from '../renderer/FieldRenderer'
import defaultAdapter from '../renderer/defaultAdapter'
import { isContainerComponent } from '../types/component-category'
import { useDesignerContext } from './DesignerContext'
import { FieldItem } from './FieldItem'
import { ContainerPreview } from './ContainerPreview'

interface RootFieldsProps {
  fields: FormFieldSchema[]
  onDragStart: (e: React.DragEvent, index: number, field: FormFieldSchema) => void
  onDrop: (e: React.DragEvent, index: number) => void
}

export const RootFields: React.FC<RootFieldsProps> = ({ fields, onDragStart, onDrop }) => {
  const { selectedFieldId } = useDesignerContext()

  return (
    <>
      {fields.map((field, index) => {
        const isSelected = selectedFieldId === field.id
        const isContainer = isContainerComponent(field.type)
        const dragHandlers = {
          onDragStart: (e: React.DragEvent) => onDragStart(e, index, field),
          onDrop: (e: React.DragEvent) => onDrop(e, index),
        }

        const content = isContainer
          ? <ContainerPreview field={field} />
          : <FieldRenderer field={field} value={undefined} onChange={() => {}} options={[]} disabled={false} adapter={defaultAdapter} />

        return (
          <FieldItem
            key={field.id}
            field={field}
            isSelected={isSelected}
            withDragHandlers
            onDragStart={dragHandlers.onDragStart}
            onDrop={dragHandlers.onDrop}
          >
            {content}
          </FieldItem>
        )
      })}
    </>
  )
}
