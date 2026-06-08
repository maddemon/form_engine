import type { BaseLayoutComponentProps, ComponentRegistration } from '../../types/component'

export interface CollapsePanelConfig {
  id: string
  key: string
  header: string
  disabled?: boolean
}

export interface CollapseProps extends BaseLayoutComponentProps {
  panels: CollapsePanelConfig[]
  activeKey?: string | string[]
  defaultActiveKey?: string | string[]
  onChange?: (key: string | string[]) => void
  accordion?: boolean
  ghost?: boolean
}

export { default as Props } from './Props'

export const meta: ComponentRegistration = {
  label: '折叠面板',
  category: 'container',
  icon: 'CollapseIcon',
  defaultProps: {
    componentProps: {
      panels: [
        { id: 'panel_1', key: 'panel_1', header: '面板一' },
        { id: 'panel_2', key: 'panel_2', header: '面板二' },
      ],
      accordion: false,
      ghost: false,
    },
  },
  eventDeclarations: [],
}
