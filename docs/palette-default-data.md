# 调色板组件默认数据方案

## 背景

当前组件相关的配置散落在三个集中文件中：

| 配置项                 | 当前位置                                                  |
| ---------------------- | --------------------------------------------------------- |
| `defaultProps` + label | `designer/paletteData.ts`                                 |
| 图标映射               | `designer/FieldList.tsx` 中的 `iconMap`                   |
| 组件分类               | `types/component-category.ts` 中的 `componentCategoryMap` |

新增或修改组件时需要改动三个地方，违背内聚归类原则。

## 目标架构

每个组件文件夹内新增 `palette.ts`，统一掌管该组件的调色板元数据。

```
packages/core/src/components/
  button/
    types.ts        # Props 类型（已有）
    Props.tsx       # 属性面板（已有）
    palette.ts      # 新增：标签、分类、图标、默认数据
  select/
    palette.ts      # 新增
  ...
```

`palette.ts` 导出格式：

```ts
import type { ComponentPalette } from '../../types/palette'

export const palette: ComponentPalette = {
  label: '下拉',          // 调色板显示名称
  category: 'form',       // 组件分类
  icon: <ChevronDown />,  // 图标 JSX
  defaultProps: { ... },  // 拖入时的默认 schema 属性
}
```

## 聚合出口

新建 `components/paletteRegistry.ts`，导入所有组件的 palette 并暴露聚合查询接口：

```ts
// 按 type 聚合所有 palette
export const componentPalettes: Record<string, ComponentPalette>

// 便捷查询函数
export function getComponentLabel(type: string): string
export function getComponentCategory(type: string): ComponentCategory | null
export function getComponentIcon(type: string): React.ReactNode | null
export function getComponentDefaultProps(type: string): Partial<FormFieldSchema>
```

## 改造结果

### 1. 新增文件

| 文件 | 说明 | 状态 |
|------|------|:----:|
| `types/palette.ts` | `ComponentPalette` 接口定义 | ✅ |
| `components/paletteRegistry.ts` | 聚合所有 palette，提供查询函数 | ✅ |
| 各 `components/*/palette.tsx`（共 24 个） | 各组件的元数据定义 | ✅ |

### 2. 修改文件

| 文件 | 改动 | 状态 |
|------|------|:----:|
| `types/component-category.ts` | 移除 `componentCategoryMap`，改为委托 `paletteRegistry` 查询 | ✅ |
| `designer/FieldList.tsx` | 移除 `iconMap`，改为调用 `getComponentIcon` | ✅ |
| `designer/Designer.tsx` | 移除 `iconMap` 引用，改用 `getComponentIcon` | ✅ |
| `designer/paletteData.ts` | 改为从 `paletteRegistry` 构建分组 | ✅ |
| `index.ts` | 移除 `componentCategoryMap` 的公开导出 | ✅ |

## 注意事项

1. **dataSource 渲染链路已就绪**：`FormRender.loadDataSource` 已支持 `dataSource.type === 'static'` 的同步解析。
2. **Button children 传递**：`FieldRenderer` 的 `fieldProps` 中已有 `...field.componentProps` 展开。
3. **选项值命名**：使用 `option1/option2/option3` 避免与数字类型值混淆。
4. **collapse/tabs 子项**：children 中的 `name` 使用简短标识，拖入后用户可按需重命名。
5. **图片 src 留空**：不预设值，避免无效加载。
6. **组件分类与图标回归**：paletteRegistry 作为单一数据源，`componentCategoryMap` 和 `iconMap` 不再需要维护。

## 注意事项