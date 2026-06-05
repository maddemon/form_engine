import { ColorPicker as AntdColorPicker, Input as AntdInput, Space } from 'antd'
import React from 'react'

export const ColorPicker: React.FC<{
  value?: string
  onChange?: (v: string) => void
  placeholder?: string
  disabled?: boolean
  allowClear?: boolean
  style?: React.CSSProperties
}> = ({ value, onChange, placeholder, disabled, allowClear, style }) => {
  const [localValue, setLocalValue] = React.useState(value ?? '')
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    setLocalValue(value ?? '')
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setLocalValue(v)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => onChange?.(v), 300)
  }

  const handleColorPickerChange = (_: unknown, hex: string) => {
    setLocalValue(hex)
    if (timerRef.current) clearTimeout(timerRef.current)
    onChange?.(hex)
  }

  React.useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  return (
    <Space.Compact style={{ width: '100%', ...style }}>
      <AntdInput
        value={localValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        disabled={disabled}
        allowClear={allowClear}
        size="small"
        style={{ flex: 1, minWidth: 60, fontFamily: 'monospace' }}
      />
      <AntdColorPicker
        value={localValue || undefined}
        onChange={handleColorPickerChange}
        disabled={disabled}
        size="small"
      >
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: 4,
            border: '1px solid #d9d9d9',
            background: localValue || '#fff',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        />
      </AntdColorPicker>
    </Space.Compact>
  )
}
