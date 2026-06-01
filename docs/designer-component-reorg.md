# 设计器左侧控件库组件整理与增强

## 目标

1. 整理调色板组件：移除冗余项、补充缺失项
2. 修复自定义组件在调色板中不显示的问题
3. 支持开发者屏蔽系统自带组件

---

## 一、组件整理清单

### 保留（13项）

| 分组 | 类型 | 标签 |
|------|------|------|
| 文本输入 | `input` | 单行文本 |
| 文本输入 | `textarea` | 多行文本 |
| 文本输入 | `password` | 密码 |
| 数值 | `input-number` | 数字 |
| 数值 | `slider` | 滑块 |
| 数值 | `rate` | 评分 |
| 选择 | `select` | 下拉 |
| 选择 | `radio` | 单选 |
| 选择 | `checkbox` | 多选框 |
| 选择 | `switch` | 开关 |
| 日期时间 | `date` | 日期 |
| 日期时间 | `datetime` | 日期时间 |
| 日期时间 | `date-range` | 日期范围 |
| 日期时间 | `time` | 时间 |
| 其他 | `upload` | 上传 |

### 移除（3项）

| 类型 | 原因 |
|------|------|
| `multi-select` | 仅是 `select` 的 `mode: 'multiple'` 模式，无需独立入口 |
| `cascader` | 适配器无实现，PropsRender 未实现 |
| `tree-select` | 适配器无实现，PropsRender 未实现 |

> `cascader` / `tree-select` 的 FieldType 定义保留（兼容已有 schema），仅从调色板中移除。

### 新增（4项）

| 分组 | 类型 | 标签 |
|------|------|------|
| 其他 | `button` | 按钮 |
| 布局 | `grid` | 栅格布局 |
| 布局 | `flex` | 弹性布局 |
| 布局 | `container` | 容器 |
| 布局 | `collapse` | 折叠面板 |
| 布局 | `tabs` | 标签页 |
| 展示 | `text` | 文本展示 |
| 展示 | `image` | 图片展示 |
| 展示 | `divider` | 分割线 |

### 后续可规划（待定）

| 类型 | 说明 |
|------|------|
| `cascader` | 等 antd 适配器实现了再加回 |
| `tree-select` | 等 antd 适配器实现了再加回 |

---

## 二、功能增强

### 1. 自定义组件显示修复

**问题：** `getFullPaletteGroups()` 中将自定义组件分组追加在默认分组之后，二者分离。
且 `example/src/App.tsx` 未导入 `custom-component-demo.tsx`。

**修改：**
- `getFullPaletteGroups()` 中，自定义组件若分类名称与内置分组同名，则**合并到对应内置分组**中
- 示例中导入 `custom-component-demo.tsx` 以注册自定义组件

### 2. 内置组件过滤机制

**新增 `DesignerProps` 属性：**

```typescript
interface DesignerProps {
  // ... 现有属性
  /** 排除的调色板组件类型列表（用于屏蔽系统自带组件） */
  excludeTypes?: string[]
}
```

**行为：**
- `FieldList` 收到 `excludeTypes` 后，过滤掉匹配的调色板项
- 同时过滤内置组件和自定义组件
- 若某分组所有项都被排除，该分组不显示

---

## 三、涉及文件

| 文件 | 改动 |
|------|------|
| `packages/core/src/designer/paletteData.ts` | 移除 multi-select/cascader/tree-select；新增 button/布局/展示组件 |
| `packages/core/src/designer/FieldList.tsx` | 新增 excludeTypes 过滤逻辑；优化自定义组件分组融合 |
| `packages/core/src/types/designer.ts` | DesignerProps 新增 excludeTypes |
| `packages/core/src/designer/Designer.tsx` | 传递 excludeTypes 到 FieldList |
| `packages/core/src/designer/FieldList.tsx` | iconMap 更新（移除 multi-select，新增各组件的图标） |
| `example/src/App.tsx` | 导入 custom-component-demo.tsx |

---

## 四、实施步骤

1. **更新 `paletteData.ts`** — 移除/新增调色板项
2. **更新 `FieldList.tsx`** — 修复图标映射、新增过滤、优化自定义分组融合
3. **更新 `designer.ts`** — DesignerProps 增加 excludeTypes
4. **更新 `Designer.tsx`** — 传递 excludeTypes
5. **更新 `example/src/App.tsx`** — 导入自定义组件示例
6. **编译验证 + Code Review**

---

## 五、完成状态

- [ ] paletteData.ts 更新
- [ ] FieldList.tsx 更新（图标 + 过滤 + 分组融合）
- [ ] designer.ts 类型更新
- [ ] Designer.tsx Props 传递
- [ ] 示例更新
- [ ] 编译通过
- [ ] Code Review
