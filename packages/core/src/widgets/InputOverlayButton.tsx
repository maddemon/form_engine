import React from 'react'
import { WidgetButton } from './Button'

/** 输入框内绝对定位覆盖层按钮（如清除按钮、表达式按钮）。
 *  包裹层 `pointer-events: none`，仅内层按钮 `pointer-events: auto`，
 *  避免绝对定位区域遮挡下层元素的事件。 */
export const InputOverlayButton: React.FC<{
  onClick: (e: React.MouseEvent) => void
  disabled?: boolean
  title?: string
  children: React.ReactNode
  style?: React.CSSProperties
}> = ({ onClick, disabled, title, children, style }) => {
  return (
    <div
      style={{
        position: 'absolute',
        right: 1,
        top: '50%',
        transform: 'translateY(-50%)',
        pointerEvents: 'none',
        ...style,
      }}
    >
      <WidgetButton
        type="text"
        size="sm"
        onClick={onClick}
        disabled={disabled}
        label={title}
        style={{ padding: '0 4px', lineHeight: 1, pointerEvents: 'auto' }}
      >
        {children}
      </WidgetButton>
    </div>
  )
}