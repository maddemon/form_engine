import React from 'react'
import type { DesignerWidgets } from '../types/adapter'

// ========================
// 基础样式常量
// ========================
const BASE_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '3px 8px',
  borderRadius: 4,
  border: '1px solid #d9d9d9',
  fontSize: 12,
  lineHeight: '20px',
  outline: 'none',
  boxSizing: 'border-box',
  background: '#fff',
}

const FOCUS_STYLE: React.CSSProperties = {
  borderColor: '#1677ff',
  boxShadow: '0 0 0 2px rgba(22,119,255,0.1)',
}

// ========================
// Input 文本输入框
// ========================
export const WidgetInput: React.FC<{
  value?: string | number
  onChange?: (v: string | number) => void
  placeholder?: string
  disabled?: boolean
  style?: React.CSSProperties
}> = ({ value, onChange, placeholder, disabled, style }) => {
  const [focused, setFocused] = React.useState(false)
  return (
    <input
      type="text"
      value={value ?? ''}
      onChange={e => onChange?.(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...BASE_STYLE,
        ...(focused ? FOCUS_STYLE : {}),
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'text',
        ...style,
      }}
    />
  )
}

// ========================
// Select 下拉选择
// ========================
export const WidgetSelect: React.FC<{
  value?: string
  onChange?: (v: string) => void
  options: { label: string; value: string }[]
  disabled?: boolean
  style?: React.CSSProperties
}> = ({ value, onChange, options, disabled, style }) => {
  const [focused, setFocused] = React.useState(false)
  return (
    <select
      value={value ?? ''}
      onChange={e => onChange?.(e.target.value)}
      disabled={disabled}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...BASE_STYLE,
        appearance: 'auto',
        ...(focused ? FOCUS_STYLE : {}),
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style,
      }}
    >
      {!value && (
        <option value="" disabled>
          请选择
        </option>
      )}
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

// ========================
// Checkbox 勾选框
// ========================
export const WidgetCheckbox: React.FC<{
  checked?: boolean
  onChange?: (v: boolean) => void
  disabled?: boolean
  style?: React.CSSProperties
}> = ({ checked, onChange, disabled, style }) => (
  <label
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      fontSize: 12,
      ...style,
    }}
  >
    <input
      type="checkbox"
      checked={!!checked}
      onChange={e => onChange?.(e.target.checked)}
      disabled={disabled}
      style={{ margin: 0, cursor: disabled ? 'not-allowed' : 'pointer' }}
    />
    <span>{checked ? '是' : '否'}</span>
  </label>
)

// ========================
// NumberInput 数字输入框
// ========================
export const WidgetNumberInput: React.FC<{
  value?: number
  onChange?: (v: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  style?: React.CSSProperties
}> = ({ value, onChange, min, max, step = 1, disabled, style }) => {
  const [focused, setFocused] = React.useState(false)
  return (
    <input
      type="number"
      value={value ?? ''}
      onChange={e => onChange?.(Number(e.target.value))}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...BASE_STYLE,
        ...(focused ? FOCUS_STYLE : {}),
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'text',
        ...style,
      }}
    />
  )
}

// ========================
// TextArea 多行文本
// ========================
export const WidgetTextArea: React.FC<{
  value?: string
  onChange?: (v: string) => void
  placeholder?: string
  disabled?: boolean
  rows?: number
  style?: React.CSSProperties
}> = ({ value, onChange, placeholder, disabled, rows = 3, style }) => {
  const [focused, setFocused] = React.useState(false)
  return (
    <textarea
      value={value ?? ''}
      onChange={e => onChange?.(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      rows={rows}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...BASE_STYLE,
        resize: 'vertical',
        minHeight: 48,
        ...(focused ? FOCUS_STYLE : {}),
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'text',
        ...style,
      }}
    />
  )
}

// ========================
// Switch 开关（用 checkbox 模拟）
// ========================
export const WidgetSwitch: React.FC<{
  checked?: boolean
  onChange?: (v: boolean) => void
  disabled?: boolean
  style?: React.CSSProperties
}> = ({ checked, onChange, disabled, style }) => {
  const trackColor = checked ? '#1677ff' : '#ccc'
  return (
    <div
      onClick={() => !disabled && onChange?.(!checked)}
      style={{
        display: 'inline-block',
        width: 36,
        height: 20,
        borderRadius: 10,
        background: trackColor,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background 0.2s',
        position: 'relative',
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 2,
          left: checked ? 18 : 2,
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: '#fff',
          transition: 'left 0.2s',
          boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
        }}
      />
    </div>
  )
}

// ========================
// Button 按钮
// ========================
export const WidgetButton: React.FC<{
  children?: React.ReactNode
  onClick?: () => void
  type?: 'default' | 'primary' | 'danger' | 'dashed'
  disabled?: boolean
  style?: React.CSSProperties
}> = ({ children, onClick, type = 'default', disabled, style }) => {
  const base: React.CSSProperties = {
    padding: '3px 12px',
    borderRadius: 4,
    border: '1px solid #d9d9d9',
    fontSize: 12,
    lineHeight: '20px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    background: '#fff',
    ...style,
  }

  if (type === 'primary') {
    base.background = '#1677ff'
    base.color = '#fff'
    base.borderColor = '#1677ff'
  } else if (type === 'danger') {
    base.color = '#ff4d4f'
    base.borderColor = '#ff4d4f'
  } else if (type === 'dashed') {
    base.borderStyle = 'dashed'
  }

  return (
    <button onClick={onClick} disabled={disabled} style={base}>
      {children}
    </button>
  )
}

// ========================
// OptionsEditor 选项编辑器（用于 select/radio/checkbox 的 options 编辑）
// ========================
export const WidgetOptionsEditor: React.FC<{
  value?: { label: string; value: string }[]
  onChange?: (v: { label: string; value: string }[]) => void
  disabled?: boolean
  style?: React.CSSProperties
}> = ({ value, onChange, disabled, style }) => {
  const options = value || []

  const update = (idx: number, patch: Partial<{ label: string; value: string }>) => {
    const next = options.map((o, i) => (i === idx ? { ...o, ...patch } : o))
    onChange?.(next)
  }

  const add = () => {
    const next = [...options, { label: `选项${options.length + 1}`, value: `option_${options.length + 1}` }]
    onChange?.(next)
  }

  const remove = (idx: number) => {
    onChange?.(options.filter((_, i) => i !== idx))
  }

  return (
    <div style={{ ...style }}>
      {options.map((opt, idx) => (
        <div key={idx} style={{ display: 'flex', gap: 4, marginBottom: 4, alignItems: 'center' }}>
          <input
            type="text"
            value={opt.label}
            placeholder="标签"
            onChange={e => update(idx, { label: e.target.value })}
            disabled={disabled}
            style={{ ...BASE_STYLE, flex: 1 }}
          />
          <input
            type="text"
            value={opt.value}
            placeholder="值"
            onChange={e => update(idx, { value: e.target.value })}
            disabled={disabled}
            style={{ ...BASE_STYLE, flex: 1 }}
          />
          <button
            onClick={() => remove(idx)}
            disabled={disabled}
            style={{
              border: 'none',
              background: 'none',
              color: '#ff4d4f',
              cursor: disabled ? 'not-allowed' : 'pointer',
              fontSize: 16,
              padding: '0 4px',
            }}
          >
            ×
          </button>
        </div>
      ))}
      <button
        onClick={add}
        disabled={disabled}
        style={{
          ...BASE_STYLE,
          background: 'none',
          color: '#1677ff',
          borderStyle: 'dashed',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        + 添加选项
      </button>
    </div>
  )
}

// ========================
// 导出默认 widgets 集合（符合 DesignerWidgets 接口）
// ========================
export const defaultDesignerWidgets: DesignerWidgets = {
  Input: WidgetInput,
  Select: WidgetSelect,
  Checkbox: WidgetCheckbox,
  NumberInput: WidgetNumberInput,
  TextArea: WidgetTextArea,
  Switch: WidgetSwitch,
  Button: WidgetButton,
  OptionsEditor: WidgetOptionsEditor,
}
