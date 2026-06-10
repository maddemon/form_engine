import type { SwitchProps } from '@form-engine/core'
import { Switch as AntdSwitch } from 'antd'
import React from 'react'

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
  defaultValue,
  style,
  className,
  id,
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
      defaultChecked={defaultValue}
      style={style}
      className={className}
      id={id}
    />
  )
}
