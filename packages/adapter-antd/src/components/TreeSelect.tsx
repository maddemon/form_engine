import React from 'react'
import { TreeSelect as AntdTreeSelect } from 'antd'
import type { TreeSelectProps } from '@form-engine/core'

/**
 * Antd TreeSelect 组件
 */
export const TreeSelect: React.FC<TreeSelectProps> = ({
  value,
  onChange,
  options = [],
  placeholder,
  allowClear = true,
  multiple = false,
  treeCheckable = false,
  showSearch = false,
  style,
  className,
  id,
  ...rest
}) => {
  const handleChange = (val: string | string[]) => {
    onChange?.(val)
  }

  return (
    <AntdTreeSelect
      value={value as any}
      onChange={handleChange}
      treeData={options as any}
      placeholder={placeholder}
      allowClear={allowClear}
      multiple={multiple}
      treeCheckable={treeCheckable}
      showSearch={showSearch}
      style={{ width: '100%', ...style }}
      className={className}
      id={id}
      {...rest}
    />
  )
}