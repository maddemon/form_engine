import React from 'react'

// 图标属性类型
export interface IconProps {
  size?: number
  color?: string
  strokeWidth?: number
}

// 创建图标组件的工厂函数
export function createIcon(path: React.ReactNode, viewBox: string = '0 0 24 24') {
  return ({ size = 16, color = 'currentColor', strokeWidth = 2 }: IconProps = {}) => (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {path}
    </svg>
  )
}

// 创建填充风格图标组件的工厂函数（fill 而非 stroke）
export function createFilledIcon(path: React.ReactNode, viewBox: string = '0 0 24 24') {
  return ({ size = 16, color = 'currentColor' }: IconProps = {}) => (
    <svg width={size} height={size} viewBox={viewBox} fill={color}>
      {path}
    </svg>
  )
}