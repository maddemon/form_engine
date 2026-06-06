import { Form } from 'antd'
import type { FormItemProps } from '@form-engine/core'
import React from 'react'
import { useInsideContainer } from '@form-engine/core'

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
  label, labelHidden, required, rules, validateStatus, help, tooltip, formConfig, scene, children,
}) => {
  const insideContainer = useInsideContainer()
  const resolvedLabel = labelHidden ? undefined : (label && formConfig.colon ? label.replace(/[:|：]\s*$/, '') + '：' : label)

  const antdRules = rules?.map(r => {
    const { type, validator, ...rest } = r
    return {
      ...rest,
      pattern: typeof rest.pattern === 'string' ? new RegExp(rest.pattern) : rest.pattern,
      type: type === 'phone' ? undefined : type,
    }
  })

  const isFullWidth = scene !== 'desktop' || insideContainer
  const colProps = isFullWidth
    ? { labelCol: { span: 24 }, wrapperCol: { span: 24 } }
    : { labelCol: formConfig.desktop.labelCol, wrapperCol: formConfig.desktop.wrapperCol }

  return (
    <Form.Item
      label={resolvedLabel}
      required={required}
      rules={antdRules}
      validateStatus={validateStatus}
      help={help}
      tooltip={tooltip || undefined}
      colon={false}
      {...colProps}
    >
      {children}
    </Form.Item>
  )
}
