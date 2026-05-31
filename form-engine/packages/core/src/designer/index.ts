/**
 * Form Engine - Designer 模块
 * 表单设计器（可视化拖拽编辑）
 */

// 导出主组件
export { Designer } from './Designer'
export { Canvas } from './Canvas'
export { FieldList } from './FieldList'
export { PropertyPanel } from './PropertyPanel'

// 导出 Hooks（方便开发者自定义设计器）
export {
  useFormDesigner,
  useDesignerScene,
  useDesignerHistory,
  useFieldActions,
} from './hooks'

// 导出工具和类型
export { defaultPaletteGroups as defaultPalette, createFieldFromPalette, generateFieldId } from './FieldList'

// 导出类型定义
export type {
  DesignerProps,
  DesignerAction,
  PaletteItem,
  SelectedFieldId,
} from '../../types/designer'
