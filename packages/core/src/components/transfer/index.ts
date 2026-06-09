import { getDefaultOptions } from '../../locale'
import type { BaseFormComponentProps, ComponentRegistration } from '../../types/component'
import type { EventDeclaration } from '../../types/events'
import type { OptionItem } from '../../types/schema'

export interface TransferProps extends BaseFormComponentProps<string[] | undefined> {
  options?: OptionItem[]
  titles?: [string, string]
  showSearch?: boolean
  disabled?: boolean
  pagination?: boolean
}

export const transferEventDeclarations: EventDeclaration[] = [
  {
    name: 'onChange',
    label: 'component.transfer.events.onChange.label',
    description: 'component.transfer.events.onChange.description',
  },
  {
    name: 'onSearch',
    label: 'component.transfer.events.onSearch.label',
    description: 'component.transfer.events.onSearch.description',
  },
]

export const meta: ComponentRegistration = {
  label: 'component.transfer.label',
  category: 'form',
  icon: 'ArrowLeftRight',
  defaultProps: (locale) => ({
    dataSource: {
      type: 'static',
      static: { options: getDefaultOptions(locale!.component.transfer.defaultOptionTemplate, 5) },
    },
  }),
  eventDeclarations: transferEventDeclarations,
}
