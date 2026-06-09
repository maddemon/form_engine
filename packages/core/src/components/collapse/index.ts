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
  label: 'component.collapse.label',
  category: 'container',
  icon: 'CollapseIcon',
  defaultProps: (locale) => ({
    componentProps: {
      panels: locale
        ? [
            { id: 'panel_1', key: 'panel_1', header: locale.component.collapse.defaultPanelHeader.replace('{n}', '1') },
            { id: 'panel_2', key: 'panel_2', header: locale.component.collapse.defaultPanelHeader.replace('{n}', '2') },
          ]
        : [],
      accordion: false,
      ghost: false,
    },
  }),
  eventDeclarations: [],
}
