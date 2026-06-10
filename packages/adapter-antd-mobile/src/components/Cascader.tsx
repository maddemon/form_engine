import type { OptionItem } from '@form-engine/core'
import { CascaderProps } from '@form-engine/core'
import { Cascader as AntmCascader, Space } from 'antd-mobile'
import { CloseCircleFill, DownOutline } from 'antd-mobile-icons'
import React from 'react'
import { toCascaderOptions } from '../utils'

export const Cascader: React.FC<CascaderProps> = ({
  value,
  onChange,
  disabled,
  options = [],
  allowClear,
  placeholder: placeholderProp = '请选择',
  style,
  className,
}) => {
  const cascaderOptions = toCascaderOptions((options || []) as OptionItem[])
  const valArr = value ? (Array.isArray(value) ? (value as string[]).map(String) : [String(value)]) : []
  const hasValue = valArr.length > 0

  return (
    <AntmCascader options={cascaderOptions} value={valArr} onConfirm={(vals) => onChange?.(vals)}>
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
        >
          <span>{hasValue ? vals.map((v: any) => v?.label ?? v ?? '').join(' / ') : placeholderProp}</span>
          {hasValue && allowClear ? (
            <CloseCircleFill
              style={{ fontSize: 16, flexShrink: 0 }}
              onClick={(e) => {
                e.stopPropagation()
                onChange?.([])
              }}
            />
          ) : (
            <DownOutline style={{ fontSize: 16, flexShrink: 0 }} />
          )}
        </Space>
      )}
    </AntmCascader>
  )
}
