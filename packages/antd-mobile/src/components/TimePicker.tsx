import { TimePickerProps } from '@form-engine/core'
import { Picker, Space } from 'antd-mobile'
import { ClockCircleOutline, CloseCircleFill } from 'antd-mobile-icons'
import React from 'react'

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  disabled,
  placeholder: placeholderProp = '请选择时间',
  allowClear,
  _format = 'HH:mm',
  style,
  className,
  id,
}) => {
  const hasValue = !!value

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
      onConfirm={(vals) => onChange?.(vals[0])}
    >
      {(vals: any, actions: any) => (
        <Space
          block
          justify="between"
          align="center"
          onClick={disabled ? undefined : actions.open}
          style={{
            color: hasValue ? undefined : 'var(--adm-color-weak)',
            cursor: disabled ? 'default' : 'pointer',
            ...style,
          }}
          className={className}
          id={id}
        >
          <span>
            {value || placeholderProp}
          </span>
          {hasValue && allowClear ? (
            <CloseCircleFill
              style={{ fontSize: 16, flexShrink: 0 }}
              onClick={(e) => {
                e.stopPropagation()
                onChange?.(undefined)
              }}
            />
          ) : (
            <ClockCircleOutline style={{ fontSize: 16, flexShrink: 0 }} />
          )}
        </Space>
      )}
    </Picker>
  )
}
