import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import React, { useMemo } from 'react'
import type { CollapsePanelConfig } from '../components/collapse/types'
import type { TabPaneConfig } from '../components/tabs/types'
import { FieldRenderer } from '../renderer/FieldRenderer'
import { useStyle } from '../styles'
import type { FormFieldSchema } from '../types/schema'
import { useDesignerContext } from './DesignerContext'
import { NestedField } from './NestedField'
import { RegionPreview } from './RegionPreview'

// ── region droppable ────────────────────────────────────────────────

function RegionDroppable({ parentId, regionKey, items, fieldId }: { parentId: string; regionKey: string; items: FormFieldSchema[]; fieldId: string }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `${fieldId}__region_${regionKey}`,
    data: { parentId, regionKey },
  })
  const { token } = useStyle()
  const childIds = useMemo(() => items.map((c) => c.id), [items])

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
      {items.length > 0 ? (
        <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
          {items.map((child, index) => (
            <NestedField key={child.id} field={child} parentContainerId={parentId} childIndex={index} />
          ))}
        </SortableContext>
      ) : (
        <div
          style={{
            color: 'var(--fe-text-muted)',
            fontSize: token('fontSizeXs'),
            textAlign: 'center',
            padding: token('spacingSm'),
          }}
        >
          拖拽组件到此处
        </div>
      )}
    </div>
  )
}

// ── reusable empty‑container placeholder ───────────────────────────

type EmptyPlaceholderProps = {
  containerId: string
  /** custom style overrides */
  style?: React.CSSProperties
}

const EmptyContainerPlaceholder: React.FC<EmptyPlaceholderProps> = React.memo(({ containerId, style }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `${containerId}__container`,
    data: { parentId: containerId },
  })
  const { token } = useStyle()

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
        ...style,
      }}
    >
      拖入组件
    </div>
  )
})
EmptyContainerPlaceholder.displayName = 'EmptyContainerPlaceholder'

// ── per‑type container content components ──────────────────────────

/** Generic container (non‑special‑cased type) */
const GenericContainerContent: React.FC<{ field: FormFieldSchema }> = React.memo(({ field }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `${field.id}__container`,
    data: { parentId: field.id },
  })
  const childIds = useMemo(() => field.children.map((c) => c.id), [field.children])
  const { token } = useStyle()

  const rawLayout = (field.componentProps?.layout as string) ?? 'vertical'
  const isHorizontal = rawLayout === 'horizontal'
  const strategy = isHorizontal ? horizontalListSortingStrategy : verticalListSortingStrategy

  if (field.children.length === 0) {
    return (
      <div
        ref={setNodeRef}
        style={{
          minHeight: token('containerMinHeight'),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'auto',
          border: isOver ? '2px solid var(--fe-primary)' : '1px dashed var(--fe-border-light)',
          borderRadius: 'var(--fe-border-radius-sm)',
          background: isOver ? 'var(--fe-primary-hover-bg)' : 'var(--fe-bg-tertiary)',
          color: 'var(--fe-text-muted)',
          fontSize: token('fontSizeSm'),
          transition: 'border-color 0.2s, background 0.2s',
        }}
      >
        拖入组件
      </div>
    )
  }
  return (
    <div
      ref={setNodeRef}
      style={{
        display: isHorizontal ? 'flex' : undefined,
        flexDirection: isHorizontal ? 'row' : undefined,
        minHeight: token('containerMinHeight'),
        border: isOver ? '2px solid var(--fe-primary)' : '1px dashed var(--fe-border-light)',
        borderRadius: 'var(--fe-border-radius-sm)',
        background: isOver ? 'var(--fe-primary-hover-bg)' : 'transparent',
        pointerEvents: 'auto',
        transition: 'border-color 0.2s, background 0.2s',
        padding: token('spacingXs'),
      }}
    >
      <SortableContext items={childIds} strategy={strategy}>
        {field.children.map((child, index) => (
          <NestedField key={child.id} field={child} parentContainerId={field.id} childIndex={index} />
        ))}
      </SortableContext>
    </div>
  )
})
GenericContainerContent.displayName = 'GenericContainerContent'

/** Card container */
const CardContainerContent: React.FC<{ field: FormFieldSchema }> = React.memo(({ field }) => {
  const { token } = useStyle()
  const { scene, formConfig, adapter } = useDesignerContext()

  const { setNodeRef, isOver } = useDroppable({
    id: `${field.id}__container`,
    data: { parentId: field.id },
  })
  const childIds = useMemo(() => field.children.map((c) => c.id), [field.children])

  const cardBody = (
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
          <NestedField key={child.id} field={child} parentContainerId={field.id} childIndex={index} />
        ))}
      </SortableContext>
      {field.children.length === 0 && <div style={{ textAlign: 'center', color: 'var(--fe-text-muted)', fontSize: token('fontSizeSm'), padding: token('spacingSm') }}>拖拽组件到此处</div>}
    </div>
  )

  const enhancedField: FormFieldSchema = {
    ...field,
    componentProps: { ...field.componentProps, children: cardBody },
  }

  return (
    <div style={{ pointerEvents: 'auto' }}>
      <FieldRenderer field={enhancedField} value={undefined} onChange={() => {}} options={[]} disabled={false} adapter={adapter} formConfig={formConfig} />
    </div>
  )
})
CardContainerContent.displayName = 'CardContainerContent'

/** Grid container */
const GridContainerContent: React.FC<{ field: FormFieldSchema }> = React.memo(({ field }) => {
  const { token } = useStyle()
  const colSpans = ((field.componentProps?.colSpans as Array<{ id: string; span: number }>) ?? []).filter(Boolean)

  // 无条件调用 useDroppable — 非空时不使用返回值
  useDroppable({
    id: `${field.id}__container`,
    data: { parentId: field.id },
  })

  if (colSpans.length === 0) {
    return <EmptyContainerPlaceholder containerId={field.id} />
  }

  const gap = (field.componentProps?.gap as number) ?? 0
  const colCount = colSpans.length
  const totalGap = gap > 0 ? gap * (colCount - 1) : 0
  const gapOffset = totalGap / colCount
  return (
    <div style={{ display: 'flex', gap, padding: token('spacingXs') }}>
      {colSpans.map((col, idx) => {
        const colItems = field.children.filter((c) => ((c.columnIndex ?? c.regionKey) ? Number(c.regionKey ?? c.columnIndex) : idx) === idx)
        return <RegionPreview key={col.id} parent={field} regionKey={String(idx)} items={colItems} regionWidth={`0 0 calc(${(col.span / 24) * 100}% - ${gapOffset}px)`} />
      })}
    </div>
  )
})
GridContainerContent.displayName = 'GridContainerContent'

/** Table container */
const TableContainerContent: React.FC<{ field: FormFieldSchema }> = React.memo(({ field }) => {
  const { token } = useStyle()
  const { scene } = useDesignerContext()
  const columns = ((field.componentProps?.columns as Array<{ id: string; label: string; width: number }>) ?? []).filter(Boolean)

  // 无条件调用 useDroppable — 非空时不使用返回值
  useDroppable({
    id: `${field.id}__container`,
    data: { parentId: field.id },
  })

  if (columns.length === 0) {
    return <EmptyContainerPlaceholder containerId={field.id} />
  }

  // Mobile：卡片模式，每列纵向堆叠
  if (scene === 'mobile') {
    return (
      <div style={{ padding: token('spacingXs') }}>
        {columns.map((col, idx) => {
          const colItems = field.children.filter((c) => ((c.columnIndex ?? c.regionKey) ? Number(c.regionKey ?? c.columnIndex) : idx) === idx)
          return <RegionPreview key={col.id} parent={field} regionKey={String(idx)} items={colItems} regionWidth="100%" regionLabel={col.label} labelBg="var(--fe-bg-tertiary)" />
        })}
      </div>
    )
  }

  // Desktop：横向分列
  const totalWidth = columns.reduce((sum, col) => sum + (col.width ?? 120), 0)
  return (
    <div style={{ display: 'flex', width: '100%', padding: token('spacingXs') }}>
      {columns.map((col, idx) => {
        const colItems = field.children.filter((c) => ((c.columnIndex ?? c.regionKey) ? Number(c.regionKey ?? c.columnIndex) : idx) === idx)
        const proportion = (col.width ?? 120) / totalWidth
        return <RegionPreview key={col.id} parent={field} regionKey={String(idx)} items={colItems} regionWidth={`${proportion} ${proportion} 0px`} regionLabel={col.label} labelBg="var(--fe-bg-tertiary)" />
      })}
    </div>
  )
})
TableContainerContent.displayName = 'TableContainerContent'

/** Collapse container */
const CollapseContainerContent: React.FC<{ field: FormFieldSchema }> = React.memo(({ field }) => {
  const { formConfig, adapter } = useDesignerContext()
  const panels = ((field.componentProps?.panels as CollapsePanelConfig[]) ?? []).filter(Boolean)

  // 无条件调用 useDroppable — 非空时不使用返回值
  useDroppable({
    id: `${field.id}__container`,
    data: { parentId: field.id },
  })

  if (panels.length === 0) {
    return <EmptyContainerPlaceholder containerId={field.id} />
  }

  const panelChildren = panels.map((panel) => {
    const items = field.children.filter((c) => c.regionKey === panel.key)
    return React.createElement('div', { key: panel.key, field: { regionKey: panel.key }, style: { display: 'contents' } as React.CSSProperties }, <RegionDroppable parentId={field.id} regionKey={panel.key} items={items} fieldId={field.id} />)
  })

  const enhancedField: FormFieldSchema = {
    ...field,
    componentProps: { ...field.componentProps, children: panelChildren },
  }

  return (
    <div style={{ pointerEvents: 'auto' }}>
      <FieldRenderer field={enhancedField} value={undefined} onChange={() => {}} options={[]} disabled={false} adapter={adapter} formConfig={formConfig} />
    </div>
  )
})
CollapseContainerContent.displayName = 'CollapseContainerContent'

/** Tabs container */
const TabsContainerContent: React.FC<{ field: FormFieldSchema }> = React.memo(({ field }) => {
  const { formConfig, adapter } = useDesignerContext()
  const tabs = ((field.componentProps?.tabs as TabPaneConfig[]) ?? []).filter(Boolean)

  // 无条件调用 useDroppable — 非空时不使用返回值
  useDroppable({
    id: `${field.id}__container`,
    data: { parentId: field.id },
  })

  if (tabs.length === 0) {
    return <EmptyContainerPlaceholder containerId={field.id} />
  }

  const tabChildren = tabs.map((tab) => {
    const items = field.children.filter((c) => c.regionKey === tab.key)
    return React.createElement('div', { key: tab.key, field: { regionKey: tab.key }, style: { display: 'contents' } as React.CSSProperties }, <RegionDroppable parentId={field.id} regionKey={tab.key} items={items} fieldId={field.id} />)
  })

  const enhancedField: FormFieldSchema = {
    ...field,
    componentProps: { ...field.componentProps, children: tabChildren },
  }

  return (
    <div style={{ pointerEvents: 'auto' }}>
      <FieldRenderer field={enhancedField} value={undefined} onChange={() => {}} options={[]} disabled={false} adapter={adapter} formConfig={formConfig} />
    </div>
  )
})
TabsContainerContent.displayName = 'TabsContainerContent'

/** Flex container */
const FlexContainerContent: React.FC<{ field: FormFieldSchema }> = React.memo(({ field }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `${field.id}__container`,
    data: { parentId: field.id },
  })
  const childIds = useMemo(() => field.children.map((c) => c.id), [field.children])
  const { token } = useStyle()

  const rawDirection = (field.componentProps?.direction as string) ?? 'row'
  const direction = rawDirection === 'horizontal' ? 'row' : rawDirection
  const isHorizontal = direction === 'row' || direction === 'row-reverse'
  const gap = (field.componentProps?.gap as number) ?? 0
  const justify = (field.componentProps?.justify as string) ?? 'flex-start'
  const align = (field.componentProps?.align as string) ?? 'stretch'
  const wrap = (field.componentProps?.wrap as string) === 'wrap'

  const strategy = isHorizontal ? horizontalListSortingStrategy : verticalListSortingStrategy

  if (field.children.length === 0) {
    return (
      <div
        ref={setNodeRef}
        style={{
          minHeight: token('containerMinHeight'),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'auto',
          border: isOver ? '2px solid var(--fe-primary)' : '1px dashed var(--fe-border-light)',
          borderRadius: 'var(--fe-border-radius-sm)',
          background: isOver ? 'var(--fe-primary-hover-bg)' : 'var(--fe-bg-tertiary)',
          color: 'var(--fe-text-muted)',
          fontSize: token('fontSizeSm'),
          transition: 'border-color 0.2s, background 0.2s',
        }}
      >
        拖入组件
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        display: 'flex',
        flexDirection: direction,
        flexWrap: wrap ? 'wrap' : 'nowrap',
        justifyContent: justify,
        alignItems: align,
        gap,
        minHeight: token('containerMinHeight'),
        padding: token('spacingXs'),
        border: isOver ? '2px solid var(--fe-primary)' : '1px dashed var(--fe-border-light)',
        borderRadius: 'var(--fe-border-radius-sm)',
        background: isOver ? 'var(--fe-primary-hover-bg)' : 'transparent',
        pointerEvents: 'auto',
        transition: 'border-color 0.2s, background 0.2s',
      }}
    >
      <SortableContext items={childIds} strategy={strategy}>
        {field.children.map((child, index) => (
          <NestedField key={child.id} field={child} parentContainerId={field.id} childIndex={index} />
        ))}
      </SortableContext>
    </div>
  )
})
FlexContainerContent.displayName = 'FlexContainerContent'

// ── ContainerPreview ────────────────────────────────────────────────

interface ContainerPreviewProps {
  field: FormFieldSchema
  childIndex?: number
}

export const ContainerPreview: React.FC<ContainerPreviewProps> = ({ field, childIndex }) => {
  let content: React.ReactNode

  if (field.type === 'card') {
    content = <CardContainerContent field={field} />
  } else if (field.type === 'grid') {
    content = <GridContainerContent field={field} />
  } else if (field.type === 'table') {
    content = <TableContainerContent field={field} />
  } else if (field.type === 'collapse') {
    content = <CollapseContainerContent field={field} />
  } else if (field.type === 'tabs') {
    content = <TabsContainerContent field={field} />
  } else if (field.type === 'flex') {
    content = <FlexContainerContent field={field} />
  } else {
    content = <GenericContainerContent field={field} />
  }

  return <div style={{ width: '100%' }}>{content}</div>
}

export default ContainerPreview
