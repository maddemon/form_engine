import { horizontalListSortingStrategy, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import React from 'react'
import { NestedField } from '../NestedField'
import type { ContainerContentProps } from './types'
import { EmptyContainerPlaceholder } from './EmptyContainerPlaceholder'
import { useContainerDroppable } from './useContainerHooks'

/** Flex container */
export const FlexContainerContent: React.FC<ContainerContentProps> = React.memo(({ field }) => {
  const { setNodeRef, childIds, hasChildren, droppableStyle } = useContainerDroppable(field)

  const rawDirection = (field.componentProps?.direction as string) ?? 'row'
  const direction = rawDirection === 'horizontal' ? 'row' : rawDirection
  const isHorizontal = direction === 'row' || direction === 'row-reverse'
  const gap = (field.componentProps?.gap as number) ?? 0
  const justify = (field.componentProps?.justify as string) ?? 'flex-start'
  const align = (field.componentProps?.align as string) ?? 'stretch'
  const wrap = (field.componentProps?.wrap as string) === 'wrap'
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
        display: 'flex',
        flexDirection: direction as React.CSSProperties['flexDirection'],
        flexWrap: wrap ? 'wrap' : 'nowrap',
        justifyContent: justify,
        alignItems: align,
        gap,
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
FlexContainerContent.displayName = 'FlexContainerContent'
