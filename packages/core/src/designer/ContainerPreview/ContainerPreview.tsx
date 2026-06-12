import React from 'react'
import type { FormFieldSchema } from '../../types/schema'
import { useDesignerScene, useDesignerFormConfig, useDesignerAdapters } from '../DesignerContext'
import { defaultContainerRenderers } from './defaultContainerRenderers'
import { GenericContainerContent } from './GenericContainerContent'
import type { ContainerContentProps } from './types'

// ── Container renderer registry ─────────────────────────────────────

/**
 * 运行时注册表：包含内置渲染器 + 用户扩展。
 * 初始化时从 defaultContainerRenderers 复制，避免修改原始对象。
 */
const containerRendererRegistry: Record<string, React.FC<ContainerContentProps>> = { ...defaultContainerRenderers }

/**
 * 注册自定义容器渲染器。
 *
 * 扩展新容器类型时，调用此函数注册渲染器，
 * ContainerPreview 会自动查找并使用。
 *
 * @example
 * ```ts
 * import { registerContainerRenderer } from '@form-engine/core/designer'
 *
 * registerContainerRenderer('my-container', MyContainerContent)
 * ```
 */
export function registerContainerRenderer(type: string, renderer: React.FC<ContainerContentProps>): void {
  containerRendererRegistry[type] = renderer
}

/**
 * 获取容器渲染器（内部使用）
 */
export function getContainerRenderer(type: string): React.FC<ContainerContentProps> | undefined {
  return containerRendererRegistry[type]
}

// ── ContainerPreview ────────────────────────────────────────────────

interface ContainerPreviewProps {
  field: FormFieldSchema
  childIndex?: number
}

/** 容器预览入口：在此处统一调用 Context hook，将值通过 props 下发给各 Content 组件 */
export const ContainerPreview: React.FC<ContainerPreviewProps> = ({ field }) => {
  const scene = useDesignerScene()
  const formConfig = useDesignerFormConfig()
  const { adapter } = useDesignerAdapters()
  const Content = getContainerRenderer(field.type) ?? GenericContainerContent

  return (
    <div style={{ width: '100%' }}>
      <Content field={field} scene={scene} formConfig={formConfig} adapter={adapter} />
    </div>
  )
}

export default ContainerPreview
