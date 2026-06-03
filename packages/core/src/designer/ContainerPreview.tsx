import React, { useMemo } from 'react'
import type { FormFieldSchema } from '../types/schema'
import { useStyle } from '../styles'
import { isContainerComponent } from '../types/component-category'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { NestedField } from './NestedField'
import { RegionPreview } from './RegionPreview'
import type { CollapsePanelConfig } from '../components/collapse/types'
import type { TabPaneConfig } from '../components/tabs/types'
import { useDesignerContext } from './DesignerContext'
import { FieldRenderer } from '../renderer/FieldRenderer'

function RegionDroppable({ parentId, regionKey, items, fieldId }: {
  parentId: string
  regionKey: string
  items: FormFieldSchema[]
  fieldId: string
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `${fieldId}__region_${regionKey}`,
    data: { parentId, regionKey },
  })
  const { token } = useStyle()
  const childIds = useMemo(() => items.map(c => c.id!), [items])

  return (
    <div ref={setNodeRef} style={{
      minHeight: token('containerMinHeight'),
      border: isOver ? '2px solid var(--fe-primary)' : '1px dashed var(--fe-border-light)',
      borderRadius: 'var(--fe-border-radius-sm)',
      background: isOver ? 'var(--fe-primary-hover-bg)' : 'transparent',
      transition: 'border-color 0.2s, background 0.2s',
      padding: token('spacingXs'),
    }}>
      {items.length > 0 ? (
        <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
          {items.map((child, index) => (
            <NestedField
              key={child.id}
              field={child}
              parentContainerId={parentId}
              childIndex={index}
            />
          ))}
        </SortableContext>
      ) : (
        <div style={{
          color: 'var(--fe-text-muted)',
          fontSize: token('fontSizeXs'),
          textAlign: 'center',
          padding: token('spacingSm'),
        }}>
          拖拽组件到此处
        </div>
      )}
    </div>
  )
}

function ContainerContent({ field }: { field: FormFieldSchema }) {
  const { token } = useStyle()
  const { scene, formConfig, adapter } = useDesignerContext()

  // 通用容器
  if (!['grid', 'table', 'tabs', 'collapse', 'card'].includes(field.type)) {
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

  // Card：使用真实 Card 组件包裹子组件
  if (field.type === 'card') {
    const { setNodeRef, isOver } = useDroppable({
      id: `${field.id}__container`,
      data: { parentId: field.id },
    })
    const childIds = useMemo(() => field.children?.map(c => c.id!) ?? [], [field.children])

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
          {field.children?.map((child, index) => (
            <NestedField key={child.id} field={child} parentContainerId={field.id!} childIndex={index} />
          ))}
        </SortableContext>
        {(!field.children || field.children.length === 0) && (
          <div style={{ textAlign: 'center', color: 'var(--fe-text-muted)', fontSize: token('fontSizeSm'), padding: token('spacingSm') }}>
            拖拽组件到此处
          </div>
        )}
      </div>
    )

    const enhancedField: FormFieldSchema = {
      ...field,
      componentProps: { ...field.componentProps, children: cardBody },
    }

    return (
      <FieldRenderer
        field={enhancedField}
        value={undefined}
        onChange={() => {}}
        options={[]}
        disabled={false}
        adapter={adapter}
        formConfig={formConfig}
      />
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

  // Table：按 columns 分列（desktop 横向分列，mobile 纵向卡片）
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

    // Mobile：卡片模式，每列纵向堆叠
    if (scene === 'mobile') {
      return (
        <div style={{ padding: token('spacingXs') }}>
          {columns.map((col, idx) => {
            const colItems = field.children?.filter(c => (c.columnIndex ?? c.regionKey ? Number(c.regionKey ?? c.columnIndex) : idx) === idx) ?? []
            return (
              <RegionPreview
                key={col.id}
                parent={field}
                regionKey={String(idx)}
                items={colItems}
                regionWidth="100%"
                regionLabel={col.label}
                labelBg="var(--fe-bg-tertiary)"
              />
            )
          })}
        </div>
      )
    }

    // Desktop：横向分列
    const totalWidth = columns.reduce((sum, col) => sum + (col.width ?? 120), 0)
    return (
      <div style={{ display: 'flex', width: '100%', padding: token('spacingXs') }}>
        {columns.map((col, idx) => {
          const colItems = field.children?.filter(c => (c.columnIndex ?? c.regionKey ? Number(c.regionKey ?? c.columnIndex) : idx) === idx) ?? []
          const proportion = (col.width ?? 120) / totalWidth
          return (
            <RegionPreview
              key={col.id}
              parent={field}
              regionKey={String(idx)}
              items={colItems}
              regionWidth={`${proportion} ${proportion} 0px`}
              regionLabel={col.label}
              labelBg="var(--fe-bg-tertiary)"
            />
          )
        })}
      </div>
    )
  }

  // Collapse：按 panels 分面板（使用 FieldRenderer + 真实 antd Collapse）
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

    const panelChildren = panels.map(panel => {
      const items = field.children?.filter(c => c.regionKey === panel.key) ?? []
      return React.createElement(
        'div',
        { key: panel.key, field: { regionKey: panel.key }, style: { display: 'contents' } as React.CSSProperties },
        <RegionDroppable parentId={field.id!} regionKey={panel.key} items={items} fieldId={field.id!} />
      )
    })

    const enhancedField: FormFieldSchema = {
      ...field,
      componentProps: { ...field.componentProps, children: panelChildren },
    }

    return (
      <FieldRenderer
        field={enhancedField}
        value={undefined}
        onChange={() => {}}
        options={[]}
        disabled={false}
        adapter={adapter}
        formConfig={formConfig}
      />
    )
  }

  // Tabs：按 tabs 分标签页（使用 FieldRenderer + 真实 antd Tabs）
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

    const tabChildren = tabs.map(tab => {
      const items = field.children?.filter(c => c.regionKey === tab.key) ?? []
      return React.createElement(
        'div',
        { key: tab.key, field: { regionKey: tab.key }, style: { display: 'contents' } as React.CSSProperties },
        <RegionDroppable parentId={field.id!} regionKey={tab.key} items={items} fieldId={field.id!} />
      )
    })

    const enhancedField: FormFieldSchema = {
      ...field,
      componentProps: { ...field.componentProps, children: tabChildren },
    }

    return (
      <FieldRenderer
        field={enhancedField}
        value={undefined}
        onChange={() => {}}
        options={[]}
        disabled={false}
        adapter={adapter}
        formConfig={formConfig}
      />
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