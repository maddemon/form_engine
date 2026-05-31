import React from 'react'
import { Select as AntdSelect } from 'antd'
import type { SelectProps, OptionItem } from '../../../types/component-props'

/**
 * Antd Select 组件
 * 实现标准 SelectProps 接口
 */
export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options = [],
  placeholder,
  disabled,
  mode,
  showSearch,
  filterOption,
  allowClear,
  maxTagCount,
  placement,
  onSearch,
  notFoundContent,
  style,
  className,
  id,
  ...rest
}) => {
  const handleChange = (val: string | string[]) => {
    onChange?.(val)
  }
  
  const selectProps = {
    value: value as any || undefined,
    onChange: handleChange,
    placeholder,
    disabled,
    mode: mode === 'multiple' ? 'multiple' : mode === 'tags' ? 'tags' : undefined,
    showSearch,
    filterOption,
    allowClear,
    maxTagCount,
    placement,
    onSearch,
    notFoundContent,
    style: { width: '100%', ...style },
    className,
    id,
    ...rest
  }
  
  return (
    <AntdSelect
      {...selectProps}
    >
      {options.map(opt => (
        <AntdSelect.Option key={String(opt.value)} value={String(opt.value)} disabled={opt.disabled}>
          {opt.label}
        </AntdSelect.Option>
      ))}
    </AntdSelect>
  )
}
