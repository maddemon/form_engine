import React from 'react'
import { Monitor, Smartphone } from '../components/icons'
import { useStyle } from '../styles'
import type { DeviceScene } from '../types/adapter'
import { WidgetButton, WidgetButtonGroup } from '../widgets'
import { Space } from '../widgets/Space'
import { Divider } from '../widgets/Divider'

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

export const CanvasToolbar: React.FC<CanvasToolbarProps> = React.memo(({ scene, onSceneChange, canUndo, canRedo, onUndo, onRedo, onTreeClick, showTree }) => {
  const { token } = useStyle()

  return (
    <div style={{ background: 'var(--fe-bg-primary)', flexShrink: 0 }}>
      <Space
        justify="space-between"
        style={{
          padding: `${token('spacingXs')} ${token('spacingMd')}`,
          fontSize: token('fontSizeSm'),
        }}
      >
        <Space gap="xs">
          <WidgetButton label="组件树" onClick={onTreeClick} size="sm">
            ☰
          </WidgetButton>
          <WidgetButton label="撤销" onClick={onUndo} disabled={!canUndo} size="sm">
            ↩
          </WidgetButton>
          <WidgetButton label="重做" onClick={onRedo} disabled={!canRedo} size="sm">
            ↪
          </WidgetButton>
        </Space>

        <WidgetButtonGroup
          options={SCENE_TOGGLES.map((item) => ({
            label: (
              <Space gap="xs" style={{ margin: token('spacingXs') }}>
                <item.icon />
              </Space>
            ),
            value: item.key,
            active: scene === item.key,
          }))}
          value={scene}
          onChange={(value) => onSceneChange?.(value as DeviceScene)}
        />
      </Space>
      <Divider direction="bottom" padding={false} />
    </div>
  )
})
CanvasToolbar.displayName = 'CanvasToolbar'
