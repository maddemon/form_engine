# Property Slot 设计

## 1. 概念

Slot = 一个命名属性编辑器的占位。核心只提供兜底（textarea/input），Adapter 或使用者可以注册更好的实现。

```
核心兜底（textarea / input）
  ← Adapter 注册增强版
    ← 最终使用者注册自实现版（优先级最高）
```

## 2. 与 DesignerWidgets 的区分

| 维度 | DesignerWidgets | Slots |
|------|----------------|-------|
| 组件 | 简单通用（Input、Select、Switch） | 复杂领域（JS 编辑器、数据源编辑器） |
| 覆盖粒度 | 全局 — 同一个 widget 替换所有出现位置 | 按 slot 名 — 只影响特定类型属性 |
| 兜底策略 | 核心提供 HTML 原生实现 | 核心提供 textarea/input，**不实现复杂版** |
| 谁提供 | Adapter 覆盖 UI 库专属版本 | Adapter 或最终使用者提供专业实现 |

## 3. Slot 完整清单

| Slot 名 | 值类型 | 核心兜底 | 用途 |
|---------|--------|----------|------|
| `expressionEditor` | `string` | `<w.ExpressionInput>` → `<textarea>` | 所有动态表达式 |
| `dataSourceEditor` | `FieldDataSource` | 静态 tab（OptionsEditor）+ 远程 tab（URL 输入） | 数据源配置 |
| `jsonEditor` | `object \| string` | `<textarea>` + JSON 格式化/校验 | JSON 数据编辑 |
| `codeEditor` | `string` | `<textarea>` monospace | 代码片段（正则、自定义校验） |

> `ColorPicker` 不属于 Slot — 它够简单，已加到 `DesignerWidgets`（`ColorPicker` 字段已存在于 `adapter.ts`）。

## 4. 类型定义

```typescript
// ── Slot 类型定义 ── 存放于 packages/core/src/types/property-slot.ts ─────

export type SlotName = 'expressionEditor' | 'dataSourceEditor' | 'jsonEditor' | 'codeEditor'

export interface PropertySlotProps {
  value: unknown
  onChange: (value: unknown) => void
  /** 当前正在编辑的字段 Schema（可为 null，如 FormConfig 场景）*/
  field?: FormFieldSchema | null
  /** 所有字段名（用于表达式编辑器插入字段名） */
  fieldNames?: string[]
  /** Slot 专属上下文 */
  context?: Record<string, unknown>
}

export interface PropertySlots {
  expressionEditor?: React.ComponentType<PropertySlotProps>
  dataSourceEditor?: React.ComponentType<PropertySlotProps>
  jsonEditor?: React.ComponentType<PropertySlotProps>
  codeEditor?: React.ComponentType<PropertySlotProps>
}

// ── 注册表（全局单例） ── 存放于 packages/core/src/registry/propertySlotRegistry.tsx ──

export class PropertySlotRegistry {
  private slots = new Map<SlotName, React.ComponentType<PropertySlotProps>>()

  register(name: SlotName, component: React.ComponentType<PropertySlotProps>): void
  get(name: SlotName): React.ComponentType<PropertySlotProps> | undefined
  has(name: SlotName): boolean
}

export const propertySlotRegistry = new PropertySlotRegistry()

// ── PropsRender 新增 ── 修改 packages/core/src/propRenders/types.ts ──────

export interface PropsRenderProps {
  widgets: DesignerWidgets & Required<Pick<DesignerWidgets, 'ButtonGroup' | 'TextArea'>>
  values: Record<string, unknown>
  onChange: (key: string, value: unknown) => void
  dataSource?: FieldDataSource          // 已有
  onDataSourceChange?: (ds: FieldDataSource) => void  // 已有
  slots?: PropertySlots                 // <--- 新增
}
```

## 5. Fallback 链

每个 slot 内部按此优先级查找：

```
1. propsRenderProps.slots.xxx          ← 运行时注入（优先级最高）
2. propertySlotRegistry.get('xxx')     ← 全局注册（适配器启动时注册）
3. Widget 兜底（w.ExpressionInput / w.DataSourceEditor 等）
4. defaultSlotFallbacks.xxx            ← 核心兜底（原生 textarea）
```

工具函数（存放于 `packages/core/src/registry/propertySlotRegistry.tsx`）：

```typescript
function resolveSlot(
  name: SlotName,
  slots?: PropertySlots,
  widgets?: DesignerWidgets,
): React.ComponentType<PropertySlotProps> {
  return (
    slots?.[name] ??
    propertySlotRegistry.get(name) ??
    getWidgetFallback(name, widgets) ??
    defaultSlotFallbacks[name]
  )
}
```

### Slot 与现有 Widget 的关系

改造后，`w.ExpressionInput`、`w.DataSourceEditor` 等 widget **保留在 DesignerWidgets 中**作为 slot 的 fallback 实现。关系如下：

| Slot | 当前对应 Widget | 改造后关系 |
|------|-----------------|-----------|
| `expressionEditor` | `w.ExpressionInput` | fallback 链第 3 级：未注册 slot 时降级为 `w.ExpressionInput` → `w.TextArea` → `<textarea>` |
| `dataSourceEditor` | `w.DataSourceEditor` | fallback 链第 3 级：未注册 slot 时降级为 `w.DataSourceEditor` |
| `jsonEditor` | 无（硬编码 `<textarea>`） | fallback 链第 3 级：`<textarea>` + JSON 校验 |
| `codeEditor` | 无（用 `w.Input`） | fallback 链第 3 级：`<textarea>` monospace |

> Widget 是"全局替换同一组件"，Slot 是"按名称替换特定类型属性编辑器"。两者互补，不互斥。

## 6. 各属性 Slot 使用表

### 6a. 基础属性（DefaultPropertyContent）

| 属性 | 当前实现 | 改为使用 Slot | 说明 |
|------|----------|---------------|------|
| `hidden` | `w.ExpressionInput` | `expressionEditor` | 表达式可能复杂，允许用户用代码编辑器写 |
| `disabled` | `w.Switch`（只支持 boolean） | `expressionEditor` | Schema 支持 `boolean \| string`，目前只暴露了 boolean |
| `readOnly` | `w.Switch`（只支持 boolean） | `expressionEditor` | 同上 |
| `defaultValue` | `w.Input`（纯文本） | `expressionEditor` | 默认值可能是静态值，也可以是动态表达式 |

> `disabled`/`readOnly` 目前只有开关。改造后：**静态时用 Switch，动态时用 expressionEditor**。内部可做 toggle 切换。
>
> **切换交互设计**：在 Switch 右侧增加一个"切换为表达式"图标按钮，点击后 Switch 消失、expressionEditor 出现，值从 `boolean` 转为 `string`；expressionEditor 旁有"切换为静态"按钮，点击后回到 Switch，值从 `string` 转为 `boolean`（空字符串/非布尔字符串时默认切回 `false`）。

### 6b. 表达式相关（分散在多个组件）

| 位置 | 属性 | 当前实现 | 改为使用 Slot |
|------|------|----------|---------------|
| `EventHandlerEditor` | 事件表达式 | `w.TextArea` 写代码 | `expressionEditor` |
| `EventHandlerEditor` | action 参数 | `w.TextArea` + 手动 JSON.parse | `jsonEditor` |
| `RulesEditor` | 正则 pattern | `w.Input` | `codeEditor` |
| `FormFieldSchema` | `requiredIfExpr` | 未暴露 | `expressionEditor` |
| `FormFieldSchema` | `visibleIfExpr` | 未暴露 | `expressionEditor` |
| `FormFieldSchema` | `disabledIfExpr` | 未暴露 | `expressionEditor` |

> **现状差异**：`DefaultPropertyContent` 中 `hidden` 用的是 `w.ExpressionInput`，而 `EventHandlerEditor` 中表达式用的是 `w.TextArea`——两处表达式编辑方式不统一。改造后统一走 `expressionEditor` slot，消除不一致。

### 6c. 组件属性 PropsRender

| PropsRender | 属性 | 当前实现 | 改为使用 Slot |
|-------------|------|----------|---------------|
| `TextPropsRender` | `color` | `w.Input` | 改用 `w.ColorPicker`（已在 DesignerWidgets 中） |
| `TitlePropsRender` | `color` | `w.Input` | 同上 |
| `DividerPropsRender` | `color` | `w.Input` | 同上 |
| `DatePickerPropsRender` | `disabledDate` | `w.Input` | `expressionEditor` |
| `SliderPropsRender` | `defaultValue` | `w.Input` | `expressionEditor` |

### 6d. CustomPropsRender

| case | 当前实现 | 改为使用 |
|------|----------|----------|
| `'json'` | 硬编码 `<textarea>` | `jsonEditor` slot |
| `'expression'` | `w.ExpressionInput` → `w.Input` | `expressionEditor` slot |
| `'custom'` | 查全局 `customPropertyWidgetRegistry` | 优先查 `CustomComponentConfig.propertyWidgets`，再查全局 |

### 6e. 数据源（field.dataSource）

**当前状态**：`FormFieldSchema.dataSource` 已定义类型，且 Select/Radio/Checkbox/Cascader/TreeSelect 的 PropsRender **已使用 `w.DataSourceEditor` 渲染**。`PropsRenderProps` 也已有 `dataSource` 和 `onDataSourceChange` 字段。

改造目标：将现有的 `w.DataSourceEditor` widget 调用改为使用 `dataSourceEditor` slot，使数据源编辑器可被替换。

需要数据源的组件：

| 组件 | 数据源作用 | 当前实现 |
|------|-----------|---------|
| `select`、`multi-select` | 下拉选项 | `w.DataSourceEditor` |
| `radio` | 单选选项 | `w.DataSourceEditor` |
| `checkbox` | 多选选项 | `w.DataSourceEditor` |
| `cascader` | 级联选项 | `w.DataSourceEditor` |
| `tree-select` | 树选选项 | `w.DataSourceEditor` |
| `sub-form` | 子表单列定义 | 未使用数据源 |

改造方式：在这些 PropsRender 中将 `w.DataSourceEditor` 替换为 `dataSourceEditor` slot。未注册 slot 时 fallback 到 `w.DataSourceEditor`（即当前行为不变）。

### 6f. 未来组件

未来新增展示型组件（如 `list` 等）同样使用 `dataSourceEditor` slot 来配置数据源，核心只提供兜底。

## 7. Consumer 使用示例

**方式一：Designer 注入（推荐）**

```tsx
import { MonacoEditor } from './my/MonacoEditor'

<Designer
  value={schema}
  onChange={setSchema}
  propertySlots={{
    expressionEditor: MonacoEditor,  // 替换所有表达式编辑器为 Monaco
    jsonEditor: MonacoEditor,
  }}
/>
```

**方式二：全局注册（适配器初始化时）**

```tsx
// adapter-antd/src/widgets/slots.ts
import { propertySlotRegistry } from '@form-engine/core'

propertySlotRegistry.register('expressionEditor', MonacoEditor)
propertySlotRegistry.register('dataSourceEditor', AntdDataSourceEditor)
```

**方式三：自定义 ColorPicker（DesignerWidgets）**

```tsx
// adapter-antd
const designerWidgets: DesignerWidgets = {
  ...antdWidgets,
  ColorPicker: MyColorPicker,  // 新增到 DesignerWidgets
}
```

## 8. PropsRender 改造清单

### Phase 1 — Slot 基础设施 ✅

| 文件 | 改动 |
|------|------|
| `packages/core/src/types/property-slot.ts` | 新建：`SlotName`、`PropertySlotProps`、`PropertySlots` 类型 |
| `packages/core/src/registry/propertySlotRegistry.tsx` | 新建：`PropertySlotRegistry` 类 + 单例 + `resolveSlot` 工具函数 + `defaultSlotFallbacks` + Widget 适配器 |
| `packages/core/src/propRenders/types.ts` | `PropsRenderProps` 加 `slots?: PropertySlots`（保留已有的 `dataSource`/`onDataSourceChange` 字段） |
| `packages/core/src/types/designer.ts` | `DesignerProps` 加 `propertySlots?: PropertySlots` |
| `packages/core/src/designer/Designer.tsx` | 把 `propertySlots` 传给 `PropertyPanel` |
| `packages/core/src/designer/PropertyPanel.tsx` | 把 `slots` 传给 `DefaultPropertyContent` + 所有 PropsRender |

### Phase 2 — 基础属性改用 Slot ✅

| 文件 | 改动 |
|------|------|
| `DefaultPropertyContent.tsx` | `hidden` 改用 `expressionEditor` slot |
| `DefaultPropertyContent.tsx` | `disabled`/`readOnly` 加 boolean ↔ expression 切换 → 用 `expressionEditor` |
| `DefaultPropertyContent.tsx` | `defaultValue` 改用 `expressionEditor` slot |

### Phase 3 — 事件/规则编辑器 ✅

| 文件 | 改动 |
|------|------|
| `EventHandlerEditor.tsx` | 事件表达式改用 `expressionEditor` slot |
| `EventHandlerEditor.tsx` | action 参数改用 `jsonEditor` slot |
| `RulesEditor.tsx` | pattern 改用 `codeEditor` slot |

### Phase 4 — CustomPropsRender ✅

| 文件 | 改动 |
|------|------|
| `CustomPropsRender.tsx` | `case 'json'` 改用 `jsonEditor` slot |
| `CustomPropsRender.tsx` | `case 'expression'` 改用 `expressionEditor` slot |
| `CustomPropsRender.tsx` | `case 'custom'` 优先查 `customComponentConfig.propertyWidgets` |

### Phase 5 — 组件 PropsRender 数据源 ✅

| 文件 | 改动 |
|------|------|
| `packages/core/src/components/select/Props.tsx` | `w.DataSourceEditor` 改为 `dataSourceEditor` slot |
| `packages/core/src/components/radio/Props.tsx` | 同上 |
| `packages/core/src/components/checkbox/Props.tsx` | 同上 |
| `packages/core/src/components/cascader/Props.tsx` | 同上 |
| `packages/core/src/components/tree-select/Props.tsx` | 同上 |
