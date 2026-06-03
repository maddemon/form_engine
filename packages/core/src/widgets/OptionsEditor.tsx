import React from 'react'
import { useStyle } from '../styles'
import { BASE_STYLE } from './shared'

export const WidgetOptionsEditor: React.FC<{
  value?: { label: string; value: string }[]
  onChange?: (v: { label: string; value: string }[]) => void
  disabled?: boolean
  style?: React.CSSProperties
}> = ({ value, onChange, disabled, style }) => {
  const { token } = useStyle()
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
        <div key={idx} style={{ display: 'flex', gap: token('spacingXs'), marginBottom: token('spacingXs'), alignItems: 'center' }}>
          <input type="text" value={opt.label} placeholder="标签" onChange={e => update(idx, { label: e.target.value })} disabled={disabled} style={{ ...BASE_STYLE, flex: 1, lineHeight: '18px' }} />
          <input type="text" value={opt.value} placeholder="值" onChange={e => update(idx, { value: e.target.value })} disabled={disabled} style={{ ...BASE_STYLE, flex: 1, lineHeight: '18px' }} />
          <button onClick={() => remove(idx)} disabled={disabled} style={{ border: 'none', background: 'none', color: token('error') as string, cursor: disabled ? 'not-allowed' : 'pointer', fontSize: token('fontSizeLg'), padding: `0 ${token('spacingXs')}` }}>×</button>
        </div>
      ))}
      <button onClick={add} disabled={disabled} style={{ ...BASE_STYLE, background: 'none', color: token('primary') as string, borderStyle: 'dashed', cursor: disabled ? 'not-allowed' : 'pointer' }}>
        + 添加选项
      </button>
    </div>
  )
}
