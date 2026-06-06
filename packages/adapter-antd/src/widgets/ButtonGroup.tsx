/**
 * ButtonGroup - PropertyPanel 用
 *
 * 使用 antd Space.Compact + Button 渲染分段按钮组，对齐 antd 风格。
 * - size="small" 与 PropertyPanel 其他小组件一致
 * - 当前选中项用 type="primary" 标识
 */
import { Button, Space } from 'antd'
import React from 'react'

type ButtonGroupOption = { label: string; value: string }

interface ButtonGroupProps {
  value?: string
  onChange?: (v: string) => void
  options: ButtonGroupOption[]
  disabled?: boolean
  style?: React.CSSProperties
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({ value, onChange, options, disabled, style }) => (
  <Space.Compact size="small" style={style}>
    {options?.map((opt) => {
      const active = value === opt.value
      return (
        <Button
          key={opt.value}
          type={active ? 'primary' : 'default'}
          disabled={disabled}
          onClick={() => !disabled && onChange?.(opt.value)}
        >
          {opt.label}
        </Button>
      )
    })}
  </Space.Compact>
)
