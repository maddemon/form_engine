import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import React, { useMemo } from 'react'
import { FieldRenderer } from '../../renderer/FieldRenderer'
import { useStyle } from '../../styles'
import type { FormFieldSchema } from '../../types/schema'
import { NestedField } from '../NestedField'
import { useDroppableStyle } from '../useDroppableStyle'
import type { ContainerContentProps } from './types'

/** Card container */
export const CardContainerContent: React.FC<ContainerContentProps> = React.memo(({ field, formConfig, adapter }) => {
  const { token } = useStyle()
  const { setNodeRef, isOver } = useDroppable({ id: `${field.id}__container`, data: { parentId: field.id } })
  const childIds = useMemo(() => field.children.map((c) => c.id), [field.children])
  const droppableStyle = useDroppableStyle(isOver, field.children.length > 0)

  const cardBody = (
    <div ref={setNodeRef} style={droppableStyle}>
      <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
        {field.children.map((child, index) => (
          <NestedField key={child.id} field={child} parentContainerId={field.id} childIndex={index} />
        ))}
      </SortableContext>
      {field.children.length === 0 && <div style={{ textAlign: 'center', color: 'var(--fe-text-muted)', fontSize: token('fontSizeSm'), padding: token('spacingSm') }}>拖拽组件到此处</div>}
    </div>
  )

  const enhancedField: FormFieldSchema = { ...field, componentProps: { ...field.componentProps, children: cardBody } }

  return (
    <div style={{ pointerEvents: 'auto' }}>
      <FieldRenderer field={enhancedField} value={undefined} onChange={() => {}} options={[]} disabled={false} adapter={adapter} formConfig={formConfig} />
    </div>
  )
})
CardContainerContent.displayName = 'CardContainerContent'
