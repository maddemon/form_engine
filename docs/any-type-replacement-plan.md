# any 类型替换工程方案

> 对应主文档：[code-optimization-analysis.md](./code-optimization-analysis.md) — 3.21  
> 状态：待审核  
> 日期：2026-06-04  
> 最后更新：2026-06-04（统计重做 + 补充遗漏文件 + 风险分析）

---

## 1. 目标

消除 `packages/core/src` 下的可替换 `any`，替换为精确 TypeScript 类型，提升类型安全性和 IDE 自动补全体验。

**注意**：部分 `any` 是架构设计使然（适配器索引签名、泛型默认值、事件回调签名），这些属于"合理保留"范畴，详见第 7 节。

---

## 2. 现状统计（2026-06-04 重做）

基于 `grep -rn ": any\|as any" packages/core/src` 逐文件验证：

| 类别 | 数量 | 分布文件数 |
|------|------|-----------|
| `: any`（类型标注） | 26 处 | 12 个文件 |
| `as any`（类型断言） | 14 处 | 11 个文件 |
| `= any`（泛型默认值，grep 未覆盖） | 1 处 | 1 个文件 |
| **非测试文件合计** | **41 处** | **20 个文件** |
| 测试文件（另计） | 11 处 | 2 个文件 |
| **总计** | **52 处** | **22 个文件** |

### 按文件分布（非测试文件，按优先级排序）

| 文件 | `: any` | `as any` | `= any` | 合计 | 优先级 |
|------|---------|----------|---------|------|--------|
| `types/adapter.ts` | 7 | 0 | 0 | 7 | **P0** — 基础类型定义，影响面最大 |
| `PropertyPanel.tsx` | 4 | 0 | 0 | 4 | **P0** — 用户直接接触的 API |
| `events/resolver.ts` | 4 | 0 | 0 | 4 | **P1** — 事件引擎核心 |
| `FormRender.tsx` | 3 | 0 | 0 | 3 | **P1** — 核心渲染器 |
| `styles/applyStyles.ts` | 0 | 3 | 0 | 3 | **P1** — 样式工具 |
| `FieldRenderer.tsx` | 2 | 0 | 0 | 2 | **P1** — 核心渲染器 |
| `renderer/useAdaptiveAdapter.ts` | 0 | 2 | 0 | 2 | **P2** — 浏览器兼容 |
| `propRenders/ItemListEditor.tsx` | 0 | 2 | 0 | 2 | **P2** — 属性编辑器 |
| `types/base-props.ts` | 1 | 0 | 1 | 2 | **P1** — 基础 Props 类型 |
| `Canvas.tsx` | 1 | 0 | 0 | 1 | **P3** |
| `designer/RulesEditor.tsx` | 1 | 0 | 0 | 1 | **P3** |
| `components/upload/types.ts` | 1 | 0 | 0 | 1 | **P3** |
| `types/events.ts` | 1 | 0 | 0 | 1 | **P1** — 事件类型定义 |
| `types/designer-drag.ts` | 0 | 1 | 0 | 1 | **P3** |
| `components/segment/Props.tsx` | 0 | 1 | 0 | 1 | **P2** |
| `components/select/Props.tsx` | 0 | 1 | 0 | 1 | **P2** |
| `components/checkbox/Props.tsx` | 0 | 1 | 0 | 1 | **P2** |
| `components/radio/Props.tsx` | 0 | 1 | 0 | 1 | **P2** |
| `components/slider/Props.tsx` | 0 | 1 | 0 | 1 | **P2** |
| `dataSource/resolver.ts` | 0 | 1 | 0 | 1 | **P2** |

> **测试文件**（不计入主统计，单独处理）：
> - `events/__tests__/resolver.test.ts`（9 处，含 mock 和 console.warn 覆盖）
> - `designer/__tests__/custom-component.test.tsx`（2 处，测试组件 props）

---

## 3. 分类与替换策略

### 3.1 类型缺失（缺少现有类型定义）

需要定义新类型或导入已有类型即可替换。

| 模式 | 示例位置 | 替换方案 |
|------|---------|---------|
| `formConfig: any` | PropertyPanel.tsx:29 | `FormConfig`（`types/schema.ts` 已有） |
| `w: any` | PropertyPanel.tsx:68,223 | `DesignerWidgets`（`types/adapter.ts` 已有） |
| `customConfig: any` | PropertyPanel.tsx:74 | `CustomComponentConfig \| null`（`types/custom-component.ts` 已有） |
| `widgets: any` | RulesEditor.tsx:17 | `DesignerWidgets` |
| `response?: any` | upload/types.ts:22 | `unknown` 或定义 `UploadResponse` 类型 |
| `children?: any[]` | Canvas.tsx:43 | `{ id: string; label: string; type: string; children?: ... }[]`（递归类型） |
| `field: any` | adapter.ts:204 | `FormFieldSchema` |
| `onChange: (updatedField: any)` | adapter.ts:206 | `FormFieldSchema` |
| `allFields?: any[]` | adapter.ts:208 | `FormFieldSchema[]` |
| `fieldSchema?: any` | adapter.ts:25 | `FormFieldSchema` |

**工作量估算**：~14 处，每处 5-15 分钟 = 2-3 小时

### 3.2 泛型缺失

函数/组件本应支持泛型但用了 `any`。

| 模式 | 位置 | 建议 |
|------|------|------|
| `(props: any) => React.ReactNode` | FieldRenderer.tsx:20,152; FormRender.tsx:20,343 | 用 `FieldComponentProps` 或定义 `ComponentRenderFn` 类型 |
| `(...args: any[]) => void` | FormRender.tsx:33; events/resolver.ts:33,79,99,138 | 部分合理保留（用户回调），events/resolver 的可统一为 `ResolvedEventHandler` |
| `TValue = any` | base-props.ts:38 | 保留（泛型默认值，下游 `ComponentPropsMap` 精确覆盖） |
| `onChange?: (value: any)` | base-props.ts:46 | 子接口已重定义精确类型，改为 `unknown` 或 `TValue` |

**工作量估算**：~8 处，每处 10-20 分钟 = 2-3 小时

### 3.3 `as any` 强制断言

| 模式 | 位置 | 替换方案 |
|------|------|---------|
| `(style as any)[cssProp]` | applyStyles.ts:46,49 | 使用 `Record<string, string>` 或 `CSSProperties[keyof CSSProperties]` 约束 |
| `borderStyle: 'dashed' as any` | applyStyles.ts:151 | `as React.CSSProperties['borderStyle']` 或 `as const` |
| `(mql as any).addListener` | useAdaptiveAdapter.ts:33,40 | 类型守卫 + `@ts-expect-error` 注释 |
| `(item as any)[field.key]` | ItemListEditor.tsx:234,246 | 定义 `Record<string, unknown>` 或泛型 |
| `values.options as any[]` | segment/select/checkbox/radio Props | 5 个文件同一根因：`OptionsEditor` 的 value 类型与 `options` 字段类型不匹配，统一修复 `OptionsEditor` 类型 |
| `(raw as any[])` | dataSource/resolver.ts:65 | `unknown[]` |
| `data.fieldType as any` | designer-drag.ts:28 | `FieldType`（`types/schema.ts` 已有） |
| `((values.tooltip as any)?.formatter)` | slider/Props.tsx:19 | 定义 `TooltipConfig` 类型 |

**工作量估算**：~14 处，每处 10-20 分钟 = 3-4 小时

---

## 4. 依赖影响分析

以下改动涉及多处下游，需同步修改，不可单独执行：

| 改动 | 影响文件 | 风险等级 |
|------|---------|---------|
| `adapter.ts` `FieldComponentProps` 的 `value`/`onChange`/`fieldSchema` | 所有 adapter 实现（`packages/adapter-antd`、`packages/adapter-antd-mobile`）、所有 field renderer、`FieldRenderer.tsx`、`FormRender.tsx` | **高** — 必须先评估泛型化可行性 |
| `adapter.ts` `PropertyPanelRenderProps` 的 `field`/`onChange`/`allFields` | 所有 adapter 的 PropertyPanel 实现 | **高** |
| `adapter.ts` `[key: string]: any` 索引签名 | 所有使用 `FieldComponentProps` 的地方 | **极高** — 删除索引签名会导致所有扩展属性报错，建议保留 |
| `events/resolver.ts` `callbacks` 类型 | `FormRender.tsx`、`FieldRenderer.tsx`、所有事件测试 | **中** |
| `base-props.ts` `onChange: (value: any)` | 所有 `BaseFormComponentProps` 子类型 | **中** — 子接口已重定义，改为 `unknown` 影响可控 |
| `OptionsEditor` 类型修复 | `segment/select/checkbox/radio/slider` Props（5 文件） | **低** — 统一修复，一次性完成 |

---

## 5. 执行步骤

### Step 1：建立类型审计基准

```bash
pnpm tsc --noEmit --strict
```

记录所有 `any` 位置的精确行号和上下文。

### Step 2：优先级路线（已修正）

```
Phase 0 — 快速修复（低风险、类型已存在）：
  PropertyPanel.tsx（4 处：formConfig/w/customConfig）
  RulesEditor.tsx（1 处：widgets）
  Canvas.tsx（1 处：children）
  designer-drag.ts（1 处：fieldType）
  upload/types.ts（1 处：response）
  合计 8 处，预计 1 小时

Phase 1 — 核心渲染器 + 基础类型：
  FormRender.tsx（3 处：components/callbacks）
  FieldRenderer.tsx（2 处：components/renderFn）
  base-props.ts（1 处：onChange，TValue=any 保留）
  types/events.ts（1 处：ResolvedEventHandler，评估后可能保留）
  合计 7 处，预计 2 小时

Phase 2 — 组件 Props 统一修复 + 样式工具：
  components/segment|select|checkbox|radio|slider Props（5 处：as any[] 统一根因）
  styles/applyStyles.ts（3 处：CSS 属性赋值）
  propRenders/ItemListEditor.tsx（2 处：动态字段访问）
  useAdaptiveAdapter.ts（2 处：浏览器兼容）
  dataSource/resolver.ts（1 处：raw as any[]）
  合计 13 处，预计 3 小时

Phase 3 — 事件引擎 + 适配器类型（需谨慎评估）：
  events/resolver.ts（4 处：callbacks 类型）
  types/adapter.ts（7 处：value/onChange/fieldSchema/index signature）
  合计 11 处，预计 4 小时（含影响评估）

Phase 4 — 测试文件：
  events/__tests__/resolver.test.ts（9 处）
  designer/__tests__/custom-component.test.tsx（2 处）
  合计 11 处，预计 1 小时
```

### Step 3：每种类型的处理方式

| 类型 | 操作 |
|------|------|
| 类型已存在但未使用 | 直接替换，验证编译通过 |
| 类型存在但字段不完整 | 补充类型定义 + 替换 |
| 类型完全不存在 | 在合适位置（`types/` 或就近）定义 + 替换 |
| 合理保留（架构设计） | 加 `// eslint-disable-next-line @typescript-eslint/no-explicit-any` + 注释说明原因 |
| 测试中的 `any` | 提取 `vi.mock` factory 或定义 test utility 类型 |
| 跨 adapter 影响 | 先评估可行性，再统一修改所有 adapter 实现 |

---

## 6. 类型定义补充清单

| 待定类型 | 可能位置 | 涉及字段 |
|----------|---------|---------|
| `ComponentRenderFn` | `types/adapter.ts` | `(props: FieldComponentProps) => React.ReactNode`（替代 `(props: any) => ...`） |
| `TooltipConfig` | `components/slider/types.ts` | `formatter: string` |
| `UploadResponse` | `components/upload/types.ts` | 根据实际响应结构调整 |
| `TreeDataNode`（递归） | `Canvas.tsx` 或就近 | `{ id: string; label: string; type: string; children?: TreeDataNode[] }` |
| `OptionsEditor` value 类型修正 | `types/adapter.ts` | `DesignerWidgets.OptionsEditor` 的 value 类型需与 `options` 字段类型一致 |

---

## 7. 边界与保留

以下 `any` 属于架构设计使然，应保留（加注释豁免）：

| 位置 | 代码 | 保留原因 |
|------|------|---------|
| `adapter.ts:35` | `[key: string]: any` | 索引签名，允许 adapter 透传任意 props 给底层 UI 库组件，删除会导致所有字段渲染器报错 |
| `base-props.ts:38` | `TValue = any` | 泛型默认值，下游 `ComponentPropsMap` 已为每种组件类型精确覆盖，不影响类型安全 |
| `events.ts:102` | `ResolvedEventHandler = (...args: any[]) => any` | 事件系统通用回调签名，无法预知各事件参数类型，属于合理设计 |
| `events/resolver.ts:33,79,99,138` | `callbacks: Record<string, (...args: any[]) => void>` | 用户自定义回调，签名由用户决定，引擎无法预知 |
| `FormRender.tsx:33` | `callbacks?: Record<string, (...args: any[]) => void>` | 同上，用户回调入口 |

保留率预期：52 处中 **10-12 处**合理保留，其余全部替换。最终目标为 **< 12 处 any**（均为架构设计或用户回调兼容）。

---

## 8. 验证方法

1. `pnpm build` — 编译无错误（`strict: true` 模式下）
2. `pnpm test` — 所有测试通过
3. IDE 检查 affected 组件的自动补全是否正常
4. 确认公共 API 的类型导出正确
5. 确认 `packages/adapter-antd` 和 `packages/adapter-antd-mobile` 同步编译通过

| 检查项 | 预期结果 |
|--------|---------|
| `pnpm build` | 0 errors |
| `pnpm test` | 全部 passed |
| `pnpm lint` | 无 `no-explicit-any` 警告（注释豁免除外） |
| `packages/adapter-antd build` | 0 errors |
| `packages/adapter-antd-mobile build` | 0 errors |
| 使用 `useFormDesigner()` 的 FormConfig 参数 | 有自动补全 |
| 使用 `useFormRender()` 的返回值 | 有类型提示 |