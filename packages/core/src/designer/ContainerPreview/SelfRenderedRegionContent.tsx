import { useDroppable } from '@dnd-kit/core'
import React, { useMemo } from 'react'
import { EmptyContainerPlaceholder } from './EmptyContainerPlaceholder'
import { RegionDroppable } from './RegionDroppable'
import { SelfRenderedContainer } from './SelfRenderedContainer'
import type { ContainerContentProps } from './types'

interface RegionConfig {
  key: string
}

interface SelfRenderedRegionContentProps extends ContainerContentProps {
  /** 区域配置列表（如 Collapse 的 panels 或 Tabs 的 tabs） */
  regions: RegionConfig[]
}

/**
 * 自渲染容器的区域内容通用组件
 *
 * 消除 CollapseContainerContent 和 TabsContainerContent 的重复逻辑。
 */
export const SelfRenderedRegionContent: React.FC<SelfRenderedRegionContentProps> = React.memo(
  ({ field, formConfig, adapter, regions }) => {
    useDroppable({ id: `${field.id}__container`, data: { parentId: field.id } })

    const regionChildren = useMemo(() => {
      if (regions.length === 0) return []
      return regions.map((region) => {
        const items = field.children.filter((c) => c.regionKey === region.key)
        return React.createElement(
          'div',
          {
            key: region.key,
            field: { regionKey: region.key },
            style: { display: 'contents' } as React.CSSProperties,
          },
          <RegionDroppable
            parentId={field.id}
            regionKey={region.key}
            items={items}
            fieldId={field.id}
          />,
        )
      })
    }, [regions, field.children, field.id])

    if (regions.length === 0) return <EmptyContainerPlaceholder containerId={field.id} />

    return (
      <SelfRenderedContainer field={field} adapter={adapter} formConfig={formConfig}>
        {regionChildren}
      </SelfRenderedContainer>
    )
  },
)
SelfRenderedRegionContent.displayName = 'SelfRenderedRegionContent'
