# 自定义组件注册指南

## 概述

Form Engine 现在支持开发者注册自定义组件到设计器。自定义组件会：
1. 显示在左侧控件库中（按分类组织）
2. 支持拖拽到画布
3. 在属性面板中显示自定义属性配置

---

## 快速开始

### 方式 1：简化注册（推荐）

自动根据 `defaultProps` 推断属性配置：

```typescript
import React from 'react'
import { registerSimpleCustomComponent } from '@form-engine/core'

// 1. 定义你的组件
function MyButton(props: any) {
  return (
    <button
      style={{
        padding: '8px 16px',
        background: props.bgColor || '#1677ff',
        color: '#fff',
        border: 'none',
        borderRadius: 4,
        cursor: 'pointer',
      }}
      onClick={props.onClick}
    >
      {props.text || '按钮'}
    </button>
  )
}

// 2. 注册组件（自动推断属性配置）
registerSimpleCustomComponent('my-button', MyButton, {
  label: '我的按钮',       // 显示名称
  category: '自定义',      // 分类（显示在控件库的哪个分组下）
  defaultProps: {          // 默认属性
    text: '点击我',
    bgColor: '#1677ff',
    disabled: false,
    count: 0,
  },
  // propertyConfig 会自动根据 defaultProps 推断：
  // - text (string)     → input
  // - bgColor (string)  → input
  // - disabled (boolean) → checkbox
  // - count (number)     → number
})
```

### 方式 2：完整注册（精确控制）

手动指定每个属性的 widget 类型：

```typescript
import { registerCustomComponent } from '@form-engine/core'

registerCustomComponent('my-button', MyButton, {
  type: 'my-button',
  label: '我的按钮',
  category: '自定义',
  defaultProps: {
    text: '点击我',
    size: 'medium',
    bgColor: '#1677ff',
  },
  propertyConfig: [
    { key: 'text', label: '按钮文字', widget: 'input', group: '基础' },
    { 
      key: 'size', 
      label: '尺寸', 
      widget: 'select',
      widgetProps: {
        options: [
          { label: '小', value: 'small' },
          { label: '中', value: 'medium' },
          { label: '大', value: 'large' },
        ]
      },
      group: '样式'
    },
    { key: 'bgColor', label: '背景色', widget: 'input', group: '样式' },
    { key: 'disabled', label: '禁用', widget: 'checkbox', group: '高级' },
  ],
})
```

---

## 属性配置详解

### PropertyConfigItem 接口

```typescript
interface PropertyConfigItem {
  key: string                          // 属性名（对应 field.props 中的 key）
  label: string                         // 显示标签
  widget: PropertyWidgetType            // widget 类型
  widgetProps?: PropertyWidgetProps     // widget 配置
  group?: string                       // 分组名称
  required?: boolean                   // 是否必填
  description?: string                 // 描述信息
  visibleWhen?: Record<string, unknown> // 显示条件
}
```

### Widget 类型

| Widget 类型 | 说明 | 适用属性类型 | widgetProps |
|-------------|------|-------------|-------------|
| `input` | 文本输入框 | string | `placeholder` |
| `textarea` | 多行文本 | string (长文本) | `placeholder` |
| `number` | 数字输入框 | number | `min`, `max`, `step` |
| `select` | 下拉选择 | string / number | `options` |
| `checkbox` | 勾选框 | boolean | - |
| `switch` | 开关 | boolean | - |
| `json` | JSON 编辑器 | object / array | `jsonConfig` |
| `custom` | 自定义组件 | 任意 | `customWidget` |

### 示例：不同 widget 的配置

```typescript
propertyConfig: [
  // input
  { key: 'label', label: '标签', widget: 'input', widgetProps: { placeholder: '请输入' } },
  
  // textarea
  { key: 'description', label: '描述', widget: 'textarea', widgetProps: { placeholder: '请输入描述' } },
  
  // number
  { key: 'maxLength', label: '最大长度', widget: 'number', widgetProps: { min: 0, max: 1000, step: 1 } },
  
  // select
  { 
    key: 'size', 
    label: '尺寸', 
    widget: 'select',
    widgetProps: {
      options: [
        { label: '小', value: 'small' },
        { label: '中', value: 'medium' },
        { label: '大', value: 'large' },
      ]
    }
  },
  
  // checkbox
  { key: 'disabled', label: '禁用', widget: 'checkbox' },
  
  // switch
  { key: 'visible', label: '显示', widget: 'switch' },
  
  // json
  { key: 'config', label: '配置', widget: 'json', widgetProps: { jsonConfig: { collapsible: true } } },
  
  // custom（自定义 Widget）
  { 
    key: 'color', 
    label: '颜色', 
    widget: 'custom',
    widgetProps: { customWidget: 'ColorPicker' }
  },
]
```

---

## 自定义属性 Widget

如果内置的 widget 无法满足需求，可以注册自定义属性编辑组件。

### 步骤 1：创建自定义 Widget 组件

```typescript
import React from 'react'
import type { PropertyWidgetComponentProps } from '@form-engine/core'

// 自定义颜色选择器 Widget
function ColorPickerWidget(props: PropertyWidgetComponentProps) {
  const { value, onChange } = props
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <input
        type="color"
        value={value as string || '#000000'}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: 40, height: 32 }}
      />
      <span style={{ fontSize: 12, color: '#666' }}>{value}</span>
    </div>
  )
}
```

### 步骤 2：注册自定义 Widget

```typescript
import { registerCustomPropertyWidget } from '@form-engine/core'

// 注册自定义 Widget（名称要和在 propertyConfig 中引用的一致）
registerCustomPropertyWidget('ColorPicker', ColorPickerWidget)
```

### 步骤 3：在 propertyConfig 中引用

```typescript
registerCustomComponent('my-component', MyComponent, {
  label: '我的组件',
  defaultProps: { color: '#000000' },
  propertyConfig: [
    { 
      key: 'color', 
      label: '颜色', 
      widget: 'custom',
      widgetProps: { customWidget: 'ColorPicker' } // 引用注册的 Widget
    }
  ],
})
```

---

## 高级功能

### 1. 属性联动（visibleWhen）

根据其他属性值决定是否显示某个属性：

```typescript
propertyConfig: [
  { key: 'mode', label: '模式', widget: 'select', widgetProps: { options: [...] } },
  
  // 只有当 mode === 'multiple' 时才显示 maxCount
  { 
    key: 'maxCount', 
    label: '最大数量', 
    widget: 'number',
    visibleWhen: { mode: 'multiple' }
  },
]
```

### 2. 自定义 Widget 的额外配置

通过 `widgetProps.customWidgetProps` 传递额外配置：

```typescript
// 注册 Widget 时，可以读取 fieldProps 和 fieldSchema
function MyCustomWidget(props: PropertyWidgetComponentProps) {
  const { value, onChange, widgetProps, fieldProps, fieldSchema } = props
  
  // widgetProps.customWidgetProps 是额外的配置
  const { apiUrl, headers } = widgetProps?.customWidgetProps || {}
  
  // fieldProps 是字段的所有属性（可用于联动）
  const { mode } = fieldProps || {}
  
  // fieldSchema 是字段的完整 Schema
  const fieldType = fieldSchema?.type
  
  return <div>...</div>
}

// 在 propertyConfig 中传递额外配置
{
  key: 'dataSource',
  label: '数据源',
  widget: 'custom',
  widgetProps: {
    customWidget: 'MyCustomWidget',
    customWidgetProps: {
      apiUrl: '/api/data',
      headers: { Authorization: 'Bearer xxx' }
    }
  }
}
```

---

## 分类组织

自定义组件会按 `category` 字段分组显示在控件库中。

### 默认分类

如果不指定 `category`，默认分类为 `'自定义'`。

### 自定义分类

```typescript
registerSimpleCustomComponent('comp1', Comp1, {
  label: '组件1',
  category: '高级控件', // 会显示在 "高级控件" 分组下
  defaultProps: {},
})

registerSimpleCustomComponent('comp2', Comp2, {
  label: '组件2',
  category: '高级控件', // 同一个分类
  defaultProps: {},
})
```

在控件库中会显示为：

```
┌─────────────────┐
│ 高级控件        │
├─────────────────┤
│ [组件1] [组件2] │
└─────────────────┘
```

---

## API 参考

### registerSimpleCustomComponent(type, component, options)

简化注册自定义组件（自动推断属性配置）。

**参数：**
- `type: string` - 组件类型标识（唯一）
- `component: React.ComponentType<any>` - 组件实例
- `options: SimpleCustomComponentOptions` - 配置选项
  - `label: string` - 显示名称
  - `icon?: React.ReactNode | string` - 图标
  - `category?: string` - 分类（默认为 `'自定义'`）
  - `defaultProps?: Record<string, unknown>` - 默认属性
  - `propertyConfig?: PropertyConfigItem[]` - 属性配置（可选，不提供则自动推断）
  - `description?: string` - 组件描述

### registerCustomComponent(type, component, config)

完整注册自定义组件（需显式定义属性配置）。

**参数：**
- `type: string` - 组件类型标识（唯一）
- `component: React.ComponentType<any>` - 组件实例
- `config: CustomComponentConfig` - 完整配置

### unregisterCustomComponent(type)

注销自定义组件。

**参数：**
- `type: string` - 组件类型标识

### registerCustomPropertyWidget(name, component)

注册自定义属性 Widget。

**参数：**
- `name: string` - Widget 名称（在 `propertyConfig.widgetProps.customWidget` 中引用）
- `component: React.ComponentType<PropertyWidgetComponentProps>` - Widget 组件

---

## 注意事项

1. **组件类型唯一性**：`type` 必须唯一，不能与已有组件重复。

2. **Widget 注册时机**：自定义 Widget 必须在渲染属性面板之前注册。

3. **属性名冲突**：自定义组件的属性名不要与标准属性（`label`, `name`, `placeholder` 等）冲突。

4. **默认值**：`defaultProps` 会在拖拽组件到画布时作为初始值。

5. **组件渲染**：注册的组件会自动注册到组件注册表，可以在画布中正常渲染。

---

## 完整示例

```typescript
import React from 'react'
import { registerSimpleCustomComponent, registerCustomPropertyWidget } from '@form-engine/core'

// 1. 定义组件
function RatingComponent(props: any) {
  const { value = 0, onChange, max = 5 } = props
  
  return (
    <div>
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          onClick={() => onChange?.(i + 1)}
          style={{ cursor: 'pointer', fontSize: 24, color: i < value ? '#faad14' : '#d9d9d9' }}
        >
          ★
        </span>
      ))}
    </div>
  )
}

// 2. 定义自定义 Widget（可选）
function MaxRatingWidget(props: any) {
  return (
    <select value={props.value} onChange={(e) => props.onChange(Number(e.target.value))}>
      <option value={3}>3 星</option>
      <option value={5}>5 星</option>
      <option value={10}>10 星</option>
    </select>
  )
}

// 3. 注册自定义 Widget（如果需要）
registerCustomPropertyWidget('MaxRating', MaxRatingWidget)

// 4. 注册组件
registerSimpleCustomComponent('rating', RatingComponent, {
  label: '评分组件',
  category: '高级',
  defaultProps: {
    value: 0,
    max: 5,
    allowHalf: false,
  },
  propertyConfig: [
    { key: 'value', label: '默认值', widget: 'number', widgetProps: { min: 0, max: 10 } },
    { key: 'max', label: '最大星数', widget: 'custom', widgetProps: { customWidget: 'MaxRating' } },
    { key: 'allowHalf', label: '允许半星', widget: 'checkbox' },
  ],
})
```

---

## 总结

通过新的自定义组件注册系统，开发者可以：

✅ **轻松注册自定义组件** - 只需要几行代码  
✅ **自动属性推断** - 默认情况下无需手动配置  
✅ **精确控制属性编辑** - 支持多种内置 widget  
✅ **自定义属性 Widget** - 支持复杂的属性编辑需求  
✅ **属性联动** - 支持根据其他属性值动态显示/隐藏  
✅ **分类组织** - 自定义组件按分类显示在控件库中

改造完成！🎉
