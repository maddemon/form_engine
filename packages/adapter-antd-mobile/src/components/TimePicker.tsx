import { Button, Picker } from 'antd-mobile'
import type { FieldComponentProps, FieldRendererFn } from '@form-engine/core'

export const TimeField: FieldRendererFn = (props: FieldComponentProps) => {
  const { value, onChange, disabled, fieldSchema } = props
  const placeholder = fieldSchema.placeholder || '请选择时间'

  const timeOptions: { label: string; value: string }[] = []
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const label = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      timeOptions.push({ label, value: label })
    }
  }

  return (
    <Picker
      columns={[timeOptions]}
      value={value ? [String(value)] : []}
      onConfirm={vals => onChange?.(vals[0])}
      disabled={disabled}
    >
      {(vals: any, actions: any) => (
        <Button
          onClick={actions.open}
          disabled={disabled}
          style={{ width: '100%', textAlign: 'left', color: value ? undefined : '#999' }}
        >
          {value || placeholder}
        </Button>
      )}
    </Picker>
  )
}
