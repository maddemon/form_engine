/**
 * 组件注册表
 * 管理组件的注册和获取
 * 
 * 重要：
 * - 不再提供 HTML 默认组件
 * - 必须安装并注册 adapter 才能使用
 * - adapter 通过 registerComponents 注册组件
 * 
 * 使用方式：
 * ```typescript
 * import { antdComponents } from '@form-engine/adapter-antd'
 * import { registerComponents } from '@form-engine/core'
 * 
 * // 注册 antd 组件
 * registerComponents(antdComponents)
 * 
 * // 或者使用 registerAdapter（推荐）
 * import { antdAdapter } from '@form-engine/adapter-antd'
 * import { registerAdapter } from '@form-engine/core'
 * 
 * registerAdapter(antdAdapter)
 * ```
 */

import React from 'react'
import type { ComponentType } from '../types/component-props'

type ComponentMap = Map<string, React.ComponentType<any>>

// 存储 desktop 和 mobile 两种场景的组件
const desktopComponents: ComponentMap = new Map()
const mobileComponents: ComponentMap = new Map()

// 当前场景
export type DeviceScene = 'desktop' | 'mobile'

let currentScene: DeviceScene = 'desktop'

/**
 * 设置当前场景
 */
export function setScene(scene: DeviceScene) {
  currentScene = scene
}

/**
 * 获取当前场景
 */
export function getScene(): DeviceScene {
  return currentScene
}

/**
 * 自动检测场景（根据窗口宽度）
 */
export function autoDetectScene(): DeviceScene {
  if (typeof window === 'undefined') return 'desktop'
  return window.innerWidth < 768 ? 'mobile' : 'desktop'
}

/**
 * 注册组件（可以指定场景）
 * 如果同名组件已存在，会被覆盖（允许 adapter 覆盖默认组件）
 */
export function registerComponent(
  type: string,
  component: React.ComponentType<any>,
  scene?: DeviceScene | 'both'
) {
  if (scene === 'both' || !scene) {
    desktopComponents.set(type, component)
    mobileComponents.set(type, component)
  } else if (scene === 'desktop') {
    desktopComponents.set(type, component)
  } else if (scene === 'mobile') {
    mobileComponents.set(type, component)
  }
}

/**
 * 批量注册组件
 */
export function registerComponents(
  components: Record<string, React.ComponentType<any>>,
  scene?: DeviceScene | 'both'
) {
  for (const [type, component] of Object.entries(components)) {
    registerComponent(type, component, scene)
  }
}

/**
 * 获取组件（根据当前场景）
 * @throws 如果组件未注册，抛出错误提示安装 adapter
 */
export function getComponent(type: string, scene?: DeviceScene): React.ComponentType<any> | null {
  const targetScene = scene || currentScene
  const components = targetScene === 'desktop' ? desktopComponents : mobileComponents
  
  const component = components.get(type)
  
  if (!component) {
    console.error(
      `[Form Engine] 组件 "${type}" 未注册。\n` +
      `请安装并注册对应的 adapter，例如：\n` +
      `  import { antdAdapter } from '@form-engine/adapter-antd'\n` +
      `  import { registerAdapter } from '@form-engine/core'\n` +
      `  registerAdapter(antdAdapter)\n`
    )
  }
  
  return component || null
}

/**
 * 获取 desktop 组件
 */
export function getDesktopComponent(type: string): React.ComponentType<any> | null {
  return desktopComponents.get(type) || null
}

/**
 * 获取 mobile 组件
 */
export function getMobileComponent(type: string): React.ComponentType<any> | null {
  return mobileComponents.get(type) || null
}

/**
 * 检查组件是否已注册
 */
export function hasComponent(type: string, scene?: DeviceScene): boolean {
  const targetScene = scene || currentScene
  const components = targetScene === 'desktop' ? desktopComponents : mobileComponents
  return components.has(type)
}

/**
 * 清空注册表（用于测试）
 */
export function clearRegistry() {
  desktopComponents.clear()
  mobileComponents.clear()
}

/**
 * 获取所有已注册的组件类型
 */
export function getRegisteredTypes(scene?: DeviceScene): string[] {
  const targetScene = scene || currentScene
  const components = targetScene === 'desktop' ? desktopComponents : mobileComponents
  return Array.from(components.keys())
}

/**
 * 检查是否已注册任何组件（即是否已安装 adapter）
 */
export function hasAnyComponent(): boolean {
  return desktopComponents.size > 0 || mobileComponents.size > 0
}
