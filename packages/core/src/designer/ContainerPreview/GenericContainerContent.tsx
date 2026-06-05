import { useDroppable } from '@dnd-kit/core'
import { horizontalListSortingStrategy, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import React, { useMemo } from 'react'
import { NestedField } from '../NestedField'
import { useDroppableStyle, useEmptyContainerStyle } from '../useDroppableStyle'
import type { ContainerContentProps } from './types'

/** Generic container (non-special-cased type) */
export const GenericContainerContent: React.FC<ContainerContentProps> = React.memo(({ field }) => {
  const { setNodeRef, isOver } = useDroppable({ id: `${field.id}__container`, data: { parentId: field.id } })
  const childIds = useMemo(() => field.children.map((c) => c.id), [field.children])
  const hasChildren = field.children.length > 0
  const droppableStyle = useDroppableStyle(isOver, hasChildren)
  const emptyStyle = useEmptyContainerStyle(isOver)

  const rawLayout = (field.componentProps?.layout as string) ?? 'vertical'
  const isHorizontal = rawLayout === 'horizontal'
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
