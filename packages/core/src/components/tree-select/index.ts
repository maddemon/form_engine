import { getDefaultTreeOptions } from '../../locale'
import type { BaseFormComponentProps, ComponentRegistration } from '../../types/component'
import type { EventDeclaration } from '../../types/events'
import type { OptionItem } from '../../types/schema'

export interface TreeSelectProps extends BaseFormComponentProps<string | string[] | undefined> {
  options?: OptionItem[]
  placeholder?: string
  allowClear?: boolean
  showSearch?: boolean
  multiple?: boolean
  treeCheckable?: boolean
  treeDefaultExpandAll?: boolean
}

export const treeSelectEventDeclarations: EventDeclaration[] = [
  {
    name: 'onChange',
    label: 'component.treeSelect.events.onChange.label',
    description: 'component.treeSelect.events.onChange.description',
  },
  {
    name: 'onSearch',
    label: 'component.treeSelect.events.onSearch.label',
    description: 'component.treeSelect.events.onSearch.description',
  },
]

export { default as Props } from './Props'

export const meta: ComponentRegistration = {
  label: 'component.treeSelect.label',
  category: 'form',
  icon: 'GitFork',
  defaultProps: (locale) => ({
    componentProps: { allowClear: true },
    dataSource: {
      type: 'static',
      static: {
        options: getDefaultTreeOptions(
          locale!.component.treeSelect.defaultOptionTemplate,
          locale!.component.treeSelect.defaultSubOptionTemplate,
          [{ children: 2 }, {}],
          'node',
        ),
      },
    },
  }),
  eventDeclarations: treeSelectEventDeclarations,
}
