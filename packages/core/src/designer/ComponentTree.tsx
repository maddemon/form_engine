import React, { useState } from 'react'

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

const TreeNode: React.FC<{ node: TreeItem; selectedId: string | null; onSelect: (id: string) => void; depth: number }> = ({ node, selectedId, onSelect, depth }) => {
  const hasChildren = node.children && node.children.length > 0
  const [expanded, setExpanded] = useState(true)

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '3px 8px',
          paddingLeft: 8 + depth * 16,
          cursor: 'pointer',
          color: selectedId === node.id ? '#1677ff' : '#333',
          background: selectedId === node.id ? '#e6f4ff' : 'transparent',
          borderRadius: 4,
          marginBottom: 1,
          fontSize: 11,
          userSelect: 'none',
        }}
        onClick={(e) => { e.stopPropagation(); onSelect(node.id); }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 14,
            height: 14,
            fontSize: 10,
            color: '#999',
            flexShrink: 0,
          }}
          onClick={(e) => { if (hasChildren) { e.stopPropagation(); setExpanded(!expanded) } }}
        >
          {hasChildren ? (expanded ? '▾' : '▸') : '·'}
        </span>
        <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {node.label}
        </span>
        <span style={{ color: '#999', flexShrink: 0 }}>[{node.type}]</span>
      </div>
      {hasChildren && expanded && (
        node.children!.map(child => (
          <TreeNode key={child.id} node={child} selectedId={selectedId} onSelect={onSelect} depth={depth + 1} />
        ))
      )}
    </>
  )
}

export const ComponentTree: React.FC<ComponentTreeProps> = ({
  items,
  selectedId,
  onSelect,
  onClose,
}) => (
  <>
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 999 }}
      onClick={onClose}
    />
    <div
      style={{
        position: 'absolute',
        top: 44,
        left: 0,
        zIndex: 1000,
        background: '#fff',
        border: '1px solid #eee',
        borderRadius: 6,
        padding: 8,
        boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
        width: 220,
        maxHeight: 320,
        overflow: 'auto',
      }}
      onClick={e => e.stopPropagation()}
    >
      <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 6 }}>组件树</div>
      {items.length === 0 && <div style={{ color: '#999', padding: '4px 0', fontSize: 11 }}>暂无组件</div>}
      {items.map(node => (
        <TreeNode key={node.id} node={node} selectedId={selectedId} onSelect={onSelect} depth={0} />
      ))}
    </div>
  </>
)