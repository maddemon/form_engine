import type { SelectProps } from '@form-engine/core'
import { Select as AntdSelect } from 'antd'
import { useLocale } from '@form-engine/core/locale'
import React from 'react'

/**
 * Antd Select 组件
 * 实现标准 SelectProps 接口
 */
export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options = [],
  placeholder: placeholderProp,
  disabled,
  mode,
  showSearch,
  filterOption,
  allowClear,
  maxTagCount,
  placement,
  onSearch,
  notFoundContent: notFoundContentProp,
  defaultValue,
  style,
  className,
  id,
  ...rest
}) => {
  const { locale } = useLocale()
  const placeholder = placeholderProp ?? locale.adapter.common.placeholder.select ?? 'Please select'
  const notFoundContent = notFoundContentProp ?? locale.widget.select.noOptions
  const handleChange = (val?: string | string[] | null) => {
    onChange?.(val)
  }

  return (
    <AntdSelect
      value={value as string | string[] | null | undefined}
      defaultValue={defaultValue as string | string[] | null | undefined}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      mode={mode}
      showSearch={
        showSearch
          ? ({
              optionFilterProp: 'label',
              filterOption,
              onSearch,
            } as Record<string, unknown>)
          : false
      }
      allowClear={allowClear}
      maxTagCount={maxTagCount}
      placement={placement as 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight' | undefined}
      notFoundContent={notFoundContent}
      style={{ width: '100%', ...style }}
      className={className}
      id={id}
      {...rest}
      options={options as unknown as Record<string, unknown>[]}
    />
  )
}
