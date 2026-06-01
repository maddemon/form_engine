import React from 'react'
import { BASE_STYLE } from './shared'

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
          <input type="text" value={opt.label} placeholder="标签" onChange={e => update(idx, { label: e.target.value })} disabled={disabled} style={{ ...BASE_STYLE, flex: 1 }} />
          <input type="text" value={opt.value} placeholder="值" onChange={e => update(idx, { value: e.target.value })} disabled={disabled} style={{ ...BASE_STYLE, flex: 1 }} />
          <button onClick={() => remove(idx)} disabled={disabled} style={{ border: 'none', background: 'none', color: '#ff4d4f', cursor: disabled ? 'not-allowed' : 'pointer', fontSize: 16, padding: '0 4px' }}>×</button>
        </div>
      ))}
      <button onClick={add} disabled={disabled} style={{ ...BASE_STYLE, background: 'none', color: '#1677ff', borderStyle: 'dashed', cursor: disabled ? 'not-allowed' : 'pointer' }}>
        + 添加选项
      </button>
    </div>
  )
}
