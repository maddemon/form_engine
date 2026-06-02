import React from 'react'
import { useStyle } from '../styles'
import type { OptionItem } from '../types/schema'

interface FieldItemProps {
  label: string
  children: React.ReactNode
  variant?: 'row' | 'group'
  tooltip?: string
  style?: React.CSSProperties
}

export const FieldItem: React.FC<FieldItemProps> = ({ label, children, variant = 'row', tooltip, style }) => {
  const { token } = useStyle()

  const labelNode = (
    <>
      {label}
      {tooltip && (
        <span title={tooltip} style={{ marginLeft: 'var(--fe-spacing-xs, 4px)', cursor: 'help', color: token('textTertiary') as string }}>?</span>
      )}
    </>
  )

  if (variant === 'group') {
    return (
      <label style={{ display: 'block', marginBottom: token('spacingSm'), fontSize: token('fontSizeSm') }}>
        {labelNode}
        <div style={{ marginTop: token('spacingXs') }}>{children}</div>
      </label>
    )
  }

  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: token('spacingSm'), marginBottom: token('spacingSm'), fontSize: token('fontSizeSm'), ...style }}>
      <span style={{ whiteSpace: 'nowrap', flexShrink: 0, minWidth: 80 }}>{labelNode}</span>
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </label>
  )
}

export const OptionRender: React.FC<{
  value?: OptionItem[]
  onChange?: (v: OptionItem[]) => void
}> = ({ value, onChange }) => {
  const options = value || []
  const { token } = useStyle()

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
        <div key={idx} style={{ display: 'flex', gap: token('spacingXs'), marginBottom: token('spacingXs'), alignItems: 'center' }}>
          <input value={opt.label} onChange={(e) => handleChange(idx, 'label', e.target.value)} placeholder="标签" style={{ flex: 1, padding: '2px 6px', border: '1px solid var(--fe-border-primary)', borderRadius: 'var(--fe-border-radius-sm)', fontSize: token('fontSizeSm') }} />
          <input value={opt.value as string} onChange={(e) => handleChange(idx, 'value', e.target.value)} placeholder="值" style={{ flex: 1, padding: '2px 6px', border: '1px solid var(--fe-border-primary)', borderRadius: 'var(--fe-border-radius-sm)', fontSize: token('fontSizeSm') }} />
          <button
            onClick={() => handleRemove(idx)}
            style={{
              padding: '2px 6px',
              border: '1px solid var(--fe-error)',
              borderRadius: 'var(--fe-border-radius-sm)',
              background: 'var(--fe-bg-primary)',
              color: 'var(--fe-error)',
              cursor: 'pointer',
              fontSize: token('fontSizeSm'),
            }}
          >
            ✕
          </button>
        </div>
      ))}
      <button
        onClick={handleAdd}
        style={{
          padding: '4px 8px',
          border: '1px dashed var(--fe-border-primary)',
          borderRadius: 'var(--fe-border-radius-sm)',
          background: 'var(--fe-bg-primary)',
          cursor: 'pointer',
          fontSize: token('fontSizeSm'),
          width: '100%',
        }}
      >
        + 添加选项
      </button>
    </div>
  )
}
