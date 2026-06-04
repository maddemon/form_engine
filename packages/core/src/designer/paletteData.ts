import type { PaletteGroup } from '../types/designer'
import type { FieldType } from '../types/schema'
import { componentRegistry, type ComponentRegistration } from '../components'

const GROUP_MEMBERS: Record<string, FieldType[]> = {
  '文本输入': ['input', 'textarea', 'password'],
  '数值': ['input-number', 'slider', 'rate'],
  '选择': ['select', 'cascader', 'tree-select', 'radio', 'checkbox', 'switch', 'segment'],
  '日期时间': ['date', 'datetime', 'date-range', 'time'],
  '布局': ['grid', 'flex', 'collapse', 'tabs', 'table', 'card'],
  '展示': ['text', 'title', 'image', 'divider', 'alert'],
  '其他': ['button', 'upload'],
}

function buildGroup(groupName: string, types: FieldType[]): PaletteGroup {
  return {
    groupName,
    items: types.map(type => {
      const reg = (componentRegistry as Record<string, ComponentRegistration>)[type]
      return {
        type,
        label: reg?.label ?? type,
        defaultProps: reg?.defaultProps ?? {},
      }
    }),
  }
}

export const defaultPaletteGroups: PaletteGroup[] = Object.entries(GROUP_MEMBERS).map(
  ([groupName, types]) => buildGroup(groupName, types)
)
