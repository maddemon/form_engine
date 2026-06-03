import React, { useState } from 'react'
import type { FieldRendererFn } from '@form-engine/core'

// antd-mobile 无 Segmented 组件，使用自定义实现
export const SegmentField: FieldRendererFn = (props: any) => {
  const { style } = props
  const options = props.options ?? []
  const defaultValue = props.defaultValue
  const disabled = props.disabled
  const block = props.block
  const onChange = props.onChange

  const [innerValue, setInnerValue] = useState<string | number | undefined>(defaultValue)
  const currentValue = props.value ?? innerValue

  const handleClick = (val: string | number) => {
    if (disabled) return
    setInnerValue(val)
    onChange?.(val)
  }

  return (
    <div style={{
      display: 'inline-flex',
      borderRadius: 8,
      background: '#f0f0f0',
      padding: 2,
      width: block ? '100%' : undefined,
      opacity: disabled ? 0.5 : 1,
      ...style,
    }}>
      {options.map((opt: any) => {
        const active = currentValue === opt.value
        const optDisabled = disabled || opt.disabled
        return (
          <button
            key={opt.value}
            type="button"
            disabled={optDisabled}
            onClick={() => !optDisabled && handleClick(opt.value)}
            style={{
              flex: 1,
              padding: '4px 12px',
              border: 'none',
              borderRadius: 6,
              background: active ? '#fff' : 'transparent',
              color: active ? '#333' : '#999',
              fontWeight: active ? 500 : 400,
              fontSize: 13,
              cursor: optDisabled ? 'not-allowed' : 'pointer',
              boxShadow: active ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
              transition: 'background 0.2s, box-shadow 0.2s',
              outline: 'none',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
