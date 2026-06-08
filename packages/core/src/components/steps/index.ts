import type { BaseComponentProps, ComponentRegistration } from '../../types/component'

export interface StepConfig {
  id: string
  title: string
  description?: string
  subTitle?: string
  icon?: string
  status?: 'wait' | 'process' | 'finish' | 'error'
  disabled?: boolean
}

export interface StepsProps extends BaseComponentProps {
  steps: StepConfig[]
  current?: number
  direction?: 'horizontal' | 'vertical'
  labelPlacement?: 'horizontal' | 'vertical'
  progressDot?: boolean
  size?: 'default' | 'small'
  type?: 'default' | 'navigation' | 'inline'
}

export const meta: ComponentRegistration = {
  label: '步骤条',
  category: 'display',
  icon: 'ListOrdered',
  defaultProps: {
    componentProps: {
      steps: [
        { id: 'step1', title: '第一步', description: '步骤描述' },
        { id: 'step2', title: '第二步', description: '步骤描述' },
        { id: 'step3', title: '第三步', description: '步骤描述' },
      ],
      current: 1,
      direction: 'horizontal',
    },
  },
  eventDeclarations: [],
}
