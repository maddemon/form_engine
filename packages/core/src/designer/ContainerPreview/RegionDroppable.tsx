import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import React, { useMemo } from 'react'
import type { FormFieldSchema } from '../../types/schema'
import { NestedField } from '../NestedField'
import { useDroppableStyle } from '../useDroppableStyle'
import { EmptyContainerPlaceholder } from './EmptyContainerPlaceholder'

interface RegionDroppableProps {
  parentId: string
  regionKey: string
  items: FormFieldSchema[]
  fieldId: string
}

export const RegionDroppable: React.FC<RegionDroppableProps> = ({ parentId, regionKey, items, fieldId }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `${fieldId}__region_${regionKey}`,
    data: { parentId, regionKey },
  })
  const childIds = useMemo(() => items.map((c) => c.id), [items])
  const droppableStyle = useDroppableStyle(isOver, items.length > 0)

  return (
    <div ref={setNodeRef} style={droppableStyle}>
      {items.length > 0 ? (
        <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
          {items.map((child, index) => (
            <NestedField key={child.id} field={child} parentContainerId={parentId} childIndex={index} />
          ))}
        </SortableContext>
      ) : (
        <EmptyContainerPlaceholder containerId={`${fieldId}__region_${regionKey}`} />
      )}
    </div>
  )
}
