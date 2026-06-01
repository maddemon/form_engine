import React from 'react'

interface TreeItem {
  id: string
  label: string
  type: string
}

interface ComponentTreeProps {
  items: TreeItem[]
  selectedId: string | null
  onSelect: (id: string) => void
  onClose: () => void
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
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        background: '#fff',
        border: '1px solid #eee',
        borderRadius: 6,
        padding: 8,
        boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
        minWidth: 180,
        maxHeight: 260,
        overflow: 'auto',
      }}
      onClick={e => e.stopPropagation()}
    >
      <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 6 }}>组件树</div>
      {items.length === 0 && <div style={{ color: '#999', padding: '4px 0', fontSize: 11 }}>暂无组件</div>}
      {items.map(node => (
        <div
          key={node.id}
          onClick={() => { onSelect(node.id); onClose() }}
          style={{
            padding: '4px 8px',
            cursor: 'pointer',
            color: selectedId === node.id ? '#1677ff' : '#333',
            background: selectedId === node.id ? '#e6f4ff' : 'transparent',
            borderRadius: 4,
            marginBottom: 2,
            fontSize: 11,
          }}
        >
          ▸ {node.label} <span style={{ color: '#999' }}>[{node.type}]</span>
        </div>
      ))}
    </div>
  </>
)
