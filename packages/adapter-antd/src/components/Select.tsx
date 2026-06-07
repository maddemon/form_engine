import type { SelectProps } from '@form-engine/core'
import { Select as AntdSelect } from 'antd'
import React from 'react'

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
  const handleChange = (val?: string | string[] | null) => {
    onChange?.(val)
  }

  return (
    <AntdSelect
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      mode={mode}
      showSearch={
        showSearch
          ? {
              optionFilterProp: 'label',
              filterOption,
              onSearch,
            }
          : false
      }
      allowClear={allowClear}
      maxTagCount={maxTagCount}
      placement={placement}
      notFoundContent={notFoundContent}
      style={{ width: '100%', ...style }}
      className={className}
      id={id}
      {...rest}
      options={options}
    />
  )
}
