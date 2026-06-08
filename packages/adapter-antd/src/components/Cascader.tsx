import type { CascaderProps } from '@form-engine/core'
import { Cascader as AntdCascader } from 'antd'
import { useLocale } from '@form-engine/core/locale'
import React from 'react'

/**
 * Antd Cascader 组件
 */
export const Cascader: React.FC<CascaderProps> = ({
  value,
  onChange,
  options = [],
  placeholder: placeholderProp,
  allowClear,
  showSearch = false,
  expandTrigger = 'click',
  style,

  ...rest
}) => {
  const { locale } = useLocale()
  const placeholder = placeholderProp ?? locale.adapter.common.placeholder.select ?? 'Please select'
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
      showSearch={
        showSearch
          ? {
              filter: (inputValue: string, path: any[]) =>
                path.some((option: any) => String(option.label).toLowerCase().includes(inputValue.toLowerCase())),
            }
          : undefined
      }
      changeOnSelect={expandTrigger === 'hover'}
      style={{ width: '100%', ...style }}
      {...rest}
    />
  )
}
