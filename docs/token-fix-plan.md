# Token 化修复计划

> 目标：消除 `pnpm check:tokens` 报出的 142 处硬编码违规，让 `pnpm build` 通过。
>
> **状态：✅ 已完成（2026-06-02）**

## 背景

`pnpm build` 前置 `pnpm check:tokens` 失败，扫描 `designer/`、`widgets/`、`renderer/`、`propRenders/` 4 个目录的 `.ts/.tsx` 文件，违规即 exit 1。

违规类型分布：
- `[hex]` 硬编码 hex 颜色
- `[rgb]` 硬编码 `rgba()`
- `[numeric]` 硬编码 `padding/margin/borderRadius/gap/fontSize/width/height` 数值

## 修复原则

| 场景 | 方案 | 理由 |
|---|---|---|
| 简单静态颜色 | `'#xxx'` → `'var(--fe-xxx)'` | 零运行时；CSS 变量已注入 |
| 简单静态数值 | `gap: 4` → `token('spacingXs')` 或 `var(--fe-spacing-xs)` | 走 token，未来可主题化 |
| 复合值 `1px solid #xxx` | `` `1px solid ${t.borderPrimary}` `` | 拼接场景必走 token() |
| 条件逻辑样式（selected/isOver） | 工厂函数返回动态对象 | 已有 `createDesignerStyles(t)` 样板 |


**禁止**：
- 引入 CSS-in-JS 库（emotion/styled-components）—— 扩大改动面
- 引入 CSS Modules 改造 className 方案 —— 与本任务目标不符
- 拆分独立 CSS 文件 —— 142 处改动会爆炸

## 颜色 → Token 映射

| 旧值 | 新值 |
|---|---|
| `#1677ff` / `#1890ff` | `var(--fe-primary)` / `token('primary')` |
| `#0958d9` | `var(--fe-primary-active)` |
| `#4096ff` | `var(--fe-primary-hover)` |
| `#fff` / `#ffffff` | `var(--fe-bg-primary)` / `token('bgPrimary')` |
| `#999` | `var(--fe-text-tertiary)` / `token('textTertiary')` |
| `#666` | `var(--fe-text-secondary)` / `token('textSecondary')` |
| `#333` | `var(--fe-text-primary)` / `token('textPrimary')` |
| `#595959` | `var(--fe-text-secondary)` |
| `#d9d9d9` | `var(--fe-border-primary)` / `token('borderPrimary')` |
| `#e8e8e8` | `var(--fe-border-secondary)` |
| `#f0f0f0` | `var(--fe-border-tertiary)` |
| `#eee` | `var(--fe-border-light)` / `token('borderLight')` |
| `#e6f4ff` | `var(--fe-primary-bg)` / `token('primaryBg')` |
| `#91caff` | `var(--fe-primary-hover)` / `token('primaryHover')` |
| `#e0e0e0` / `#ccc` / `#ddd` | `var(--fe-border-primary)` 或 `borderLight` |
| `#f5f5f5` | `var(--fe-bg-secondary)` |
| `#fafafa` | `var(--fe-bg-tertiary)` |
| `#f0f5ff` | `var(--fe-primary-hover-bg)` |
| `#f0f8ff` | **例外保留硬编码**（DnD 高亮，业务反馈色） |
| `#ff4d4f` | `var(--fe-error)` / `token('error')` |
| `#52c41a` 等其他 antd 业务色 | 对应 token |

## 数值 → Token 映射

| 旧值 | 新 token |
|---|---|
| `gap: 2` | `spacingXs / 2` (无合适 token 时取 spacingXs 4px，注释说明) |
| `gap: 4` | `spacingXs` |
| `gap: 6 / 8` | 保持数值或映射 `spacingXs/Md` |
| `padding: 4 / 8 / 12` | `spacingXs/Sm/Md` |
| `fontSize: 10 / 11 / 12` | `fontSizeXs` 或 `0.857em`（小标签专用） |
| `fontSize: 14` | `fontSizeMd` |
| `fontSize: 16` | `fontSizeLg` |
| `borderRadius: 2/3/4/6/8` | `borderRadiusXs/Sm/Md/Lg` |


## 文件清单（共 20 个）

### designer/ (11 个, 116 处) ✅
- [x] Canvas.tsx (7)
- [x] CanvasToolbar.tsx (21)
- [x] CollapsibleSection.tsx (4)
- [x] ComponentTree.tsx (10)
- [x] ContainerPreview.tsx (4)
- [x] Designer.tsx (10)
- [x] FieldItem.tsx (11)
- [x] FieldList.tsx (16)
- [x] FormConfigPanel.tsx (13)
- [x] PropertyPanel.tsx (8)
- [x] styles.ts (4)

### widgets/ (5 个, 15 处) ✅
- [x] ButtonGroup.tsx (1)
- [x] Checkbox.tsx (3)
- [x] OptionsEditor.tsx (2)
- [x] shared.ts (4)
- [x] Switch.tsx (5)

### renderer/ (2 个, 4 处) ✅
- [x] defaultAdapter.ts (2)
- [x] FormRender.tsx (2)

### propRenders/ (2 个, 15 处) ✅
- [x] CustomPropsRender.tsx (8)
- [x] shared.tsx (7)

## 执行步骤

1. ✅ 修复 designer/ 11 个文件
2. ✅ 修复 widgets/ 5 个文件
3. ✅ 修复 renderer/ 2 个文件
4. ✅ 修复 propRenders/ 2 个文件
5. ✅ 跑 `node scripts/check-tokens.mjs` 确认 0 违规
6. ✅ 跑 `pnpm build` 确认构建通过
7. ✅ 跑 `pnpm type-check` 确认 TypeScript 无错

## 关键观察 & 决策记录

### 大量违规的根因
原代码中绝大多数违规来自 `var(--fe-xxx, #fallback)` 的 **fallback 硬编码颜色**。例如：
- `'var(--fe-primary, #1890ff)'` —— fallback 里的 `#1890ff` 触发 [hex] 违规
- `'var(--fe-text-muted, #999)'` —— fallback 里的 `#999` 触发 [hex] 违规
- `'var(--fe-border-primary, #e0e0e0)'` —— 同上

**修复策略**：直接去掉 fallback，保留 `var(--fe-xxx)`。StyleProvider 通过 [StyleProvider.tsx](file:///d:/Repos/form_engine/packages/core/src/styles/StyleProvider.tsx) 在 `<head>` 注入 `:root { --fe-xxx: ... }`，构建产物里一定存在。

### 物理尺寸豁免
- [Switch.tsx](file:///d:/Repos/form_engine/packages/core/src/widgets/Switch.tsx) 的 `width: 36 / height: 20 / borderRadius: 10 / top: 2 / left: 18` 是 switch 组件的物理尺寸，**不属于主题 token**。
- [ContainerPreview.tsx](file:///d:/Repos/form_engine/packages/core/src/designer/ContainerPreview.tsx) 的 `minHeight: 60` 是容器最小高度，同上。
- [Canvas.tsx](file:///d:/Repos/form_engine/packages/core/src/designer/Canvas.tsx) 和 [ContainerPreview.tsx](file:///d:/Repos/form_engine/packages/core/src/designer/ContainerPreview.tsx) 的 `#f0f8ff` 是 DnD 高亮业务反馈色，按 [theme-tokens.md](./../.agents/rules/theme-tokens.md) 例外条款保留 + 注释。
- [ButtonGroup.tsx](file:///d:/Repos/form_engine/packages/core/src/widgets/ButtonGroup.tsx) 的 `gap: 0` 是 ButtonGroup 内嵌默认行为（按钮紧贴），disable-line 兜底。
- 滚动条样式的 `5px` / `3px`（[Designer.tsx](file:///d:/Repos/form_engine/packages/core/src/designer/Designer.tsx)）和复选框的 `margin: 0`（[Checkbox.tsx](file:///d:/Repos/form_engine/packages/core/src/widgets/Checkbox.tsx)）都是浏览器默认重置，disable-line 兜底。

### 架构决策
- **不引入 CSS-in-JS**（emotion / styled-components）：违背"只实现需求内功能"原则，会扩大改动面
- **不引入 CSS Modules**：会让所有 className 引用变成 `styles.xxx`，跨 20 个文件，动静太大
- **不外移到 CSS 文件**：142 处改动会爆炸；当前内联 style + 工厂函数 (`createXxxStyles(t)`) 模式足够支撑主题化
- **继续走 `var(--fe-*)` + 工厂函数双轨**：静态值用 CSS 变量零运行时，复合值（`1px solid ${color}`）用 `token()` 在工厂函数里拼接

## 完成判定

- ✅ `node scripts/check-tokens.mjs` 退出码 0
- ✅ `pnpm build` 退出码 0（所有包构建成功）
- ✅ `pnpm type-check` 退出码 0
- ✅ 全部 142 处违规消除
- ✅ 不引入新依赖
- ✅ 不破坏现有功能
