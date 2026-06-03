import React, { useMemo } from 'react'
import type { FormFieldSchema } from '../types/schema'
import { useStyle } from '../styles'
import { isContainerComponent } from '../types/component-category'
import { CanvasField } from './CanvasField'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { NestedField } from './NestedField'
import { RegionPreview } from './RegionPreview'
import type { CollapsePanelConfig } from '../components/collapse/types'
import type { TabPaneConfig } from '../components/tabs/types'

function ContainerContent({ field }: { field: FormFieldSchema }) {
  const { token } = useStyle()

  // 通用容器
  if (!['grid', 'table', 'tabs', 'collapse'].includes(field.type)) {
    const { setNodeRef, isOver } = useDroppable({
      id: `${field.id}__container`,
      data: { parentId: field.id },
    })
    const childIds = useMemo(() => field.children?.map(c => c.id!) ?? [], [field.children])
    if (!field.children || field.children.length === 0) {
      return (
        <div
          ref={setNodeRef}
          style={{
            minHeight: token('containerMinHeight'),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: isOver ? '2px solid var(--fe-primary)' : '1px dashed var(--fe-border-light)',
            borderRadius: 'var(--fe-border-radius-sm)',
            background: isOver ? 'var(--fe-primary-hover-bg)' : 'var(--fe-bg-tertiary)',
            color: 'var(--fe-text-muted)',
            fontSize: token('fontSizeSm'),
            transition: 'border-color 0.2s, background 0.2s',
          }}
        >
          <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
            {field.children?.map((child, index) => (
              <NestedField key={child.id} field={child} parentContainerId={field.id!} childIndex={index} />
            ))}
            <span>拖入组件</span>
          </SortableContext>
        </div>
      )
    }
    return (
      <div
        ref={setNodeRef}
        style={{
          minHeight: token('containerMinHeight'),
          border: isOver ? '2px solid var(--fe-primary)' : '1px dashed var(--fe-border-light)',
          borderRadius: 'var(--fe-border-radius-sm)',
          background: isOver ? 'var(--fe-primary-hover-bg)' : 'transparent',
          transition: 'border-color 0.2s, background 0.2s',
          padding: token('spacingXs'),
        }}
      >
        <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
          {field.children.map((child, index) => (
            <NestedField key={child.id} field={child} parentContainerId={field.id!} childIndex={index} />
          ))}
        </SortableContext>
      </div>
    )
  }

  // Grid：按 colSpans 分列
  if (field.type === 'grid') {
    const colSpans = ((field.componentProps?.colSpans as Array<{ id: string; span: number }>) ?? []).filter(Boolean)
    if (colSpans.length === 0) {
      const { setNodeRef, isOver } = useDroppable({
        id: `${field.id}__container`,
        data: { parentId: field.id },
      })
      return (
        <div
          ref={setNodeRef}
          style={{
            minHeight: token('containerMinHeight'),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: isOver ? '2px solid var(--fe-primary)' : '1px dashed var(--fe-border-light)',
            borderRadius: 'var(--fe-border-radius-sm)',
            background: isOver ? 'var(--fe-primary-hover-bg)' : 'var(--fe-bg-tertiary)',
            color: 'var(--fe-text-muted)',
            fontSize: token('fontSizeSm'),
          }}
        >
          拖入组件
        </div>
      )
    }

    const gap = (field.componentProps?.gap as number) ?? 0
    const colCount = colSpans.length
    const totalGap = gap > 0 ? gap * (colCount - 1) : 0
    const gapOffset = totalGap / colCount
    return (
      <div style={{ display: 'flex', gap, padding: token('spacingXs') }}>
        {colSpans.map((col, idx) => {
          const colItems = (field.children ?? []).filter(c => (c.columnIndex ?? c.regionKey ? Number(c.regionKey ?? c.columnIndex) : idx) === idx)
          return (
            <RegionPreview
              key={col.id}
              parent={field}
              regionKey={String(idx)}
              items={colItems}
              regionWidth={`0 0 calc(${(col.span / 24) * 100}% - ${gapOffset}px)`}
            />
          )
        })}
      </div>
    )
  }

  // Table：按 columns 分列
  if (field.type === 'table') {
    const columns = ((field.componentProps?.columns as Array<{ id: string; label: string; width: number }>) ?? []).filter(Boolean)
    if (columns.length === 0) {
      const { setNodeRef, isOver } = useDroppable({
        id: `${field.id}__container`,
        data: { parentId: field.id },
      })
      return (
        <div
          ref={setNodeRef}
          style={{
            minHeight: token('containerMinHeight'),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: isOver ? '2px solid var(--fe-primary)' : '1px dashed var(--fe-border-light)',
            borderRadius: 'var(--fe-border-radius-sm)',
            background: isOver ? 'var(--fe-primary-hover-bg)' : 'var(--fe-bg-tertiary)',
            color: 'var(--fe-text-muted)',
            fontSize: token('fontSizeSm'),
          }}
        >
          拖入组件
        </div>
      )
    }

    return (
      <div style={{ display: 'flex', padding: token('spacingXs') }}>
        {columns.map((col, idx) => {
          const colItems = field.children?.filter(c => (c.columnIndex ?? c.regionKey ? Number(c.regionKey ?? c.columnIndex) : idx) === idx) ?? []
          return (
            <RegionPreview
              key={col.id}
              parent={field}
              regionKey={String(idx)}
              items={colItems}
              regionWidth={col.width != null ? `0 0 ${col.width}px` : undefined}
              regionLabel={col.label}
              labelBg="var(--fe-bg-tertiary)"
            />
          )
        })}
      </div>
    )
  }

  // Collapse：按 panels 分面板
  if (field.type === 'collapse') {
    const panels = ((field.componentProps?.panels as CollapsePanelConfig[]) ?? []).filter(Boolean)
    if (panels.length === 0) {
      const { setNodeRef, isOver } = useDroppable({
        id: `${field.id}__container`,
        data: { parentId: field.id },
      })
      return (
        <div
          ref={setNodeRef}
          style={{
            minHeight: token('containerMinHeight'),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: isOver ? '2px solid var(--fe-primary)' : '1px dashed var(--fe-border-light)',
            borderRadius: 'var(--fe-border-radius-sm)',
            background: isOver ? 'var(--fe-primary-hover-bg)' : 'var(--fe-bg-tertiary)',
            color: 'var(--fe-text-muted)',
            fontSize: token('fontSizeSm'),
          }}
        >
          拖入组件
        </div>
      )
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--fe-spacing-xs)', padding: token('spacingXs') }}>{/* Collapse panels */}
        {panels.map((panel, idx) => {
          const panelItems = field.children?.filter(c => c.regionKey === panel.key) ?? []
          return (
            <RegionPreview
              key={panel.id}
              parent={field}
              regionKey={panel.key}
              items={panelItems}
              regionWidth="100%"
              regionLabel={panel.header}
              labelBg="var(--fe-bg-tertiary)"
            />
          )
        })}
      </div>
    )
  }

  // Tabs：按 tabs 分标签页
  if (field.type === 'tabs') {
    const tabs = ((field.componentProps?.tabs as TabPaneConfig[]) ?? []).filter(Boolean)
    if (tabs.length === 0) {
      const { setNodeRef, isOver } = useDroppable({
        id: `${field.id}__container`,
        data: { parentId: field.id },
      })
      return (
        <div
          ref={setNodeRef}
          style={{
            minHeight: token('containerMinHeight'),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: isOver ? '2px solid var(--fe-primary)' : '1px dashed var(--fe-border-light)',
            borderRadius: 'var(--fe-border-radius-sm)',
            background: isOver ? 'var(--fe-primary-hover-bg)' : 'var(--fe-bg-tertiary)',
            color: 'var(--fe-text-muted)',
            fontSize: token('fontSizeSm'),
          }}
        >
          拖入组件
        </div>
      )
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--fe-spacing-xs)', padding: token('spacingXs') }}>{/* Tabs */}
        {tabs.map((tab, idx) => {
          const tabItems = field.children?.filter(c => c.regionKey === tab.key) ?? []
          return (
            <RegionPreview
              key={tab.id}
              parent={field}
              regionKey={tab.key}
              items={tabItems}
              regionWidth="100%"
              regionLabel={tab.title}
              labelBg="var(--fe-bg-tertiary)"
            />
          )
        })}
      </div>
    )
  }

  return null
}

interface ContainerPreviewProps {
  field: FormFieldSchema
  childIndex?: number
}

export const ContainerPreview: React.FC<ContainerPreviewProps> = ({ field, childIndex }) => {
  return (
    <div style={{ width: '100%' }}>
      <ContainerContent field={field} />
    </div>
  )
}

export default ContainerPreview