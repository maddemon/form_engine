import type { FieldType } from './schema'

/**
 * 组件分类
 * - form: 表单输入组件，产生表单数据
 * - display: 展示组件，仅用于展示，不产生数据
 * - container: 容器组件，可包含子组件
 * - button: 按钮组件，用于触发操作
 */
export type ComponentCategory = 'form' | 'display' | 'container' | 'button'

export const componentCategoryMap: Record<string, ComponentCategory> = {
  input: 'form',
  'input-number': 'form',
  textarea: 'form',
  password: 'form',
  select: 'form',
  'multi-select': 'form',
  radio: 'form',
  checkbox: 'form',
  switch: 'form',
  slider: 'form',
  rate: 'form',
  date: 'form',
  'date-range': 'form',
  datetime: 'form',
  time: 'form',
  upload: 'form',
  cascader: 'form',
  'tree-select': 'form',

  button: 'button',

  grid: 'container',
  flex: 'container',
  container: 'container',
  collapse: 'container',
  tabs: 'container',

  text: 'display',
  image: 'display',
  divider: 'display',
  title: 'display',
}

export function getComponentCategory(type: string): ComponentCategory | null {
  if (type.startsWith('custom:')) return 'form'
  if (type === 'custom') return 'form'
  return componentCategoryMap[type] ?? null
}

export function isFormComponent(type: string): boolean {
  return getComponentCategory(type) === 'form'
}

export function isDisplayComponent(type: string): boolean {
  return getComponentCategory(type) === 'display'
}

export function isContainerComponent(type: string): boolean {
  return getComponentCategory(type) === 'container'
}

export function isButtonComponent(type: string): boolean {
  return getComponentCategory(type) === 'button'
}

/**
 * 获取所有表单组件类型（不含展示/容器/按钮）
 * 可用于生成数据模型时过滤掉非表单组件
 */
export function getFormFieldTypes(): FieldType[] {
  return (Object.entries(componentCategoryMap) as [string, ComponentCategory][])
    .filter(([_, category]) => category === 'form')
    .map(([type]) => type as FieldType)
}

/**
 * 获取所有容器组件类型
 */
export function getContainerFieldTypes(): FieldType[] {
  return (Object.entries(componentCategoryMap) as [string, ComponentCategory][])
    .filter(([_, category]) => category === 'container')
    .map(([type]) => type as FieldType)
}
