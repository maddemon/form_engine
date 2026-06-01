import React from 'react'
import type { PaletteItem, PaletteGroup } from '../types/designer'
import type { FormFieldSchema, FieldType } from '../types'
import { customComponentRegistry } from '../registry/customComponentRegistry'
import { defaultPaletteGroups } from './paletteData'
import { Type, FileText, Hash, Lock, ChevronDown, CheckSquare, Circle, ToggleLeft, Slash, Star, Calendar, Clock, UploadIcon, GitBranch, GridIcon } from '../components/icons'

const iconMap: Record<string, React.ReactNode> = {
  'input': <Type />, 'textarea': <FileText />, 'input-number': <Hash />,
  'password': <Lock />, 'select': <ChevronDown />, 'multi-select': <CheckSquare />,
  'radio': <Circle />, 'checkbox': <CheckSquare />, 'switch': <ToggleLeft />,
  'slider': <Slash />, 'rate': <Star />, 'date': <Calendar />,
  'datetime': <Calendar />, 'date-range': <Calendar />, 'time': <Clock />,
  'upload': <UploadIcon />, 'cascader': <GitBranch />, 'tree-select': <GridIcon />,
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

export function getFullPaletteGroups(): PaletteGroup[] {
  const grouped = customComponentRegistry.getGrouped()
  if (Object.keys(grouped).length === 0) return defaultPaletteGroups

  const customGroups: PaletteGroup[] = Object.entries(grouped).map(([groupName, configs]) => ({
    groupName,
    items: configs
      .filter(config => isValidFieldType(config.type))
      .map(config => ({
        type: config.type as FieldType,
        label: config.label,
        defaultProps: config.defaultProps || {},
      })),
  }))
  return [...defaultPaletteGroups, ...customGroups]
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

interface FieldListProps {
  groups?: PaletteGroup[]
  onDragStart: (item: PaletteItem, event: React.DragEvent<HTMLDivElement>) => void
}

export const FieldList: React.FC<FieldListProps> = ({ groups, onDragStart }) => {
  const finalGroups = groups || getFullPaletteGroups()
  return (
    <div style={{ width: 220, borderRight: '1px solid #eee', padding: '8px 10px', overflow: 'auto', height: '100%', background: '#fafafa' }}>
      {finalGroups.map(group => (
        <div key={group.groupName} style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: '#999', fontWeight: 500, padding: '4px 4px 6px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {group.groupName}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
            {group.items.map(item => (
              <div
                key={item.type} draggable
                onDragStart={(e) => onDragStart(item, e)}
                title={item.label}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px 4px', border: '1px solid #eee', borderRadius: 6, cursor: 'grab', fontSize: 11, color: '#595959', background: '#fff', userSelect: 'none', transition: 'all 0.2s', gap: 4 }}
                onMouseEnter={e => { e.currentTarget.style.background = '#e6f4ff'; e.currentTarget.style.borderColor = '#91caff'; e.currentTarget.style.color = '#1677ff' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#eee'; e.currentTarget.style.color = '#595959' }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20 }}>
                  {getIcon(item)}
                </span>
                <span style={{ lineHeight: 1.2, textAlign: 'center' }}>{item.label}</span>
              </div>
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
    'multi-select', 'radio', 'checkbox', 'switch', 'slider',
    'date', 'date-range', 'time', 'datetime', 'upload',
    'rate', 'cascader', 'tree-select', 'custom'
  ]
  return (validTypes as string[]).includes(type) || type.startsWith('custom:')
}