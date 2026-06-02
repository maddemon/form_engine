import React, { useEffect, useRef } from 'react'
import { useStyle } from '../styles'

interface TreeItem {
  id: string
  label: string
  type: string
  children?: TreeItem[]
}

interface ComponentTreeProps {
  items: TreeItem[]
  selectedId: string | null
  onSelect: (id: string) => void
  onClose: () => void
}

const TreeNode: React.FC<{ item: TreeItem; selectedId: string | null; onSelect: (id: string) => void; depth: number }> = ({ item, selectedId, onSelect, depth }) => {
  const { token } = useStyle()
  return (
    <div>
      <div
        onClick={() => onSelect(item.id)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: token('spacingXs'),
          padding: '2px 4px',
          cursor: 'pointer',
          fontSize: token('fontSizeSm'),
          background: selectedId === item.id ? 'var(--fe-primary-bg)' : 'transparent',
          color: selectedId === item.id ? 'var(--fe-primary)' : 'var(--fe-text-primary)',
          borderRadius: 'var(--fe-border-radius-xs)',
          marginLeft: depth * parseInt(token('spacingMd') as string),
        }}
      >
        {item.children ? '📁' : '📄'} {item.label}
        <span style={{ color: 'var(--fe-text-muted)', fontSize: token('widgetInputFontSizeXxs') }}>({item.type})</span>
      </div>
      {item.children?.map(child => (
        <TreeNode key={child.id} item={child} selectedId={selectedId} onSelect={onSelect} depth={depth + 1} />
      ))}
    </div>
  )
}

export const ComponentTree: React.FC<ComponentTreeProps> = ({ items, selectedId, onSelect, onClose }) => {
  const { token } = useStyle()
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

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        top: 36,
        left: 0,
        width: 220,
        padding: `${token('spacingSm')} ${token('spacingMd')}`,
        background: 'var(--fe-bg-elevated)',
        border: '1px solid var(--fe-border-light)',
        borderRadius: token('borderRadiusMd'),
        boxShadow: 'var(--fe-shadow-lg)',
        maxHeight: 300,
        overflow: 'auto',
        fontSize: token('fontSizeSm'),
        zIndex: 100,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: token('spacingSm') }}>
        <strong style={{ fontSize: token('fontSizeSm') }}>组件树</strong>
        <button
          onClick={onClose}
          style={{
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: 'var(--fe-text-muted)',
            fontSize: token('fontSizeMd'),
            padding: '0 2px',
          }}
        >
          ✕
        </button>
      </div>
      {items.map(item => (
        <TreeNode key={item.id} item={item} selectedId={selectedId} onSelect={onSelect} depth={0} />
      ))}
    </div>
  )
}
