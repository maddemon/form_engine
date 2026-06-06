import { useDroppable } from '@dnd-kit/core'
import React, { useMemo } from 'react'
import type { CollapsePanelConfig } from '../../components/collapse/types'
import { EmptyContainerPlaceholder } from './EmptyContainerPlaceholder'
import { RegionDroppable } from './RegionDroppable'
import { SelfRenderedContainer } from './SelfRenderedContainer'
import type { ContainerContentProps } from './types'

/** Collapse container — desktop/mobile 均通过 SelfRenderedContainer 渲染，适配器负责处理 children */
export const CollapseContainerContent: React.FC<ContainerContentProps> = React.memo(({ field, formConfig, adapter }) => {
  const panels = ((field.componentProps?.panels as CollapsePanelConfig[]) ?? []).filter(Boolean)

  useDroppable({ id: `${field.id}__container`, data: { parentId: field.id } })

  const panelChildren = useMemo(() => {
    if (panels.length === 0) return []
    return panels.map((panel) => {
      const items = field.children.filter((c) => c.regionKey === panel.key)
      return React.createElement(
        'div',
        { key: panel.key, field: { regionKey: panel.key }, style: { display: 'contents' } as React.CSSProperties },
        <RegionDroppable parentId={field.id} regionKey={panel.key} items={items} fieldId={field.id} />,
      )
    })
  }, [panels, field.children, field.id])

  if (panels.length === 0) return <EmptyContainerPlaceholder containerId={field.id} />

  return (
    <SelfRenderedContainer field={field} adapter={adapter} formConfig={formConfig}>
      {panelChildren}
    </SelfRenderedContainer>
  )
})
CollapseContainerContent.displayName = 'CollapseContainerContent'
