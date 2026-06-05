import { useDroppable } from '@dnd-kit/core'
import { horizontalListSortingStrategy, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import React, { useMemo } from 'react'
import { NestedField } from '../NestedField'
import { useDroppableStyle, useEmptyContainerStyle } from '../useDroppableStyle'
import type { ContainerContentProps } from './types'

/** Flex container */
export const FlexContainerContent: React.FC<ContainerContentProps> = React.memo(({ field }) => {
  const { setNodeRef, isOver } = useDroppable({ id: `${field.id}__container`, data: { parentId: field.id } })
  const childIds = useMemo(() => field.children.map((c) => c.id), [field.children])
  const hasChildren = field.children.length > 0
  const droppableStyle = useDroppableStyle(isOver, hasChildren)
  const emptyStyle = useEmptyContainerStyle(isOver)

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
      <div ref={setNodeRef} style={{ ...emptyStyle, pointerEvents: 'auto' }}>
        拖入组件
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
