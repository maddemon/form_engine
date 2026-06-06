import { Form } from 'antd-mobile'
import type { FormItemProps } from '@form-engine/core'
import { useStyle } from '@form-engine/core'
import React from 'react'

/**
 * Antd Mobile FormItem 包裹组件
 *
 * 受控模式：不使用 name 属性，避免 antd-mobile Form.Item 自动绑定表单实例。
 * 错误信息通过 description prop 显式传入，并用 error token 着色。
 */
export const AntdMobileFormItem: React.FC<FormItemProps> = ({
  label, labelHidden, required, errors, help, formConfig, scene, children, name,
}) => {
  const { token } = useStyle()
  const errorMsg = errors?.[0]
  const description = errorMsg ? <span style={{ color: token('error') }}>{errorMsg}</span> : help

  return (
    <Form.Item
      name={name}
      label={labelHidden ? undefined : label}
      required={required}
      {...(description ? { description } : {})}
    >
      {children}
    </Form.Item>
  )
}
