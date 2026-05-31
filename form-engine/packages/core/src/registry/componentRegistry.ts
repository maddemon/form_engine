/**
 * 组件注册表
 * 管理组件的注册和获取
 * 
 * 默认注册了 HTML 原生组件实现
 * 当安装 adapter（如 antd）后，adapter 会覆盖同名组件的默认实现
 */

import React from 'react'
import type { ComponentType } from '../types/component-props'

// 导入默认 HTML 组件
import {
  Input as HTMLInput,
  Password as HTMLPassword,
  Select as HTMLSelect,
  TextArea as HTMLTextArea,
  Switch as HTMLSwitch,
  Radio as HTMLRadio,
  Checkbox as HTMLCheckbox,
  InputNumber as HTMLInputNumber,
  Slider as HTMLSlider,
  Rate as HTMLRate,
  DatePicker as HTMLDatePicker,
  Upload as HTMLUpload,
  Button as HTMLButton,
  Grid as HTMLGrid,
  Flex as HTMLFlex,
  Text as HTMLText,
  Image as HTMLImage,
  Divider as HTMLDivider,
  Container as HTMLContainer,
} from '../components'

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
 */
export function getComponent(type: string, scene?: DeviceScene): React.ComponentType<any> | null {
  const targetScene = scene || currentScene
  const components = targetScene === 'desktop' ? desktopComponents : mobileComponents
  return components.get(type) || null
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
 * 初始化默认组件（HTML 原生实现）
 * 在模块加载时自动调用
 */
function initDefaultComponents() {
  const defaultComponents = {
    // 表单组件
    'Input': HTMLInput,
    'Password': HTMLPassword,
    'TextArea': HTMLTextArea,
    'Select': HTMLSelect,
    'Radio': HTMLRadio,
    'RadioGroup': HTMLRadio, // RadioGroup 使用相同实现
    'Checkbox': HTMLCheckbox,
    'CheckboxGroup': HTMLCheckbox, // CheckboxGroup 使用相同实现
    'InputNumber': HTMLInputNumber,
    'Slider': HTMLSlider,
    'Rate': HTMLRate,
    'DatePicker': HTMLDatePicker,
    'DateRangePicker': HTMLDatePicker, // 实际应区分，暂时使用相同实现
    'Upload': HTMLUpload,
    'Switch': HTMLSwitch,
    'Button': HTMLButton,

    // 布局组件
    'Grid': HTMLGrid,
    'Flex': HTMLFlex,

    // 展示组件
    'Text': HTMLText,
    'Image': HTMLImage,
    'Divider': HTMLDivider,
    'Container': HTMLContainer,
  }

  // 注册默认组件（如果用户后续注册同名组件，会自动覆盖）
  registerComponents(defaultComponents)
}

// 初始化默认组件
initDefaultComponents()
