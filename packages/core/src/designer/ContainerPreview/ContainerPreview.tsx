import React from 'react'
import type { FormFieldSchema } from '../../types/schema'
import { useDesignerConfig } from '../DesignerContext'
import { CardContainerContent } from './CardContainerContent'
import { CollapseContainerContent } from './CollapseContainerContent'
import type { ContainerContentProps } from './types'
import { FlexContainerContent } from './FlexContainerContent'
import { GenericContainerContent } from './GenericContainerContent'
import { GridContainerContent } from './GridContainerContent'
import { SubFormContainerContent } from './SubFormContainerContent'
import { TabsContainerContent } from './TabsContainerContent'

// ── Container renderer registry ─────────────────────────────────────

const containerRendererRegistry: Record<string, React.FC<ContainerContentProps>> = {
  card: CardContainerContent,
  grid: GridContainerContent,
  'sub-form': SubFormContainerContent,
  collapse: CollapseContainerContent,
  tabs: TabsContainerContent,
  flex: FlexContainerContent,
}

// ── ContainerPreview ────────────────────────────────────────────────

interface ContainerPreviewProps {
  field: FormFieldSchema
  childIndex?: number
}

/** 容器预览入口：在此处统一调用 Context hook，将值通过 props 下发给各 Content 组件 */
export const ContainerPreview: React.FC<ContainerPreviewProps> = ({ field }) => {
  const { scene, formConfig, adapter } = useDesignerConfig()
  const Content = containerRendererRegistry[field.type] ?? GenericContainerContent

  return (
    <div style={{ width: '100%' }}>
      <Content field={field} scene={scene} formConfig={formConfig} adapter={adapter} />
    </div>
  )
}

export default ContainerPreview
