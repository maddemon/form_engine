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
  const sceneConfig = formConfig[scene]
  const isDesktop = scene === 'desktop'

  return (
    <Form
      layout={sceneConfig?.layout}
      colon={formConfig.colon}
      size={formConfig.size}
      labelAlign={isDesktop ? sceneConfig?.labelAlign : undefined}
      labelCol={isDesktop ? sceneConfig?.labelCol : undefined}
      wrapperCol={isDesktop ? sceneConfig?.wrapperCol : undefined}
      variant={isDesktop ? sceneConfig?.variant : undefined}
      requiredMark={formConfig.requiredMark}
      onFinish={() => onSubmit?.()}
      className={className}
      style={style}
    >
      {children}
    </Form>
  )
}
