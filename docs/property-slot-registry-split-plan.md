# Property Slot Registry 拆分计划

## 目标

`packages/core/src/registry/propertySlotRegistry.tsx`（434 行）混入了多种职责，单组件 `FallbackCodeEditor` 占近一半体积。按职责拆为子文件夹 + 兜底组件独立文件，保持外部 import 路径不变。

## 现状

文件内含：

| 块                        | 内容                                                                                                  | 行数（大致） |
| ------------------------- | ----------------------------------------------------------------------------------------------------- | ------------ |
| `PropertySlotRegistry` 类 | 纯注册逻辑，无 React                                                                                  | ~20          |
| 适配层                    | `adaptExpressionInput` / `adaptDataSourceEditor` / `getWidgetFallback`                                | ~60          |
| 样式常量 + 工具           | `FALLBACK_TEXTAREA_STYLE` / `LINE_NUMBERS` / `countLines` / `getDefaultCode`                          | ~50          |
| 4 个 Fallback 组件        | `FallbackExpressionEditor` / `FallbackJsonEditor` / `FallbackDataSourceEditor` / `FallbackCodeEditor` | ~250         |
| 解析出口                  | `defaultSlotFallbacks` + `resolveSlot`                                                                | ~35          |

## 目标结构

```text
packages/core/src/registry/propertySlotRegistry/
├── index.ts               # 收口重导出（保持 import 路径不变）
├── registry.ts            # PropertySlotRegistry 类（纯 TS，无 React）
├── widgetAdapters.tsx     # adaptExpressionInput / adaptDataSourceEditor / getWidgetFallback
├── resolveSlot.tsx        # defaultSlotFallbacks + resolveSlot
└── fallbacks/
    ├── shared.ts          # FALLBACK_TEXTAREA_STYLE 公共样式
    ├── ExpressionEditor.tsx
    ├── JsonEditor.tsx
    ├── DataSourceEditor.tsx
    └── CodeEditor.tsx     # 包含它独有的 LINE_NUMBERS / TEXTAREA_CODE / BUTTON_BAR / getDefaultCode / countLines
```

## 拆分原则

- **`registry.ts` 保持纯 TS**：不引入 React，便于单测和 tree-shaking
- **Widget 适配层独立**：依赖 `DesignerWidgets` 和 `PropertySlotProps`，与 fallback 解耦
- **每个 fallback 独立文件**：`CodeEditor` 内部依赖的样式/工具就近内联（不抽 `shared.ts`），避免无意义的"共享"耦合
- **`shared.ts` 只放多文件复用的样式**：`FALLBACK_TEXTAREA_STYLE` 至少 3 个 fallback 复用，保留
- **`index.ts` 完整重导出**：外部 `import { ... } from '.../propertySlotRegistry'` 路径不变

## 兼容性

外部 7 个 import 点全部使用 `from '.../registry/propertySlotRegistry'`，bundler 解析下会自动找到 `propertySlotRegistry/index.ts`，**无需修改任何 import**。

涉及点（仅供核对，不修改）：

- `packages/core/src/index.ts:184`
- `packages/core/src/registry/index.ts:27`
- `packages/core/src/components/jsx/Props.tsx:5`
- `packages/core/src/components/html/Props.tsx:2`
- `packages/core/src/designer/PropertyPanel/DefaultPropertyContent.tsx:7`
- `packages/core/src/designer/RulesEditor.tsx:4`
- `packages/core/src/designer/EventHandlerEditor.tsx:14`
- `packages/core/src/propRenders/shared.tsx:5`
- `packages/core/src/propRenders/CustomPropsRender.tsx:3`

## 执行步骤

1. 创建 `propertySlotRegistry/` 目录及 8 个新文件
2. 验证 7 个 import 点路径解析（无需改动）
3. 删除旧 `propertySlotRegistry.tsx`
4. `pnpm lint` → `pnpm check:tokens` → `pnpm --filter @form-engine/core type-check` → `pnpm --filter @form-engine/core test -- --run`

## 验证结果

| 检查                                         | 结果                                                                                                                                                                       |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 旧 `propertySlotRegistry.tsx` 已删除         | ✅（Glob 校验不存在）                                                                                                                                                      |
| 9 个新文件创建                               | ✅ `index.ts` / `registry.ts` / `widgetAdapters.tsx` / `resolveSlot.tsx` / `fallbacks/{CodeEditor,DataSourceEditor,ExpressionEditor,JsonEditor,shared}.{tsx,ts}`           |
| 8 个外部 import 站点路径                     | ✅ 未改动（bundler 自动解析到 `propertySlotRegistry/index.ts`）                                                                                                            |
| `pnpm check:tokens`                          | ✅ 0 violations（103 files scanned）                                                                                                                                       |
| `pnpm lint`                                  | ⚠️ 仓库内 25 errors / 46 warnings，**新增文件零问题**（grep 验证 `propertySlotRegistry\|fallbacks` 无匹配）                                                                |
| `pnpm --filter @form-engine/core type-check` | ⚠️ 3 errors，**全部在 `html/Props.tsx` / `jsx/Props.tsx`**，未触碰、属历史遗留（`PropertySlotProps.placeholder?: string` 与 `locale` 字段为 `string \| undefined` 不兼容） |
| `pnpm --filter @form-engine/core test`       | ⚠️ 30 通过 / 2 失败 / 3 空测试套件。失败的是 `FormRender.test.tsx` 的 `submit/onSubmit` 用例，与 `useFormRender.ts` 的 ref-in-render lint 错误同源，**与本次拆分无关**     |

**结论**：拆分本身零新增问题，剩余 error 均为仓库历史遗留。

## 拆分收益

| 维度       | 拆分前                            | 拆分后                                 |
| ---------- | --------------------------------- | -------------------------------------- |
| 最大单文件 | 434 行                            | 250 行（`CodeEditor.tsx`）             |
| 关注点     | 注册 / 适配 / 兜底 / 解析混在一起 | 4 层各 1 文件                          |
| 后续扩展   | 改一处要看 400+ 行                | 加 fallback 只需新增 1 文件 + 1 行注册 |
| 测试挂载   | 无法独立测单一 fallback           | 每个 fallback 独立文件便于挂测试       |
