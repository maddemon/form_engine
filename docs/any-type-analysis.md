# adapter `any` 类型分类分析

> 2026-06-11

---

## Category 1: Core 类型定义缺陷（可修复）

### 1.1 Widgets 缺少类型定义

**文件**: `adapter-antd/src/widgets/{Input,Select,Checkbox,Switch,NumberInput}.tsx`
**现状**: `React.FC<any>`
**根因**: 没有从 core 的 `DesignerWidgets` 接口导入 prop 类型，而是内联 `any`
**修复**: 导入 `DesignerWidgets` 中对应的 prop 类型

### 1.2 AlertProps 缺少 onClose

**文件**: `adapter-antd/src/components/Alert.tsx:48`
**现状**: `onClose as any`
**根因**: `AlertProps` 没有定义 `onClose`，但 adapter 解构了它
**修复**: 在 `core/src/components/alert/index.ts` 的 `AlertProps` 中添加 `onClose?: () => void`

### 1.3 BaseComponentProps 索引签名过松

**文件**: `adapter-antd/src/components/{Text,Title}.tsx`
**现状**: `const textProps: any`
**根因**: `BaseComponentProps` 有 `[key: string]: unknown` 索引签名，导致 spread 后所有属性变成 `unknown`
**修复**: 删除 `[key: string]: unknown`，改为显式属性或用 `Omit` 覆盖

### 1.4 Collapse/Tabs/SubForm 不必要的 as any

**文件**: `adapter-antd-mobile/src/components/{Collapse,Tabs,SubForm}.tsx`
**现状**: `(fieldSchema as any)?.children`
**根因**: `FormFieldSchema` 已经有 `children: FormFieldSchema[]`，`as any` 是多余的
**修复**: 直接删除 `as any`

---

## Category 2: 库互操作（必须用 as，无法修复）

### 2.1 Cascader options 类型不匹配

**文件**: `adapter-antd/src/components/Cascader.tsx:31`
**现状**: `options as any`
**原因**: core 的 `OptionItem` 是通用类型（`value: string | number`），antd Cascader 期望更具体的树节点类型。两者结构兼容但类型签名不同。
**建议**: 保留 `as`，加注释说明

### 2.2 TreeSelect treeData 类型不匹配

**文件**: `adapter-antd/src/components/TreeSelect.tsx:31,33`
**现状**: `value as any`, `treeData={options as any}`
**原因**: 同 2.1，`OptionItem[]` vs antd `DataNode[]`
**建议**: 保留 `as`，加注释说明

### 2.3 antd-mobile 渲染属性类型缺失

**文件**: `adapter-antd-mobile/src/components/{Cascader,DatePicker,TimePicker,TreeSelect}.tsx`
**现状**: `(vals: any, actions: any)`
**原因**: antd-mobile 的 Cascader/DatePicker 等组件的 render prop 没有提供类型定义（库本身的缺陷）
**建议**: 保留 `as`，加注释说明

### 2.4 antd-mobile Radio/Select options 类型

**文件**: `adapter-antd-mobile/src/components/{Radio,Select,Segment}.tsx`
**现状**: `(options || []) as any[]`
**原因**: `OptionItem` vs antd-mobile Selector 的期望类型
**建议**: 保留 `as`，加注释说明
