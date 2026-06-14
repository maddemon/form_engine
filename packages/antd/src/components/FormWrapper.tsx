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
  const desktopConfig = isDesktop ? formConfig.desktop : undefined

  return (
    <Form
      layout={sceneConfig?.layout}
      colon={formConfig.colon}
      size={formConfig.size}
      labelAlign={desktopConfig?.labelAlign}
      labelCol={desktopConfig?.labelCol}
      wrapperCol={desktopConfig?.wrapperCol}
      variant={desktopConfig?.variant}
      requiredMark={formConfig.requiredMark}
      onFinish={() => onSubmit?.()}
      className={className}
      style={style}
    >
      {children}
    </Form>
  )
}
