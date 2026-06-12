/**
 * Form Engine - Designer 模块
 * 表单设计器（可视化拖拽编辑）
 */

// 导出主组件
export { Canvas } from './Canvas'
export { Designer } from './Designer'
export { PalettePanel } from './PalettePanel'
export { PropertyPanel } from './PropertyPanel'

// 导出容器渲染器注册 API
export { getContainerRenderer, registerContainerRenderer } from './ContainerPreview'

// 导出默认设计器小组件（可传入 PropertyPanel 的 designerWidgets prop）
export { defaultDesignerWidgets as designerWidgets } from '../widgets'

// 导出 Hooks（方便开发者自定义设计器）
export { useDesignerScene, useFieldActions } from './hooks'

// 导出工具和类型
export { createFieldFromPalette, generateFieldId, getFullPaletteGroups } from './PalettePanel'
export { defaultPaletteGroups as defaultPalette } from './data/paletteData'

// 导出类型定义
export type { DesignerWidgets } from '../types/adapter'
export type {
    DesignerAction,
    DesignerProps,
    PaletteGroup,
    PaletteItem,
    PanelWidths,
    SelectedFieldId
} from '../types/designer'

