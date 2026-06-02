# 容器嵌套

> 简要约束在 [`AGENTS.md`](../../AGENTS.md)。本文档给出数据结构、渲染与 Reducer 操作约定。

## 数据结构

- 容器组件的 `FormFieldSchema.children` 存储子字段（`FieldSchema[]`）
- 子字段可以是任意类型，**允许嵌套容器**形成树状结构

## 渲染

- Canvas 递归渲染，遍历 `children` 即可
- 容器区域可拖入新组件或移动已有组件
- `Canvas.tsx` / `ContainerPreview.tsx` / `NestedField.tsx` 共同处理嵌套展示

## Reducer

- 所有字段操作 Action 都支持 `parentId` 参数
- 没有 `parentId` 表示操作根级字段，有 `parentId` 表示操作对应容器的子字段
- 移动、删除、复制等操作均需在 `parentId` 维度定位

## 辅助 API

- `getFormFieldTypes()` — 列出全部 `form` 组件类型，可用于调色板 / 校验
- `getContainerFieldTypes()` — 列出全部 `container` 组件类型

> 修改嵌套相关逻辑时，务必同步检查：`reducer.ts`、`Canvas.tsx`、`ContainerPreview.tsx`、`NestedField.tsx`、`FieldItem.tsx`。
