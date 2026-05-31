/**
 * Form Engine - Antd Adapter
 * 提供 antd 组件实现，自动覆盖 core 的默认 HTML 组件
 * 
 * 使用方式：
 * ```typescript
 * // 方式1：导入即自动注册（推荐）
 * import '@form-engine/adapter-antd'
 * 
 * // 方式2：手动注册（如果需要控制注册时机）
 * import { antdComponents } from '@form-engine/adapter-antd'
 * import { registerComponents } from '@form-engine/core'
 * registerComponents(antdComponents)
 * ```
 */

import React from 'react'

// 导入所有 antd 组件
export { Input, Password } from './components/Input'
export { Select } from './components/Select'
export { TextArea } from './components/TextArea'
export { Switch } from './components/Switch'

// 更多组件待实现...
// export { InputNumber } from './components/InputNumber'
// export { Radio, Checkbox } from './components/RadioCheckbox'
// export { Slider } from './components/Slider'
// export { Rate } from './components/Rate'
// export { DatePicker, DateRangePicker, TimePicker } from './components/DatePicker'
// export { Upload } from './components/Upload'
// export { Cascader } from './components/Cascader'
// export { TreeSelect } from './components/TreeSelect'

/**
 * Antd 组件映射（用于注册）
 * 支持 desktop 和 mobile 场景
 */
export const antdComponents = {
  'Input': React.lazy(() => import('./components/Input').then(m => ({ default: m.Input }))),
  'Password': React.lazy(() => import('./components/Input').then(m => ({ default: m.Password }))),
  'Textarea': React.lazy(() => import('./components/TextArea').then(m => ({ default: m.TextArea }))),
  'Select': React.lazy(() => import('./components/Select').then(m => ({ default: m.Select }))),
  'Switch': React.lazy(() => import('./components/Switch').then(m => ({ default: m.Switch }))),  
  
  // 更多组件待添加...
}

/**
 * 自动注册 antd 组件（覆盖 core 的默认 HTML 组件）
 * 当导入此模块时自动执行
 */
function autoRegister() {
  // 动态导入 core 的注册函数
  const core = require('@form-engine/core')
  if (core && core.registerComponents) {
    core.registerComponents(antdComponents)
  }
}

// 自动注册（副作用）
if (typeof window !== 'undefined') {
  autoRegister()
}

export default antdComponents
