/**
 * Antd Checkbox 组件
 * 适配 Form Engine 的 CheckboxProps
 */

import React from 'react'
import { Checkbox as AntCheckbox } from 'antd'
import type { CheckboxProps } from '@form-engine/core'

const { Group } = AntCheckbox

/**
 * Checkbox 组件
 */
export const Checkbox: React.FC<CheckboxProps> = ({
  value,
  onChange,
  options = [],
  indeterminate,
  disabled,
  style,
  className,
  id,
  ...rest
}) => {
  const handleChange = (checkedValues: any) => {
    onChange?.(checkedValues)
  }
  
  // 如果有 options，渲染 Checkbox.Group
  if (options && options.length > 0) {
    return (
      <Group
        value={value || []}
        onChange={handleChange}
        disabled={disabled}
        style={style}
        className={className}
        id={id}
        options={options}
        {...rest}
      />
    )
  }
  
  // 否则渲染单个 Checkbox
  return (
    <AntCheckbox
      checked={!!value}
      onChange={(e) => onChange?.(e.target.checked)}
      indeterminate={indeterminate}
      disabled={disabled}
      style={style}
      className={className}
      id={id}
      {...rest}
    >
      {rest.children}
    </AntCheckbox>
  )
}

/**
 * CheckboxGroup 组件（Checkbox 的别名）
 */
export const CheckboxGroup: React.FC<CheckboxProps> = (props) => {
  return <Checkbox {...props} />
}
