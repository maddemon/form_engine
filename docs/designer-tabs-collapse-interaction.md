# Tabs / Collapse 设计器交互优化方案 v3

## Schema 设计与双渲染路径

### Schema 数据结构（现有，不改）

```
FormFieldSchema (type='tabs')
├─ componentProps.tabs: TabPaneConfig[]     ← 定义标签页（title、key）
│   [{ id, key: 'tab_1', title: '标签页一' },
│    { id, key: 'tab_2', title: '标签页二' }]
├─ children: FormFieldSchema[]              ← 子字段（由 regionKey 关联到 tab）
│   ├─ { name, type, regionKey: 'tab_1', ... }
│   └─ { name, type, regionKey: 'tab_2', ... }
└─ type: 'tabs'

FormFieldSchema (type='collapse')
├─ componentProps.panels: CollapsePanelConfig[]  ← 定义面板（header、key）
├─ children: FormFieldSchema[]                  ← 子字段（由 regionKey 关联到 panel）
└─ type: 'collapse'
```

### 两套渲染路径

#### 路径 A：运行时（FormRender）

```
FormRender.renderNestedField(field)
  ├─ 递归渲染 children → ReactNode[]（真实表单控件：Input、Select...）
  └─ 注入 componentProps.children = ReactNode[]
      └─ FieldRenderer(field, adapter)
          └─ adapter['tabs'](componentProps)  ← antd Tabs
              ├─ AntTabs.TabPane(key='tab_1', tab='标签页一')
              │   └─ children[匹配tab_1]       ← 真实表单控件
              └─ AntTabs.TabPane(key='tab_2', tab='标签页二')
                  └─ children[匹配tab_2]
```

#### 路径 B：设计时（ContainerPreview）— 本次修改目标

```
ContainerPreview(field)
  ├─ 为每个 tab/panel 生成带 dnd-kit 的 ReactNode[]
  │   └─ children = [
  │       <RegionDroppable key='tab_1' regionKey='tab_1'>
  │         <SortableContext>
  │           <NestedField field={child1} />  ← 可选中的拖拽子字段
  │         </SortableContext>
  │       </RegionDroppable>,
  │       <RegionDroppable key='tab_2' regionKey='tab_2'>
  │         <SortableContext>
  │           <NestedField field={child2} />
  │         </SortableContext>
  │       </RegionDroppable>,
  │     ]
  └─ 注入 componentProps.children = ReactNode[]
      └─ FieldRenderer(field, defaultAdapter)
          └─ adapter['tabs'](componentProps)  ← 同一套 antd Tabs
              ├─ AntTabs.TabPane(key='tab_1', tab='标签页一')
              │   └─ children[匹配tab_1]       ← RegionDroppable + NestedField
              └─ AntTabs.TabPane(key='tab_2', tab='标签页二')
                  └─ children[匹配tab_2]
```

**关键结论**：两套路径共用同一套 `FieldRenderer` + `adapter['tabs']`，区别仅在于：

* 运行时：children 是递归渲染的真实表单字段

* 设计时：children 是 `RegionDroppable`（内含 `useDroppable` + `SortableContext` + `NestedField`）

Schema 和 adapter 组件都不需要改。

***

## 修改文件（仅 1 个）

### `packages/core/src/designer/ContainerPreview.tsx`

#### 改动内容

将 `tabs` 和 `collapse` 分支从「扁平 RegionPreview」改为「FieldRenderer + 自定义 children」。

#### 具体步骤

1. **新增导入**：

```tsx
import React, { useMemo } from 'react'
import { FieldRenderer } from '../renderer/FieldRenderer'
// adapter 从 useDesignerContext() 获取，无需单独 import
```

1. **新增辅助组件** **`RegionDroppable`**：

```tsx
function RegionDroppable({ parentId, regionKey, items, fieldId }: {
  parentId: string
  regionKey: string
  items: FormFieldSchema[]
  fieldId: string
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `${fieldId}__region_${regionKey}`,
    data: { parentId, regionKey },
  })
  const { token } = useStyle()
  const childIds = useMemo(() => items.map(c => c.id!), [items])

  return (
    <div ref={setNodeRef} style={{
      minHeight: token('containerMinHeight'),
      border: isOver ? '2px solid var(--fe-primary)' : '1px dashed var(--fe-border-light)',
      borderRadius: 'var(--fe-border-radius-sm)',
      background: isOver ? 'var(--fe-primary-hover-bg)' : 'transparent',
      transition: 'border-color 0.2s, background 0.2s',
      padding: token('spacingXs'),
    }}>
      {items.length > 0 ? (
        <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
          {items.map((child, index) => (
            <NestedField
              key={child.id}
              field={child}
              parentContainerId={parentId}
              childIndex={index}
            />
          ))}
        </SortableContext>
      ) : (
        <div style={{
          color: 'var(--fe-text-muted)',
          fontSize: token('fontSizeXs'),
          textAlign: 'center',
          padding: token('spacingSm'),
        }}>
          拖拽组件到此处
        </div>
      )}
    </div>
  )
}
```

2. **`withRegionKey`** **工具函数**（包装 child element 以支持 adapter 按 regionKey 过滤）：

adapter-antd 的 Tabs 组件中按 `child.props?.field?.regionKey === tab.key` 过滤 children。所以每个 child 必须携带 `props.field = { regionKey }`。

用 React.createElement 实现即可，不需要额外 helper：

```tsx
const tabChildren = tabs.map(tab => {
  const items = field.children?.filter(c => c.regionKey === tab.key) ?? []
  return React.createElement(
    'div',                          // 或用 Fragment
    { key: tab.key, field: { regionKey: tab.key }, style: { display: 'contents' } },
    <RegionDroppable parentId={field.id!} regionKey={tab.key} items={items} fieldId={field.id!} />
  )
})
```

3. **替换 tabs 分支**（原 \~行 217-261）：

> ⚠️ 注意：`useDesignerContext()` 已在组件顶部调用（取 `scene`/`formConfig`/`adapter`），不要在 `if` 块里再次调用，避免违反 React Hooks 规则。

```tsx
// Tabs
if (field.type === 'tabs') {
  const tabs = ((field.componentProps?.tabs as TabPaneConfig[]) ?? [])

  if (tabs.length === 0) {
    // 空态：保留现有 fallback
    return <ExistingEmptyState />
  }

  // 生成每个 tab 内容区的 ReactNode（带 props.field.regionKey）
  const tabChildren = tabs.map(tab => {
    const items = field.children?.filter(c => c.regionKey === tab.key) ?? []
    return React.createElement(
      'div',
      { key: tab.key, field: { regionKey: tab.key }, style: { display: 'contents' } as React.CSSProperties },
      <RegionDroppable parentId={field.id!} regionKey={tab.key} items={items} fieldId={field.id!} />
    )
  })

  const enhancedField: FormFieldSchema = {
    ...field,
    componentProps: { ...field.componentProps, children: tabChildren },
  }

  return (
    <FieldRenderer
      field={enhancedField}
      value={undefined}
      onChange={() => {}}
      options={[]}
      disabled={false}
      adapter={adapter}
      formConfig={formConfig}
    />
  )
}
```

4. **替换 collapse 分支**（原 \~行 169-214）：

```tsx
// Collapse
if (field.type === 'collapse') {
  const panels = ((field.componentProps?.panels as CollapsePanelConfig[]) ?? [])

  if (panels.length === 0) {
    return <ExistingEmptyState />
  }

  const panelChildren = panels.map(panel => {
    const items = field.children?.filter(c => c.regionKey === panel.key) ?? []
    return React.createElement(
      'div',
      { key: panel.key, field: { regionKey: panel.key }, style: { display: 'contents' } as React.CSSProperties },
      <RegionDroppable parentId={field.id!} regionKey={panel.key} items={items} fieldId={field.id!} />
    )
  })

  const enhancedField: FormFieldSchema = {
    ...field,
    componentProps: { ...field.componentProps, children: panelChildren },
  }

  return (
    <FieldRenderer
      field={enhancedField}
      value={undefined}
      onChange={() => {}}
      options={[]}
      disabled={false}
      adapter={adapter}
      formConfig={formConfig}
    />
  )
}
```

5. **移除** **`useDroppable`** **迁移**：原有空态也用了 `useDroppable`，保持不变。

***

## 不变的内容

* `FieldItem.tsx` — 不改，靠事件冒泡正常工作

* `RegionPreview.tsx` — 不改，Grid/Table 继续用

* `NestedField.tsx` — 不改，在设计时 children 中复用

* `RootFields.tsx` — 不改

* `FormRender.tsx` — 不改，运行时路径不变

* `adapter-antd` 中的 Tabs/Collapse — 不改

* Schema 类型定义 — 不改

***

## 验证

1. `pnpm build` 编译通过
2. `pnpm check:tokens` 无违规
3. 设计器 Tabs 渲染为 antd Tabs（有标签头栏），点击标签头切换 tab
4. 设计器 Collapse 渲染为 antd Collapse，点击标题展开/折叠
5. 每个 tab/panel 内容区可拖入新组件、内部可排序
6. 点击标签头/面板标题时组件交互正常（不被选中事件阻断）
7. 空 tabs/panels 显示空态提示
8. Grid/Table/普通容器行为不变
9. 运行时 FormRender 的 Tabs/Collapse 行为不变

