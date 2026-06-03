import type { BaseLayoutComponentProps } from '../../types/component-props'

export interface CollapsePanelConfig {
  id: string
  /** antd Panel 的 key（唯一，children 用此关联） */
  key: string
  header: string
  disabled?: boolean
}

export interface CollapseProps extends BaseLayoutComponentProps {
  panels: CollapsePanelConfig[]
  defaultActiveKey?: string | string[]
  accordion?: boolean
  ghost?: boolean
}