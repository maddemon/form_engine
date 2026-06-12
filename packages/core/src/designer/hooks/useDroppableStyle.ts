import { useStyle } from '../../styles'

/**
 * 可拖放区域的通用样式计算
 *
 * 消除 ContainerPreview 中 5+ 处重复的 droppable 样式代码。
 */
export function useDroppableStyle(isOver: boolean, hasChildren: boolean) {
  const { token } = useStyle()

  return {
    minHeight: token('containerMinHeight'),
    border: isOver ? '2px solid var(--fe-primary)' : '1px dashed var(--fe-border-light)',
    borderRadius: 'var(--fe-border-radius-sm)',
    background: isOver ? 'var(--fe-primary-hover-bg)' : hasChildren ? 'transparent' : 'var(--fe-bg-tertiary)',
    transition: 'border-color 0.2s, background 0.2s',
    padding: token('spacingXs'),
  } as const
}

/**
 * 空容器的占位样式（居中显示"拖入组件"文案）
 */
export function useEmptyContainerStyle(isOver: boolean) {
  const { token } = useStyle()

  return {
    minHeight: token('containerMinHeight'),
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    border: isOver ? '2px solid var(--fe-primary)' : '1px dashed var(--fe-border-light)',
    borderRadius: 'var(--fe-border-radius-sm)',
    background: isOver ? 'var(--fe-primary-hover-bg)' : 'var(--fe-bg-tertiary)',
    color: 'var(--fe-text-muted)',
    fontSize: token('fontSizeSm'),
  } as const
}
