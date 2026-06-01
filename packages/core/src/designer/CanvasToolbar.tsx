import React from 'react'
import type { DeviceScene } from '../registry/componentRegistry'

interface CanvasToolbarProps {
  scene: DeviceScene
  onSceneChange?: (scene: DeviceScene) => void
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  mode: 'design' | 'preview'
  onModeChange?: (mode: 'design' | 'preview') => void
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
  mode,
  onModeChange,
  onTreeClick,
  showTree,
}) => (
  <div
    style={{
      position: 'sticky',
      top: 8,
      zIndex: 100,
      display: 'flex',
      justifyContent: 'center',
      pointerEvents: 'none',
      marginBottom: -32,
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 8px',
        background: '#fff',
        border: '1px solid #eee',
        borderRadius: 6,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        pointerEvents: 'auto',
        fontSize: 12,
      }}
    >
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

      <div style={{ width: 1, height: 16, background: '#eee', margin: '0 4px' }} />

      {[
        { key: 'design' as const, label: '设计' },
        { key: 'preview' as const, label: '预览' },
      ].map(item => (
        <button
          key={item.key}
          title={item.label}
          onClick={() => onModeChange?.(item.key)}
          style={{
            border: mode === item.key ? '1px solid #1677ff' : '1px solid #d9d9d9',
            background: mode === item.key ? '#e6f4ff' : '#fff',
            borderRadius: 4,
            padding: '2px 8px',
            cursor: 'pointer',
            fontSize: 11,
            fontWeight: mode === item.key ? 500 : 400,
          }}
        >
          {item.label}
        </button>
      ))}

      <div style={{ width: 1, height: 16, background: '#eee', margin: '0 4px' }} />

      {(
        [
          { key: 'desktop' as const, label: '🖥' },
          { key: 'mobile' as const, label: '📱' },
        ] as { key: DeviceScene; label: string }[]
      ).map(item => (
        <button
          key={item.key}
          title={item.label}
          onClick={() => onSceneChange?.(item.key)}
          style={{
            border: scene === item.key ? '1px solid #1677ff' : '1px solid #d9d9d9',
            background: scene === item.key ? '#e6f4ff' : '#fff',
            borderRadius: 4,
            padding: '2px 6px',
            cursor: 'pointer',
            fontSize: 11,
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  </div>
)
