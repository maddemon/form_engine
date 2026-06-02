import React from 'react'
import type { PaletteItem, PaletteGroup } from '../types/designer'
import type { FormFieldSchema, FieldType } from '../types'
import { customComponentRegistry } from '../registry/customComponentRegistry'
import { defaultPaletteGroups } from './paletteData'
import { useDraggable } from '@dnd-kit/core'
import { getComponentIcon } from '../components/paletteRegistry'
import { useStyle } from '../styles'

function DefaultIcon() {
  const { token } = useStyle()
  return <span style={{ fontSize: token('fontSizeSm'), color: 'var(--fe-text-muted)' }}>⬜</span>
}

function getIcon(item: PaletteItem): React.ReactNode {
  const icon = getComponentIcon(item.type)
  if (icon) return icon

  const customConfig = customComponentRegistry.get(item.type)
  if (customConfig?.icon) {
    if (typeof customConfig.icon === 'string') {
      const { token } = useStyle()
      return <span style={{ fontSize: token('fontSizeSm') as string }}>{customConfig.icon}</span>
    }
    return customConfig.icon
  }
  return <DefaultIcon />
}

export function getFullPaletteGroups(excludeTypes?: string[]): PaletteGroup[] {
  const customGrouped = customComponentRegistry.getGrouped()
  const merged = defaultPaletteGroups.map(group => ({ ...group, items: [...group.items] }))

  if (Object.keys(customGrouped).length > 0) {
    for (const [groupName, configs] of Object.entries(customGrouped)) {
      const existingGroup = merged.find(g => g.groupName === groupName)
      const paletteItems = configs
        .filter(config => isValidFieldType(config.type))
        .map(config => ({
          type: config.type as FieldType,
          label: config.label,
          defaultProps: config.defaultProps || {},
        }))
      if (existingGroup) {
        existingGroup.items.push(...paletteItems)
      } else {
        merged.push({ groupName, items: paletteItems })
      }
    }
  }

  if (excludeTypes && excludeTypes.length > 0) {
    const excludeSet = new Set(excludeTypes)
    return merged
      .map(group => ({
        ...group,
        items: group.items.filter(item => !excludeSet.has(item.type)),
      }))
      .filter(group => group.items.length > 0)
  }

  return merged
}

let _counter = 0
export function generateFieldId(type: FieldType): string {
  _counter++
  return `field_${type}_${Date.now()}_${_counter}`
}

export function createFieldFromPalette(item: PaletteItem): FormFieldSchema {
  const randomSuffix = Math.random().toString(36).substring(2, 8)
  return {
    id: generateFieldId(item.type),
    name: `${item.type}_${randomSuffix}`,
    type: item.type,
    label: item.label,
    ...(item.defaultProps || {}),
  }
}

const PaletteItemCard: React.FC<{ item: PaletteItem }> = ({ item }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${item.type}`,
    data: {
      source: 'palette',
      fieldType: item.type,
      label: item.label,
      defaultProps: item.defaultProps || {},
    },
  })
  const { token } = useStyle()

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      title={item.label}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--fe-spacing-sm) var(--fe-spacing-xs)',
        border: '1px solid var(--fe-border-primary)',
        borderRadius: token('borderRadiusSm'),
        cursor: 'grab',
        fontSize: token('fontSizeSm'),
        color: 'var(--fe-text-secondary)',
        background: isDragging ? 'var(--fe-primary-bg)' : 'var(--fe-bg-primary)',
        borderColor: isDragging ? 'var(--fe-primary-border)' : 'var(--fe-border-light)',
        userSelect: 'none',
        transition: 'all 0.2s',
        gap: token('spacingXs'),
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: token('widgetPaletteIconBox'), height: token('widgetPaletteIconBox') }}>
        {getIcon(item)}
      </span>
      <span style={{ lineHeight: 1.2, textAlign: 'center' }}>{item.label}</span>
    </div>
  )
}

interface FieldListProps {
  groups?: PaletteGroup[]
  excludeTypes?: string[]
}

export const FieldList: React.FC<FieldListProps> = ({ groups, excludeTypes }) => {
  const finalGroups = groups || getFullPaletteGroups(excludeTypes)
  const { token } = useStyle()
  return (
    <div style={{ width: token('panelFieldListWidth'), borderRight: '1px solid var(--fe-border-light)', padding: `${token('spacingSm')} ${token('spacingMd')}`, overflow: 'auto', height: '100%', background: 'var(--fe-bg-tertiary)' }}>
      {finalGroups.map(group => (
        <div key={group.groupName} style={{ marginBottom: 'var(--fe-spacing-md)' }}>
          <div style={{ fontSize: 'var(--fe-font-size-xs)', color: 'var(--fe-text-muted)', fontWeight: 500, padding: 'var(--fe-spacing-xs) var(--fe-spacing-xs) var(--fe-spacing-sm)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {group.groupName}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--fe-spacing-xs)' }}>
            {group.items.map(item => (
              <PaletteItemCard key={item.type} item={item} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function isValidFieldType(type: string): type is FieldType {
  const validTypes: FieldType[] = [
    'input', 'input-number', 'textarea', 'password', 'select',
    'radio', 'checkbox', 'switch', 'slider',
    'date', 'date-range', 'time', 'datetime', 'upload',
    'rate', 'custom',
    'button', 'grid', 'flex', 'container', 'collapse', 'tabs',
    'text', 'image', 'divider', 'title',
  ]
  return (validTypes as string[]).includes(type) || type.startsWith('custom:')
}
