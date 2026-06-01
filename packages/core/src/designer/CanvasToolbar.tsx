import React from 'react'
import type { DeviceScene } from '../registry/componentRegistry'
import { Monitor, Smartphone } from '../components/icons'

interface CanvasToolbarProps {
  scene: DeviceScene
  onSceneChange?: (scene: DeviceScene) => void
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  onTreeClick: () => void
  showTree: boolean
}

export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  scene,
  onSceneChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onTreeClick,
  showTree,
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '4px 12px',
      background: '#fff',
      borderBottom: '1px solid #eee',
      flexShrink: 0,
      fontSize: 12,
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <button
        title="组件树"
        onClick={onTreeClick}
        style={{
          border: showTree ? '1px solid #1677ff' : '1px solid #d9d9d9',
          background: showTree ? '#e6f4ff' : '#fff',
          borderRadius: 4,
          padding: '2px 6px',
          cursor: 'pointer',
          fontSize: 11,
        }}
      >
        ☰
      </button>

      <button
        title="撤销"
        onClick={onUndo}
        disabled={!canUndo}
        style={{ border: '1px solid #d9d9d9', background: '#fff', borderRadius: 4, padding: '2px 6px', cursor: 'pointer', fontSize: 11, opacity: !canUndo ? 0.4 : 1 }}
      >↩</button>
      <button
        title="重做"
        onClick={onRedo}
        disabled={!canRedo}
        style={{ border: '1px solid #d9d9d9', background: '#fff', borderRadius: 4, padding: '2px 6px', cursor: 'pointer', fontSize: 11, opacity: !canRedo ? 0.4 : 1 }}
      >↪</button>
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {(
        [
          { key: 'desktop' as const, icon: Monitor, title: '桌面' },
          { key: 'mobile' as const, icon: Smartphone, title: '手机' },
        ] as { key: DeviceScene; icon: React.FC<{ size?: number; color?: string }>; title: string }[]
      ).map(item => (
        <button
          key={item.key}
          title={item.title}
          onClick={() => onSceneChange?.(item.key)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: scene === item.key ? '1px solid #1677ff' : '1px solid #d9d9d9',
            background: scene === item.key ? '#e6f4ff' : '#fff',
            borderRadius: 4,
            padding: '2px 6px',
            cursor: 'pointer',
          }}
        >
          <item.icon size={14} color={scene === item.key ? '#1677ff' : '#666'} />
        </button>
      ))}
    </div>
  </div>
)
