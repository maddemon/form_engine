import React from 'react'
import type { DeviceScene } from '../types/adapter'
import { Monitor, Smartphone } from '../components/icons'
import { useStyle } from '../styles'

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
}) => {
  const { token } = useStyle()

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `${token('spacingXs')} ${token('spacingMd')}`,
        background: 'var(--fe-bg-primary)',
        borderBottom: '1px solid var(--fe-border-light)',
        flexShrink: 0,
        fontSize: token('fontSizeSm'),
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: token('spacingXs') }}>
        <button
          title="组件树"
          onClick={onTreeClick}
          style={{
            border: showTree ? '1px solid var(--fe-primary)' : '1px solid var(--fe-border-primary)',
            background: showTree ? 'var(--fe-primary-bg)' : 'var(--fe-bg-primary)',
            borderRadius: token('borderRadiusSm'),
            padding: '2px 6px',
            cursor: 'pointer',
            fontSize: 'var(--fe-font-size-xs)',
          }}
        >
          ☰
        </button>

        <button
          title="撤销"
          onClick={onUndo}
          disabled={!canUndo}
          style={{
            border: '1px solid var(--fe-border-primary)',
            background: 'var(--fe-bg-primary)',
            borderRadius: token('borderRadiusSm'),
            padding: '2px 6px',
            cursor: 'pointer',
            fontSize: 'var(--fe-font-size-xs)',
            opacity: !canUndo ? 0.4 : 1,
          }}
        >
          ↩
        </button>
        <button
          title="重做"
          onClick={onRedo}
          disabled={!canRedo}
          style={{
            border: '1px solid var(--fe-border-primary)',
            background: 'var(--fe-bg-primary)',
            borderRadius: token('borderRadiusSm'),
            padding: '2px 6px',
            cursor: 'pointer',
            fontSize: 'var(--fe-font-size-xs)',
            opacity: !canRedo ? 0.4 : 1,
          }}
        >
          ↪
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: token('spacingXs') }}>
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
              border: scene === item.key ? '1px solid var(--fe-primary)' : '1px solid var(--fe-border-primary)',
              background: scene === item.key ? 'var(--fe-primary-bg)' : 'var(--fe-bg-primary)',
              borderRadius: token('borderRadiusSm'),
              padding: '2px 6px',
              cursor: 'pointer',
            }}
          >
            <item.icon
              size={14}
              color={scene === item.key ? 'var(--fe-primary)' : 'var(--fe-text-secondary)'}
            />
          </button>
        ))}
      </div>
    </div>
  )
}
