import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import React from 'react'
import { FieldRenderer } from '../../renderer/FieldRenderer'
import { isContainerComponent } from '../../types/component-category'
import { ContainerPreview } from '../ContainerPreview'
import { FieldItem } from '../FieldItem'
import type { SortableFieldProps } from './types'

export const SortableField: React.FC<SortableFieldProps> = React.memo(({ field, selectedFieldId, formConfig, adapter }) => {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
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
        <FieldRenderer field={field} value={undefined} onChange={() => {}} options={[]} disabled={false} adapter={adapter} formConfig={formConfig} />
      )}
    </FieldItem>
  )
})
SortableField.displayName = 'SortableField'
