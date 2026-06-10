import React from 'react'
import { Monitor, Smartphone } from '../components/icons'
import { useStyle } from '../styles'
import { useLocale } from '../locale'
import type { DeviceScene } from '../types/adapter'
import { WidgetButton, WidgetButtonGroup } from '../widgets'
import { Space } from '../widgets/Space'
import { Divider } from '../widgets/Divider'

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

export const CanvasToolbar: React.FC<CanvasToolbarProps> = React.memo(({ scene, onSceneChange, canUndo, canRedo, onUndo, onRedo, onTreeClick, showTree: _showTree }) => {
  const { token } = useStyle()
  const { locale } = useLocale()
  const t = locale.designer.canvasToolbar

  const SCENE_TOGGLES = [
    { key: 'desktop' as const, icon: Monitor, title: t.desktop },
    { key: 'mobile' as const, icon: Smartphone, title: t.mobile },
  ]

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
          <WidgetButton label={t.componentTree} onClick={onTreeClick} size="sm">
            ☰
          </WidgetButton>
          <WidgetButton label={t.undo} onClick={onUndo} disabled={!canUndo} size="sm">
            ↩
          </WidgetButton>
          <WidgetButton label={t.redo} onClick={onRedo} disabled={!canRedo} size="sm">
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
