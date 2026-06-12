/**
 * Form Engine - 组件注册表
 *
 * 从各组件目录的 index.ts 导入 meta 数据，组装成 componentRegistry。
 * 各组件自管 label / category / icon / defaultProps / eventDeclarations。
 *
 * 消费方：
 * - FieldType 联合类型       → keyof typeof componentRegistry | 'custom' | `custom:${string}`
 * - componentPalettes（兼容） → 从 registry 派生
 * - EVENT_DECLARATION_MAP   → 从 registry 派生
 * - PropsRenderMap          → propRenders/index.ts（独立维护，与 registry 保持同步）
 * - paletteData             → 查 registry.label / .defaultProps
 * - getComponentCategory    → 查 registry.category
 */

import type { ComponentRegistration } from '../types/component'
import type { EventDeclaration } from '../types/events'
import { meta as alert } from './alert'
import { meta as button } from './button'
import { meta as card } from './card'
import { meta as cascader } from './cascader'
import { meta as checkbox } from './checkbox'
import { meta as collapse } from './collapse'
import { dateMeta, dateRangeMeta } from './date-picker'
import { meta as dateTime } from './date-time'
import { meta as divider } from './divider'
import { meta as flex } from './flex'
import { meta as grid } from './grid'
import { meta as image } from './image'
import { inputMeta } from './input'
import { meta as inputNumber } from './input-number'
import { meta as password } from './password'
import { meta as radio } from './radio'
import { meta as rate } from './rate'
import { meta as segment } from './segment'
import { meta as select } from './select'
import { meta as slider } from './slider'
import { meta as subForm } from './sub-form'
import { meta as switch_ } from './switch'
import { meta as tabs } from './tabs'
import { meta as text } from './text'
import { meta as textarea } from './textarea'
import { meta as time } from './time-picker'
import { meta as title_ } from './title'
import { meta as treeSelect } from './tree-select'
import { meta as upload } from './upload'
import { meta as html } from './html'
import { meta as jsx } from './jsx'

// ============================
// 组件注册表（数据源自各组件 index.ts）
// ============================

export const componentRegistry = {
  // ── 表单组件 ─────────────────────────────────────
  input: { ...inputMeta },
  textarea: { ...textarea },
  'input-number': { ...inputNumber },
  password: { ...password },
  select: { ...select },
  'multi-select': { ...select },
  radio: { ...radio },
  checkbox: { ...checkbox },
  switch: { ...switch_ },
  slider: { ...slider },
  rate: { ...rate },
  date: { ...dateMeta },
  'date-range': { ...dateRangeMeta },
  datetime: { ...dateTime },
  time: { ...time },
  upload: { ...upload },
  cascader: { ...cascader },
  'tree-select': { ...treeSelect },

  // ── 容器组件 ─────────────────────────────────────
  grid: { ...grid },
  flex: { ...flex },
  collapse: { ...collapse },
  tabs: { ...tabs },
  'sub-form': { ...subForm },
  card: { ...card },

  // ── 展示组件 ─────────────────────────────────────
  text: { ...text },
  title: { ...title_ },
  image: { ...image },
  divider: { ...divider },
  alert: { ...alert },
  html: { ...html },
  jsx: { ...jsx },
  segment: { ...segment },

  // ── 按钮组件 ─────────────────────────────────────
  button: { ...button },
} as const satisfies Record<string, ComponentRegistration>

// ============================
// 从 registry 派生的查询表
// ============================

/**
 * EVENT_DECLARATION_MAP（从 registry 派生）
 */
const EVENT_DECLARATION_MAP: Record<string, EventDeclaration[]> = Object.fromEntries(
  Object.entries(componentRegistry).map(([type, reg]) => [type, reg.eventDeclarations]),
)

/** 按 FieldType 查询该组件支持的事件声明 */
export function getEventDeclarations(type: string): EventDeclaration[] {
  return EVENT_DECLARATION_MAP[type] ?? []
}

/** 所有内置字段类型列表 */
export const ALL_FIELD_TYPES = Object.keys(componentRegistry)