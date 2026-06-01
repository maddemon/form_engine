import type { PaletteGroup } from '../types/designer'

export const defaultPaletteGroups: PaletteGroup[] = [
  {
    groupName: '文本输入',
    items: [
      { type: 'input', label: '单行文本', defaultProps: { placeholder: '请输入' } },
      { type: 'textarea', label: '多行文本', defaultProps: { placeholder: '请输入' } },
      { type: 'password', label: '密码', defaultProps: {} },
    ],
  },
  {
    groupName: '数值',
    items: [
      { type: 'input-number', label: '数字', defaultProps: {} },
      { type: 'slider', label: '滑块', defaultProps: {} },
      { type: 'rate', label: '评分', defaultProps: {} },
    ],
  },
  {
    groupName: '选择',
    items: [
      { type: 'select', label: '下拉', defaultProps: {} },
      { type: 'multi-select', label: '多选', defaultProps: { componentProps: { mode: 'multiple' } } },
      { type: 'radio', label: '单选', defaultProps: {} },
      { type: 'checkbox', label: '多选框', defaultProps: {} },
      { type: 'switch', label: '开关', defaultProps: { defaultValue: false } },
      { type: 'cascader', label: '级联', defaultProps: {} },
      { type: 'tree-select', label: '树选择', defaultProps: {} },
    ],
  },
  {
    groupName: '日期时间',
    items: [
      { type: 'date', label: '日期', defaultProps: {} },
      { type: 'datetime', label: '日期时间', defaultProps: { componentProps: { showTime: true } } },
      { type: 'date-range', label: '日期范围', defaultProps: {} },
      { type: 'time', label: '时间', defaultProps: {} },
    ],
  },
  {
    groupName: '其他',
    items: [
      { type: 'upload', label: '上传', defaultProps: {} },
    ],
  },
]
