import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import React from 'react'
import { FieldRenderer, DefaultFormItem } from '../../renderer/FieldRenderer'
import { isContainerComponent } from '../../types/component-category'
import type { FormItemProps } from '../../types/adapter'
import { ContainerPreview } from '../ContainerPreview'
import { FieldItem } from '../FieldItem'
import type { SortableFieldProps } from './types'

/** 这些容器的 ContainerContent 内部已自行调用 FieldRenderer，外层无需重复包 label */
const SELF_RENDERED = new Set(['card', 'collapse', 'tabs'])

export const SortableField: React.FC<SortableFieldProps> = React.memo(({ field, selectedFieldId, formConfig, adapter }) => {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
    data: { source: 'canvas', fieldId: field.id },
  })

  const isContainer = isContainerComponent(field.type)

  const content = isContainer ? (
    <ContainerPreview field={field} />
  ) : (
    <FieldRenderer field={field} value={undefined} onChange={() => {}} options={[]} disabled={false} adapter={adapter} formConfig={formConfig} />
  )

  const needsLabel = isContainer && !SELF_RENDERED.has(field.type)
  const containerLabelProps: FormItemProps = {
    label: field.label,
    labelHidden: field.labelHidden,
    formConfig,
    scene: adapter.scene,
    children: content,
  }

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
      {needsLabel ? React.createElement(adapter.FormItem ?? DefaultFormItem, containerLabelProps) : content}
    </FieldItem>
  )
})
SortableField.displayName = 'SortableField'
