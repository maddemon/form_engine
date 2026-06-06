import { useDroppable } from '@dnd-kit/core'
import React, { useMemo } from 'react'
import { useStyle } from '../../styles'
import type { FormFieldSchema } from '../../types/schema'
import { RegionPreview } from '../RegionPreview'
import { EmptyContainerPlaceholder } from './EmptyContainerPlaceholder'
import type { ContainerContentProps } from './types'

/** sub-form container */
export const SubFormContainerContent: React.FC<ContainerContentProps> = React.memo(({ field, scene }) => {
  const { token } = useStyle()
  const columns = ((field.componentProps?.columns as Array<{ id: string; label: string; width: number }>) ?? []).filter(Boolean)

  useDroppable({ id: `${field.id}__container`, data: { parentId: field.id } })

  const childrenByColumn = useMemo(() => {
    const map: Record<number, FormFieldSchema[]> = {}
    for (const child of field.children) {
      const colIdx = (child.columnIndex ?? child.regionKey) ? Number(child.regionKey ?? child.columnIndex) : 0
      if (!map[colIdx]) map[colIdx] = []
      map[colIdx].push(child)
    }
    return map
  }, [field.children])

  if (columns.length === 0) return <EmptyContainerPlaceholder containerId={field.id} />

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
