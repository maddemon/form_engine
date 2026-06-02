# 主题适配方案：让 Form Engine 界面跟随开发者 UI 库的主题色

> **实施状态**：✅ Phase 1（Core 基础变更）+ Phase 2（Adapter 桥接）+ Phase 3（全量硬编码样式消除）全部完成。
>
> 最后更新：2026-06-02

## 问题分析

### 现状

1. **core/styles 已有 Token 体系**：`ThemeTokens` 接口定义了 60+ token（颜色、间距、圆角、阴影等），`StyleProvider` 支持 CSS 变量注入
2. **全量硬编码样式**：经 grep 统计，core 包中 `style={{...}}` 内联样式约 60 处，硬编码颜色值（`#xxx`）约 114 处，分布如下：
   - **widgets/**（4 文件）：Button、ButtonGroup、Switch、OptionsEditor — 组件渲染基础部件
   - **renderer/**（1 文件）：FieldRenderer — 表单字段渲染器（必填星号、错误提示等）
   - **propRenders/**（2 文件）：shared.tsx、CustomPropsRender — 属性面板编辑器控件
   - **designer/**（10 文件）：styles.ts、Designer、Canvas、CanvasToolbar、FieldList、PropertyPanel、FormConfigPanel、ComponentTree、ContainerPreview、CollapsibleSection、EventHandlerEditor
3. **adapter 层无主题桥接**：`adapter-antd`、`adapter-antd-mobile` 仅注册组件，未提供 UI 库 token → Form Engine token 的映射

> **关于 MUI**：当前项目无 MUI adapter，本方案仅在架构图与第三步接口预留位置。**桥接实现只针对 antd + antd-mobile**，MUI 留待未来扩展。

### 各 UI 库主题机制对比

| UI 库          | 主题注入方式                        | Token 消费方式                                                                | CSS 变量支持         |
| -------------- | ----------------------------------- | ----------------------------------------------------------------------------- | -------------------- |
| antd v6        | `ConfigProvider` + CSS 变量（默认） | `theme.useToken()` 同时返回值引用和 CSS 变量引用；`getDesignToken()` 静态方法 | 原生支持，默认启用   |
| antd-mobile v5 | CSS 变量（`--adm-*`）               | 直接覆盖 CSS 变量                                                             | 原生支持             |
| MUI v6         | `ThemeProvider` + `createTheme`     | `sx` prop / `theme.vars`                                                      | `cssVariables: true` |

> **antd v6 关键变化**：v6 默认使用纯 CSS 变量模式（`@ant-design/cssinjs` 输出 `--ant-*` 变量，不再生成 hashed className）。这意味着 antd 的 bridge 实现可以与 antd-mobile 趋同——都通过读取 DOM 上的 CSS 变量完成映射，不再必须依赖 `useToken()` hook 在组件内读取。此外，antd v6 提供了 `getDesignToken()` 静态方法，可在非 React 上下文中获取 token 值。

### 核心矛盾（v6 已大幅缓解）

- antd v6 默认输出 CSS 变量（`--ant-*`），token 本质上已在 DOM 上
- antd-mobile 用 CSS 变量（`--adm-*`），token 同样在 DOM 上
- MUI v6 开启 `cssVariables` 后也是 CSS 变量
- 三者的 bridge 实现路径趋同：读取 DOM CSS 变量 → 映射为 `--fe-*` CSS 变量
- **剩余差异**：antd 的 `zeroRuntime` 模式下 CSS 变量可能不完整；antd-mobile 的 CSS 变量需在组件挂载后才能读取

## 方案设计

### 核心思路：CSS 变量作为统一消费层 + Adapter 提供桥接映射

```
┌─────────────────────────────────────────────────────┐
│  开发者的 UI 库 (antd / antd-mobile，本期)           │
│  (MUI v6: 未来扩展，本期不实现)                       │
│  ┌──────────────┐  ┌──────────────┐                  │
│  │ ConfigProvider│  │ --adm-* vars │                  │
│  │ --ant-* vars │  │              │                  │
│  └──────┬───────┘  └──────┬───────┘                  │
└─────────┼─────────────────┼──────────────────────────┘
          │                 │
          ▼                 ▼
┌─────────────────────────────────────────────────────┐
│  Theme Bridge（每个 Adapter 提供）                    │
│  ┌──────────────────────────────────────────────┐    │
│  │ antd: 读取 --ant-* CSS 变量                   │    │
│  │   或 getDesignToken() 静态方法                │    │
│  │   → 注入 --fe-* CSS 变量到 :root             │    │
│  │ antd-mobile: 读取 --adm-* CSS 变量           │    │
│  │   → 注入 --fe-* CSS 变量到 :root             │    │
│  │ MUI（未来）: theme.vars → 注入 --fe-*         │    │
│  └──────────────────────────────────────────────┘    │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│  Form Engine 消费层                                  │
│  --fe-primary: #1677ff;                             │
│  --fe-border-radius-sm: 4px;                       │
│  --fe-spacing-md: 12px;                            │
│  ...                                                │
│  组件通过 useStyle() / useTheme() / CSS 变量消费     │
└─────────────────────────────────────────────────────┘
```

### 关键设计决策

1. **CSS 变量是唯一可靠的跨库消费方式**
   - inline style 中可写 `var(--fe-primary)`
   - antd v6 和 antd-mobile 都已默认使用 CSS 变量，可直接读取映射
   - MUI v6 开启 `cssVariables` 后也是 CSS 变量
   - 三者的 bridge 实现路径统一：读 DOM CSS 变量 → 注入 `--fe-*` CSS 变量

2. **BridgeProvider 只负责注入 CSS 变量，不包裹 StyleProvider**
   - BridgeProvider 从 UI 库读取 token，通过 `createStyleTag()` 写入独立的 `<style data-fe-bridge="...">` 标签，与 StyleProvider 的 `injectCssVariables`（写入 inline style）完全隔离
   - BridgeProvider **不包裹也不替代** `StyleProvider`，两者各自独立工作
   - 用户可单独使用 BridgeProvider、单独使用 StyleProvider、或组合使用
   - 组合使用时 CSS 变量的最终优先级：`StyleProvider.theme` > `BridgeProvider` 映射 > `defaultTheme`。要使 `StyleProvider` 覆盖生效，必须将 `StyleProvider` 作为**外层**（父），详见第六步

3. **所有 core 组件统一使用 ThemeTokens，消除全量硬编码**
   - 不仅是 Designer，整个 core 包的组件（widgets/、renderer/、propRenders/、designer/）都不能写死样式
   - 样式迁移采用分层策略：共享样式用工厂函数、复杂组件用 `useStyle().token()`、简单组件用 `var(--fe-xxx)` CSS 变量引用
   - 注意：`designer/styles.ts` 中 `primary = '#1890ff'`（antd v4 默认），`defaultTheme.primary = '#1677ff'`（antd v5/v6 默认），统一后 Designer 主色会从 `#1890ff` 变为 `#1677ff`，这是一个视觉变化

## 实施步骤

### 第一步：扩展 ThemeTokens 接口（补充 Designer 所需 token）

当前 `ThemeTokens` 缺少 Designer 用到的一些语义 token，需要新增以下字段：

| 新 Token         | 类型     | Designer 原值 | 说明                                                                                                   |
| ---------------- | -------- | ------------- | ------------------------------------------------------------------------------------------------------ |
| `primaryHoverBg` | `string` | `#f0f5ff`     | 主色悬停背景色                                                                                         |
| `textMuted`      | `string` | `#bbb`        | 更弱化的辅助文字色（`textQuaternary`/`textPlaceholder` 是 `rgba(0,0,0,0.25)` ≈ `#bfbfbf`，不完全匹配） |
| `borderLight`    | `string` | `#eee`        | 浅色边框（`borderSecondary`=`#e8e8e8` 和 `borderTertiary`=`#f0f0f0` 均不完全匹配 `#eee`）              |

已可复用的 token（无需新增）：

| Designer 使用          | Designer 值     | 对应 Token      | 值                      | 是否匹配                                                               |
| ---------------------- | --------------- | --------------- | ----------------------- | ---------------------------------------------------------------------- |
| `colors.primary`       | `#1890ff`       | `primary`       | `#1677ff`               | ⚠️ 色调有差异（v4 vs v5/v6 默认值），统一为 `#1677ff`                  |
| `colors.primaryBg`     | `#e6f4ff`       | `primaryBg`     | `rgba(22,119,255,0.06)` | ✅ 近似匹配                                                            |
| `colors.danger`        | `#ff4d4f`       | `error`         | `#ff4d4f`               | ✅ 匹配                                                                |
| `colors.text`          | `#666`          | `textSecondary` | `rgba(0,0,0,0.65)`      | ⚠️ `#666` ≈ `rgba(0,0,0,0.6)`，`textSecondary` 是 `0.65`，视觉差异极小 |
| `colors.textSecondary` | `#999`          | `textTertiary`  | `rgba(0,0,0,0.45)`      | ⚠️ `#999` = `rgba(0,0,0,0.4)`，与 `0.45` 有细微差异                    |
| `colors.white`         | `#fff`          | `bgPrimary`     | `#ffffff`               | ✅ 匹配                                                                |
| `colors.canvasBg`      | `#f5f5f5`       | `bgSecondary`   | `#f5f5f5`               | ✅ 匹配                                                                |
| `colors.containerBg`   | `#fafafa`       | `bgTertiary`    | `#fafafa`               | ✅ 匹配                                                                |
| `colors.transparent`   | `'transparent'` | —               | —                       | 保持原样，无需 token                                                   |

> **注意**：`designer/styles.ts` 中的 `borders` 对象包含复合值（如 `selected: '1px solid ${colors.primary}'`），无法用单个 token 表达，需改为工厂函数从多个 token 拼装。`spacing` 和 `radii` 使用数字类型（如 `spacing.sm = 8`），而 `ThemeTokens` 中是字符串（如 `spacingSm = '8px'`），迁移时需注意类型差异。

同时需要同步更新 `tokens.css`（约 1000 行，与 `defaultTheme.ts` 一一对应）和 `darkTheme` 暗黑模式覆盖值。注意 `StyleProvider.tsx` 和 `injectCss.ts` 中各有一个 `toKebabCase` 重复定义，实施时提取为公共工具函数。

**文件**：`packages/core/src/styles/defaultTheme.ts`、`packages/core/src/styles/tokens.css`

### 第二步：消除全量硬编码样式（迁移策略）

#### 2.1 迁移三层策略

根据组件类型和样式复杂度，分三层处理：

| 层级        | 适用场景                                                                      | 方式                            | 示例                        |
| ----------- | ----------------------------------------------------------------------------- | ------------------------------- | --------------------------- |
| **第 1 层** | 共享样式定义（`designer/styles.ts`、`widgets/shared.tsx`）                    | 工厂函数 + `useStyle().token()` | `createStyles(t).toolbar`   |
| **第 2 层** | 复杂组件，含条件判断多（Button、ButtonGroup、Switch、FieldRenderer 等）       | `useStyle().token()` 直接取值   | `token('primary')`          |
| **第 3 层** | 简单纯展示组件，无条件判断（FieldList 的 DefaultIcon、CollapsibleSection 等） | `var(--fe-xxx)` CSS 变量引用    | `'var(--fe-text-tertiary)'` |

#### 2.2 第 1 层示例：工厂函数

```typescript
// packages/core/src/designer/styles.ts（重构后）
import type { ThemeTokens } from '../styles/defaultTheme'

export function createDesignerStyles(t: ThemeTokens) {
  return {
    toolbar: {
      position: 'absolute' as const,
      top: 0,
      right: 0,
      zIndex: 30,
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      background: t.primary,
      borderRadius: `0 ${t.borderRadiusSm} 0 ${t.borderRadiusSm}`,
      padding: '2px 6px',
      lineHeight: 1,
    },
    iconBtn: {
      color: t.bgPrimary,
      fontSize: 12,
      cursor: 'pointer',
      padding: '2px 3px',
      userSelect: 'none' as const,
    },
    fieldItem: (selected: boolean) => ({
      position: 'relative' as const,
      padding: t.spacingSm,
      marginBottom: t.spacingSm,
      borderRadius: t.borderRadiusMd,
      border: selected ? `1px solid ${t.primary}` : '1px solid transparent',
      transition: 'border-color 0.2s',
      cursor: 'pointer',
    }),
    containerPreview: (isOver: boolean) => ({
      minHeight: 60,
      position: 'relative' as const,
      border: isOver ? `2px solid ${t.primary}` : `1px dashed ${t.borderPrimary}`,
      borderRadius: t.borderRadiusSm,
      background: isOver ? t.primaryHoverBg : t.bgTertiary,
      padding: t.spacingSm,
    }),
    // ... 其他共享样式
  }
}
```

组件中使用：

```tsx
const { theme } = useStyle()
const ds = useMemo(() => createDesignerStyles(theme), [theme])
// ds.toolbar, ds.iconBtn, ds.containerPreview(isOver)
```

#### 2.3 第 2 层示例：`useStyle().token()`

条件判断多、逻辑复杂时用 `token()` 更安全且类型安全：

```tsx
// widgets/Button.tsx（重构后）
const { token } = useStyle()

const base: React.CSSProperties = {
  padding: '3px 12px',
  borderRadius: token('borderRadiusSm'),
  border: `1px solid ${token('borderPrimary')}`,
  fontSize: 12,
  background: token('bgPrimary'),
  color: token('textPrimary'),
}
if (type === 'primary') {
  base.background = token('primary')
  base.color = token('bgPrimary')
  base.borderColor = token('primary')
}
```

```tsx
// renderer/FieldRenderer.tsx（重构后）
const { token } = useStyle()

// 必填星号
{
  isRequired && <span style={{ color: token('error'), marginRight: 4 }}>*</span>
}

// 错误提示
;<div style={{ fontSize: 12, color: token('error') }}>未知字段类型: {field.type}</div>
```

#### 2.4 第 3 层示例：`var(--fe-xxx)` CSS 变量引用

无需 hook、无条件判断的纯展示样式，CSS 变量引用最简洁：

```tsx
// FieldList.tsx 中的 DefaultIcon（纯函数组件，无需改造为 hook）
function DefaultIcon() {
  return <span style={{ fontSize: 14, color: 'var(--fe-text-tertiary)' }}>⬜</span>
}

// 简单分隔线
;<div style={{ borderTop: '1px solid var(--fe-border-light)', paddingTop: 8 }} />
```

#### 2.5 全量颜色映射速查表

| 硬编码值  | 出现次数 | 替换为 `token()`           | 或 CSS 变量                  |
| --------- | -------- | -------------------------- | ---------------------------- |
| `#1677ff` | ~20      | `token('primary')`         | `var(--fe-primary)`          |
| `#1890ff` | ~3       | `token('primary')`         | `var(--fe-primary)`          |
| `#e6f4ff` | ~8       | `token('primaryBg')`       | `var(--fe-primary-bg)`       |
| `#f0f5ff` | ~3       | `token('primaryHoverBg')`  | `var(--fe-primary-hover-bg)` |
| `#91caff` | ~1       | `token('primaryBorder')`   | `var(--fe-primary-border)`   |
| `#ff4d4f` | ~8       | `token('error')`           | `var(--fe-error)`            |
| `#d9d9d9` | ~20      | `token('borderPrimary')`   | `var(--fe-border-primary)`   |
| `#eee`    | ~20      | `token('borderLight')`     | `var(--fe-border-light)`     |
| `#ddd`    | ~3       | `token('borderLight')`     | `var(--fe-border-light)`     |
| `#fff`    | ~25      | `token('bgPrimary')`       | `var(--fe-bg-primary)`       |
| `#f5f5f5` | ~3       | `token('bgSecondary')`     | `var(--fe-bg-secondary)`     |
| `#fafafa` | ~5       | `token('bgTertiary')`      | `var(--fe-bg-tertiary)`      |
| `#333`    | ~5       | `token('textPrimary')`     | `var(--fe-text-primary)`     |
| `#595959` | ~1       | `token('textSecondary')`   | `var(--fe-text-secondary)`   |
| `#666`    | ~5       | `token('textSecondary')`   | `var(--fe-text-secondary)`   |
| `#999`    | ~20      | `token('textTertiary')`    | `var(--fe-text-tertiary)`    |
| `#bbb`    | ~2       | `token('textMuted')`       | `var(--fe-text-muted)`       |
| `#ccc`    | ~2       | `token('disabledColor')`   | `var(--fe-disabled-color)`   |
| `#e0e0e0` | ~1       | `token('borderSecondary')` | `var(--fe-border-secondary)` |
| `#f0f8ff` | ~1       | —（DnD 拖入高亮，保留）    | —                            |

> **注意**：`#f0f8ff`（AliceBlue）是 DnD 拖入高亮反馈色，不属于主题体系，保留原样。

#### 2.6 执行顺序

1. **先改 `designer/styles.ts`** — 工厂函数，定义所有共享样式
2. **改 widgets/** — Button、ButtonGroup、Switch、OptionsEditor（用 `useStyle().token()`）
3. **改 renderer/** — FieldRenderer、`defaultAdapter.ts`（用 `useStyle().token()`）
4. **改 propRenders/** — shared.tsx、CustomPropsRender（混合使用）
5. **改 designer 纯展示组件** — FieldList 的 DefaultIcon、CollapsibleSection 等（用 `var(--fe-xxx)`）
6. **改 designer 复杂组件** — CanvasToolbar、FormConfigPanel、ComponentTree、PropertyPanel 等（用 `useStyle().token()`）
7. **改 Designer.tsx、Canvas.tsx** — 混合使用
8. 全部改完后 grep 验证无残留 `#xxx`

**文件**：`packages/core/src/widgets/*.tsx`、`packages/core/src/renderer/FieldRenderer.tsx`、`packages/core/src/renderer/defaultAdapter.ts`、`packages/core/src/propRenders/*.tsx`、`packages/core/src/designer/styles.ts` 及所有 designer 组件

> **补充**：`packages/core/src/renderer/defaultAdapter.ts:38` 的兜底渲染（"未知字段类型"提示框）也写死了 `border: '1px dashed #ff4d4f'` 和 `color: '#ff4d4f'`，需迁移为 `token('error')` / `token('borderPrimary')`。`components/*/Props.tsx` 中的 `#xxx` 均为 placeholder 提示文字（如"如: #333"），**不需要**迁移。

### 第三步：定义 ThemeBridge 接口

在 core 中定义桥接接口，让各 adapter 实现。由于 antd v6 和 antd-mobile 都已使用 CSS 变量，bridge 只需注入 CSS 变量，不需返回值对象。

```typescript
// packages/core/src/styles/themeBridge.ts

/**
 * CSS 变量映射配置
 * key: FE token 名, value: 源 CSS 变量名（如 --ant-color-primary）
 */
export type CssVarMapping = Record<string, string>

/**
 * ThemeBridge 配置
 */
export interface ThemeBridgeConfig {
  /** 来源 UI 库（用于将来扩展 / 调试） */
  source: 'antd' | 'antd-mobile' | 'mui' | 'custom'
  /** CSS 变量映射表 */
  mapping: CssVarMapping
  /**
   * 值转换器：key → 源变量名 → 原始值 → 转换后值
   * 典型用途：antd v6 的 borderRadius/fontSize 等是裸数字（无单位），需补 'px'
   */
  transformValue?: (feKey: string, srcCssVar: string, rawValue: string) => string
}

/**
 * BridgeProvider 的 Props
 *
 * 命名上 `theme` 与 `StyleProvider.theme` 对齐，避免「overrides」与「theme」混用。
 */
export interface BridgeProviderProps {
  children: React.ReactNode
  /** 用户最终覆盖的 token（在 bridge 映射之上；等价于把 StyleProvider 嵌套在外层） */
  theme?: PartialThemeTokens
}
```

> **简化说明**：v6 中三者的 bridge 均通过读 CSS 变量完成，因此不再需要 `resolveTokens()` 方法，ThemeBridge 退化为一个映射配置 + 一个提取公共逻辑的工厂函数。`prefix` 由 `StyleProvider`/`injectCssVariables` 默认接管 `fe`，BridgeProvider 内部硬编码 `fe-` 前缀，不向外暴露 prefix 配置项。

**文件**：`packages/core/src/styles/themeBridge.ts`（新增）

### 第四步：实现 antd ThemeBridge

antd v6 默认使用纯 CSS 变量（`--ant-*`），可直接从 DOM 读取并映射：

```typescript
// packages/adapter-antd/src/themeBridge.ts
import React, { useLayoutEffect } from 'react'
import { createStyleTag } from '@form-engine/core/styles'
import type { BridgeProviderProps } from '@form-engine/core'
// ⚠️ injectCssVariables/createStyleTag 仅从 '@form-engine/core/styles' 导出，
// '@form-engine/core' 主入口未 re-export。

const TOKEN_MAP: Record<string, string> = {
  // Primary
  primary: '--ant-color-primary',
  primaryHover: '--ant-color-primary-hover',
  primaryActive: '--ant-color-primary-active',
  primaryBg: '--ant-color-primary-bg',
  primaryBorder: '--ant-color-primary-border',

  // Success
  success: '--ant-color-success',
  successBg: '--ant-color-success-bg',

  // Warning
  warning: '--ant-color-warning',
  warningBg: '--ant-color-warning-bg',

  // Error
  error: '--ant-color-error',
  errorHover: '--ant-color-error-hover',
  errorBg: '--ant-color-error-bg',

  // Text
  textPrimary: '--ant-color-text',
  textSecondary: '--ant-color-text-secondary',
  textTertiary: '--ant-color-text-tertiary',
  textQuaternary: '--ant-color-text-quaternary',

  // Background
  bgPrimary: '--ant-color-bg-container',
  bgSecondary: '--ant-color-bg-layout',
  bgTertiary: '--ant-color-bg-container-secondary',
  bgElevated: '--ant-color-bg-elevated',

  // Border
  borderPrimary: '--ant-color-border',
  borderSecondary: '--ant-color-border-secondary',

  // 新增 token（Designer 需要，从最近似 antd token 映射）
  primaryHoverBg: '--ant-color-primary-bg-hover',
  textMuted: '--ant-color-text-quaternary',
  borderLight: '--ant-color-border-secondary',

  // ... 更多映射
}

/**
 * 值转换：处理 antd v6 中 borderRadius 等数值型 token 缺少单位的问题
 */
function transformValue(feKey: string, _srcCssVar: string, rawValue: string): string {
  if (!rawValue) return rawValue

  // 需要 px 单位的 token
  const pxKeys = new Set([
    'borderRadiusXs', 'borderRadiusSm', 'borderRadiusMd', 'borderRadiusLg', 'borderRadiusXl',
    'spacingXs', 'spacingSm', 'spacingMd', 'spacingLg', 'spacingXl', 'spacing2xl', 'spacing3xl',
    'fontSizeXs', 'fontSizeSm', 'fontSizeMd', 'fontSizeLg', 'fontSizeXl', 'fontSize2xl', 'fontSize3xl',
  ])

  if (pxKeys.has(feKey) && !isNaN(Number(rawValue)) && !rawValue.includes('px')) {
    return `${rawValue}px`
  }

  return rawValue
}

export const AntdBridgeProvider: React.FC<BridgeProviderProps> = ({ children, theme: themeOverrides }) => {
  useLayoutEffect(() => {
    // SSR / 无 document 守卫：避免服务端渲染或单元测试中崩溃
    if (typeof document === 'undefined') return

    const rootStyle = getComputedStyle(document.documentElement)
    const mapped: Record<string, string> = {}

    for (const [feKey, cssVarName] of Object.entries(TOKEN_MAP)) {
      const rawValue = rootStyle.getPropertyValue(cssVarName).trim()
      if (rawValue) {
        mapped[feKey] = transformValue(feKey, cssVarName, rawValue)
      }
    }

    // 用户最终覆盖（等价于把 StyleProvider 嵌套在外层）
    if (themeOverrides) {
      Object.assign(mapped, themeOverrides)
    }

    // 用独立 <style> 标签注入（带 data-fe-bridge 标识），与 StyleProvider 的
    // 注入隔离，卸载时只移除自身标签，不影响其他 provider 写入的 --fe-*
    const styleEl = createStyleTag(mapped, 'fe')
    styleEl.setAttribute('data-fe-bridge', 'antd')

    // 警告：未挂载在 antd ConfigProvider 内时，--ant-* 全空
    if (Object.keys(mapped).length === 0) {
      console.warn(
        '[form-engine] AntdBridgeProvider 检测到无可映射的 --ant-* CSS 变量，' +
        '请确认外层存在 antd 的 <ConfigProvider>。'
      )
    }

    // 清理：移除 bridge 自身的 <style> 标签，不影响 StyleProvider
    return () => {
      const tag = document.querySelector('style[data-fe-theme="true"][data-fe-bridge="antd"]')
      if (tag) tag.remove()
    }
  }, [themeOverrides])

  return <>{children}</>
}
```

> **隔离策略**：原先直接 `document.documentElement.style.setProperty` 会污染 inline style，与 `StyleProvider` 写入的同名变量互相覆盖且无法区分归属。改为 `createStyleTag` 写入独立 `<style>` 标签，cleanup 时精准移除自己；多 BridgeProvider 嵌套也能共存。
>
> **替代方案**：也可使用 antd v6 的 `getDesignToken()` 静态方法直接获取 token 值（`import { theme } from 'antd'; theme.getDesignToken()`），不依赖 DOM 读取，但**不会自动响应** `ConfigProvider` 的动态主题切换。推荐默认使用 CSS 变量读取方式，保留主题切换的响应性（仅限采用 `var(--fe-xxx)` 的消费侧）。

**文件**：`packages/adapter-antd/src/themeBridge.ts`（新增）

### 第五步：实现 antd-mobile ThemeBridge

antd-mobile 使用 CSS 变量（`--adm-*`），与 antd v6 实现方式类似。需要注意：antd-mobile 的 CSS 变量在组件挂载后才写入 DOM，需要用 `useLayoutEffect`（而非同步读取 `getComputedStyle`）：

```typescript
// packages/adapter-antd-mobile/src/themeBridge.ts
import React, { useLayoutEffect } from 'react'
import { createStyleTag } from '@form-engine/core/styles'
import type { BridgeProviderProps } from '@form-engine/core'

const CSS_VAR_MAP: Record<string, string> = {
  primary: '--adm-color-primary',
  primaryHover: '--adm-color-primary',
  success: '--adm-color-success',
  warning: '--adm-color-warning',
  error: '--adm-color-danger',
  textPrimary: '--adm-color-text',
  textSecondary: '--adm-color-weak',
  textMuted: '--adm-color-light',
  bgPrimary: '--adm-color-background',
  borderPrimary: '--adm-color-border',
  // ... 更多映射（antd-mobile token 有限，部分用最近似值）
}

export const AntdMobileBridgeProvider: React.FC<BridgeProviderProps> = ({ children, theme: themeOverrides }) => {
  useLayoutEffect(() => {
    if (typeof document === 'undefined') return

    // antd-mobile 的 CSS 变量可能未初始化，useLayoutEffect 确保在 DOM 就绪后读取
    const rootStyle = getComputedStyle(document.documentElement)
    const mapped: Record<string, string> = {}

    for (const [feKey, cssVarName] of Object.entries(CSS_VAR_MAP)) {
      const value = rootStyle.getPropertyValue(cssVarName).trim()
      if (value) {
        mapped[feKey] = value
      }
    }

    if (themeOverrides) {
      Object.assign(mapped, themeOverrides)
    }

    // 独立 <style> 标签注入，避免与 StyleProvider 互相覆盖
    const styleEl = createStyleTag(mapped, 'fe')
    styleEl.setAttribute('data-fe-bridge', 'antd-mobile')

    return () => {
      const tag = document.querySelector('style[data-fe-theme="true"][data-fe-bridge="antd-mobile"]')
      if (tag) tag.remove()
    }
  }, [themeOverrides])

  return <>{children}</>
}
```

> **antd-mobile token 限制**：antd-mobile 开放的 CSS 变量比 antd 少，部分 FE token（如 `primaryBg`、`borderRadiusSm` 等）可能没有直接对应。对于这些缺失 token，`defaultTheme` 的值会作为回退。
>
> **暗黑模式响应**：antd-mobile 通过 `data-prefers-color-scheme` 属性切换 CSS 变量值，需要响应时：
>
> 1. 简单做法：在外层包一个可观察 `data-prefers-color-scheme` 变化的容器，主题切换时 `key` 重挂 BridgeProvider。
> 2. 完整做法：BridgeProvider 内部用 `MutationObserver` 监听 `documentElement` 的 `data-*` 属性变化，触发重读。**本期不实现**，留作后续增强。

**文件**：`packages/adapter-antd-mobile/src/themeBridge.ts`（新增）

### 第六步：用户使用方式

BridgeProvider 只负责注入 CSS 变量（`--fe-*`），不包裹 StyleProvider。用户可灵活组合：

```tsx
// ============ 方式1：只使用 BridgeProvider（推荐，最简单）============
// antd 项目 — BridgeProvider 自动读取 --ant-* 并注入 --fe-*
import { AntdBridgeProvider } from '@form-engine/adapter-antd'
import { ConfigProvider } from 'antd'

function App() {
  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#722ed1' } }}>
      <AntdBridgeProvider>
        <FormRender schema={schema} />
      </AntdBridgeProvider>
    </ConfigProvider>
  )
}

// ============ 方式2：BridgeProvider + StyleProvider 组合 ============
// 注意：StyleProvider 必须是外层（父），其 effect 在 BridgeProvider 之后执行，
// 才会覆盖 BridgeProvider 注入的同名变量。
import { AntdBridgeProvider } from '@form-engine/adapter-antd'
import { StyleProvider } from '@form-engine/core'

function App() {
  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#722ed1' } }}>
      <StyleProvider theme={{ borderRadiusSm: '8px' }}>
        <AntdBridgeProvider>
          <FormRender schema={schema} />
        </AntdBridgeProvider>
      </StyleProvider>
    </ConfigProvider>
  )
}

// 也可直接在 BridgeProvider 上通过 theme 覆盖（无需外层 StyleProvider）
function App() {
  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#722ed1' } }}>
      <AntdBridgeProvider theme={{ borderRadiusSm: '8px' }}>
        <FormRender schema={schema} />
      </AntdBridgeProvider>
    </ConfigProvider>
  )
}

// ============ 方式3：不使用 BridgeProvider（自定义主题 / 非 antd 项目）============
import { StyleProvider } from '@form-engine/core'

function App() {
  return (
    <StyleProvider theme={{ primary: '#722ed1', borderRadiusSm: '8px' }}>
      <FormRender schema={schema} />
    </StyleProvider>
  )
}
```

> **组合使用时的 CSS 变量优先级**：React 的 effect 执行顺序是「子先父后，cleanup 反之」。`StyleProvider` 与 `BridgeProvider` 都通过 `injectCssVariables` 写 `document.documentElement.style.setProperty('--fe-xxx', ...)`。要让 `StyleProvider.theme` 覆盖 `BridgeProvider` 的映射，**必须把 `StyleProvider` 放在外层（父）**，这样其 effect 在 `BridgeProvider` 之后执行，最终优先级为：`StyleProvider.theme` > `BridgeProvider` 映射 > `defaultTheme`。如果反过来嵌套（`BridgeProvider` 外层），则 `BridgeProvider` 会覆盖 `StyleProvider` 的同名变量。也可以直接通过 `BridgeProvider` 的 `overrides` 属性做最终覆盖（与 `StyleProvider` 等效，但路径更短）。

> **动态主题切换时的取舍**：当 `ConfigProvider` 主题运行时变化时，DOM 上的 `--ant-*` 会更新，但 `getComputedStyle` 不会触发 React 重渲。本方案采用「mounted 时读取一次」的简化策略，不监听 DOM 变化。如果业务上需要 antd 主题在运行时动态切换且立即反映到 Form Engine，**必须改用 CSS 变量引用（`var(--fe-xxx)`）消费 token**，避免 `useStyle().token()` 因 `useMemo` 缓存样式对象导致不刷新。换言之：
>
> - 需要动态主题切换的组件 → 优先用 `var(--fe-xxx)`（跟随 DOM 自动更新）
> - 仅静态场景的组件 → 可用 `useStyle().token()` 拿具体值，但要避免在 `useMemo` 依赖里固化样式对象

**边界说明**：`BridgeProvider` 管理的 `--fe-*` CSS 变量影响范围是：

- Designer 自身的 UI（FieldList、Canvas、PropertyPanel 等）
- Form Engine core 中不使用 adapter 的原生组件
- **不影响** adapter 组件（如 antd Input/Select），它们由 antd 的 `ConfigProvider` 主题独立控制

### 第七步：测试计划（对应 AGENTS.md 结果核验）

按「先写非法用例，编码至通过」的策略，本重构涉及大范围样式替换，必须配套以下测试：

#### 7.1 单元测试（vitest + @testing-library/react）

| 用例                                                                               | 覆盖点                                                                                |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `AntdBridgeProvider` 注入 `--fe-*` 数量                                            | 验证挂载后 `<style data-fe-bridge="antd">` 含至少 N 个 token（按当前 TOKEN_MAP 数量） |
| `AntdBridgeProvider` 卸载清理                                                      | 验证 unmount 后该 `<style>` 标签被移除，StyleProvider 写入的变量未受影响              |
| `AntdBridgeProvider` 在无 `ConfigProvider` 环境下                                  | 验证 `console.warn` 触发，DOM 不残留任何 `--fe-*`                                     |
| `AntdBridgeProvider` SSR（`typeof document === 'undefined'`）                      | 验证不抛错、不执行注入                                                                |
| `useStyle().token('primary')` 返回值在 `StyleProvider themeMode="dark"` 切换时更新 | 验证重渲后的 token 是 darkTheme 值                                                    |
| `createDesignerStyles(t).toolbar.background` 在切到 dark 时变化                    | 工厂函数跟随主题                                                                      |
| `toKebabCase` 三处引用一致性                                                       | 跨 StyleProvider/injectCss/applyStyles 行为一致                                       |
| `renderer/defaultAdapter.ts` 兜底渲染颜色                                          | 替换后 `style.color` 等于 `token('error')` 值                                         |

#### 7.2 快照测试

| 组件                         | 快照内容                                                     |
| ---------------------------- | ------------------------------------------------------------ |
| `designer/Designer.tsx`      | light/dark/compact 三种模式下的根容器 + 关键子组件 HTML 结构 |
| `widgets/Button.tsx`         | `type=primary` / `danger` / `disabled` 三态                  |
| `renderer/FieldRenderer.tsx` | 必填星号颜色、tooltip 颜色、未知类型错误提示                 |
| `tokens.css`                 | 文件内容快照（防止 token 命名/值意外改动）                   |

#### 7.3 手工验证（开发自检清单）

- [ ] 在 `apps/dev` 中分别用 antd ConfigProvider 设 `colorPrimary: '#722ed1'`、暗色模式、紧凑模式三态切换，验证 Designer 主色、按钮、错误提示实时跟随
- [ ] `BridgeProvider` 与 `StyleProvider` 不同嵌套顺序（外/内）下，确认 `StyleProvider.theme` 始终是最终生效值
- [ ] 不挂 `BridgeProvider` 时，Designer 显示与重构前一致（行为兼容）
- [ ] `defaultAdapter.ts` 在「未知字段类型」路径下视觉与原版一致

### darkTheme 完整性说明

`packages/core/src/styles/defaultTheme.ts` 的 `darkTheme: Partial<ThemeTokens>` 当前仅覆盖 ~20 个字段（约 70 个 token 中的 1/3）。**`spacingXs/Sm/Md/Lg/Xl`、`borderRadius*`、`shadow*`、`fontSize*`、`transition*`、所有 `Component` 字段（btn/input 系列）均未定义**。

后果：

- 暗黑模式下，未覆盖的 token 保留 light 默认值 → 视觉偏差（间距、圆角不变化，但颜色/文字对比度变化）
- 桥接到 antd v6 `darkAlgorithm` 时表现稍好（antd 自己覆盖了对应 token），但 `compactOverrides` 与 antd 紧凑模式不直接对应
- 桥接到 antd-mobile 时差距更大，因 `--adm-*` 暗黑色板也不覆盖几何 token

**实施时必须补全** `darkTheme` 和 `compactOverrides`（按 antd v6 dark/compact 算法实际值），否则迁移后夜间模式视觉割裂。建议在第二步之前先补全，或与第一步合并提交。

## 文件变更清单

> ✅ = 已完成 · ⬜ = 待实施

| 文件                                                  | 变更类型 | 状态 | 说明                                                                                                    |
| ----------------------------------------------------- | -------- | ---- | ------------------------------------------------------------------------------------------------------- |
| `packages/core/package.json`                          | 修改     | ✅   | `peerDependencies.react` 由 `>=18.0.0` 改为 `>=19.0.0`（与 antd v6/antd-mobile v5 对齐）                |
| `packages/core/src/styles/defaultTheme.ts`            | 修改     | ✅   | 补充 Designer 所需 token（primaryHoverBg, textMuted, borderLight），**补全 darkTheme/compactOverrides** |
| `packages/core/src/styles/tokens.css`                 | 修改     | ✅   | 同步新增 token 的 CSS 变量定义                                                                          |
| `packages/core/src/styles/themeBridge.ts`             | 新增     | ✅   | ThemeBridge 配置类型和 BridgeProviderProps 接口定义                                                     |
| `packages/core/src/styles/utils.ts`                   | 新增     | ✅   | 提取 `toKebabCase` 公共工具函数                                                                         |
| `packages/core/src/styles/applyStyles.ts`             | 修改     | ✅   | 改为 `import { toKebabCase } from './utils'`                                                            |
| `packages/core/src/styles/injectCss.ts`               | 修改     | ✅   | `createStyleTag` 接受 `Record<string, string>`；toKebabCase import                                      |
| `packages/core/src/styles/StyleProvider.tsx`          | 修改     | ✅   | toKebabCase import                                                                                      |
| `packages/core/src/styles/index.ts`                   | 修改     | ✅   | 导出 ThemeBridge 相关类型                                                                               |
| `packages/core/src/index.ts`                          | 修改     | ✅   | 从主入口导出 Bridge 类型                                                                                |
| `packages/core/src/designer/styles.ts`                | 重构     | ✅   | 清理旧常量，仅保留工厂函数                                                                              |
| `packages/adapter-antd/src/themeBridge.tsx`           | 新增     | ✅   | antd v6 CSS 变量 → FE token 映射 + AntdBridgeProvider                                                   |
| `packages/adapter-antd/src/index.tsx`                 | 修改     | ✅   | 导出 AntdBridgeProvider；version `5.0.0` → `6.x`                                                        |
| `packages/adapter-antd-mobile/src/themeBridge.tsx`    | 新增     | ✅   | antd-mobile CSS 变量 → FE token 映射 + AntdMobileBridgeProvider                                         |
| `packages/adapter-antd-mobile/src/index.tsx`          | 修改     | ✅   | 导出 AntdMobileBridgeProvider                                                                           |
| `packages/core/src/widgets/Button.tsx`                | 修改     | ✅   | 用 useStyle().token() 替换硬编码颜色                                                                    |
| `packages/core/src/widgets/ButtonGroup.tsx`           | 修改     | ✅   | 用 useStyle().token() 替换硬编码颜色（含 onMouseEnter/Leave 中的 DOM 操作）                             |
| `packages/core/src/widgets/Switch.tsx`                | 修改     | ✅   | 用 useStyle().token() 替换硬编码颜色                                                                    |
| `packages/core/src/widgets/OptionsEditor.tsx`         | 修改     | ✅   | 用 useStyle().token() + var(--fe-\*) 替换硬编码颜色                                                     |
| `packages/core/src/widgets/shared.ts`                 | 修改     | ✅   | BASE_STYLE/FOCUS_STYLE 使用 CSS 变量                                                                    |
| `packages/core/src/renderer/FieldRenderer.tsx`        | 修改     | ✅   | 用 useStyle().token() 替换硬编码颜色（必填星号、tooltip、错误提示）                                     |
| `packages/core/src/renderer/defaultAdapter.ts`        | 修改     | ✅   | var(--fe-\*) 替换 `#ff4d4f` 边框/文字                                                                   |
| `packages/core/src/propRenders/shared.tsx`            | 修改     | ✅   | var(--fe-\*) 替换硬编码颜色和尺寸                                                                       |
| `packages/core/src/propRenders/CustomPropsRender.tsx` | 修改     | ✅   | var(--fe-\*) 替换硬编码颜色                                                                             |
| `packages/core/src/designer/Designer.tsx`             | 修改     | ✅   | var(--fe-\*) 替换 bg-secondary / drag overlay                                                           |
| `packages/core/src/designer/Canvas.tsx`               | 修改     | ✅   | var(--fe-\*) 替换硬编码颜色和尺寸                                                                       |
| `packages/core/src/designer/CanvasToolbar.tsx`        | 修改     | ✅   | var(--fe-\*) 替换硬编码颜色和尺寸                                                                       |
| `packages/core/src/designer/FieldList.tsx`            | 修改     | ✅   | var(--fe-\*) 替换硬编码颜色和尺寸                                                                       |
| `packages/core/src/designer/PropertyPanel.tsx`        | 修改     | ✅   | var(--fe-\*) 替换硬编码颜色和尺寸                                                                       |
| `packages/core/src/designer/FormConfigPanel.tsx`      | 修改     | ✅   | var(--fe-\*) 替换硬编码颜色和尺寸                                                                       |
| `packages/core/src/designer/ComponentTree.tsx`        | 修改     | ✅   | var(--fe-\*) 替换硬编码颜色和尺寸                                                                       |
| `packages/core/src/designer/ContainerPreview.tsx`     | 修改     | ✅   | var(--fe-\*) 替换硬编码颜色                                                                             |
| `packages/core/src/designer/CollapsibleSection.tsx`   | 修改     | ✅   | var(--fe-\*) 替换硬编码颜色                                                                             |
| `packages/core/src/designer/FieldItem.tsx`            | 修改     | ✅   | var(--fe-\*) 替换硬编码颜色（不再导入旧常量）                                                           |
| `packages/core/src/styles/__tests__/*`                | 新增     | ⬜   | BridgeProvider / StyleProvider 测试用例（留给后续）                                                     |

## 风险与注意事项

### 运行时风险

1. **antd v6 `zeroRuntime` 模式下 CSS 变量不完整**
   - `zeroRuntime: true` 时用户需手动引入 `antd/dist/antd.css`，CSS 变量集合取决于引入的 CSS 文件内容
   - BridgeProvider 读取不到变量时，对应的 `--fe-*` 会回退到 `defaultTheme` 值
   - 建议文档中明确说明：使用 BridgeProvider 时不建议开启 `zeroRuntime`

2. **antd 数值型 token 缺少单位**
   - antd v6 的 CSS 变量中 `borderRadius`、`fontSize` 等值是裸数字（如 `6` 而非 `6px`）
   - BridgeProvider 实现中需要 `transformValue` 做单位补充，映射表需维护「需要 px 单位的 key 集合」
   - 需验证 antd v6 中 `spacing` 相关 token 的 CSS 变量值和单位情况，确保映射正确

3. **主题动态切换的响应性（已与第六步交叉）**
   - 本期方案采用「mounted 时读取一次」简化策略，**不支持运行时动态切换 ConfigProvider 的 `token` 或 `algorithm`**
   - 消费侧必须用 `var(--fe-xxx)` 引用才能跟随 DOM 变化自动更新；用 `useStyle().token()` 拿到的是 mount 时的快照值，需要在 `themeOverrides` 变化时主动重渲
   - **后续增强方向**：BridgeProvider 内部用 `MutationObserver` + `requestAnimationFrame` 轮询，或改造为受 antd `theme.useToken()` 驱动（响应 ConfigProvider 变化）。**本期不实现**

4. **暗黑模式支持**
   - antd：通过 `ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}` 切换，`--ant-*` 变量值会跟随变化，BridgeProvider 需重新读取
   - antd-mobile：通过 `data-prefers-color-scheme` 属性切换，CSS 变量值随之变化，需用 `MutationObserver` 监听属性变化
   - `StyleProvider` 已有的 `themeMode` 参数在 BridgeProvider 中未对接——暗黑模式完全依赖 UI 库自身的机制，FE 侧自动跟随
   - 需更新 `darkTheme` 覆盖值以匹配 antd v6 暗黑模式的实际 token 值

5. **antd-mobile CSS 变量初始化时序**
   - antd-mobile 的 CSS 变量可能在 `BridgeProvider` 挂载时尚未注入到 DOM
   - 当前使用 `useLayoutEffect` 延迟读取，但如果有异步加载场景仍可能失败
   - 极端情况下需添加重试逻辑或监听 DOM 变化

### 兼容性风险

6. **Designer 主色变化**
   - `designer/styles.ts` 中 `primary = '#1890ff'`（antd v4 默认），`defaultTheme.primary = '#1677ff'`（antd v5/v6 默认）
   - 统一后 Designer 主色从 `#1890ff` 变为 `#1677ff`，对未使用 BridgeProvider 的用户是一个视觉变化
   - 需在 changelog 中标注

7. **向后兼容**
   - 不使用 BridgeProvider 时，行为与现在完全一致（使用 defaultTheme）
   - BridgeProvider 不包裹 StyleProvider，不影响现有 `StyleProvider` 用户

8. **MUI adapter 暂不实现**
   - 当前项目无 MUI adapter，本期**不实现** MUI 桥接
   - MUI v6 开启 `cssVariables` 后也是 CSS 变量，未来实现时参照 antd-mobile 模式即可
   - ThemeBridge 接口中已为 MUI 预留位置（`source` 字段），但本期不会增加 `@form-engine/adapter-mui` 包

### 实现细节风险

9. **`toKebabCase` 重复定义**
   - 实际有 **3 处**重复：`StyleProvider.tsx:223`、`injectCss.ts:14`、`applyStyles.ts:201`
   - 实施时统一提取到 `packages/core/src/styles/utils.ts` 公共函数，三处改为 `import { toKebabCase } from './utils'`

10. **复合样式值无法用单个 token 表示**
    - `designer/styles.ts` 中 `borders.selected = '1px solid ${colors.primary}'`、`borders.container = '1px dashed ${colors.border}'` 等
    - 需改为工厂函数从多个 token 拼装，或在 Designer 代码中内联

11. **adapter 版本依赖**
    - antd adapter 需将 `peerDependency` 从 `antd@5` 更新为 `antd@6`（**当前 `antdAdapter.version` 写死为 `'5.0.0'`**，[adapter-antd/src/index.tsx:166](file:///d:/Repos/form_engine/packages/adapter-antd/src/index.tsx#L166)，需同步改为 `'6.x'`）
    - `core/package.json` 的 `peerDependencies.react` 当前为 `>=18.0.0`，需提升到 **`>=19.0.0`** 以匹配 antd v6 与 antd-mobile v5 的要求（两 adapter 已要求 19，否则会出现「类型 React 19、运行 React 18」的不一致）
    - `@ant-design/icons` 需升级到 v6（antd v6 要求）

12. **applyStyles.ts 工具已存在，避免重复造轮子**
    - [packages/core/src/styles/applyStyles.ts](file:///d:/Repos/form_engine/packages/core/src/styles/applyStyles.ts) 已经有 `applyThemeStyles(theme, mapping, 'css-var')`、`createButtonStyle(theme, options)`、`createInputStyle(theme, options)` 三个工具
    - 「工厂函数 + `useStyle().token()`」方案中的工厂函数（第 1 层）与 `createButtonStyle`/`createInputStyle` 重叠
    - 「`var(--fe-xxx)`」消费（第 3 层）与 `applyThemeStyles(mode='css-var')` 等价
    - 实施前需要明确：工厂函数是组件内联创建 vs 工具函数化的边界，避免重复抽象或破坏现有 API
    - **`createButtonStyle/createInputStyle` 的现有调用方**：第一步先 grep 确认调用范围，再决定是否重构或仅作新增

13. **token 语义错配（无类型系统防范）**
    - `useStyle().token('btnHeightMd')` 返回 `'32px'`，若误用到 `style={{ width: token('btnHeightMd') }}` 上，TypeScript 不会报错
    - 迁移规范应在 PR 描述里点明「token 语义对应」，必要时把 token 名按 CSS 属性分类整理一份速查表
    - 长期建议：未来把 token 按 group 拆成命名空间类型（如 `SpacingToken`、`ColorToken`），让类型系统拦截误用

14. **darkTheme / compactOverrides 覆盖不全**
    - 当前 darkTheme 是 `Partial<ThemeTokens>`，**仅覆盖 ~20 个字段**（约 70 个 token 的 1/3），`spacing*`、`borderRadius*`、`shadow*`、`fontSize*`、`transition*`、`Component` 系列均未覆盖
    - 暗黑 / 紧凑模式下，未覆盖的 token 保留 light 默认值，视觉与新 antd v6 dark/compact 行为有偏差
    - 实施时必须**先补全** darkTheme 与 compactOverrides（或在第一步之前合入），否则会引入回归

15. **BridgeProvider 嵌套与多 ConfigProvider 行为**
    - 多个 antd `ConfigProvider` 嵌套时，`getComputedStyle` 读到的是最近（内层）ConfigProvider 写入的 `--ant-*`。本方案未做特殊处理，**桥接到最近一层 ConfigProvider**（与 antd 自身的 `theme.useToken()` 行为一致）
    - 同一页面挂多个 `AntdBridgeProvider` 时，每个 provider 会**各自**插入一个 `<style data-fe-bridge="antd">` 标签（data 属性未加 unique id），后挂载的会覆盖前者，且 unmount 时只会移除自身。**生产环境不推荐**这种用法，建议整页只挂一个 BridgeProvider

16. **antd v6 `getDesignToken()` 静态方法的可用性**
    - 文档中「替代方案」提到 `import { theme } from 'antd'; theme.getDesignToken()`。需在实施前验证：antd v6 是否真提供此静态方法（v5 提供 `theme.getDesignToken()` 但依赖当前 ConfigProvider），以及是否在非 React 上下文可用
    - 若仅 `theme.useToken()` 可用，则替代方案降级为「通过 `useToken()` 拿到 token 列表」，需要在 BridgeProvider 内部用 `useToken()`，从而强制要求是 React 组件 + 必须在 antd ConfigProvider 内

## 防回归：4 层防护

本重构涉及 ~250 处硬编码替换，迁移完成后必须配套防护机制，否则在后续 AI / 人类开发者修改代码时极易回退。本仓库已建立 4 层防护：

### 防护 1：AGENTS.md 强约束（AI 必读）

[AGENTS.md](../AGENTS.md) 新增「主题 Token 强制约定」小节，**对所有 AI 助手可见**。明确：

- 检查范围：`designer/`、`widgets/`、`renderer/`、`propRenders/` 四个目录的 `.ts/.tsx`
- 禁止写法：十六进制颜色、`rgb()/rgba()`、CSS 命名颜色、裸数字 spacing/radius
- 正确写法：3 层消费策略（工厂函数 / `token()` / `var(--fe-*)`）
- 4 类例外（`Props.tsx` placeholder、`tokens.css` 等定义文件、测试、业务反馈色）

> 效果：AI 在生成新代码时直接看到约束，被「软性」约束用 token 写法。

### 防护 2：ESLint 自定义规则（编辑期硬拦截）

[`eslint.config.mjs`](../eslint.config.mjs) 新增自定义规则 `form-engine/ban-hardcoded-style`，**仅作用于** 4 个目标目录的 `.ts/.tsx`：

- 拦截 `style={{ ... }}` JSX 属性内的硬编码
- 拦截 `const style = { ... }` 顶层对象内的硬编码
- 拦截 `export const style: CSSProperties = { ... }`
- 分类：
  - `color/background/border-color/fill/stroke/...` → 字符串字面量必须是 hex/rgb/named color
  - `padding/margin/borderRadius/gap/fontSize/...` → 数字字面量
- 错误示例：

  ```
  12:19  error  Hardcoded numeric layout value for "borderRadius". Use token() or var(--fe-*)  form-engine/ban-hardcoded-style
  14:15  error  Hardcoded numeric layout value for "fontSize". Use token() or var(--fe-*)      form-engine/ban-hardcoded-style
  18:17  error  Hardcoded hex color "#fff". Use token() or var(--fe-*)                          form-engine/ban-hardcoded-style
  ```

> 效果：编辑器红波浪线 + 保存即报错，CI/手动 `pnpm lint` 也跑这条规则。**这是最强的硬拦截**。

### 防护 3：`check-tokens.mjs` 扫描脚本（CI 兜底）

[`scripts/check-tokens.mjs`](../scripts/check-tokens.mjs) 是 ESLint 的补充，覆盖 ESLint 不便表达的场景：

- 文件级禁用：文件顶部 `/* check-tokens-disable */`
- 跳过 `placeholder="如: #333"` 形式的字符串
- 跳过 `__tests__/` 目录
- 退出码：`0` 通过 / `1` 违规 / `2` 内部错误

集成位置：

| 触发点              | 命令                                   |
| ------------------- | -------------------------------------- |
| `pnpm build`        | 自动 `pnpm check:tokens && pnpm build` |
| `pnpm test`         | 自动 `pnpm check:tokens && pnpm test`  |
| `pnpm check:tokens` | 单独跑                                 |
| pre-commit hook     | 通过 lint-staged 在改动的文件上跑      |

> 效果：build/test 必跑，CI 上接 `pnpm test` 即自动拦截。

### 防护 4：simple-git-hooks + lint-staged（提交前拦截）

- [`.simple-git-hooks.json`](../.simple-git-hooks.json)：`pre-commit` 触发 `pnpm exec lint-staged`
- [`.lintstagedrc.json`](../.lintstagedrc.json)：对 `*.{ts,tsx}` 跑 `eslint --fix` + `node scripts/check-tokens.mjs`
- `package.json` 的 `prepare` 脚本：`simple-git-hooks || true`（install 后自动注册 hook）

> 效果：开发者 `git commit` 时自动跑两层检查，**未通过不允许提交**。

### 4 层关系

```
┌────────────────────────────────────────────────────────────┐
│ AI 生成代码 (AGENTS.md 软约束)                              │
└────────────────────┬───────────────────────────────────────┘
                     ▼
┌────────────────────────────────────────────────────────────┐
│ 编辑器 / 保存 (ESLint 实时拦截)                              │  ← 最快反馈
└────────────────────┬───────────────────────────────────────┘
                     ▼
┌────────────────────────────────────────────────────────────┐
│ git commit (lint-staged: eslint + check-tokens)            │  ← 提交前
└────────────────────┬───────────────────────────────────────┘
                     ▼
┌────────────────────────────────────────────────────────────┐
│ pnpm build / pnpm test (check-tokens 兜底)                  │  ← CI / 合并前
└────────────────────────────────────────────────────────────┘
```

### 维护要点

1. **新加组件目录** 时（如 `packages/core/src/newdir/`），需在 3 处同步：
   - `eslint.config.mjs` 的 `files` glob
   - `scripts/check-tokens.mjs` 的 `TARGET_DIRS`
   - AGENTS.md「主题 Token 强制约定」的目录列表
2. **调整规则粒度**（如需放行 `box-shadow` 字符串）：改 `eslint.config.mjs` 中的 `COLOR_PROPS` / `LAYOUT_PROPS`，同步改 `scripts/check-tokens.mjs` 的 `NAMED_COLOR_PATTERN` / `NUMERIC_PATTERN`
