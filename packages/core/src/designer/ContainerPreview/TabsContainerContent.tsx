import React from 'react'
import type { TabPaneConfig } from '../../components/tabs'
import { SelfRenderedRegionContent } from './SelfRenderedRegionContent'
import type { ContainerContentProps } from './types'

/** Tabs container — desktop/mobile 均通过 SelfRenderedContainer 渲染，适配器负责处理 children */
export const TabsContainerContent: React.FC<ContainerContentProps> = React.memo((props) => {
  const tabs = ((props.field.componentProps?.tabs as TabPaneConfig[]) ?? []).filter(Boolean)
  return <SelfRenderedRegionContent {...props} regions={tabs} />
})
TabsContainerContent.displayName = 'TabsContainerContent'
