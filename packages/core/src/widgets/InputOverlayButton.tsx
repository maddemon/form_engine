import React, { useState } from 'react'
import { useStyle } from '../styles'

/** 输入框内绝对定位覆盖层按钮（如清除按钮、表达式按钮）。
 *  包裹层 `pointer-events: none`，仅内层按钮 `pointer-events: auto`，
 *  避免绝对定位区域遮挡下层元素的事件。
 *
 *  默认色彩方案：tertiary 色 → hover 时 secondary 色 + bg-secondary 背景，
 *  可通过 style 覆盖 color 等属性。 */
export const InputOverlayButton: React.FC<{
  onClick: (e: React.MouseEvent) => void
  onMouseDown?: (e: React.MouseEvent) => void
  disabled?: boolean
  title?: string
  children: React.ReactNode
  style?: React.CSSProperties
}> = ({ onClick, onMouseDown, disabled, title, children, style }) => {
  const [hovered, setHovered] = useState(false)
  const { token } = useStyle()

  return (
    <div
      style={{
        position: 'absolute',
        right: 1,
        top: '50%',
        transform: 'translateY(-50%)',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      <span
        role="button"
        aria-label={title}
        onClick={onClick}
        onMouseDown={onMouseDown}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: token('inputActionSize') as string,
          height: token('inputActionSize') as string,
          lineHeight: 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          color: hovered ? 'var(--fe-text-secondary)' : 'var(--fe-text-tertiary)',
          background: hovered ? 'var(--fe-bg-secondary)' : 'transparent',
          borderRadius: 'var(--fe-border-radius-sm)',
          pointerEvents: 'auto',
          transition: 'color 0.2s, background 0.2s',
          ...style,
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {children}
      </span>
    </div>
  )
}
