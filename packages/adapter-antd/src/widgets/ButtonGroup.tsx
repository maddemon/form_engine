/**
 * ButtonGroup - PropertyPanel 用
 *
 * 使用 antd Space.Compact + Button 渲染分段按钮组，对齐 antd 风格。
 * - size="small" 与 PropertyPanel 其他小组件一致
 * - 当前选中项用 type="primary" 标识
 */
import { Button, Space } from 'antd'
import React from 'react'
import type { DesignerWidgets } from '@form-engine/core'

type ButtonGroupOption = { label: string; value: string }

export const ButtonGroup: React.FC<DesignerWidgets['ButtonGroup']> = ({ value, onChange, options, disabled, style }) => (
  <Space.Compact size="small" style={style}>
    {(options as ButtonGroupOption[])?.map((opt) => {
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
