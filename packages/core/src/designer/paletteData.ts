import type { PaletteGroup } from '../types/designer'
import type { FieldType } from '../types/schema'
import { componentPalettes } from '../components/paletteRegistry'

const GROUP_MEMBERS: Record<string, FieldType[]> = {
  '文本输入': ['input', 'textarea', 'password'],
  '数值': ['input-number', 'slider', 'rate'],
  '选择': ['select', 'cascader', 'tree-select', 'radio', 'checkbox', 'switch'],
  '日期时间': ['date', 'datetime', 'date-range', 'time'],
  '布局': ['grid', 'flex', 'container', 'collapse', 'tabs', 'table'],
  '展示': ['text', 'title', 'image', 'divider'],
  '其他': ['button', 'upload'],
}

function buildGroup(groupName: string, types: FieldType[]): PaletteGroup {
  return {
    groupName,
    items: types.map(type => {
      const palette = componentPalettes[type]
      return {
        type,
        label: palette?.label ?? type,
        defaultProps: palette?.defaultProps ?? {},
      }
    }),
  }
}

export const defaultPaletteGroups: PaletteGroup[] = Object.entries(GROUP_MEMBERS).map(
  ([groupName, types]) => buildGroup(groupName, types)
)