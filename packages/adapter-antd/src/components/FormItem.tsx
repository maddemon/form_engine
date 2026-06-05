import { Form } from 'antd'
import type { FormItemProps } from '@form-engine/core'
import React from 'react'

/**
 * Antd FormItem 包裹组件
 *
 * 受控模式：不使用 name 属性，避免 antd Form.Item 自动绑定表单实例。
 * 校验状态通过 props 显式传入。
 *
 * 映射关系：
 * - FormItemProps.errors[0] → antd Form.Item help（校验错误信息）
 * - FormItemProps.help → antd Form.Item extra（静态帮助文本）
 * - FormItemProps.tooltip → antd Form.Item tooltip
 */
export const AntdFormItem: React.FC<FormItemProps> = ({
  label, required, rules, validateStatus, help, tooltip, formConfig, scene, children,
}) => {
  const labelText = label && formConfig.colon ? label.replace(/[:|：]\s*$/, '') + '：' : label

  return (
    <Form.Item
      label={labelText}
      required={required}
      rules={rules}
      validateStatus={validateStatus}
      help={help}
      tooltip={tooltip || undefined}
      labelCol={formConfig.scenes[scene]?.labelCol}
      wrapperCol={formConfig.scenes[scene]?.wrapperCol}
      colon={false}
    >
      {children}
    </Form.Item>
  )
}
