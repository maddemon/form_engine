import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import React from 'react'
import { NestedField } from '../NestedField'
import { EmptyContainerPlaceholder } from './EmptyContainerPlaceholder'
import { SelfRenderedContainer } from './SelfRenderedContainer'
import { useContainerDroppable } from './useContainerHooks'
import type { ContainerContentProps } from './types'

/** Card container */
export const CardContainerContent: React.FC<ContainerContentProps> = React.memo(({ field, formConfig, adapter }) => {
  const { setNodeRef, childIds, hasChildren, droppableStyle } = useContainerDroppable(field)

  const cardBody = hasChildren ? (
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
