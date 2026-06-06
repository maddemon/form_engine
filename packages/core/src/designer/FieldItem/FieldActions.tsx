import React from 'react'
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
        size="sm"
        onClick={(e: React.MouseEvent) => { e.stopPropagation(); onCopy() }}
        label="复制"
        style={{ color: 'var(--fe-primary)', fontSize: token('widgetFieldHandleFontSize') as string, padding: '2px var(--fe-spacing-xs)', userSelect: 'none' }}
      >
        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      </WidgetButton>
      <WidgetButton
        type="text"
        size="sm"
        onClick={(e: React.MouseEvent) => { e.stopPropagation(); onRemove() }}
        label="删除"
        style={{ color: 'var(--fe-error)', fontSize: token('widgetFieldHandleFontSize') as string, padding: '2px var(--fe-spacing-xs)', userSelect: 'none' }}
      >
        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      </WidgetButton>
    </div>
  )
}
