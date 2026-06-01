import React from 'react'
import { Switch as AntdSwitch } from 'antd'
import type { SwitchProps } from '@form-engine/core'

/**
 * Antd Switch 组件
 * 实现标准 SwitchProps 接口
 */
export const Switch: React.FC<SwitchProps> = ({
  value,
  onChange,
  disabled,
  checkedChildren,
  unCheckedChildren,
  defaultChecked,
  style,
  className,
  id,
  ...rest
}) => {
  const handleChange = (checked: boolean) => {
    onChange?.(checked)
  }
  
  return (
    <AntdSwitch
      checked={!!value}
      onChange={handleChange}
      disabled={disabled}
      checkedChildren={checkedChildren}
      unCheckedChildren={unCheckedChildren}
      defaultChecked={defaultChecked}
      style={style}
      className={className}
      id={id}
      {...rest}
    />
  )
}
