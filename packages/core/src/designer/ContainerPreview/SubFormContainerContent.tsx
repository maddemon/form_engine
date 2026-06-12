import { useDroppable } from '@dnd-kit/core'
import React from 'react'
import { useStyle } from '../../styles'
import { RegionPreview } from './RegionPreview'
import { EmptyContainerPlaceholder } from './EmptyContainerPlaceholder'
import { useChildrenByColumn } from './useContainerHooks'
import type { ContainerContentProps } from './types'

/** sub-form container */
export const SubFormContainerContent: React.FC<ContainerContentProps> = React.memo(({ field, scene }) => {
  const { token } = useStyle()
  const columns = ((field.componentProps?.columns as Array<{ id: string; label: string; width: number }>) ?? []).filter(Boolean)

  useDroppable({ id: `${field.id}__container`, data: { parentId: field.id } })
  const childrenByColumn = useChildrenByColumn(field.children)

  if (columns.length === 0) {
    return <EmptyContainerPlaceholder containerId={field.id} />
  }

  if (scene === 'mobile') {
    return (
      <div style={{ padding: token('spacingXs') }}>
        {columns.map((col, idx) => {
          const colItems = childrenByColumn[idx] ?? []
          return <RegionPreview key={col.id} parent={field} regionKey={String(idx)} items={colItems} regionWidth="100%" regionLabel={col.label} labelBg="var(--fe-bg-tertiary)" />
        })}
      </div>
    )
  }

  const totalWidth = columns.reduce((sum, col) => sum + (col.width ?? 120), 0)
  return (
    <div style={{ display: 'flex', width: '100%', padding: token('spacingXs') }}>
      {columns.map((col, idx) => {
        const colItems = childrenByColumn[idx] ?? []
        const proportion = (col.width ?? 120) / totalWidth
        return (
          <RegionPreview key={col.id} parent={field} regionKey={String(idx)} items={colItems} regionWidth={`${proportion} ${proportion} 0px`} regionLabel={col.label} labelBg="var(--fe-bg-tertiary)" />
        )
      })}
    </div>
  )
})
SubFormContainerContent.displayName = 'SubFormContainerContent'
