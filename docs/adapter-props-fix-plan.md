# Adapter Props 映射修复计划

## 背景

antd-mobile adapter 的容器/展示组件从 `componentProps?.xxx` 读取属性，但渲染器将 `field.componentProps` 展开到了 props 顶层，没有保留独立的 `componentProps` key，导致所有布局/展示属性在运行时取不到值（横排竖排不生效等）。antd adapter 则缺少独立的小写 key 字段函数映射，过度依赖 defaultAdapter 代理。

## 目标

- [x] 修复 antd-mobile 9 个容器/展示组件的 props 读取路径
- [x] 补齐 antd adapter 的小写 key 字段映射，使其可作为独立 adapter 使用
- [x] 验证修复后编译通过

## 任务

### 1. 修复 antd-mobile 容器/展示组件的 props 读取路径（9 个文件）

所有容器/展示组件改为从 props 顶层直接读取属性（因为渲染器已将 componentProps 展开到顶层）。

受影响文件及变更：

| 文件                                                        | 当前写法                    | 改为              |
| ----------------------------------------------------------- | --------------------------- | ----------------- |
| `packages/adapter-antd-mobile/src/components/Container.tsx` | `componentProps?.layout`    | `props.layout`    |
| `packages/adapter-antd-mobile/src/components/Flex.tsx`      | `componentProps?.direction` | `props.direction` |
| `packages/adapter-antd-mobile/src/components/Grid.tsx`      | `componentProps?.columns`   | `props.columns`   |
| `packages/adapter-antd-mobile/src/components/Text.tsx`      | `componentProps?.content`   | `props.content`   |
| `packages/adapter-antd-mobile/src/components/Image.tsx`     | `componentProps?.src`       | `props.src`       |
| `packages/adapter-antd-mobile/src/components/Divider.tsx`   | `componentProps?.type`      | `props.type`      |
| `packages/adapter-antd-mobile/src/components/Title.tsx`     | `componentProps?.content`   | `props.content`   |
| `packages/adapter-antd-mobile/src/components/Collapse.tsx`  | `componentProps?.accordion` | `props.accordion` |
| `packages/adapter-antd-mobile/src/components/Tabs.tsx`      | `componentProps?.activeKey` | `props.activeKey` |

### 2. 补齐 antd adapter 的小写 key 字段映射

在 `packages/adapter-antd/src/index.tsx` 的 `antdAdapter` 对象上，增加容器和展示组件的小写 key 映射，与 antd-mobile 保持一致。

需要增加：

- `'container'` → 映射到 `Container` 组件
- `'grid'` → 映射到 `Grid` 组件
- `'flex'` → 映射到 `Flex` 组件
- `'text'` → 映射到 `Text` 组件
- `'image'` → 映射到 `Image` 组件
- `'divider'` → 映射到 `Divider` 组件
- `'title'` → 映射到 `Title` 组件
- `'collapse'` → 映射到 `Collapse` 组件
- `'tabs'` → 映射到 `Tabs` 组件

### 3. 编译验证

修复后执行编译，确保所有类型检查和构建通过。
