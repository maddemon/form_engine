import { getDefaultTreeOptions } from '../../locale'
import type { BaseFormComponentProps, ComponentRegistration } from '../../types/component'
import type { EventDeclaration } from '../../types/events'
import type { OptionItem } from '../../types/schema'

export interface CascaderProps extends BaseFormComponentProps<string[]> {
  options?: OptionItem[]
  allowClear?: boolean
  showSearch?: boolean
  expandTrigger?: 'click' | 'hover'
}

export const cascaderEventDeclarations: EventDeclaration[] = [
  {
    name: 'onChange',
    label: 'component.cascader.events.onChange.label',
    description: 'component.cascader.events.onChange.description',
  },
  {
    name: 'onPopupVisibleChange',
    label: 'component.cascader.events.onPopupVisibleChange.label',
    description: 'component.cascader.events.onPopupVisibleChange.description',
  },
]

export { default as Props } from './Props'

export const meta: ComponentRegistration = {
  label: 'component.cascader.label',
  category: 'form',
  icon: 'GitBranch',
  defaultProps: (locale) => ({
    componentProps: { allowClear: true },
    dataSource: {
      type: 'static',
      static: {
        options: getDefaultTreeOptions(
          locale!.component.cascader.defaultOptionTemplate,
          locale!.component.cascader.defaultSubOptionTemplate,
          [{ children: 2 }, { children: 1 }, {}],
        ),
      },
    },
  }),
  eventDeclarations: cascaderEventDeclarations,
}
