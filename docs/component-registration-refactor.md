# 组件注册机制重构方案

## 问题

当前新增/删除一个组件需要手动修改 10+ 个文件，且信息分散在各处，容易遗漏。

## 目标

- 组件只在一处声明，其余自动派生
- 增删组件只需改动 2 处（注册表 + adapter）
- 用工具脚本兜底，不破坏现有代码结构

## 方案一：Registry 对象驱动

### 核心思路

在 `components/index.ts` 中维护一个 `componentRegistry` 对象，聚合组件全部元信息，`FieldType` 由 `keyof` 自动推导。

```ts
// packages/core/src/components/index.ts

export interface ComponentRegistration {
  label: string
  category: ComponentCategory
  palette: ComponentPalette
  PropsRender: ComponentType<PropsRenderProps>
  types: Record<string, unknown>     // Props 类型
  eventDeclarations: EventDeclaration[]
}

export const componentRegistry = {
  input: {
    label: '输入框',
    category: 'form',
    palette: inputPalette,
    PropsRender: InputPropsRender,
    types: { props: {} as InputProps },
    eventDeclarations: inputEventDeclarations,
  },
  select: { ... },
  // ...
} as const satisfies Record<string, ComponentRegistration>

// 自动推导
export type FieldType = keyof typeof componentRegistry
export type ComponentPropsMap = {
  [K in FieldType]: (typeof componentRegistry)[K]['types']['props']
}
```

### 现有信息的消费方式

| 消费方 | 来源 |
|--------|------|
| `FieldType` 联合类型 | `keyof typeof componentRegistry` |
| `componentPalettes` | `Object.fromEntries(Object.entries(registry).map(([k,v]) => [k, v.palette]))` |
| `PropsRenderMap` | 同上，从 registry 直接引用 `.PropsRender` |
| 事件声明查询表 | 同上，`.eventDeclarations` |
| 组件分组（paletteData） | 按 `category` 字段自动分组 |
| `ALL_FIELD_TYPES` | `Object.keys(registry)` |
| `ComponentPropsMap` | 从 registry 自动推导 |

### 文件改动量

- `components/index.ts` — 改为 registry 对象，导出辅助函数代替手写列表
- `paletteRegistry.ts` — 改为从 registry 构建（甚至可以直接删除，让消费者直接读 registry）
- `propRenders/index.ts` — `PropsRenderMap` 改为 `Object.fromEntries` 构建
- `paletteData.ts` — 按 category 自动分组，不再手写分组
- `FieldList.tsx` — 删除 `ALL_FIELD_TYPES`，用 `Object.keys(registry)`
- `types/schema.ts` — 删除 `FieldType`，改为从 `components` 包 re-export
- `types/component-props.ts` — 删除 `ComponentPropsMap`，改为从 registry 推导
- adapter — 不变（仍然手动写 components 映射）

## 方案二：脚本检查 adapter 合规

独立于方案一，可在 CI 中运行。

```ts
// scripts/check-adapter-coverage.ts
import { componentRegistry } from '@form-engine/core'
import { antdAdapter } from '@form-engine/adapter-antd'

const missing = Object.keys(componentRegistry)
  .filter(type => !antdAdapter.components[type])

if (missing.length) {
  console.error(`❌ adapter-antd 缺少以下组件：\n  ${missing.join('\n  ')}`)
  process.exit(1)
}
```

- 在 `packages/adapter-antd` 的 `test` 或 `lint` 中引入
- 按 adapter 粒度分开执行

## 实施建议

1. **优先提 registry 方案** — 解决根本问题，消除多处手写
2. **adapter 检查脚本可单独添加** — 工作量小，即使 registry 不动也能立即受益
3. 建议 registry 里的 `types` 字段保持最小——只保留 Props 类型引用，不存运行时代码
