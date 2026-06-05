import { useDroppable } from '@dnd-kit/core'
import React, { useMemo } from 'react'
import type { CollapsePanelConfig } from '../../components/collapse/types'
import { FieldRenderer } from '../../renderer/FieldRenderer'
import type { FormFieldSchema } from '../../types/schema'
import { EmptyContainerPlaceholder } from './EmptyContainerPlaceholder'
import { RegionDroppable } from './RegionDroppable'
import type { ContainerContentProps } from './types'

/** Collapse container */
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

  const enhancedField: FormFieldSchema = { ...field, componentProps: { ...field.componentProps, children: panelChildren } }

  return (
    <div style={{ pointerEvents: 'auto' }}>
      <FieldRenderer field={enhancedField} value={undefined} onChange={() => {}} options={[]} disabled={false} adapter={adapter} formConfig={formConfig} />
    </div>
  )
})
CollapseContainerContent.displayName = 'CollapseContainerContent'
