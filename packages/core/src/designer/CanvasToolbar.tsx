import React from 'react'
import type { DeviceScene } from '../types/adapter'
import { Monitor, Smartphone } from '../components/icons'
import { useStyle } from '../styles'

const SCENE_TOGGLES = [
  { key: 'desktop' as const, icon: Monitor, title: '桌面' },
  { key: 'mobile' as const, icon: Smartphone, title: '手机' },
]

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

/** Toolbar 通用按钮（提取自重复的 button JSX） */
const ToolbarButton: React.FC<{
  label: string
  onClick: () => void
  disabled?: boolean
  active?: boolean
  children: React.ReactNode
}> = React.memo(({ label, onClick, disabled, active, children }) => {
  const { token } = useStyle()
  return (
    <button
      title={label}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: active ? '1px solid var(--fe-primary)' : '1px solid var(--fe-border-primary)',
        background: active ? 'var(--fe-primary-bg)' : 'var(--fe-bg-primary)',
        borderRadius: token('borderRadiusSm'),
        padding: '2px 6px',
        cursor: 'pointer',
        fontSize: 'var(--fe-font-size-xs)',
        opacity: disabled ? 0.4 : 1,
        color: 'var(--fe-text-primary)',
      }}
    >
      {children}
    </button>
  )
})
ToolbarButton.displayName = 'ToolbarButton'

export const CanvasToolbar: React.FC<CanvasToolbarProps> = React.memo(({
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
        <ToolbarButton label="组件树" onClick={onTreeClick} active={showTree}>☰</ToolbarButton>
        <ToolbarButton label="撤销" onClick={onUndo} disabled={!canUndo}>↩</ToolbarButton>
        <ToolbarButton label="重做" onClick={onRedo} disabled={!canRedo}>↪</ToolbarButton>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: token('spacingXs') }}>
        {SCENE_TOGGLES.map(item => (
          <ToolbarButton
            key={item.key}
            label={item.title}
            onClick={() => onSceneChange?.(item.key)}
            active={scene === item.key}
          >
            <item.icon
              size={14}
              color={scene === item.key ? 'var(--fe-primary)' : 'var(--fe-text-secondary)'}
            />
          </ToolbarButton>
        ))}
      </div>
    </div>
  )
})
CanvasToolbar.displayName = 'CanvasToolbar'
