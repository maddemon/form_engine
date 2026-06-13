import React, { useEffect, useRef } from 'react'
import { useStyle } from '../../styles'
import { useLocale } from '../../locale'
import { Space } from '../../widgets/Space'
import { Text } from '../../widgets/Text'
import { WidgetButton } from '../../widgets/Button'

export interface TreeItem {
  id: string
  label: string
  type: string
  children: TreeItem[]
}

interface ComponentTreeProps {
  items: TreeItem[]
  selectedId: string | null
  onSelect: (id: string) => void
  onClose: () => void
}

interface TreeNodeProps {
  item: TreeItem
  selectedId: string | null
  onSelect: (id: string) => void
  depth: number
}

const TreeNode: React.FC<TreeNodeProps> = React.memo(({ item, selectedId, onSelect, depth }) => {
  const { token } = useStyle()
  const nodeStyle: React.CSSProperties = {
    padding: '2px 4px',
    cursor: 'pointer',
    fontSize: token('fontSizeSm'),
    background: selectedId === item.id ? 'var(--fe-primary-bg)' : 'transparent',
    color: selectedId === item.id ? 'var(--fe-primary)' : 'var(--fe-text-primary)',
    borderRadius: 'var(--fe-border-radius-xs)',
    marginLeft: depth * parseInt(token('spacingMd') as string),
  }
  return (
    <div>
      <div onClick={() => onSelect(item.id)} style={nodeStyle}>
        <Space gap="xs" align="center">
          {item.children.length ? '📁' : '📄'} {item.label}
          <Text type="secondary">({item.type})</Text>
        </Space>
      </div>
      {item.children.map(child => (
        <TreeNode key={child.id} item={child} selectedId={selectedId} onSelect={onSelect} depth={depth + 1} />
      ))}
    </div>
  )
})
TreeNode.displayName = 'TreeNode'

export const ComponentTree: React.FC<ComponentTreeProps> = ({ items, selectedId, onSelect, onClose }) => {
  const { token } = useStyle()
  const { locale } = useLocale()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const popupStyle: React.CSSProperties = {
    position: 'absolute',
    top: 36,
    left: 0,
    width: token('panelFieldListWidth'),
    padding: `${token('spacingSm')} ${token('spacingMd')}`,
    background: 'var(--fe-bg-elevated)',
    border: '1px solid var(--fe-border-light)',
    borderRadius: token('borderRadiusMd'),
    boxShadow: 'var(--fe-shadow-lg)',
    maxHeight: 300,
    overflow: 'auto',
    fontSize: token('fontSizeSm'),
    zIndex: 100,
  }

  return (
    <div ref={ref} style={popupStyle}>
      <Space justify="space-between" gap={0} style={{ marginBottom: token('spacingSm') }}>
        <strong style={{ fontSize: token('fontSizeSm') }}>{locale.designer.canvasToolbar.componentTree}</strong>
        <WidgetButton type="text" size="sm" onClick={onClose} label={locale.designer.canvasToolbar.close} style={{ padding: '0 2px', lineHeight: 1 }}>✕</WidgetButton>
      </Space>
      {items.map(item => (
        <TreeNode key={item.id} item={item} selectedId={selectedId} onSelect={onSelect} depth={0} />
      ))}
    </div>
  )
}
