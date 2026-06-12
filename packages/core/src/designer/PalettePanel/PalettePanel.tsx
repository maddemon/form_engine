import React, { useMemo, useState } from 'react'
import { getComponentIcon } from '../../components'
import { useLocale } from '../../locale'
import { useStyle } from '../../styles'
import type { SidePanelTabContentProps } from '../../types/designer'
import { resolvePanelWidth } from '../../utils'
import { WidgetButton } from '../../widgets/Button'
import { Space } from '../../widgets/Space'
import { PANEL_BORDER_RIGHT } from '../../shared/UIPrimitives'
import { ComponentLibContent } from './ComponentLibContent'
import { DefaultIcon } from './DefaultIcon'
import { COMPONENT_LIB_TAB_KEY, MIN_PALETTE_WIDTH, type PalettePanelProps } from './types'
import { getFullPaletteGroups } from './utils'

export const PalettePanel: React.FC<PalettePanelProps> = ({
  groups,
  excludeTypes,
  width,
  sidePanelTabs,
  fields = [],
  selectedFieldId = null,
  dispatch,
}) => {
  const finalGroups = useMemo(() => groups || getFullPaletteGroups(excludeTypes), [groups, excludeTypes])
  const { token } = useStyle()
  const { locale } = useLocale()
  const resolvedWidth = resolvePanelWidth(width, token('panelFieldListWidth') as string, MIN_PALETTE_WIDTH)
  const hasTabs = sidePanelTabs && sidePanelTabs.length > 0
  const [activeTab, setActiveTab] = useState(COMPONENT_LIB_TAB_KEY)

  const allTabs = hasTabs
    ? [
        { key: COMPONENT_LIB_TAB_KEY, title: locale.designer.fieldList.title, icon: getComponentIcon('input') || <DefaultIcon /> },
        ...sidePanelTabs,
      ]
    : []

  const tabContentProps: SidePanelTabContentProps = { fields, selectedFieldId, dispatch: dispatch || (() => {}) }

  if (!hasTabs) {
    return (
      <div
        style={{
          width: resolvedWidth,
          ...PANEL_BORDER_RIGHT,
          padding: `${token('spacingSm')} ${token('spacingMd')}`,
          overflow: 'auto',
          height: '100%',
          background: 'var(--fe-bg-tertiary)',
        }}
      >
        <ComponentLibContent groups={finalGroups} />
      </div>
    )
  }

  return (
    <div
      style={{
        width: resolvedWidth,
        ...PANEL_BORDER_RIGHT,
        display: 'flex',
        height: '100%',
        background: 'var(--fe-bg-tertiary)',
      }}
    >
      <Space
        direction="vertical"
        gap="xs"
        style={{ ...PANEL_BORDER_RIGHT, padding: `${token('spacingXs')} 0`, flexShrink: 0 }}
      >
        {allTabs.map((tab) => (
          <WidgetButton
            key={tab.key}
            type="text"
            size="sm"
            onClick={() => setActiveTab(tab.key)}
            label={tab.title}
            style={{
              width: token('spacing2xl') as string,
              height: token('spacing2xl') as string,
              color: activeTab === tab.key ? 'var(--fe-primary)' : 'var(--fe-text-muted)',
              background: activeTab === tab.key ? 'var(--fe-primary-bg)' : 'transparent',
              fontSize: token('fontSizeMd') as string,
              margin: `0 ${token('spacingXs')}`,
            }}
          >
            {tab.icon}
          </WidgetButton>
        ))}
      </Space>
      <div style={{ flex: 1, overflow: 'auto', padding: `${token('spacingSm')} ${token('spacingMd')}` }}>
        {activeTab === COMPONENT_LIB_TAB_KEY ? (
          <ComponentLibContent groups={finalGroups} />
        ) : (
          (() => {
            const tab = sidePanelTabs?.find((t) => t.key === activeTab)
            if (!tab) return null
            const TabContent = tab.content
            return <TabContent {...tabContentProps} />
          })()
        )}
      </div>
    </div>
  )
}
