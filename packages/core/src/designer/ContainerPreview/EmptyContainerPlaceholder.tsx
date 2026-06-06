import { useDroppable } from '@dnd-kit/core'
import React from 'react'
import { useStyle } from '../../styles'
import { useEmptyContainerStyle } from '../useDroppableStyle'

interface EmptyPlaceholderProps {
  containerId: string
  style?: React.CSSProperties
  /** 占位文案，默认"拖入组件" */
  text?: string
  /** 变体：simple 为纯文本占位，dashed 为带虚线边框的画布级占位 */
  variant?: 'simple' | 'dashed'
  /** 跳过内部 useDroppable（外层已处理 droppable 时使用） */
  skipDroppable?: boolean
}

export const EmptyContainerPlaceholder: React.FC<EmptyPlaceholderProps> = React.memo(({ containerId, style, text = '拖入组件', variant = 'simple', skipDroppable = false }) => {
  const { setNodeRef, isOver } = skipDroppable
    ? { setNodeRef: undefined, isOver: false }
    : useDroppable({ id: `${containerId}__container`, data: { parentId: containerId } })
  const emptyStyle = useEmptyContainerStyle(isOver)
  const { token } = useStyle()

  if (variant === 'dashed') {
    return (
      <div ref={setNodeRef} style={{
        color: token('textTertiary'),
        fontSize: token('fontSizeSm'),
        padding: token('spacingXl'),
        textAlign: 'center',
        border: '1px dashed var(--fe-border-light)',
        borderRadius: 'var(--fe-border-radius-sm)',
        ...style,
      }}>
        {text}
      </div>
    )
  }

  return (
    <div ref={setNodeRef} style={{ ...emptyStyle, ...style }}>
      {text}
    </div>
  )
})
EmptyContainerPlaceholder.displayName = 'EmptyContainerPlaceholder'
