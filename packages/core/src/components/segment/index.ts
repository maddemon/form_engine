import { getDefaultOptions } from '../../locale'
import type { BaseComponentProps, ComponentRegistration } from '../../types/component'
import type { EventDeclaration } from '../../types/events'
import type { OptionItem } from '../../types/schema'

export interface SegmentProps extends BaseComponentProps {
  options: OptionItem[]
  value?: string | number
  defaultValue?: string | number
  size?: 'large' | 'middle' | 'small'
  block?: boolean
  onChange?: (value: string | number) => void
}

export const segmentEventDeclarations: EventDeclaration[] = [
  {
    name: 'onChange',
    label: 'component.segment.events.onChange.label',
    description: 'component.segment.events.onChange.description',
  },
]

export { default as Props } from './Props'

export const meta: ComponentRegistration = {
  label: 'component.segment.label',
  category: 'display',
  icon: 'SegmentIcon',
  defaultProps: (locale) => ({
    dataSource: {
      type: 'static',
      static: { options: getDefaultOptions(locale!.component.segment.defaultOptionTemplate, 3, 'option_') },
    },
    componentProps: { size: 'middle', block: false },
  }),
  eventDeclarations: segmentEventDeclarations,
}
