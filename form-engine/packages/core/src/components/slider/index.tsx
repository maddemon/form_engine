import React, { useState, useRef } from 'react'
import type { SliderProps } from './types'
import { useStyle } from '../../styles/useStyle'

/**
 * HTML Slider 组件（默认实现）
 * Ant Design 风格
 */
export const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  style: propsStyle,
  className,
  id,
  ...rest
}) => {
  const [focused, setFocused] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)
  const { token } = useStyle()

  const currentValue = typeof value === 'number' ? value : min
  const percentage = ((currentValue - min) / (max - min)) * 100

  const handleChange = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return
    const track = trackRef.current
    if (!track) return

    const rect = track.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const newPercentage = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
    const newValue = min + (newPercentage / 100) * (max - min)

    // 对齐到 step
    const steppedValue = Math.round(newValue / step) * step
    const clampedValue = Math.max(min, Math.min(max, steppedValue))

    onChange?.(clampedValue)
  }

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: token('spacingMd') as number,
    width: '100%',
    ...propsStyle,
  }

  const trackStyle: React.CSSProperties = {
    flex: 1,
    height: '4px',
    background: token('borderSecondary') as string,
    borderRadius: '2px',
    position: 'relative',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  }

  const fillStyle: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    width: `${percentage}%`,
    background: disabled ? token('textQuaternary') as string : token('primary') as string,
    borderRadius: '2px',
    transition: focused ? 'none' : 'width 0.2s',
  }

  const thumbStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${percentage}%`,
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: '14px',
    height: '14px',
    background: token('bgPrimary') as string,
    border: `2px solid ${disabled ? token('textQuaternary') as string : token('primary') as string}`,
    borderRadius: '50%',
    boxShadow: focused ? token('inputFocusBoxShadow') as string : '0 2px 4px rgba(0,0,0,0.1)',
    cursor: disabled ? 'not-allowed' : 'grab',
    transition: focused ? 'none' : 'box-shadow 0.2s',
  }

  const valueStyle: React.CSSProperties = {
    fontSize: token('fontSizeMd') as number,
    fontWeight: token('fontWeightSemibold') as number,
    color: token('textPrimary') as string,
    minWidth: '40px',
    textAlign: 'center',
  }

  return (
    <div
      id={id}
      className={className}
      style={containerStyle}
      {...rest}
    >
      <span style={{ fontSize: '12px', color: token('textTertiary') as string }}>{min}</span>
      <div
        ref={trackRef}
        style={trackStyle}
        onMouseDown={handleChange}
        onTouchStart={handleChange}
      >
        <div style={fillStyle} />
        <div
          style={thumbStyle}
          onMouseDown={(e) => {
            e.preventDefault()
            setFocused(true)
          }}
          onMouseUp={() => setFocused(false)}
          onTouchStart={() => setFocused(true)}
          onTouchEnd={() => setFocused(false)}
        />
      </div>
      <span style={{ fontSize: '12px', color: token('textTertiary') as string }}>{max}</span>
      <span style={valueStyle}>{currentValue}</span>
    </div>
  )
}
