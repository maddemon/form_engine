import { Form } from 'antd'
import type { FormWrapperProps } from '@form-engine/core'
import React from 'react'

/**
 * Antd Form 容器组件
 *
 * 不使用 antd Form 实例管理值，仅用于布局和上下文。
 * 值管理仍由引擎 useFormValues 负责。
 */
export const AntdFormWrapper: React.FC<FormWrapperProps> = ({
  formConfig, scene, onSubmit, children, className, style,
}) => {
  return (
    <Form
      layout={formConfig.layout}
      colon={formConfig.colon}
      size={formConfig.size}
      labelAlign={formConfig.labelAlign}
      labelCol={formConfig.scenes[scene]?.labelCol}
      wrapperCol={formConfig.scenes[scene]?.wrapperCol}
      variant={formConfig.variant}
      requiredMark={formConfig.requiredMark}
      onFinish={() => onSubmit?.()}
      className={className}
      style={style}
    >
      {children}
    </Form>
  )
}
