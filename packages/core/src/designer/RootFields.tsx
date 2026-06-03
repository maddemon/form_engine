import React, { useMemo } from 'react'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { FormFieldSchema } from '../types/schema'
import { FieldItem } from './FieldItem'
import { ContainerPreview } from './ContainerPreview'
import { useDesignerContext } from './DesignerContext'
import { isContainerComponent } from '../types/component-category'
import { FieldRenderer } from '../renderer/FieldRenderer'
import defaultAdapter from '../renderer/defaultAdapter'

interface RootFieldsProps {
  fields: FormFieldSchema[]
}

const SortableField: React.FC<{ field: FormFieldSchema }> = ({ field }) => {
  const { selectedFieldId, formConfig } = useDesignerContext()
  const {
    attributes, listeners, setNodeRef, setActivatorNodeRef,
    transform, transition, isDragging,
  } = useSortable({
    id: field.id!,
    data: { source: 'canvas', fieldId: field.id },
  })

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
      {isContainerComponent(field.type) ? (
        <ContainerPreview field={field} />
      ) : (
        <FieldRenderer field={field} value={undefined} onChange={() => {}} options={[]} disabled={false} adapter={defaultAdapter} formConfig={formConfig} />
      )}
    </FieldItem>
  )
}

export const RootFields: React.FC<RootFieldsProps> = ({ fields }) => {
  const fieldIds = useMemo(() => fields.map(f => f.id!), [fields])

  if (fields.length === 0) return null

  return (
    <SortableContext items={fieldIds} strategy={verticalListSortingStrategy}>
      {fields.map(field => (
        <SortableField key={field.id} field={field} />
      ))}
    </SortableContext>
  )
}
