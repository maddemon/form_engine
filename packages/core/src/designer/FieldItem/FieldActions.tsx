import React from 'react'
import { Copy, Trash } from '../../components/icons'
import { useStyle } from '../../styles'
import { WidgetButton } from '../../widgets/Button'
import type { FieldActionsProps } from './types'

/** 操作按钮：复制 / 删除，hover 或选中时显示在右上角 */
export const FieldActions: React.FC<FieldActionsProps> = ({ fieldId, onCopy, onRemove }) => {
  const { token } = useStyle()

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        zIndex: 30,
        background: 'transparent',
        borderRadius: '0 var(--fe-border-radius-sm) 0 var(--fe-border-radius-sm)',
        padding: '2px var(--fe-spacing-xs)',
        lineHeight: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--fe-spacing-xs)',
      }}
    >
      <WidgetButton
        type="text"
        color="primary"
        size="sm"
        onClick={(e: React.MouseEvent) => { e.stopPropagation(); onCopy() }}
        label="复制"
        style={{ fontSize: token('widgetFieldHandleFontSize') as string, padding: '2px var(--fe-spacing-xs)', userSelect: 'none' }}
      >
        <Copy size={12} strokeWidth={2.5} />
      </WidgetButton>
      <WidgetButton
        type="text"
        color="danger"
        size="sm"
        onClick={(e: React.MouseEvent) => { e.stopPropagation(); onRemove() }}
        label="删除"
        style={{ fontSize: token('widgetFieldHandleFontSize') as string, padding: '2px var(--fe-spacing-xs)', userSelect: 'none' }}
      >
        <Trash size={12} strokeWidth={2.5} />
      </WidgetButton>
    </div>
  )
}
