import { useDroppable } from '@dnd-kit/core'
import React, { useMemo } from 'react'
import { useStyle } from '../../styles'
import type { FormFieldSchema } from '../../types/schema'
import { RegionPreview } from '../RegionPreview'
import { EmptyContainerPlaceholder } from './EmptyContainerPlaceholder'
import type { ContainerContentProps } from './types'

/** Grid container */
export const GridContainerContent: React.FC<ContainerContentProps> = React.memo(({ field, scene }) => {
  const { token } = useStyle()

  useDroppable({ id: `${field.id}__container`, data: { parentId: field.id } })

  const colSpans = ((field.componentProps?.colSpans as Array<{ id: string; span: number }>) ?? []).filter(Boolean)

  const childrenByColumn = useMemo(() => {
    const map: Record<number, FormFieldSchema[]> = {}
    for (const child of field.children) {
      const colIdx = (child.columnIndex ?? child.regionKey) ? Number(child.regionKey ?? child.columnIndex) : 0
      if (!map[colIdx]) map[colIdx] = []
      map[colIdx].push(child)
    }
    return map
  }, [field.children])

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
