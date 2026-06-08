import { useDroppable } from '@dnd-kit/core'
import React, { useMemo } from 'react'
import type { TabPaneConfig } from '../../components/tabs'
import { EmptyContainerPlaceholder } from './EmptyContainerPlaceholder'
import { RegionDroppable } from './RegionDroppable'
import { SelfRenderedContainer } from './SelfRenderedContainer'
import type { ContainerContentProps } from './types'

/** Tabs container — desktop/mobile 均通过 SelfRenderedContainer 渲染，适配器负责处理 children */
export const TabsContainerContent: React.FC<ContainerContentProps> = React.memo(({ field, formConfig, adapter }) => {
  const tabs = ((field.componentProps?.tabs as TabPaneConfig[]) ?? []).filter(Boolean)

  useDroppable({ id: `${field.id}__container`, data: { parentId: field.id } })

  const tabChildren = useMemo(() => {
    if (tabs.length === 0) return []
    return tabs.map((tab) => {
      const items = field.children.filter((c) => c.regionKey === tab.key)
      return React.createElement(
        'div',
        { key: tab.key, field: { regionKey: tab.key }, style: { display: 'contents' } as React.CSSProperties },
        <RegionDroppable parentId={field.id} regionKey={tab.key} items={items} fieldId={field.id} />,
      )
    })
  }, [tabs, field.children, field.id])

  if (tabs.length === 0) return <EmptyContainerPlaceholder containerId={field.id} />

  return (
    <SelfRenderedContainer field={field} adapter={adapter} formConfig={formConfig}>
      {tabChildren}
    </SelfRenderedContainer>
  )
})
TabsContainerContent.displayName = 'TabsContainerContent'
