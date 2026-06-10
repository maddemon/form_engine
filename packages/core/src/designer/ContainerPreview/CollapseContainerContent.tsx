import React from 'react'
import type { CollapsePanelConfig } from '../../components/collapse'
import { SelfRenderedRegionContent } from './SelfRenderedRegionContent'
import type { ContainerContentProps } from './types'

/** Collapse container — desktop/mobile 均通过 SelfRenderedContainer 渲染，适配器负责处理 children */
export const CollapseContainerContent: React.FC<ContainerContentProps> = React.memo((props) => {
  const panels = ((props.field.componentProps?.panels as CollapsePanelConfig[]) ?? []).filter(Boolean)
  return <SelfRenderedRegionContent {...props} regions={panels} />
})
CollapseContainerContent.displayName = 'CollapseContainerContent'
