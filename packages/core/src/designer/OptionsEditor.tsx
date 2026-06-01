import React from 'react'
import type { OptionItem } from '../types/schema'

export function renderOptionsEditor(
  value: unknown,
  onChange: (value: unknown) => void,
): React.ReactNode {
  const options = (value as OptionItem[] || []).map((opt, idx) => ({
    ...opt,
    __idx: idx,
  }))

  const updateOptions = (newOptions: typeof options) => {
    onChange(newOptions.map(({ __idx, ...rest }) => ({ ...rest })))
  }

  const handleAdd = () => {
    const idx = options.length
    updateOptions([
      ...options,
      { label: `选项${idx + 1}`, value: `option_${idx + 1}`, __idx: idx },
    ])
  }

  const handleRemove = (idx: number) => {
    updateOptions(options.filter((_, i) => i !== idx))
  }

  const handleChange = (idx: number, key: 'label' | 'value', val: string) => {
    const newOptions = [...options]
    newOptions[idx] = { ...newOptions[idx], [key]: val }
    updateOptions(newOptions)
  }

  return (
    <div>
      {options.map((opt, idx) => (
        <div key={idx} style={{ display: 'flex', gap: 4, marginBottom: 4, alignItems: 'center' }}>
          <input
            value={opt.label}
            onChange={(e) => handleChange(idx, 'label', e.target.value)}
            placeholder="标签"
            style={{ flex: 1, padding: '2px 6px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 12 }}
          />
          <input
            value={opt.value as string}
            onChange={(e) => handleChange(idx, 'value', e.target.value)}
            placeholder="值"
            style={{ flex: 1, padding: '2px 6px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 12 }}
          />
          <button
            onClick={() => handleRemove(idx)}
            style={{ padding: '2px 6px', border: '1px solid #ff4d4f', borderRadius: 4, background: '#fff', color: '#ff4d4f', cursor: 'pointer', fontSize: 12 }}
          >
            ✕
          </button>
        </div>
      ))}
      <button
        onClick={handleAdd}
        style={{ padding: '4px 8px', border: '1px dashed #d9d9d9', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 12, width: '100%' }}
      >
        + 添加选项
      </button>
    </div>
  )
}
