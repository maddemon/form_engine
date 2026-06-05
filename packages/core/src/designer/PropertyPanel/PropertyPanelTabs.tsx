import { useStyle } from '../../styles'
import { WidgetButtonGroup } from '../../widgets'

/**
 * 渲染顶部 Tab 栏（仅在有 propertyPanelTabs 时调用）
 */
export function PropertyPanelTabs({ allTabs, activeTab, setActiveTab }: { allTabs: { key: string; title: string }[]; activeTab: string; setActiveTab: (v: string) => void }) {
  const { token } = useStyle()

  return (
    <div style={{ margin: token('spacingXs') }}>
      <WidgetButtonGroup
        value={activeTab}
        onChange={setActiveTab}
        options={allTabs.map((item) => ({
          label: item.title,
          value: item.key,
        }))}
      />
    </div>
  )
}
