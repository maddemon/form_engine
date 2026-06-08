# 多国语言（i18n）支持方案

> **实施状态**：🅿️ 计划阶段，待实施
>
> 最后更新：2026-06-08

## 问题分析

### 现状

1. **~520+ 硬编码中文字符串** 遍布整个代码库：
   - `designer/` — 工具栏、属性面板、事件编辑器、校验规则编辑器等 UI 文本（~85 处）
   - `components/*/Props.tsx` — 各组件属性面板的 label/placeholder/option 文本（~250 处）
   - `components/*/index.ts` — 组件注册 label、事件声明 label/description（~100 处）
   - `widgets/` — Select、Modal、DataSourceEditor 等内部文本（~45 处）
   - `renderer/validate.ts` — 校验错误消息（~16 处）
   - `adapter-antd/` 和 `adapter-antd-mobile/` — 适配器层内部文本（~24 处）
2. **零 i18n 基础设施**：无 locale 文件、无语言切换机制
3. **组件注册 label / 事件描述 / defaultProps 是静态数据**，不在 React 渲染上下文中，处理方式需特殊设计

### 约束

- 不引入 `react-i18next` / `react-intl` 等外部依赖
- 使用项目自有的 Provider→Context→Hook 模式（与 `StyleProvider` 对齐）
- `locale` prop 只初始化时指定，不支持运行时切换
- `ComponentRegistration.label` 等字段本身就是 locale key（点分路径），不在字段上单独加 `labelKey`
- 未命中的 locale key 返回 `undefined`，组件自行处理

## 方案设计

### 架构概览

```
packages/core/src/locale/
├── types.ts            → LocalePack 接口定义
├── zh-CN.ts            → 默认中文包
├── en-US.ts            → 英文翻译
├── utils.ts            → deepMerge + flattenLocale + validateLocale（内部工具，不导出到主入口）
├── LocaleContext.ts    → createContext + useLocale() hook
├── LocaleProvider.tsx  → Provider 组件
└── index.ts            → 统一导出
```

### Provider 注入链路

```
<FormRender locale={enUS}>
  <StyleProvider>                        // 主题
    <LocaleProvider locale={merged}>      // ← 新增，在 StyleProvider 内部
      <BridgeProvider>
        <FormEngineContext.Provider>
          <FormStateContext.Provider>
            {children}
          </FormStateContext.Provider>
        </FormEngineContext.Provider>
      </BridgeProvider>
    </LocaleProvider>
  </StyleProvider>
</FormRender>
```

`Designer` 同理，在 `StyleProvider` 内部、`DesignerDispatchContext` 外层包裹 `LocaleProvider`。

## 实现步骤

### Phase 1 — 类型定义 & 默认 locale

#### 1.1 `types.ts` — LocalePack 接口

按模块分层组织所有 key，与源码目录结构对齐：

```ts
// packages/core/src/locale/types.ts

export interface LocalePack {
  designer: {
    canvasToolbar: {
      desktop: string
      mobile: string
      componentTree: string
      close: string
      undo: string
      redo: string
    }
    fieldList: {
      title: string
    }
    propertyPanel: {
      title: string
      fieldName: string
      fieldLabel: string
      fieldLabelPlaceholder: string
      showLabel: string
      hideLabel: string
      defaultValue: string
      defaultValuePlaceholder: string
      containerHint: string
      advancedProps: string
      colSpan: string
      disabled: string
      readOnly: string
      hidden: string
      hiddenPlaceholder: string
    }
    eventHandler: {
      notConfigured: string
      expression: string
      action: string
      callback: string
      expressionLabel: string
      expressionHelp: string
      expressionPlaceholder: string
      actionLabel: string
      actionParams: string
      actionParamsPlaceholder: string
      callbackNameLabel: string
      callbackNamePlaceholder: string
    }
    rules: {
      custom: string
      phone: string
      idCard: string
      email: string
      url: string
      title: string
      required: string
      errorMessage: string
      errorMessagePlaceholder: string
      regex: string
      regexPlaceholder: string
      regexPresets: string
    }
    formConfig: {
      pageBg: string
      bgPlaceholder: string
      labelWidth: string
      controlWidth: string
      title: string
      showColon: string
      requiredMark: string
      desktopConfig: string
      layoutMode: string
      labelAlign: string
      controlVariant: string
      mobileConfig: string
      horizontal: string
      vertical: string
      inline: string
      leftAlign: string
      rightAlign: string
      outline: string
      filled: string
      borderless: string
      underline: string
      default: string
      optionalMark: string
      hidden: string
    }
    paletteGroups: {
      textInput: string
      number: string
      select: string
      dateTime: string
      layout: string
      display: string
      other: string
    }
    fieldActions: {
      copy: string
      delete: string
      dragSort: string
    }
    staticExpressionToggle: {
      switchToExpression: string
      switchToStatic: string
      funcIcon: string
      staticIcon: string
      expressionPlaceholder: string
    }
  }

  component: {
    input: {
      label: string
      allowClear: string
      maxLength: string
      prefix: string
      suffix: string
      addonBefore: string
      addonAfter: string
      autoComplete: string
      type: string
      placeholder: string
      text: string
      email: string
      phone: string
      url: string
      events: {
        onChange: { label: string; description: string }
        onBlur: { label: string; description: string }
        onFocus: { label: string; description: string }
        onPressEnter: { label: string; description: string }
      }
    }
    inputNumber: {
      label: string
      min: string
      max: string
      step: string
      precision: string
      prefix: string
      suffix: string
      prefixPlaceholder: string
      suffixPlaceholder: string
      events: Record<string, { label: string; description?: string }>
    }
    textarea: {
      label: string
      placeholder: string
      rows: string
      autoSize: string
      minRows: string
      maxRows: string
      maxLength: string
      events: Record<string, { label: string; description?: string }>
    }
    password: {
      label: string
      allowClear: string
      placeholder: string
      placeholderValue: string
      maxLength: string
      prefix: string
    }
    select: {
      label: string
      modeDefault: string
      modeMultiple: string
      modeTags: string
      dataSource: string
      allowClear: string
      mode: string
      maxTagCount: string
      notFoundContent: string
      notFoundContentPlaceholder: string
      events: Record<string, { label: string; description?: string }>
    }
    radio: {
      label: string
      dataSource: string
      optionType: string
      buttonStyle: string
      direction: string
      defaultType: string
      button: string
      border: string
      solid: string
      horizontal: string
      vertical: string
      events: Record<string, { label: string; description?: string }>
    }
    checkbox: {
      label: string
      dataSource: string
      indeterminate: string
      direction: string
      horizontal: string
      vertical: string
      events: Record<string, { label: string; description?: string }>
    }
    cascader: {
      label: string
      dataSource: string
      placeholder: string
      placeholderValue: string
      allowClear: string
      searchable: string
      expandTrigger: string
      click: string
      hover: string
      events: Record<string, { label: string; description?: string }>
    }
    treeSelect: {
      label: string
      dataSource: string
      placeholder: string
      placeholderValue: string
      allowClear: string
      searchable: string
      multiple: string
      treeCheckable: string
      events: Record<string, { label: string; description?: string }>
    }
    segment: {
      label: string
      dataSource: string
      defaultValue: string
      size: string
      block: string
      disabled: string
      placeholder: string
      large: string
      medium: string
      small: string
      events: Record<string, { label: string; description?: string }>
    }
    slider: {
      label: string
      defaultValue: string
      min: string
      max: string
      step: string
      formatter: string
      formatterPlaceholder: string
      defaultPlaceholder: string
      events: Record<string, { label: string; description?: string }>
    }
    rate: {
      label: string
      defaultValue: string
      count: string
      character: string
      tooltips: string
      characterPlaceholder: string
      tooltipsPlaceholder: string
      events: Record<string, { label: string; description?: string }>
    }
    switch: {
      label: string
      defaultChecked: string
      size: string
      checkedText: string
      uncheckedText: string
      defaultSize: string
      smallSize: string
      checkedPlaceholder: string
      uncheckedPlaceholder: string
      events: Record<string, { label: string; description?: string }>
    }
    datePicker: {
      label: string
      allowClear: string
      format: string
      picker: string
      minDate: string
      maxDate: string
      disabledDate: string
      disabledDatePlaceholder: string
      unlimited: string
      today: string
      yesterday: string
      tomorrow: string
      lastWeek: string
      nextWeek: string
      lastMonth: string
      nextMonth: string
      date: string
      week: string
      month: string
      quarter: string
      year: string
      events: Record<string, { label: string; description?: string }>
    }
    dateRange: {
      label: string
      events: Record<string, { label: string; description?: string }>
    }
    dateTime: {
      label: string
      allowClear: string
      format: string
      formatPlaceholder: string
      picker: string
      events: Record<string, { label: string; description?: string }>
    }
    timePicker: {
      label: string
      allowClear: string
      format: string
      formatPlaceholder: string
      minuteStep: string
      secondStep: string
      events: Record<string, { label: string; description?: string }>
    }
    button: {
      label: string
      size: string
      btnType: string
      icon: string
      text: string
      block: string
      danger: string
      loading: string
      small: string
      medium: string
      large: string
      default: string
      primary: string
      dashed: string
      link: string
      textType: string
      iconPlaceholder: string
      textPlaceholder: string
      events: Record<string, { label: string; description?: string }>
    }
    title: {
      label: string
      content: string
      contentPlaceholder: string
      level: string
      type: string
      align: string
      bold: string
      italic: string
      underline: string
      mark: string
      default: string
      secondary: string
      success: string
      warning: string
      danger: string
      left: string
      center: string
      right: string
    }
    text: {
      label: string
      content: string
      contentPlaceholder: string
      type: string
      fontSize: string
      fontSizePlaceholder: string
      align: string
      keyboard: string
      bold: string
      italic: string
      underline: string
      strikethrough: string
      code: string
      mark: string
      ellipsis: string
    }
    alert: {
      label: string
      type: string
      title: string
      content: string
      showIcon: string
      closable: string
      customIcon: string
      titlePlaceholder: string
      contentPlaceholder: string
      none: string
      primary: string
      info: string
      success: string
      warning: string
      error: string
      events: Record<string, { label: string; description?: string }>
    }
    card: {
      label: string
      title: string
      titlePlaceholder: string
      icon: string
      bordered: string
      size: string
      bodyPadding: string
      bodyGap: string
      events: Record<string, { label: string; description?: string }>
    }
    divider: {
      label: string
      direction: string
      textPosition: string
      plain: string
      textContent: string
      textContentPlaceholder: string
      color: string
      colorPlaceholder: string
      weight: string
      horizontal: string
      vertical: string
      center: string
      left: string
      right: string
    }
    image: {
      label: string
      src: string
      srcPlaceholder: string
      alt: string
      altPlaceholder: string
      width: string
      height: string
      sizePlaceholder: string
      preview: string
      radius: string
    }
    grid: {
      label: string
      layoutMode: string
      gap: string
      padding: string
      margin: string
      columnMgmt: string
      grid: string
      flex: string
      addColumn: string
      columnWidth: string
    }
    flex: {
      label: string
      direction: string
      justify: string
      align: string
      gap: string
      wrap: string
      padding: string
      margin: string
    }
    collapse: {
      label: string
      accordion: string
      ghost: string
      defaultActive: string
      defaultActivePlaceholder: string
      panelMgmt: string
      header: string
      key: string
      disabled: string
      addPanel: string
      events: Record<string, { label: string; description?: string }>
    }
    tabs: {
      label: string
      type: string
      size: string
      position: string
      centered: string
      tabMgmt: string
      line: string
      card: string
      editableCard: string
      large: string
      medium: string
      small: string
      top: string
      right: string
      bottom: string
      left: string
      title: string
      key: string
      disabled: string
      addTab: string
      events: Record<string, { label: string; description?: string }>
    }
    subForm: {
      label: string
      rowMode: string
      fixedRows: string
      columnMgmt: string
      dynamic: string
      fixed: string
      columnTitle: string
      columnWidth: string
      addColumn: string
    }
    upload: {
      label: string
      action: string
      actionPlaceholder: string
      defaultValue: string
      accept: string
      maxCount: string
      listType: string
      showUploadList: string
      list: string
      card: string
      events: Record<string, { label: string; description?: string }>
    }
    html: { label: string }
    steps: { label: string }
    tag: { label: string }
    table: { label: string }
    form: { label: string }
    transfer: {
      label: string
      events: Record<string, { label: string; description?: string }>
    }
  }

  widget: {
    modal: {
      confirm: string
      cancel: string
    }
    select: {
      placeholder: string
      clear: string
      noOptions: string
    }
    expressionInput: {
      title: string
      availableFields: string
      editButton: string
    }
    dataSourceEditor: {
      batchEdit: string
      batchInstructions: string
      remoteDataSource: string
      apiUrl: string
      apiUrlPlaceholder: string
      paramHelp: string
      dependentField: string
      reloadHelp: string
      responseMapping: string
      listPath: string
      listPathPlaceholder: string
      labelField: string
      labelFieldPlaceholder: string
      valueField: string
      valueFieldPlaceholder: string
      staticData: string
      remoteData: string
      labelCol: string
      valueCol: string
      addOption: string
      batchEditBtn: string
      configRemote: string
      none: string
    }
    treeDataEditor: {
      title: string
      instructions: string
      batchEdit: string
      empty: string
    }
    sortableTableEditor: {
      delete: string
    }
    sortableList: {
      delete: string
    }
    colorPicker: {
      clear: string
    }
  }

  // 校验错误消息。min/max/len 的模板不在此处维护（UI 已限制输入，几乎不会触发），
  // 校验函数中统一用 'Invalid value' 兜底。
  validation: {
    required: string                      // '必填'
    typeError: {
      string: string                      // '类型错误：期望 string'
      number: string                      // '类型错误：期望 number'
      boolean: string                     // '类型错误：期望 boolean'
    }
    email: string                         // '邮箱格式错误'
    url: string                           // 'URL 格式错误'
    phone: string                         // '手机号格式错误'
    pattern: string                       // '格式不匹配'
  }

  adapter: {
    // 通用占位文本（adapter 组件在 schema 未提供 placeholder 时使用）
    common: {
      placeholder: {
        input: string      // '请填写' / 'Please enter'
        select: string     // '请选择' / 'Please select'
        date: string       // '请选择日期' / 'Select date'
        time: string       // '请选择时间' / 'Select time'
        number: string     // '请输入数值' / 'Enter a number'
        search: string     // '搜索...' / 'Search...'
      }
    }
    antd: {
      subForm: {
        empty: string
        operation: string
        delete: string
        addRow: string
      }
      upload: {
        button: string
      }
    }
    mobile: {
      // 占位文本归入 adapter.common.placeholder，此处只保留 adapter 特有 UI
      confirm: string
      cancel: string
      dateRangeStart: string
      dateRangeEnd: string
      subForm: {
        empty: string
        delete: string
        addRow: string
      }
      image: {
        empty: string
      }
    }
  }
}
```

#### 1.2 `zh-CN.ts` — 默认中文

从当前所有硬编码字符串提取，与现有行为完全一致。作为 `locale` prop 不传时的默认值。

#### 1.3 `en-US.ts` — 英文翻译

翻译所有 label/description/placeholder 文本。示例类占位符（如 `https://example.com`、`{value}%`）不翻译。

### Phase 2 — Provider & 注入链路

#### 2.1 `LocaleContext.ts`

Context 提供完整的 locale 对象 + 扁平 `t()` 函数：

```ts
import { createContext, useContext } from 'react'
import type { LocalePack } from './types'
import { zhCN } from './zh-CN'

export interface LocaleContextValue {
  locale: LocalePack
  t: (key: string) => string | undefined   // 未命中返回 undefined
}

const defaultT: (key: string) => string | undefined = () => undefined

export const LocaleContext = createContext<LocaleContextValue>({
  locale: zhCN,
  t: defaultT,
})

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext)
}
```

#### 2.2 `LocaleProvider.tsx`

Provider 将嵌套 locale 拍平成 flat map，`useMemo` 保证只在 locale 变化时重建。dev 模式下自动校验缺失 key：

```tsx
import React, { useMemo } from 'react'
import type { LocalePack } from './types'
import { LocaleContext, type LocaleContextValue } from './LocaleContext'
import { zhCN } from './zh-CN'
import { enUS } from './en-US'
import { flattenLocale, validateLocale } from './utils'

export type SupportedLocale = 'zh-CN' | 'en-US'

const localeMap: Record<string, LocalePack> = {
  'zh-CN': zhCN,
  'en-US': enUS,
}

export interface LocaleProviderProps {
  locale?: SupportedLocale | Partial<LocalePack>
  children: React.ReactNode
}

export function LocaleProvider({ locale, children }: LocaleProviderProps) {
  const ctx = useMemo<LocaleContextValue>(() => {
    const merged = !locale
      ? zhCN
      : typeof locale === 'string'
        ? localeMap[locale] ?? zhCN
        : deepMerge(zhCN, locale as Partial<LocalePack>)

    const flat = flattenLocale(merged)

    // Dev 模式自动校验：将所有 zhCN 中的 key 与新 locale 比较
    if (process.env.NODE_ENV === 'development') {
      validateLocale(flattenLocale(zhCN), flat)
    }

    return {
      locale: merged,
      t: (key: string) => flat[key],
    }
  }, [locale])

  return (
    <LocaleContext.Provider value={ctx}>
      {children}
    </LocaleContext.Provider>
  )
}
```

#### 2.3 `FormRender` 注入

在 `FormRender.tsx` 的 `StyleProvider` 内部、`BridgeProvider` 外层包裹 `LocaleProvider`：

```tsx
// FormRender.tsx 内
const inner = (
  <LocaleProvider locale={locale}>
    <FormRenderInner ... />
  </LocaleProvider>
)
```

`FormRenderProps` 增加可选 `locale?: SupportedLocale | Partial<LocalePack>`。

#### 2.4 `Designer` 注入

同理，`DesignerProps` 增加可选 `locale` prop，在 `StyleProvider` 内部包裹 `LocaleProvider`。

### Phase 3 — 替换 Designer 模块字符串（~85 处）

所有 designer 下的 React 组件通过 `useLocale()` 获取 locale 对象。两种用法：

- **`locale.xxx.yyy`**（类型安全的直接访问）：key 在编码时已知，优先使用
- **`t(key)`**（扁平 key 查找）：key 是动态变量时使用（如 `ComponentRegistration.label`、`PaletteGroup.groupName`）

```tsx
// 改前
;<Button onClick={onUndo} icon={<Undo2 size={14} />} title="撤销" />

// 改后
const { locale } = useLocale()
;<Button onClick={onUndo} icon={<Undo2 size={14} />} title={locale.designer.canvasToolbar.undo} />
```

涉及文件：

| 文件 | 关键替换 |
|---|---|
| `designer/CanvasToolbar.tsx` | `'桌面'`、`'手机'`、`'组件树'`、`'撤销'`、`'重做'` |
| `designer/FieldList/FieldList.tsx` | `'组件库'` |
| `designer/ComponentTree.tsx` | `'组件树'`、`'关闭'` |
| `designer/PropertyPanel.tsx` | `'属性'` |
| `designer/PropertyPanel/DefaultPropertyContent.tsx` | 全部 label / placeholder |
| `designer/PropertyPanel/StaticExpressionToggle.tsx` | `'切换为表达式'` 等 |
| `designer/PropertyPanel/EventEditor.tsx` | `'事件（${n}）'` |
| `designer/EventHandlerEditor.tsx` | 所有 option label / field label / placeholder |
| `designer/RulesEditor.tsx` | 所有 option label / section title / field label |
| `designer/FormConfigPanel.tsx` | 所有 section title / field label / option label |
| `designer/FieldItem/DragHandle.tsx` | `'拖拽排序'` |
| `designer/FieldItem/FieldActions.tsx` | `'复制'`、`'删除'` |

### Phase 4 — 替换组件注册字符串（~100 处）

`label` 字段本身直接作为 locale key（点分路径），不加额外字段。

#### 4.1 `ComponentRegistration`

类型定义不变（`label` 字段的语义从「显示名」变为「locale key」）：

```ts
export interface ComponentRegistration {
  label: string            // ← 现在是 locale key，如 'component.input.label'
  category: ComponentCategory | ComponentCategory[]
  icon: string
  defaultProps?: Partial<FormFieldSchema>
  eventDeclarations: EventDeclaration[]
}
```

#### 4.2 `EventDeclaration`

同理，`label` / `description` 直接作为 locale key：

```ts
export interface EventDeclaration {
  name: string
  label: string            // ← locale key，如 'component.input.events.onChange.label'
  description?: string     // ← locale key，如 'component.input.events.onChange.description'
}
```

#### 4.3 `getComponentLabel` 改为接受 locale

```ts
// 改前
export function getComponentLabel(type: string): string

// 改后（接受 t 函数，未命中返回 undefined → 调用方自行兜底）
export function getComponentLabel(type: string, t?: (key: string) => string | undefined): string | undefined {
  const reg = (componentRegistry as Record<string, ComponentRegistration>)[type]
  if (!reg) return type
  // 自定义组件：直接返回 label 显示字符串，不做 locale 解析
  if (type === 'custom' || type.startsWith('custom:')) return reg.label
  return t ? t(reg.label) : reg.label
}
```

调用方改造（当前已知的调用点）：

| 调用位置 | 改前 | 改后 |
|---|---|---|
| `designer/PropertyPanel.tsx:96` | `getComponentLabel(field.type)` | `getComponentLabel(field.type, t)` |
| `designer/paletteData.ts` (buildGroup) | `reg?.label ?? type` | 已通过 `PaletteItem.label` 在渲染时解析 |
| `designer/Dnd/useDndHandlers.ts` | `data.label` | 无需改动（拖拽 label 来自 PaletteItem，已由 4.4 处理） |

#### 4.4 各组件 index.ts：label 直接改为 locale key

```ts
// 改前
export const inputMeta: ComponentRegistration = {
  label: '输入框',
  category: 'form',
  icon: 'Edit',
  defaultProps: { componentProps: { placeholder: '请输入', allowClear: true } },
  eventDeclarations: [
    { name: 'onChange', label: '值变化', description: '输入框内容变化时触发' },
  ],
}

// 改后 — label/description 直接写 locale key，defaultProps 中移除 placeholder
export const inputMeta: ComponentRegistration = {
  label: 'component.input.label',
  category: 'form',
  icon: 'Edit',
  defaultProps: { componentProps: { allowClear: true } },
  eventDeclarations: [
    {
      name: 'onChange',
      label: 'component.input.events.onChange.label',
      description: 'component.input.events.onChange.description',
    },
  ],
}
```

扁平查找由 `flattenLocale()` 在 Provider 初始化时做一次，运行时 `t(key)` 直接查 flat map，未命中返回 `undefined`：

```ts
// utils.ts — 扁平化嵌套 locale 对象
export function flattenLocale(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'string') result[path] = value
    else if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenLocale(value as Record<string, unknown>, path))
    }
  }
  return result
}

/**
 * Dev 模式校验：将参考 locale（zhCN）的所有 key 与当前 locale 比较，
 * 缺失的 key 通过 console.warn 输出。也能在测试中直接调用。
 */
export function validateLocale(
  reference: Record<string, string>,
  target: Record<string, string>,
  label?: string,
): string[] {
  const missing: string[] = []
  for (const [key] of Object.entries(reference)) {
    if (!(key in target)) missing.push(key)
  }
  if (missing.length > 0) {
    const tag = label ? ` [${label}]` : ''
    console.warn(
      `[FormEngine] Missing locale keys${tag} (${missing.length}):\n  ${missing.join('\n  ')}`,
    )
  }
  return missing
}
```

`t(key)` 返回 `flat[key]`，未命中则 `undefined`。组件配合 `??` 或 `&&` 自行决定 fallback：

```tsx
const { t } = useLocale()
const label = t('component.input.label') ?? '未知组件'
```
组件也可以约定：label 缺了就不显示标签，placeholder 缺了就用空字符串，各组件自行决定策略。

所有 ~50 个组件/子组件的 `index.ts` 均按此模式修改。

#### 4.5 `paletteData.ts` 处理

`defaultPaletteGroups` 在模块加载时静态构建（`export const defaultPaletteGroups = ...`），此时没有 React 上下文，无法调用 `useLocale()`。因此分组名和组件名的翻译必须延迟到渲染时解析。

方案：`GROUP_MEMBERS` 的 key 改为 locale key，`buildGroup` 直接使用 locale key 赋值给 `groupName` / `label`。

```ts
// 改前 — GROUP_MEMBERS key 是中文
const GROUP_MEMBERS: Record<string, FieldType[]> = {
  文本输入: ['input', 'textarea', 'password'],
  ...
}

// 改后 — key 改为 locale key
const GROUP_MEMBERS: Record<string, FieldType[]> = {
  'designer.paletteGroups.textInput': ['input', 'textarea', 'password'],
  'designer.paletteGroups.number': ['input-number', 'slider', 'rate'],
  'designer.paletteGroups.select': ['select', 'cascader', 'tree-select', 'radio', 'checkbox', 'switch', 'segment'],
  'designer.paletteGroups.dateTime': ['date', 'datetime', 'date-range', 'time'],
  'designer.paletteGroups.layout': ['grid', 'flex', 'collapse', 'tabs', 'sub-form', 'card'],
  'designer.paletteGroups.display': ['text', 'title', 'image', 'divider', 'alert'],
  'designer.paletteGroups.other': ['button', 'upload'],
}

function buildGroup(groupName: string, types: FieldType[]): PaletteGroup {
  return {
    groupName,  // ← 现在是 locale key
    items: types.map((type) => {
      const reg = (componentRegistry as Record<string, ComponentRegistration>)[type]
      return {
        type,
        label: reg?.label ?? type,  // ← 从 registry 取 locale key
        defaultProps: reg?.defaultProps ?? {},
      }
    }),
  }
}
```

`PaletteGroup` 和 `PaletteItem` 类型不变（`groupName` / `label` 的语义从「显示名」变为「locale key」）。

消费端（`FieldList.tsx`、`PaletteItemCard.tsx`）在渲染时通过 `useLocale()` 解析：

```tsx
const { t } = useLocale()
const displayName = t(item.label) ?? item.label  // 未命中时 fallback 到 key 字符串
```

> **自定义组件兼容**：自定义组件的 type 为 `custom` 或以 `custom:` 开头，其 `label` 是用户提供的显示字符串而非 locale key。消费端遇到这些类型时直接使用 `label` 不做解析。

### Phase 5 — 替换 Props.tsx 字符串（~250 处）

所有 `components/*/Props.tsx` 中的 React 组件使用 `useLocale()`：

```tsx
// 改前
<FieldItem label="允许清除">
  <w.Switch checked={!!values.allowClear} onChange={(v) => onChange('allowClear', v)} />
</FieldItem>

// 改后
const { locale } = useLocale()
<FieldItem label={locale.component.input.allowClear}>
  <w.Switch checked={!!values.allowClear} onChange={(v) => onChange('allowClear', v)} />
</FieldItem>
```

占位符也同理：

```tsx
// 改前
<w.Input ... placeholder="如：https://" />

// 改后
<w.Input ... placeholder={locale.component.input.prefixPlaceholder} />
```

涉及 ~35 个 `Props.tsx` 文件。

### Phase 6 — 替换 Widgets 字符串（~45 处）

| 文件 | 关键替换 |
|---|---|
| `widgets/Modal.tsx` | `'确定'`、`'取消'` |
| `widgets/Select.tsx` | `'请选择'`、`'清除'`、`'无选项'` |
| `widgets/ExpressionInput.tsx` | `'编辑表达式'`、`'可用字段（点击插入）'` |
| `widgets/DataSourceEditor.tsx` | 全部 label / placeholder / button 文本 |
| `widgets/TreeDataEditor.tsx` | 全部 label / placeholder / button 文本 |
| `widgets/SortableTableEditor.tsx` | `'删除'` |
| `widgets/sortableListShared.tsx` | `'删除'` |

### Phase 7 — 替换校验字符串（~16 处）

`validate.ts` 是纯函数模块，不依赖 React 上下文。方案是新增可选参数 `validation?: LocalePack['validation']`，由调用方传入。

校验消息只覆盖**实际会触发的场景**（required / type / email / url / phone / pattern）。min/max/len 相关校验很少触发（UI 已限制输入），无需维护 locale 翻译，统一用 `'Invalid value'` 兜底。

#### 7.1 校验函数替换

```ts
// 改前
return rule.message || '必填'
return rule.message || '邮箱格式错误'
return rule.message || `不能小于 ${rule.min}`

// 改后（硬编码 fallback 用英文）
return rule.message || (validation?.required ?? 'Required')
return rule.message || (validation?.email ?? 'Invalid email')
return rule.message || 'Invalid value'   // min/max/len 无需翻译，直接英文兜底
```

#### 7.2 调用链路

`validateForm` 新增可选参数 `validation`，传递给 `checkRule`：

```ts
export function validateForm(
  fields: FormFieldSchema[],
  formValues: Record<string, unknown>,
  name?: string,
  validation?: LocalePack['validation'],  // ← 新增
): ValidateResult { ... }
```

**两条调用路径都需要传入 validation**：

1. `useFormValidation` hook（React 上下文内）→ `validateForm(fields, values, name, locale.validation)`
2. `useFormRender` hook（React 上下文内）→ 内部也调用 `validateForm`，同样需要传入 `locale.validation`

两个 hook 均通过 `useLocale()` 获取 `locale.validation` 段，在调用 `validateForm` 时传入。不传时 `checkRule` 使用英文硬编码 fallback（如 `'Required'`、`'Invalid email'`）。

### Phase 8 — 替换 Adapter 包字符串（~24 处）

`adapter-antd` 和 `adapter-antd-mobile` 中的 React 组件通过 `useLocale()` 获取文本。这些组件渲染时已在 `FormEngineContext` 内部，可访问 `LocaleProvider`。

**占位文本处理**：所有 adapter 组件统一从 `adapter.common.placeholder` 获取默认占位文本，按字段类型选择对应 key。如果 schema 设置了 `placeholder` 则优先使用 schema 值。

```tsx
// adapter 组件内部（以 Input 为例）
const { locale } = useLocale()
const placeholder = fieldSchema.componentProps?.placeholder
  ?? locale.adapter.common.placeholder.input
  ?? 'Please enter'
```

**UI 文本替换**：

| 文件 | 关键替换 |
|---|---|
| `adapter-antd/src/components/SubForm.tsx` | `'操作'`、`'删除'`、`'+ 添加行'` |
| `adapter-antd/src/components/Upload.tsx` | `'上传文件'` |
| `adapter-antd-mobile/src/components/DatePicker.tsx` | `'确定'`、`'取消'` |
| `adapter-antd-mobile/src/components/DateRange.tsx` | `'确定'`、`'取消'`、`'开始'`、`'结束'` |
| `adapter-antd-mobile/src/components/SubForm.tsx` | `'删除'`、`'+ 添加行'` |
| `adapter-antd-mobile/src/components/Image.tsx` | `'无图片'` |

### Phase 9 — 导出

#### 9.1 主入口导出

```ts
// packages/core/src/index.ts
export { LocaleProvider, useLocale } from './locale'
export type { LocalePack, SupportedLocale } from './locale'
```

#### 9.2 子路径导出

```json
// packages/core/package.json
"./locale": {
  "types": "./src/locale/types.ts",
  "import": "./src/locale/index.ts"
}
```

允许按需导入 locale 包：

```ts
import { zhCN } from '@form-engine/core/locale'
import { enUS } from '@form-engine/core/locale'
```

#### 9.4 tsup 构建配置

`tsup.config.ts` 需要新增 `locale` 入口，否则构建产物中不会有 `dist/locale/`：

```ts
// packages/core/tsup.config.ts
export default defineConfig([
  {
    entry: {
      'index': 'src/index.ts',
      'designer/index': 'src/designer/index.ts',
      'styles/index': 'src/styles/index.ts',
      'locale/index': 'src/locale/index.ts',  // ← 新增
    },
    // ... 其余配置不变
  },
])
```

同时 `package.json` 的 `publishConfig.exports` 也需要同步添加 `./locale` 条目（与开发态 `exports` 对齐）。

#### 9.3 使用示例

```tsx
import { FormRender, Designer, LocaleProvider } from '@form-engine/core'
import { antdAdapter } from '@form-engine/adapter-antd'
import { zhCN, enUS } from '@form-engine/core/locale'

// 方式1：通过 FormRender/Designer 传递
<FormRender schema={schema} locale="en-US" adapter={antdAdapter} />

// 方式2：使用 LocaleProvider 包裹（子树内所有 FormRender 共享）
<LocaleProvider locale="en-US">
  <>
    <FormRender schema={schemaA} adapter={antdAdapter} />
    <FormRender schema={schemaB} adapter={antdAdapter} />
  </>
</LocaleProvider>

// 方式3：部分覆盖（不传则使用 zh-CN 默认值）
<FormRender schema={schema} locale={{ designer: { canvasToolbar: { undo: '撤消' } } }} />
```

## 关键设计决策

### 1. label 字段直接作为 locale key

不加 `labelKey` 字段，`ComponentRegistration.label` 本身就是一个 locale path key（如 `'component.input.label'`）。原因：

- 少一层间接，少一个要维护的字段
- 所有内置组件的 `label` 本来就是内部标识，对用户不可见，改成 key 字符串没有兼容负担
- 自定义组件（`custom:*`）的 `label` 是用户提供的显示字符串，跳过 locale 解析直接使用
- 未命中的 key 返回 `undefined`，`t(key)` 就是 `flat[key]`，没有 fallback 逻辑

### 2. validation 纯函数处理

`validate.ts` 是纯函数模块，不依赖 React 上下文。

- `checkRule()` 和 `validateForm()` 新增可选参数 `validation?: LocalePack['validation']`
- 两条调用路径（`useFormValidation` hook 和 `useFormRender` hook）均在 React 上下文内，通过 `useLocale()` 获取 validation 段传入
- **只覆盖实际会触发的场景**：required / type / email / url / phone / pattern
- min/max/len 校验很少触发（UI 已约束输入），不需要 locale 翻译，统一用 `'Invalid value'` 英文兜底
- 不传 `validation` 时使用英文硬编码 fallback

### 3. defaultProps 中不应出现 placeholder 字符串

`component*` defaultProps 中的 `placeholder: '请输入'` **全部移除**。原因：

- Schema 数据中的 placeholder 是业务数据，属于用户意图；默认占位文本不应污染 schema
- 当 schema 未提供 `placeholder` 时，由 adapter 组件根据字段类型展示 locale 中的默认占位文本（见第 4 条）

### 4. Adapter 层默认 placeholder 按组件类型区分

当 `FieldComponentProps.placeholder` 为空时，adapter 组件不应展示空输入框，而应根据字段类型展示 locale 中的默认提示：

```ts
// LocalePack 扩展字段
interface LocalePack {
  adapter: {
    common: {
      placeholder: {
        input: string    // '请填写' / 'Please enter'
        select: string   // '请选择' / 'Please select'
        date: string     // '请选择日期' / 'Select date'
        time: string     // '请选择时间' / 'Select time'
        number: string   // '请输入数值' / 'Enter a number'
        search: string   // '搜索...' / 'Search...'
      }
    }
    antd: { ... }
    mobile: { ... }
  }
}
```

adapter 组件在渲染时先取 `fieldSchema.componentProps.placeholder`，为空时 fallback 到 `locale.adapter.common.placeholder[type]`，再 fallback 到英文 `'Please enter'`：

```tsx
const { locale } = useLocale()
const placeholder = fieldSchema.componentProps?.placeholder
  ?? locale.adapter.common.placeholder.input
  ?? 'Please enter'
```

这样既不污染 schema 数据，又保证了不同字段类型有恰当的默认提示。

### 5. 性能

- `LocaleProvider` 传入的 locale 不变时，`useMemo` 保证 merge 只执行一次
- `LocaleContext` 值引用稳定，子组件不会因 locale 重渲染
- 不传 locale 时直接使用模块级 `zhCN` 常量，零开销

### 6. 扁平化（flattenLocale）与自动校验

`LocaleProvider` 初始化时用 `flattenLocale` 将嵌套 locale 拍平成 flat map，存入 context。`t(key)` 直接查 flat map，O(1)。

```ts
// utils.ts
export function flattenLocale(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'string') result[path] = value
    else if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenLocale(value as Record<string, unknown>, path))
    }
  }
  return result
}
```

`t(key)` 未命中返回 `undefined`，组件配合 `??` 自行决定 fallback。

**自动校验**：`validateLocale()` 在 dev 模式下以 `zhCN` 为参考，检查当前 locale 是否缺少 key：

```ts
export function validateLocale(
  reference: Record<string, string>,
  target: Record<string, string>,
  label?: string,
): string[] {
  const missing: string[] = []
  for (const key of Object.keys(reference)) {
    if (!(key in target)) missing.push(key)
  }
  if (missing.length > 0) {
    console.warn(
      `[FormEngine] Missing locale keys${label ? ` [${label}]` : ''} (${missing.length}):\n  ${missing.join('\n  ')}`,
    )
  }
  return missing
}
```

校验在 `LocaleProvider` 的 `useMemo` 中执行（仅 dev），零生产开销。同时该函数可直接在测试中调用，实现「用 JS 检查替代人工肉眼」：

```ts
import { zhCN, enUS } from '@form-engine/core/locale'
import { flattenLocale, validateLocale } from '@form-engine/core/locale/utils'

test('en-US covers all zh-CN keys', () => {
  const missing = validateLocale(flattenLocale(zhCN), flattenLocale(enUS), 'en-US')
  expect(missing).toEqual([])
})
```

`deepMerge` 同样放在 `locale/utils.ts` 中，不导出到主入口。

### 7. 自定义组件与 i18n 边界

自定义组件（type 为 `custom` 或以 `custom:` 开头）的 `label` 是用户通过 `registerCustomComponent` 提供的显示字符串，**不是 locale key**：

- `getComponentLabel` 对 `custom` / `custom:*` 类型直接返回 `reg.label`，不做 locale 解析
- `getFullPaletteGroups` 中自定义组件的分组名（`groupName`）同样来自用户注册，不做翻译
- `SidePanelTab.title` / `PropertyPanelTab.title`：用户定义的扩展面板标题

如果后续需要支持自定义组件的 i18n，可以扩展 `registerCustomComponent` API 接受 locale key 参数，但这不在本次范围内。

### 8. multi-select 与预留组件

- **`multi-select`**：在 `componentRegistry` 中复用 `select` 的 meta（`'multi-select': { ...select }`），`getComponentLabel('multi-select')` 返回 select 的 label。LocalePack 中不单独定义 `multiSelect`，解析时自然命中 `component.select.label`。
- **`html` / `steps` / `tag` / `table` / `form` / `transfer`**：这些在 `LocalePack.component` 中声明但当前 `componentRegistry` 中不存在。它们是预留的组件定义，为未来扩展保留 locale key。实现时如果这些组件尚未开发，对应的 locale key 在 `zh-CN.ts` / `en-US.ts` 中填写占位文本即可。

## 验证策略

### 基本验证

1. **类型检查**：`LocalePack` 接口约束所有 locale 文件的结构，`tsc --noEmit` 确保 zh-CN / en-US 完整覆盖所有 key
2. **locale 完整性测试**：用 `validateLocale(flattenLocale(zhCN), flattenLocale(enUS))` 断言 `en-US` 不缺 key，开发期 CI 拦截遗漏
3. **Smoke test**：用 `en-US` locale 渲染 `<Designer>` 和 `<FormRender>`，断言关键 UI 文本为英文（工具栏按钮、属性面板标题、校验消息）
4. **Fallback test**：不传 locale 时，所有 UI 文本与改造前完全一致（中文）

### 回归验证

- 现有测试套件（`pnpm test`）不依赖 UI 文本内容，locale 改造不应破坏
- `useFormValidation` 测试需要新增用例：传入 `en-US` validation 段时，错误消息为英文

## 工作量估算

| Phase | 内容 | 文件数 | 字符串数 | 预估人天 |
|---|---|---|---|---|
| 1 | 类型定义 + locale 文件 + deepMerge 工具 | 5 | 0 | 0.5 |
| 2 | Provider + FormRender/Designer 注入 | 4 | 0 | 0.5 |
| 3 | Designer 模块替换 | ~15 | ~85 | 1.5 |
| 4 | 组件注册替换 + paletteData 重构 | ~52 | ~100 | 1.5 |
| 5 | Props.tsx 替换 | ~28 | ~250 | 2 |
| 6 | Widgets 替换 | ~10 | ~45 | 0.5 |
| 7 | Validation 替换（含 useFormRender） | 3 | ~16 | 0.5 |
| 8 | Adapter 包替换 | ~12 | ~24 | 0.5 |
| 9 | 导出 + tsup 配置 + 测试 | 5 | 0 | 1 |
| **合计** | | **~134** | **~520** | **~8.5** |

## 附录：Locale key 命名约定

```
模块.子模块.具体含义

示例:
designer.canvasToolbar.undo                    → Designer 画布工具栏的"撤销"
component.input.label                          → 输入框组件的注册 label
component.input.allowClear                     → 输入框属性面板的"允许清除"（Props.tsx 中的 FieldItem label）
component.input.events.onChange.label          → 输入框 onChange 事件的显示名
component.input.events.onChange.description    → 输入框 onChange 事件的描述
widget.select.placeholder                      → Select 控件的默认 placeholder
validation.required                            → 必填校验的默认错误消息
adapter.common.placeholder.input               → Input 默认占位文本
adapter.antd.subForm.empty                     → antd 子表单的空状态提示
adapter.mobile.datePicker.confirm              → 移动端日期选择的确认按钮
```
