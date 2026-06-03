import type { BaseLayoutComponentProps } from '../../types/component-props'

export interface TabPaneConfig {
  id: string
  /** antd TabPane 的 key */
  key: string
  title: string
  disabled?: boolean
}

export interface TabsProps extends BaseLayoutComponentProps {
  tabs: TabPaneConfig[]
  defaultActiveKey?: string
  type?: 'line' | 'card' | 'editable-card'
  size?: 'small' | 'middle' | 'large'
  tabPosition?: 'top' | 'right' | 'bottom' | 'left'
  centered?: boolean
}