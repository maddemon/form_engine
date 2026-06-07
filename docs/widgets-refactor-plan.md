# Widgets 目录重构计划

## 问题总结

经过全面审查，Widgets 目录存在两个核心问题：

### 问题 1：无共享 Modal 基座

`ExpressionModal`（位于 `ExpressionInput.tsx`）和 `BatchEditModal`（位于 `OptionsEditor.tsx`）各自手写了**完全相同的 Modal 外壳**：

| 结构层 | 重复代码 |
|--------|----------|
| Overlay 遮罩 | `position: fixed; top/left/right/bottom: 0; background: var(--fe-bg-mask); display: flex; align-items/justify-content: center; z-index: 1000` |
| Modal 容器 | `background: var(--fe-bg-primary); border-radius: token('borderRadiusLg'); box-shadow: token('shadowLg'); padding: token('spacingLg')` |
| 点击外部关闭 | `onClick={onCancel}` → `e.stopPropagation()` |
| Footer 按钮组 | 几乎相同的"取消"+"确定"按钮 |
| 打开同步逻辑 | `useEffect` + `prevOpenRef` 模式 |

仅差异项：标题文字、内容区（textarea）、宽度（`modalWidthSm` vs `modalWidthMd`）。

### 问题 2：Widget 内部未复用同级组件

`OptionsEditor.tsx` 和 `ExpressionInput.tsx` 内部大量使用原生 HTML 元素，而非同目录下已封装的 `WidgetButton`、`WidgetInput`、`WidgetTextArea`：

| 文件 | 原生 `<button>` | 原生 `<input>` | 原生 `<textarea>` |
|------|:---:|:---:|:---:|
| `OptionsEditor.tsx` | 3 处（L326/358/384） | 2 处（L320/324） | 1 处（L151） |
| `ExpressionInput.tsx` | 4 处（L109/133/147/205） | — | 1 处（L81） |

对比已有组件：

- `WidgetButton` 已支持 `type: 'default' \| 'primary' \| 'dashed'`，完全覆盖 Modal footer 中"取消/确定"以及底部"添加选项（dashed 变体）"的使用场景。
- `WidgetTextArea` 样式与 Modal 中手写的 textarea 高度一致（均基于 `BASE_STYLE` / 主题 Token）。
- `WidgetInput` 用于 OptionsEditor 的行内编辑框时，因行内模式需要 `border: none` + `background: transparent`，与 `WidgetInput` 的默认样式不同，不适合直接替换。

---

## 修改方案

### 变更 1：创建共享 `Modal` 组件（`widgets/Modal.tsx`）

将两个 Modal 公共的外壳提取为 `WidgetModal` 组件：

```tsx
// Modal.tsx
interface WidgetModalProps {
  open: boolean
  title: string
  width?: 'sm' | 'md' | 'lg'  // 对应 modalWidthSm/Md/Lg token
  onCancel: () => void
  children: React.ReactNode
  footer?: React.ReactNode     // 自定义 footer，默认提供"取消"+"确定"按钮
}
```

行为：
- Overlay 点击 → `onCancel`
- 打开时焦点管理（`useEffect` 同步）
- 默认 footer：`WidgetButton type="default"`（取消）+ `WidgetButton type="primary"`（确定）
- 标题 + children 由调用方传入

**不暴露到 `DesignerWidgets` 接口**（纯内部共享组件），保持公共 API 不变。

### 变更 2：`ExpressionModal` → 基于 `WidgetModal` 重构

- [ExpressionInput.tsx](file:///d:/Repos/form_engine/packages/core/src/widgets/ExpressionInput.tsx) 中的 `ExpressionModal`：
  - Overlay 容器 → `<WidgetModal>` 
  - `<textarea>` → `<WidgetTextArea>`
  - Footer 中原生 `<button>` → `<WidgetButton type="default">` / `<WidgetButton type="primary">`
  - Field name 标签按钮（tag-like）保持原生 `<button>`（尺寸风格特殊，封装成本 > 收益）

### 变更 3：`BatchEditModal` → 基于 `WidgetModal` 重构

- [OptionsEditor.tsx](file:///d:/Repos/form_engine/packages/core/src/widgets/OptionsEditor.tsx) 中的 `BatchEditModal`：
  - Overlay 容器 → `<WidgetModal>`
  - `<textarea>` → `<WidgetTextArea>`
  - Footer 中原生 `<button>` → `<WidgetButton type="default">` / `<WidgetButton type="primary">`

### 变更 4：OptionsEditor 底部按钮 → `WidgetButton`

- [OptionsEditor.tsx](file:///d:/Repos/form_engine/packages/core/src/widgets/OptionsEditor.tsx) L358-L383（"添加选项" dashed 按钮）→ `<WidgetButton type="dashed">`，保留 `flex: 1`、`transition`、hover 效果等差异通过 `style` prop 传入。
- OptionsEditor L384-L402（"批量编辑"按钮）→ `<WidgetButton type="dashed">` + style overrides

### 变更 5：`widgets/index.ts` 补导出 `WidgetModal`

仅供内部/desinger 模块按需导入（通过 `designer/widgets.tsx`），**不加入 `DesignerWidgets` 接口**，避免要求 adapter 实现者提供 Modal。

### 不变的内容（明确不修改）

| 条目 | 原因 |
|------|------|
| OptionsEditor 行内 `<input>`（L320/324） | 行内编辑模式需要 `border: none; background: transparent`，与 `WidgetInput` 默认样式冲突，拆分变体不划算 |
| OptionsEditor 删除按钮（L326） | icon-only 按钮，尺寸/样式特殊，使用 `WidgetButton` 反而更重 |
| ExpressionInput 的 inline `<input>`（L188-204） | 已使用 `BASE_STYLE` + `FOCUS_STYLE` 共享常量，样式合理 |
| ExpressionInput 的 field-name 标签按钮（L109） | 小型标签按钮，风格独特，封装收益低 |
| `ButtonGroup` | 实现正常，无原生元素 |
| `Checkbox` / `Select` / `Switch` / `NumberInput` | 实现正常，无原生元素，使用场景特定 |

---

## 架构决策

1. **`WidgetModal` 不加入 `DesignerWidgets`**：Modal 是内部编排组件，非"设计师可替换的 UI 元组件"。加入接口会让所有 adapter 实现者被迫提供 Modal 实现，增加不必要的耦合。

2. **Widget 内部直接 import 同级组件**：`OptionsEditor.tsx` 中 `import { WidgetButton } from './Button'`，不走 `w.Xxx` 间接层。因为 `w` 是运行时注入的，不适合在 Widget 自身实现中使用。

3. **不清理 ButtonGroup 等已达标文件**：遵循"仅修改本次关注的代码"原则。

---

## 验证步骤

1. `pnpm build` — 确保无编译/类型错误
2. `pnpm lint` — 确保无 lint 违规
3. `pnpm check:tokens` — 确保主题 Token 约束未被破坏
4. 视觉确认：两个 Modal 打开/关闭行为正常，按钮样式一致