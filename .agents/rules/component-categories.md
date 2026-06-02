# 组件分类体系

> 简要约束在 [`AGENTS.md`](../../AGENTS.md)。本文档给出完整分类说明与判定工具函数。

所有组件通过 `ComponentCategory` 分为四类（`packages/core/src/types/component-category.ts`）：

| 类别        | 含义         | PropertyPanel 显示                | Canvas 行为              |
| ----------- | ------------ | --------------------------------- | ------------------------ |
| `form`      | 表单输入组件 | `label` / `placeholder` / `name`  | 渲染为可录入字段         |
| `display`   | 展示组件     | 仅 `name`                         | 渲染为静态展示           |
| `container` | 容器组件     | 仅 `name`                         | 递归渲染子组件、支持拖入 |
| `button`    | 按钮组件     | 仅 `name`                         | 渲染为可点击按钮         |

## 分类判定

通过 `componentPalettes[type]?.category` 取值，类型定义：

```ts
export type ComponentCategory = 'form' | 'display' | 'container' | 'button'
```

`packages/core/src/types/component-category.ts` 提供以下工具函数：

- `getComponentCategory(type)` — 取分类，未知类型返回 `null`
- `isFormComponent(type)` / `isDisplayComponent(type)` / `isContainerComponent(type)` / `isButtonComponent(type)`
- `getFormFieldTypes()` — 获取所有 `form` 类别组件类型数组
- `getContainerFieldTypes()` — 获取所有 `container` 类别组件类型数组

> 自定义组件约定：`type === 'custom'` 或以 `custom:` 开头均归为 `form` 分类。
