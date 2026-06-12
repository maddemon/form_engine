import { useDroppable } from '@dnd-kit/core'
import React from 'react'
import { useLocale } from '../../locale'
import { useStyle } from '../../styles'
import { useEmptyContainerStyle } from '../hooks/useDroppableStyle'

interface EmptyPlaceholderProps {
  containerId: string
  style?: React.CSSProperties
  /** 占位文案 */
  text?: string
  /** 变体：simple 为纯文本占位，dashed 为带虚线边框的画布级占位 */
  variant?: 'simple' | 'dashed'
  /** 跳过内部 useDroppable（外层已处理 droppable 时使用） */
  skipDroppable?: boolean
}

export const EmptyContainerPlaceholder: React.FC<EmptyPlaceholderProps> = React.memo(({ containerId, style, text, variant = 'simple', skipDroppable = false }) => {
  const { locale } = useLocale()
  const placeholderText = text ?? locale.designer.emptyContainerPlaceholder
  const { setNodeRef: droppableRef, isOver: droppableOver } = useDroppable({ id: `${containerId}__container`, data: { parentId: containerId } })
  const setNodeRef = skipDroppable ? undefined : droppableRef
  const isOver = skipDroppable ? false : droppableOver
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
        {placeholderText}
      </div>
    )
  }

  return (
    <div ref={setNodeRef} style={{ ...emptyStyle, ...style }}>
      {placeholderText}
    </div>
  )
})
EmptyContainerPlaceholder.displayName = 'EmptyContainerPlaceholder'
