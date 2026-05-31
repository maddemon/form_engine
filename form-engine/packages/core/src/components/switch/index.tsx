import React from 'react'
import type { SwitchProps } from './types'
import { useStyle } from '../../styles/useStyle'

/**
 * HTML Switch 组件（默认实现）
 * Ant Design 风格
 */
export const Switch: React.FC<SwitchProps> = ({
  value,
  onChange,
  disabled,
  checkedChildren,
  unCheckedChildren,
  style: propsStyle,
  className,
  id,
  ...rest
}) => {
  const { token } = useStyle()

  const handleToggle = () => {
    if (!disabled) {
      onChange?.(!value)
    }
  }

  const switchWidth = 44
  const switchHeight = 22
  const handleSize = 18

  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    ...propsStyle,
  }

  const switchStyle: React.CSSProperties = {
    position: 'relative',
    width: switchWidth,
    height: switchHeight,
    borderRadius: switchHeight / 2,
    background: value ? token('primary') as string : token('switchBg') as string,
    transition: `background-color 0.2s, border-color 0.2s`,
    border: 'none',
    padding: 0,
    outline: 'none',
    flexShrink: 0,
  }

  const handleStyle: React.CSSProperties = {
    position: 'absolute',
    top: '2px',
    left: value ? `${switchWidth - handleSize - 2}px` : '2px',
    width: handleSize,
    height: handleSize,
    borderRadius: '50%',
    background: '#fff',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    transition: 'left 0.2s ease-in-out',
  }

  const textStyle: React.CSSProperties = {
    fontSize: token('fontSizeSm') as number,
    lineHeight: `${switchHeight}px`,
    color: value ? token('textPrimary') as string : token('textSecondary') as string,
    marginLeft: '8px',
    userSelect: 'none',
  }

  return (
    <label style={containerStyle} className={className} onClick={handleToggle}>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        disabled={disabled}
        id={id}
        style={switchStyle}
        {...rest}
      >
        <span style={handleStyle} />
      </button>
      {(checkedChildren || unCheckedChildren) && (
        <span style={textStyle}>
          {value ? checkedChildren : unCheckedChildren}
        </span>
      )}
    </label>
  )
}
