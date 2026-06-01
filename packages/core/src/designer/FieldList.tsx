import React from 'react'
import type { PaletteItem, PaletteGroup } from '../types/designer'
import type { FormFieldSchema, FieldType } from '../types'
import { customComponentRegistry } from '../registry/customComponentRegistry'
import { defaultPaletteGroups } from './paletteData'
import { useDraggable } from '@dnd-kit/core'
import { Type, FileText, Hash, Lock, ChevronDown, CheckSquare, Circle, ToggleLeft, Slash, Star, Calendar, Clock, UploadIcon, GridIcon, Columns, Square, Minus, Layout, FolderOpen, ImageIcon } from '../components/icons'

export const iconMap: Record<string, React.ReactNode> = {
  'input': <Type />, 'textarea': <FileText />, 'input-number': <Hash />,
  'password': <Lock />, 'select': <ChevronDown />,
  'radio': <Circle />, 'checkbox': <CheckSquare />, 'switch': <ToggleLeft />,
  'slider': <Slash />, 'rate': <Star />, 'date': <Calendar />,
  'datetime': <Calendar />, 'date-range': <Calendar />, 'time': <Clock />,
  'upload': <UploadIcon />,
  'button': <Square />,
  'grid': <GridIcon />, 'flex': <Layout />, 'container': <Square />,
  'collapse': <FolderOpen />, 'tabs': <Minus />,
  'text': <Type />,   'image': <ImageIcon />, 'divider': <Minus />, 'title': <Type />,
}

function DefaultIcon() {
  return <span style={{ fontSize: 14, color: '#999' }}>⬜</span>
}

function getIcon(item: PaletteItem): React.ReactNode {
  if (iconMap[item.type]) return iconMap[item.type]

  const customConfig = customComponentRegistry.get(item.type)
  if (customConfig?.icon) {
    if (typeof customConfig.icon === 'string') {
      return <span style={{ fontSize: 14 }}>{customConfig.icon}</span>
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
        padding: '8px 4px',
        border: '1px solid #eee',
        borderRadius: 6,
        cursor: 'grab',
        fontSize: 11,
        color: '#595959',
        background: isDragging ? '#e6f4ff' : '#fff',
        borderColor: isDragging ? '#91caff' : '#eee',
        userSelect: 'none',
        transition: 'all 0.2s',
        gap: 4,
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20 }}>
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
  return (
    <div style={{ width: 220, borderRight: '1px solid #eee', padding: '8px 10px', overflow: 'auto', height: '100%', background: '#fafafa' }}>
      {finalGroups.map(group => (
        <div key={group.groupName} style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: '#999', fontWeight: 500, padding: '4px 4px 6px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {group.groupName}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
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
