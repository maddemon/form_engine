import React from 'react'
import { Cascader as AntdCascader } from 'antd'
import type { CascaderProps } from '@form-engine/core'

/**
 * Antd Cascader 组件
 */
export const Cascader: React.FC<CascaderProps> = ({
  value,
  onChange,
  options = [],
  placeholder,
  allowClear = true,
  showSearch = false,
  expandTrigger = 'click',
  style,
  className,
  id,
  ...rest
}) => {
  const handleChange = (val: (string | number)[]) => {
    onChange?.(val as string[])
  }

  return (
    <AntdCascader
      value={value as (string | number)[] | undefined}
      onChange={handleChange}
      options={options as any}
      placeholder={placeholder}
      allowClear={allowClear}
      showSearch={showSearch ? { filter: (inputValue: string, path: any[]) => path.some((option: any) => String(option.label).toLowerCase().includes(inputValue.toLowerCase())) } : undefined}
      changeOnSelect={expandTrigger === 'hover'}
      style={{ width: '100%', ...style }}
      className={className}
      id={id}
      {...rest}
    />
  )
}