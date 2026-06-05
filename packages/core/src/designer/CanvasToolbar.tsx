import React from 'react'
import { Monitor, Smartphone } from '../components/icons'
import { useStyle } from '../styles'
import type { DeviceScene } from '../types/adapter'
import { WidgetButton, WidgetButtonGroup } from '../widgets'

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
    <WidgetButton onClick={onClick} disabled={disabled} size="sm">
      {children}
    </WidgetButton>
  )
})
ToolbarButton.displayName = 'ToolbarButton'

export const CanvasToolbar: React.FC<CanvasToolbarProps> = React.memo(({ scene, onSceneChange, canUndo, canRedo, onUndo, onRedo, onTreeClick, showTree }) => {
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
        <ToolbarButton label="组件树" onClick={onTreeClick} active={showTree}>
          ☰
        </ToolbarButton>
        <ToolbarButton label="撤销" onClick={onUndo} disabled={!canUndo}>
          ↩
        </ToolbarButton>
        <ToolbarButton label="重做" onClick={onRedo} disabled={!canRedo}>
          ↪
        </ToolbarButton>
      </div>

      <WidgetButtonGroup
        options={SCENE_TOGGLES.map((item) => ({
          label: (
            <div
              style={{
                margin: token('spacingXs'),
                display: 'flex',
                alignItems: 'center',
                gap: token('spacingXs'),
              }}
            >
              <item.icon />
            </div>
          ),
          value: item.key,
          active: scene === item.key,
        }))}
        value={scene}
        onChange={(value) => onSceneChange?.(value as DeviceScene)}
      />
    </div>
  )
})
CanvasToolbar.displayName = 'CanvasToolbar'
