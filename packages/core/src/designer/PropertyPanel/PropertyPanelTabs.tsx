import { useStyle } from '../../styles'

/**
 * 渲染顶部 Tab 栏（仅在有 propertyPanelTabs 时调用）
 */
export function PropertyPanelTabs({ allTabs, activeTab, setActiveTab }: { allTabs: { key: string; title: string }[]; activeTab: string; setActiveTab: (v: string) => void }) {
  const { token } = useStyle()

  return (
    <div style={{ display: 'flex', padding: token('spacingSm'), borderBottom: '1px solid var(--fe-border-light)', background: 'var(--fe-bg-tertiary)', position: 'sticky', top: 0, zIndex: 1 }}>
      {allTabs.map((tab, idx) => {
        const isFirst = idx === 0
        const isLast = idx === allTabs.length - 1
        return (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1,
              border: '1px solid var(--fe-border-primary)',
              borderRight: isLast ? '1px solid var(--fe-border-primary)' : 'none',
              background: activeTab === tab.key ? 'var(--fe-bg-primary)' : 'var(--fe-bg-tertiary)',
              color: activeTab === tab.key ? 'var(--fe-primary)' : 'var(--fe-text-secondary)',
              cursor: 'pointer',
              padding: `${token('spacingXs')} ${token('spacingSm')}`,
              fontSize: token('fontSizeXs'),
              fontWeight: activeTab === tab.key ? 500 : 400,
              transition: 'all 0.2s',
              outline: 'none',
              borderTopLeftRadius: isFirst ? token('borderRadiusSm') : 0,
              borderBottomLeftRadius: isFirst ? token('borderRadiusSm') : 0,
              borderTopRightRadius: isLast ? token('borderRadiusSm') : 0,
              borderBottomRightRadius: isLast ? token('borderRadiusSm') : 0,
            }}
          >
            {tab.title}
          </button>
        )
      })}
    </div>
  )
}
