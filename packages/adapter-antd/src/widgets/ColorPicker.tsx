import { BgColorsOutlined } from '@ant-design/icons'
import { ColorPicker as AntdColorPicker, Input as AntdInput, Button, Space } from 'antd'
import React from 'react'

export const ColorPicker: React.FC<{
  value?: string
  onChange?: (v: string) => void
  placeholder?: string
  disabled?: boolean
  allowClear?: boolean
  style?: React.CSSProperties
}> = ({ value, onChange, placeholder, disabled, allowClear, style }) => {
  const [draft, setDraft] = React.useState<string | null>(null)
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const displayValue = draft ?? value ?? ''

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setDraft(v)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setDraft(null)
      onChange?.(v)
    }, 300)
  }

  const handleColorPickerChange = (_: unknown, hex: string) => {
    setDraft(null)
    if (timerRef.current) clearTimeout(timerRef.current)
    onChange?.(hex)
  }

  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <Space.Compact style={{ width: '100%', ...style }}>
      <AntdInput
        value={displayValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        disabled={disabled}
        allowClear={allowClear}
        size="small"
        style={{ flex: 1, minWidth: 60, fontFamily: 'monospace' }}
      />
      <AntdColorPicker
        value={displayValue || undefined}
        onChange={handleColorPickerChange}
        disabled={disabled}
        size="small"
      >
        <Button
          type="primary"
          size="small"
          style={displayValue ? { backgroundColor: displayValue, borderColor: displayValue } : undefined}
          onClick={() => {
            setDraft(null)
            onChange?.('')
          }}
        >
          <BgColorsOutlined />
        </Button>
      </AntdColorPicker>
    </Space.Compact>
  )
}
