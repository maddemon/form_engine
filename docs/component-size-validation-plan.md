# 组件 Size 属性 & 校验规则增强计划

## 目标概述

为表单引擎添加以下能力：
1. 组件级别 `size` 属性（如 Button）
2. 属性面板"高级属性"中增加校验规则编辑（必填、错误提示、正则验证、常用正则预设）
3. 设置必填后组件显示必填标记（`*`）
4. 提交时校验，利用 UI 库特性（如 antd 输入框变红 + 错误信息）

---

## 步骤 1：Button 增加 `size` 属性

### 调研结论

对 antd / antd-mobile / MUI 三个主流 UI 库的 `size` 支持做了交叉对比：

| 组件 | antd | antd-mobile | MUI | 三库均支持? |
|------|:----:|:-----------:|:---:|:---:|
| **Button** | ✅ | ✅ | ✅ | **是** |
| Input/TextField | ✅ | ❌ (CSS变量) | ✅ | ❌ |
| Select | ✅ | ❌ | ✅ | ❌ |
| InputNumber | ✅ | ❌ | ❌ | ❌ |
| Cascader | ✅ | ❌ | ❌ | ❌ |
| DatePicker | ✅ | ❌ | ✅ | ❌ |
| TreeSelect | ✅ | ❌ | ❌ | ❌ |

**唯一三库均支持 size 的组件是 Button**，因此仅对 Button 添加 `size` 属性。

> antd-mobile Button 的 size 值为 `'mini' | 'small' | 'middle' | 'large'`，比 antd 多了 `mini`。MUI 为 `'small' | 'medium' | 'large'`。  
> core 类型使用 `'small' | 'middle' | 'large'`，各 adapter 自行映射。

### 1.1 类型定义 — `packages/core/src/components/button/types.ts`
- 在 `ButtonProps` 中新增 `size?: 'small' | 'middle' | 'large'`

### 1.2 属性面板 — `packages/core/src/components/button/Props.tsx`
- 新增 `size` 选择器（使用 `ButtonGroup` widget），选项：小(small) / 中(middle) / 大(large)，默认 `middle`

### 1.3 Adapter 透传
- `packages/adapter-antd/src/components/Button.tsx`：将 `size` 透传给 `<AntButton size={...}>`
- `packages/adapter-antd-mobile` Button 组件（如有）：将 `size` 透传给 antd-mobile Button（支持 `mini` 到 `large` 的映射）

---

## 步骤 2：属性面板增加校验规则编辑（高级属性区域）

### 2.1 Schema 现状确认
`FormRule` 已定义在 `packages/core/src/types/schema.ts`：
```ts
interface FormRule {
  required?: boolean
  message?: string
  pattern?: string
  type?: 'string' | 'number' | 'boolean' | 'url' | 'email' | 'phone'
  // ...
}
```
字段已有 `rules?: FormRule[]`，但目前属性面板未提供编辑入口。

### 2.2 创建校验规则编辑器组件 — `packages/core/src/designer/RulesEditor.tsx`
新建组件，包含：
- **必填开关**：`<w.Switch>` 或 `<w.Checkbox>`，写入 `rules[0].required`
- **错误提示**：`<w.Input>` 输入自定义错误消息，placeholder 显示默认提示（如"此字段为必填"）
- **正则验证**：`<w.Input>` 输入正则表达式 `rules[0].pattern`
- **常用正则预设**：`<w.Select>` 下拉选择，选项：
  - 手机号（中国）：`^1[3-9]\d{9}$`
  - 身份证号（18位）：`^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$`
  - 邮箱：`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
  - 网址：`^https?://[\w.-]+(:\d+)?(/[\w./-]*)?$`
  - 自定义（输入框手动填写）

### 2.3 接入 PropertyPanel — `packages/core/src/designer/PropertyPanel.tsx`
- 在"高级属性" `<CollapsibleSection>` 内，`isForm` 条件块中，校验规则编辑器放在 colSpan 之后、hidden 之前
- 更新 `hasAdvancedConfig` 函数，增加对 `field.rules` 的检查
- 校验规则仅对 `isForm`（表单组件）显示

---

## 步骤 3：FieldRenderer 传递校验信息给适配器组件

### 3.1 — `packages/core/src/renderer/FieldRenderer.tsx`
- 在 `fieldProps` 中增加 `required: isRequired` 和 `rules: field.rules`
- 确保 `isRequired` 的判断逻辑已覆盖 `rules[].required`

### 3.2 必填标记
当前 `FieldRenderer` 已在 label 中渲染 `*` 和红色样式，逻辑保留。
但同时也将 `required` 传递给 adapter 组件，让 UI 库层面也感知必填状态。

---

## 步骤 4：提交时校验

### 4.1 校验逻辑 — 新建 `packages/core/src/renderer/validation.ts`
- 实现 `validateField(field, value): { valid: boolean; message?: string }` 
- 支持：required 检查、pattern 正则匹配、type 类型校验（email/url/phone）
- `validateForm(fields, values): Record<string, string>` 返回 `{ fieldName: errorMessage }`

### 4.2 FormRender 状态管理 — `packages/core/src/renderer/FormRender.tsx`
- 新增状态：`const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})`
- 修改 `handleSubmit`：
  - 先调用 `validateForm(visibleFields, formValues)` 获取所有字段的错误
  - 有错误时：`setFieldErrors(errors)`，**不调用** `onSubmit`
  - 无错误时：清空 `fieldErrors`，调用 `onSubmit?.(formValues)`
- 字段值变化时清除对应字段的错误

### 4.3 FieldRenderer 展示校验错误 — `packages/core/src/renderer/FieldRenderer.tsx`
- 新增 prop `error?: string`
- 有错误时在组件下方展示红色错误文字（模拟 antd Form.Item 的 `help` 样式）
- 将 `validateStatus`（`'error'` 或 `undefined`）传递给 adapter 组件

### 4.4 Adapter 组件支持校验状态
以 Input 为例 — `packages/adapter-antd/src/components/Input.tsx`：
- props 增加 `validateStatus?: 'error' | 'warning' | 'success'` 和 `help?: string`
- 用 antd 的 `Form.Item` 包裹（或直接传入 antd Input 的 `status` prop）

若 adapter 组件不处理 `validateStatus`/`help`，则 FieldRenderer 的红色文字兜底生效。

### 4.5 FormRender 传递 errors — `packages/core/src/renderer/FormRender.tsx`
- 修改 `renderNestedField`，从 `fieldErrors` 中取出当前字段 error 传给 `FieldRenderer`

---

## 步骤 5：编译 & 验证

- 执行 `pnpm run build`（或各包独立 build），修复所有类型错误
- 确保 adapter-antd 和 core 包均通过编译

---

## 涉及文件清单

### 步骤 1（size 属性 — 仅 Button）
| 文件 | 改动 |
|------|------|
| `packages/core/src/components/button/types.ts` | 新增 `size?: 'small' \| 'middle' \| 'large'` |
| `packages/core/src/components/button/Props.tsx` | 新增 size 选择器 |
| `packages/adapter-antd/src/components/Button.tsx` | 透传 size 给 AntButton |
| `packages/adapter-antd-mobile/src/components/Button.tsx`（如存在） | 透传 size 给 antd-mobile Button |

### 步骤 2（校验规则编辑）
| 文件 | 改动 |
|------|------|
| `packages/core/src/designer/RulesEditor.tsx` | **新建** — 校验规则编辑器 |
| `packages/core/src/designer/PropertyPanel.tsx` | 接入 RulesEditor，更新 hasAdvancedConfig |

### 步骤 3（FieldRenderer 传递校验信息）
| 文件 | 改动 |
|------|------|
| `packages/core/src/renderer/FieldRenderer.tsx` | 增加 required/rules 透传到 fieldProps |

### 步骤 4（提交时校验）
| 文件 | 改动 |
|------|------|
| `packages/core/src/renderer/validation.ts` | **新建** — 校验函数 |
| `packages/core/src/renderer/FieldRenderer.tsx` | 增加 error/validateStatus props |
| `packages/core/src/renderer/FormRender.tsx` | fieldErrors 状态、提交校验、传递 errors 给 FieldRenderer |

## 状态：📋 规划中