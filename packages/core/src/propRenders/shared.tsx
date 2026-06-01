import React from 'react'
import type { OptionItem } from '../types/schema'

export const FieldGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label style={{ display: 'block', marginBottom: 8, fontSize: 12 }}>
    {label}
    <div style={{ marginTop: 2 }}>{children}</div>
  </label>
)

export const InlineField: React.FC<{ label: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ label, children, style }) => (
  <label style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4, fontSize: 12, ...style }}>
    {children}
    <span style={{ minWidth: 64 }}>{label}</span>
  </label>
)

export const RowField: React.FC<{ label: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ label, children, style }) => (
  <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 12, ...style }}>
    <span style={{ whiteSpace: 'nowrap', flexShrink: 0, minWidth: 64 }}>{label}</span>
    <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
  </label>
)

export const OptionRender: React.FC<{
  value?: OptionItem[]
  onChange?: (v: OptionItem[]) => void
}> = ({ value, onChange }) => {
  const options = value || []

  const handleAdd = () => {
    const idx = options.length
    onChange?.([...options, { label: `选项${idx + 1}`, value: `option_${idx + 1}` }])
  }

  const handleRemove = (idx: number) => {
    onChange?.(options.filter((_, i) => i !== idx))
  }

  const handleChange = (idx: number, key: 'label' | 'value', val: string) => {
    const next = options.map((o, i) => (i === idx ? { ...o, [key]: val } : o))
    onChange?.(next)
  }

  return (
    <div>
      {options.map((opt, idx) => (
        <div key={idx} style={{ display: 'flex', gap: 4, marginBottom: 4, alignItems: 'center' }}>
          <input value={opt.label} onChange={(e) => handleChange(idx, 'label', e.target.value)} placeholder="标签" style={{ flex: 1, padding: '2px 6px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 12 }} />
          <input value={opt.value as string} onChange={(e) => handleChange(idx, 'value', e.target.value)} placeholder="值" style={{ flex: 1, padding: '2px 6px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 12 }} />
          <button onClick={() => handleRemove(idx)} style={{ padding: '2px 6px', border: '1px solid #ff4d4f', borderRadius: 4, background: '#fff', color: '#ff4d4f', cursor: 'pointer', fontSize: 12 }}>
            ✕
          </button>
        </div>
      ))}
      <button onClick={handleAdd} style={{ padding: '4px 8px', border: '1px dashed #d9d9d9', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 12, width: '100%' }}>
        + 添加选项
      </button>
    </div>
  )
}
