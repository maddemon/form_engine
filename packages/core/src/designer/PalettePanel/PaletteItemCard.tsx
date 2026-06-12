import { useDraggable } from '@dnd-kit/core'
import React, { useMemo, useState } from 'react'
import { useLocale } from '../../locale'
import { useStyle } from '../../styles'
import type { PaletteItemCardProps } from './types'
import { getIcon } from './utils'

export const PaletteItemCard: React.FC<PaletteItemCardProps> = React.memo(({ item }) => {
  const [hovered, setHovered] = useState(false)
  const { t } = useLocale()
  const isCustom = item.type === 'custom' || String(item.type).startsWith('custom:')
  const displayLabel = isCustom ? item.label : (t(item.label) ?? item.label)
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${item.type}`,
    data: {
      source: 'palette',
      fieldType: item.type,
      label: displayLabel,
      defaultProps: item.defaultProps ?? {},
      extraData: item.extraData || {},
    },
  })
  const { token } = useStyle()
  const icon = useMemo(() => getIcon(item, token), [item, token])

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      title={displayLabel}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 'var(--fe-spacing-xs) var(--fe-spacing-sm)',
        borderWidth: 1,
        borderStyle: 'solid',
        borderRadius: token('borderRadiusSm'),
        cursor: 'grab',
        fontSize: token('widgetPaletteFontSize'),
        color: 'var(--fe-text-secondary)',
        background: isDragging ? 'var(--fe-primary-bg)' : hovered ? 'var(--fe-canvas-field-hover-bg)' : 'var(--fe-bg-primary)',
        borderColor: isDragging ? 'var(--fe-primary-border)' : hovered ? 'var(--fe-canvas-field-hover-border)' : 'var(--fe-border-light)',
        userSelect: 'none',
        transition: 'all 0.2s',
        gap: token('spacingSm'),
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>
      <span>{displayLabel}</span>
    </div>
  )
})
PaletteItemCard.displayName = 'PaletteItemCard'
