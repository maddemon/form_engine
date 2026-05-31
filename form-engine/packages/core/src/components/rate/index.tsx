import React, { useState } from 'react'
import type { RateProps } from './types'
import { useStyle } from '../../styles/useStyle'

/**
 * HTML Rate 组件（默认实现）
 * Ant Design 风格 - 使用 SVG 星星
 */
export const Rate: React.FC<RateProps> = ({
  value,
  onChange,
  count = 5,
  allowHalf = false,
  disabled,
  style: propsStyle,
  className,
  id,
  ...rest
}) => {
  const [hoverValue, setHoverValue] = useState<number | undefined>(undefined)
  const { token } = useStyle()

  const displayValue = hoverValue ?? (typeof value === 'number' ? value : 0)

  const handleClick = (index: number, isHalf: boolean) => {
    if (disabled) return
    const newValue = isHalf ? index + 0.5 : index + 1
    onChange?.(newValue)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLSpanElement>, index: number) => {
    if (disabled) return
    if (allowHalf) {
      const rect = e.currentTarget.getBoundingClientRect()
      const isHalf = e.clientX - rect.left < rect.width / 2
      setHoverValue(isHalf ? index + 0.5 : index + 1)
    } else {
      setHoverValue(index + 1)
    }
  }

  const handleMouseLeave = () => {
    setHoverValue(undefined)
  }

  const starColor = token('rateStarColor') as string || '#f5a623'
  const defaultColor = token('borderSecondary') as string || '#d9d9d9'

  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    gap: '4px',
    ...propsStyle,
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? 'default' : 'pointer',
  }

  return (
    <div
      id={id}
      className={className}
      style={containerStyle}
      onMouseLeave={handleMouseLeave}
      {...rest}
    >
      {Array.from({ length: count }, (_, i) => {
        const starValue = i + 1
        const isFull = displayValue >= starValue
        const isHalf = allowHalf && displayValue >= i + 0.5 && displayValue < starValue

        return (
          <span
            key={i}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const isHalfClick = allowHalf && e.clientX - rect.left < rect.width / 2
              handleClick(i, isHalfClick)
            }}
            onMouseMove={(e) => handleMouseMove(e, i)}
            style={{
              fontSize: token('rateStarSize') as number || '20px',
              lineHeight: 1,
              transition: 'color 0.2s',
              color: isFull || isHalf ? starColor : defaultColor,
            }}
          >
            {/* 使用 SVG 渲染星星，更美观 */}
            <svg
              viewBox="0 0 20 20"
              style={{
                width: '1em',
                height: '1em',
                fill: 'currentColor',
                display: 'block',
              }}
            >
              {isHalf ? (
                // 半星
                <path d="M10 1L12.5 6.5L18.5 7.5L14 11.5L15.5 17.5L10 14.5L4.5 17.5L6 11.5L1.5 7.5L7.5 6.5Z" />
              ) : (
                // 全星
                <path d="M10 1L12.5 6.5L18.5 7.5L14 11.5L15.5 17.5L10 14.5L4.5 17.5L6 11.5L1.5 7.5L7.5 6.5Z" />
              )}
            </svg>
          </span>
        )
      })}
    </div>
  )
}
