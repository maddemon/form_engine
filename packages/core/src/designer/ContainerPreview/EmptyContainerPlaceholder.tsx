import { useDroppable } from '@dnd-kit/core'
import React from 'react'
import { useEmptyContainerStyle } from '../useDroppableStyle'

type EmptyPlaceholderProps = { containerId: string; style?: React.CSSProperties }

export const EmptyContainerPlaceholder: React.FC<EmptyPlaceholderProps> = React.memo(({ containerId, style }) => {
  const { setNodeRef, isOver } = useDroppable({ id: `${containerId}__container`, data: { parentId: containerId } })
  const emptyStyle = useEmptyContainerStyle(isOver)

  return (
    <div ref={setNodeRef} style={{ ...emptyStyle, ...style }}>
      拖入组件
    </div>
  )
})
EmptyContainerPlaceholder.displayName = 'EmptyContainerPlaceholder'
