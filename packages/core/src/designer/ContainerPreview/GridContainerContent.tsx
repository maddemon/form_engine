import { useDroppable } from '@dnd-kit/core'
import React from 'react'
import { useStyle } from '../../styles'
import { RegionPreview } from '../RegionPreview'
import { EmptyContainerPlaceholder } from './EmptyContainerPlaceholder'
import { useChildrenByColumn } from './useContainerHooks'
import type { ContainerContentProps } from './types'

/** Grid container */
export const GridContainerContent: React.FC<ContainerContentProps> = React.memo(({ field, scene }) => {
  const { token } = useStyle()

  useDroppable({ id: `${field.id}__container`, data: { parentId: field.id } })

  const colSpans = ((field.componentProps?.colSpans as Array<{ id: string; span: number }>) ?? []).filter(Boolean)
  const childrenByColumn = useChildrenByColumn(field.children)

  if (colSpans.length === 0) return <EmptyContainerPlaceholder containerId={field.id} />

  const isMobile = scene === 'mobile'
  const gap = (field.componentProps?.gap as number) ?? 0

  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap, padding: token('spacingXs') }}>
        {colSpans.map((col, idx) => {
          const colItems = childrenByColumn[idx] ?? []
          return <RegionPreview key={col.id} parent={field} regionKey={String(idx)} items={colItems} regionWidth="0 0 100%" />
        })}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap, padding: token('spacingXs') }}>
      {colSpans.map((col, idx) => {
        const colItems = childrenByColumn[idx] ?? []
        const gapOffset = gap > 0 ? (gap * (colSpans.length - 1) / colSpans.length) : 0
        return <RegionPreview key={col.id} parent={field} regionKey={String(idx)} items={colItems} regionWidth={`0 0 calc(${(col.span / 24) * 100}% - ${gapOffset}px)`} />
      })}
    </div>
  )
})
GridContainerContent.displayName = 'GridContainerContent'
