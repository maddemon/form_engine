import type { FormWrapperProps } from '@form-engine/core'
import { Form } from 'antd-mobile'
import React from 'react'

/**
 * Antd Mobile Form 容器组件
 *
 * 不使用 antd-mobile Form 实例管理值，仅用于布局和上下文。
 * 值管理仍由引擎 useFormValues 负责。
 */
export const AntdMobileFormWrapper: React.FC<FormWrapperProps> = ({
  formConfig,
  onSubmit,
  children,
  className,
  style,
}) => {
  const mobileLayout = formConfig.mobile.layout === 'horizontal' ? 'horizontal' : 'vertical'

  return (
    <Form layout={mobileLayout} footer={null} onFinish={() => onSubmit?.()} className={className} style={style}>
      {children}
    </Form>
  )
}
