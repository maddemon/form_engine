/**
 * Form Engine Adapter 接口定义
 *
 * Adapter 负责将 Form Engine 的字段类型映射到具体的 UI 库组件。
 *
 * 核心原则：
 * - 纯对象，无 Proxy，无全局状态
 * - 显式传入，谁用谁传
 * - scene 标明适配场景，由调用方按需选择
 *
 * 类型分组说明（按职责拆分到子文件再 barrel re-export）：
 * - adapter-field.ts   → FieldComponentProps, FieldRendererFn, ComponentRenderFn, DeviceScene
 * - adapter-form.ts    → FormWrapperProps, FormItemProps, ValidateFn
 * - adapter-designer.ts → DesignerWidgets, PropEditorConfig, PropertyPanelRenderProps
 */

import * as React from 'react'
import type { BridgeProviderProps } from '../styles/themeBridge'
import type { FieldRendererFn, DeviceScene } from './adapter-field'
import type { FormWrapperProps, FormItemProps, ValidateFn } from './adapter-form'
import type { DesignerWidgets } from './adapter-designer'

// Barrel re-export — consumer 的 import 路径不变
export type {
  FieldComponentProps,
  FieldRendererFn,
  ComponentRenderFn,
  DeviceScene,
} from './adapter-field'
export type {
  FormWrapperProps,
  FormItemProps,
  ValidateFn,
} from './adapter-form'
export type {
  DesignerWidgets,
  PropEditorConfig,
  PropertyPanelRenderProps,
} from './adapter-designer'

// ============================
// Adapter 接口
// ============================

/**
 * Form Engine Adapter 接口
 *
 * 每个 UI 库（antd、antd-mobile 等）实现一个 adapter。
 * Adapter 是一个纯对象，无 Proxy、无全局注册。
 *
 * 使用方式：
 * ```tsx
 * import { antdAdapter } from '@form-engine/adapter-antd'
 * import { antdMobileAdapter } from '@form-engine/adapter-antd-mobile'
 *
 * // 设计/预览：传两个 adapter，框架按 scene 自动切换
 * <Designer desktopAdapter={antdAdapter} mobileAdapter={antdMobileAdapter} />
 * <FormRender desktopAdapter={antdAdapter} mobileAdapter={antdMobileAdapter} scene={scene} />
 *
 * // 只传一个时，无论 scene 都使用它
 * <Designer desktopAdapter={antdAdapter} />
 * ```
 */
export interface FormEngineAdapter {
  /** Adapter 名称，如 'antd'、'antd-mobile' */
  name: string

  /** 适配场景 */
  scene: DeviceScene

  /**
   * 字段组件映射：field.type → FieldRendererFn
   *
   * key 为小写字段类型（如 'input'、'select'、'date-picker'），
   * value 为对应的渲染函数。
   */
  components: Record<string, FieldRendererFn>

  /** 兜底渲染函数，未知字段类型时使用 */
  default: FieldRendererFn

  /** 设计器属性面板小组件 */
  designerWidgets?: DesignerWidgets

  /**
   * 主题桥接 Provider
   *
   * adapter 可选提供，用于将宿主 UI 库的主题 Token 同步到 Form Engine 的 --fe-* CSS 变量。
   * Designer / FormRender 会在内部自动包裹此 Provider，消费者无需手动处理。
   *
   * @example
   * ```ts
   * // adapter-antd 内部
   * import { AntdBridgeProvider } from './themeBridge'
   * export const antdAdapter: FormEngineAdapter = {
   *   bridgeProvider: AntdBridgeProvider,
   *   // ...
   * }
   * ```
   */
  bridgeProvider?: React.ComponentType<BridgeProviderProps>

  /**
   * Form 容器组件（可选）
   * 不提供时引擎使用原生 <form> 元素
   */
  FormWrapper?: React.ComponentType<FormWrapperProps>

  /**
   * FormItem 包裹组件（可选）
   * 不提供时引擎使用内置 DefaultFormItem（label + error 渲染）
   */
  FormItem?: React.ComponentType<FormItemProps>

  /**
   * 校验函数（可选）
   * 不提供时引擎使用内置 validateForm() 兜底
   */
  validate?: ValidateFn

  /**
   * JSX 组件作用域
   * 暴露给 JSX 渲染器的组件映射。key 是组件名，value 是组件。
   * 两个 adapter 的 jsxScope 合并铺平到统一 scope 中，无覆盖规则。
   * 用户也可通过 FormRender.jsxScope 额外注入。
   */
  jsxScope?: Record<string, React.ComponentType<any>>
}