/**
 * RegionPreview — 通用区域预览组件
 * 替代 ColumnDropZone，用于 Canvas 中所有"区域"的视觉块 + droppable 容器
 *
 * 4 个组件（Grid/Table/Collapse/Tabs）共用
 */

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import React, { useMemo } from 'react'
import type { FormFieldSchema } from '../types/schema'
import { useStyle } from '../styles'
import { NestedField } from './NestedField'
import { EmptyContainerPlaceholder } from './ContainerPreview/EmptyContainerPlaceholder'

export interface RegionPreviewProps {
  parent: FormFieldSchema
  /** 区域唯一标识（Grid/Table 用 columnIndex 字符串，Collapse/Tabs 用 panel.key/tab.key） */
  regionKey: string
  /** 该区域下的 children */
  items: FormFieldSchema[]
  /** 顶部标签文本。空字符串则不显示 */
  regionLabel?: string
  /** 区域宽度。Grid: flex 比例；Table: 像素值；Collapse/Tabs: 100% */
  regionWidth?: number | string
  /** 顶部标签栏背景色 token */
  labelBg?: string
}

export const RegionPreview: React.FC<RegionPreviewProps> = ({
  parent,
  regionKey,
  items,
  regionLabel,
  regionWidth,
  labelBg,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `${parent.id}__region_${regionKey}`,
    data: { parentId: parent.id, regionKey },
  })
  const { token } = useStyle()
  const childIds = useMemo(() => items.map(c => c.id), [items])

  const flexStyle: React.CSSProperties = regionWidth == null
    ? { flex: 1 }
    : typeof regionWidth === 'number'
      ? { width: regionWidth, flexShrink: 0 }
      : regionWidth.includes(' ')
        ? { flex: regionWidth }
        : { width: regionWidth }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...flexStyle,
        boxSizing: 'border-box',
        minWidth: 0,
        position: 'relative',
        minHeight: token('containerMinHeight'),
        border: isOver ? '2px solid var(--fe-primary)' : '1px dashed var(--fe-border-light)',
        borderRadius: 'var(--fe-border-radius-sm)',
        background: isOver ? 'var(--fe-primary-hover-bg)' : 'transparent',
        pointerEvents: 'auto',
        transition: 'border-color 0.2s, background 0.2s',
        overflow: 'hidden',
      }}
    >
      {/* 顶部标签栏 */}
      {regionLabel && (
        <div
          style={{
            height: token('spacingXl'),
            lineHeight: token('spacingXl'),
            padding: `0 ${token('spacingXs')}`,
            fontSize: token('fontSizeXs'),
            fontWeight: 600,
            color: 'var(--fe-text-primary)',
            background: labelBg ?? 'var(--fe-bg-tertiary)',
            borderBottom: '1px solid var(--fe-border-light)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {regionLabel}
        </div>
      )}

      {/* 内容区 */}
      <div style={{ padding: token('spacingXs') }}>
        {items.length > 0 ? (
          <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
            {items.map((child, index) => (
              <NestedField
                key={child.id}
                field={child}
                parentContainerId={parent.id}
                childIndex={index}
              />
            ))}
          </SortableContext>
        ) : (
          <EmptyContainerPlaceholder containerId={`${parent.id}__region_${regionKey}`} skipDroppable />
        )}
      </div>
    </div>
  )
}