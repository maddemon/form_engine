/**
 * Property Slot 注册表
 *
 * 管理属性编辑器 Slot 的注册、查询和兜底。
 * 优先级链：运行时注入 > 全局注册 > Widget 兜底 > 核心兜底
 *
 * 拆分结构：
 * - registry.ts       类 + 全局单例
 * - widgetAdapters.tsx DesignerWidgets → PropertySlotProps 适配
 * - resolveSlot.tsx   defaultSlotFallbacks + resolveSlot 解析入口
 * - fallbacks/        4 个核心 fallback 组件
 */

export { PropertySlotRegistry, propertySlotRegistry } from './registry'
export { resolveSlot, defaultSlotFallbacks } from './resolveSlot'
