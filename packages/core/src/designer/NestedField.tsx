import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { FormFieldSchema } from '../types/schema'
import { FieldRenderer } from '../renderer/FieldRenderer'
import { isContainerComponent } from '../types/component-category'
import { useDesignerContext } from './DesignerContext'
import { FieldItem } from './FieldItem'
import { ContainerPreview } from './ContainerPreview'

interface NestedFieldProps {
  field: FormFieldSchema
  parentContainerId?: string
  childIndex?: number
}

export const NestedField: React.FC<NestedFieldProps> = ({ field, parentContainerId, childIndex }) => {
  const { selectedFieldId, formConfig, adapter } = useDesignerContext()
  const isContainer = isContainerComponent(field.type)

  const {
    attributes, listeners, setNodeRef, setActivatorNodeRef,
    transform, transition, isDragging,
  } = useSortable({
    id: field.id!,
    data: { source: 'canvas', fieldId: field.id },
    disabled: parentContainerId === undefined || childIndex === undefined,
  })

  const content = isContainer
    ? <ContainerPreview field={field} />
    : <FieldRenderer field={field} value={undefined} onChange={() => {}} options={[]} disabled={false} adapter={adapter} formConfig={formConfig} />

  return (
    <FieldItem
      field={field}
      isSelected={selectedFieldId === field.id}
      dragListeners={listeners}
      dragAttributes={attributes}
      dragActivatorRef={setActivatorNodeRef}
      dragNodeRef={setNodeRef}
      dragStyle={{
        transform: isDragging ? undefined : CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0 : 1,
      }}
    >
      {content}
    </FieldItem>
  )
}
