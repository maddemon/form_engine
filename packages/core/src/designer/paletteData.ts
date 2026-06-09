import { componentRegistry } from '../components'
import { ComponentRegistration } from '../types/component'
import type { PaletteGroup } from '../types/designer'
import type { FieldType } from '../types/schema'

const GROUP_MEMBERS: Record<string, FieldType[]> = {
  'designer.paletteGroups.textInput': ['input', 'textarea', 'password'],
  'designer.paletteGroups.number': ['input-number', 'slider', 'rate'],
  'designer.paletteGroups.select': ['select', 'cascader', 'tree-select', 'radio', 'checkbox', 'switch', 'segment'],
  'designer.paletteGroups.dateTime': ['date', 'datetime', 'date-range', 'time'],
  'designer.paletteGroups.layout': ['grid', 'flex', 'collapse', 'tabs', 'sub-form', 'card'],
  'designer.paletteGroups.display': ['text', 'title', 'image', 'divider', 'html', 'jsx', 'alert'],
  'designer.paletteGroups.other': ['button', 'upload'],
}

function buildGroup(groupName: string, types: FieldType[]): PaletteGroup {
  return {
    groupName,
    items: types.map((type) => {
      const reg = (componentRegistry as Record<string, ComponentRegistration>)[type]
      return {
        type,
        label: reg?.label ?? type,
        defaultProps: reg?.defaultProps ?? {},
      }
    }),
  }
}

export const defaultPaletteGroups: PaletteGroup[] = Object.entries(GROUP_MEMBERS).map(([groupName, types]) =>
  buildGroup(groupName, types),
)
