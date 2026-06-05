import { useDroppable } from '@dnd-kit/core'
import React, { useMemo } from 'react'
import type { TabPaneConfig } from '../../components/tabs/types'
import { FieldRenderer } from '../../renderer/FieldRenderer'
import type { FormFieldSchema } from '../../types/schema'
import { EmptyContainerPlaceholder } from './EmptyContainerPlaceholder'
import { RegionDroppable } from './RegionDroppable'
import type { ContainerContentProps } from './types'

/** Tabs container */
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

  const enhancedField: FormFieldSchema = { ...field, componentProps: { ...field.componentProps, children: tabChildren } }

  return (
    <div style={{ pointerEvents: 'auto' }}>
      <FieldRenderer field={enhancedField} value={undefined} onChange={() => {}} options={[]} disabled={false} adapter={adapter} formConfig={formConfig} />
    </div>
  )
})
TabsContainerContent.displayName = 'TabsContainerContent'
