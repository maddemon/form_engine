import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import React from 'react'
import { useStyle } from '../styles'
import { WidgetButton } from './Button'
import { Space } from './Space'

/** 数组元素移动工具 */
export function arrayMove<T>(arr: T[], from: number, to: number): T[] {
  const copy = [...arr]
  const [moved] = copy.splice(from, 1)
  copy.splice(to, 0, moved)
  return copy
}

/** 拖拽手柄图标 */
export const DragHandleIcon: React.FC<{ disabled?: boolean; sortable?: boolean }> = ({ disabled, sortable = true }) => {
  const { token } = useStyle()
  return (
    <Space.Compact
      align="center"
      style={{
        justifyContent: 'center',
        flexShrink: 0,
        width: token('itemListDragHandleWidthLg'),
        height: token('itemListDragHandleHeightLg'),
        cursor: disabled || !sortable ? 'default' : 'grab',
        color: 'var(--fe-text-secondary)',
        fontSize: token('fontSizeMd'),
        lineHeight: 1,
        userSelect: 'none',
        touchAction: 'none',
        borderRadius: token('borderRadiusSm'),
        background: 'var(--fe-bg-tertiary)',
      }}
    >
      ⋮⋮
    </Space.Compact>
  )
}

/** 行内删除按钮 */
export const InlineDeleteButton: React.FC<{
  disabled?: boolean
  onClick: (e: React.MouseEvent) => void
  title?: string
}> = ({ disabled, onClick, title = '删除' }) => {
  return (
    <WidgetButton style={{ flexShrink: 0 }} size="sm" type="text" disabled={disabled} onClick={onClick} label={title}>
      ✕
    </WidgetButton>
  )
}

/** 列表行内输入框基础样式 */
export function getInputBaseStyle(
  token: ReturnType<typeof useStyle>['token'],
  disabled?: boolean,
): React.CSSProperties {
  return {
    width: '100%',
    padding: '1px 0',
    border: 'none',
    outline: 'none',
    fontSize: token('fontSizeXs'),
    boxSizing: 'border-box',
    background: 'transparent',
    color: disabled ? 'var(--fe-disabled-color)' : 'inherit',
  }
}

/** 可排序列表行内容容器 */
export const SortableRowContent: React.FC<{
  extra?: React.CSSProperties
  children?: React.ReactNode
}> = ({ extra, children }) => {
  const { token } = useStyle()
  return (
    <Space
      gap="xs"
      style={{
        marginBottom: token('spacingXs'),
        background: 'var(--fe-bg-primary)',
        padding: '2px 4px',
        borderRadius: token('borderRadiusSm'),
        ...extra,
      }}
    >
      {children}
    </Space>
  )
}

/** 可排序行组件 */
export const SortableRow: React.FC<{
  id: string
  sortable?: boolean
  dragHandle?: React.ReactNode
  children: React.ReactNode
}> = ({ id, sortable = true, dragHandle, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: sortable ? id : `__nosort_${id}`,
    disabled: !sortable,
  })

  const style: React.CSSProperties = sortable
    ? {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }
    : {}

  return (
    <div ref={setNodeRef} style={style}>
      <Space align="center" style={{ gap: 'inherit' }}>
        {sortable && dragHandle && (
          <div {...attributes} {...listeners} style={{ touchAction: 'none', display: 'flex' }}>
            {dragHandle}
          </div>
        )}
        {children}
      </Space>
    </div>
  )
}
