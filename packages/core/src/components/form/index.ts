import type { BaseLayoutComponentProps, ComponentRegistration } from '../../types/component'

export type LayoutConfig = { span?: number }

export interface FormProps extends BaseLayoutComponentProps {
  layout?: 'horizontal' | 'vertical' | 'inline'
  labelAlign?: 'left' | 'right'
  labelCol?: LayoutConfig
  wrapperCol?: LayoutConfig
  colon?: boolean
  size?: 'small' | 'middle' | 'large'
  disabled?: boolean
}

export const meta: ComponentRegistration = {
  label: 'component.form.label',
  category: 'container',
  icon: 'FormOutlined',
  defaultProps: { componentProps: { layout: 'vertical', labelAlign: 'right' } },
  eventDeclarations: [],
}
