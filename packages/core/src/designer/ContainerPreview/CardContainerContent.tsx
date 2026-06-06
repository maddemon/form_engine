import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import React, { useMemo } from 'react'
import { NestedField } from '../NestedField'
import { useDroppableStyle } from '../useDroppableStyle'
import { EmptyContainerPlaceholder } from './EmptyContainerPlaceholder'
import { SelfRenderedContainer } from './SelfRenderedContainer'
import type { ContainerContentProps } from './types'

/** Card container */
export const CardContainerContent: React.FC<ContainerContentProps> = React.memo(({ field, formConfig, adapter }) => {
  const { setNodeRef, isOver } = useDroppable({ id: `${field.id}__container`, data: { parentId: field.id } })
  const childIds = useMemo(() => field.children.map((c) => c.id), [field.children])
  const droppableStyle = useDroppableStyle(isOver, field.children.length > 0)

  const cardBody = field.children.length > 0 ? (
    <div ref={setNodeRef} style={droppableStyle}>
      <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
        {field.children.map((child, index) => (
          <NestedField key={child.id} field={child} parentContainerId={field.id} childIndex={index} />
        ))}
      </SortableContext>
    </div>
  ) : (
    <div ref={setNodeRef} style={droppableStyle}>
      <EmptyContainerPlaceholder containerId={field.id} skipDroppable />
    </div>
  )

  return (
    <SelfRenderedContainer field={field} adapter={adapter} formConfig={formConfig}>
      {cardBody}
    </SelfRenderedContainer>
  )
})
CardContainerContent.displayName = 'CardContainerContent'
