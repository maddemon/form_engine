import React from 'react'
import { useLocale } from '../../locale'
import type { PaletteGroup } from '../../types/designer'
import { PaletteItemCard } from './PaletteItemCard'

interface ComponentLibContentProps {
  groups: PaletteGroup[]
}

export const ComponentLibContent: React.FC<ComponentLibContentProps> = ({ groups }) => {
  const { t } = useLocale()
  return (
    <>
      {groups.map((group) => (
        <div key={group.groupName} style={{ marginBottom: 'var(--fe-spacing-md)' }}>
          <div
            style={{
              fontSize: 'var(--fe-font-size-xs)',
              color: 'var(--fe-text-tertiary)',
              fontWeight: 500,
              padding: 'var(--fe-spacing-xs) var(--fe-spacing-xs) var(--fe-spacing-sm)',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            {t(group.groupName) ?? group.groupName}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--fe-spacing-xs)' }}>
            {group.items.map((item) => (
              <PaletteItemCard key={item.type} item={item} />
            ))}
          </div>
        </div>
      ))}
    </>
  )
}
