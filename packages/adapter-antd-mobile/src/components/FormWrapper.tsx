import { Form } from 'antd-mobile'
import type { FormWrapperProps } from '@form-engine/core'
import React from 'react'

/**
 * Antd Mobile Form 容器组件
 *
 * 不使用 antd-mobile Form 实例管理值，仅用于布局和上下文。
 * 值管理仍由引擎 useFormValues 负责。
 */
export const AntdMobileFormWrapper: React.FC<FormWrapperProps> = ({
  formConfig, scene, onSubmit, children, className, style,
}) => {
  return (
    <Form
      layout={formConfig.layout === 'inline' ? 'horizontal' : formConfig.layout}
      footer={null}
      onFinish={() => onSubmit?.()}
      className={className}
      style={style}
    >
      {children}
    </Form>
  )
}
