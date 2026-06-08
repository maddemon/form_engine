import type { BaseLayoutComponentProps, ComponentRegistration } from '../../types/component'

export interface TabPaneConfig {
  id: string
  key: string
  title: string
  icon?: string
  disabled?: boolean
  closable?: boolean
}

export interface TabsProps extends BaseLayoutComponentProps {
  tabs: TabPaneConfig[]
  activeKey?: string
  defaultActiveKey?: string
  onChange?: (activeKey: string) => void
  type?: 'line' | 'card' | 'editable-card'
  size?: 'small' | 'middle' | 'large'
  tabPosition?: 'top' | 'right' | 'bottom' | 'left'
  centered?: boolean
  addable?: boolean
}

export { default as Props } from './Props'

const DEFAULT_TABS = [
  { id: 'tab_1', key: 'tab_1', title: '标签一' },
  { id: 'tab_2', key: 'tab_2', title: '标签二' },
  { id: 'tab_3', key: 'tab_3', title: '标签三' },
]

export const meta: ComponentRegistration = {
  label: 'component.tabs.label',
  category: 'container',
  icon: 'TabIcon',
  defaultProps: { componentProps: { tabs: DEFAULT_TABS, type: 'line', tabPosition: 'top' } },
  eventDeclarations: [],
}
