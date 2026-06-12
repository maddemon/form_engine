import { horizontalListSortingStrategy, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import React from 'react'
import { NestedField } from './NestedField'
import type { ContainerContentProps } from './types'
import { EmptyContainerPlaceholder } from './EmptyContainerPlaceholder'
import { useContainerDroppable } from './useContainerHooks'

/** Generic container (non-special-cased type) */
export const GenericContainerContent: React.FC<ContainerContentProps> = React.memo(({ field }) => {
  const { setNodeRef, childIds, hasChildren, droppableStyle } = useContainerDroppable(field)

  const rawLayout = (field.componentProps?.layout as string) ?? 'vertical'
  const isHorizontal = rawLayout === 'horizontal'
  const strategy = isHorizontal ? horizontalListSortingStrategy : verticalListSortingStrategy

  if (!hasChildren) {
    return (
      <div ref={setNodeRef} style={{ pointerEvents: 'auto' }}>
        <EmptyContainerPlaceholder containerId={field.id} skipDroppable />
      </div>
    )
  }
  return (
    <div
      ref={setNodeRef}
      style={{
        ...droppableStyle,
        display: isHorizontal ? 'flex' : undefined,
        flexDirection: isHorizontal ? 'row' : undefined,
        pointerEvents: 'auto',
      }}
    >
      <SortableContext items={childIds} strategy={strategy}>
        {field.children.map((child, index) => (
          <NestedField key={child.id} field={child} parentContainerId={field.id} childIndex={index} />
        ))}
      </SortableContext>
    </div>
  )
})
GenericContainerContent.displayName = 'GenericContainerContent'
