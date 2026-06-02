# 主题 Token 强制约定

> **核心约束在 [`AGENTS.md`](../../AGENTS.md)，本文件给出完整规则、错误示范、Token 速查与例外说明。AI 编码时违反此约定将导致 PR 不会被合并。**

## 适用范围

本仓库所有视觉样式**必须**走主题 Token，禁止在以下目录的 `.ts/.tsx` 文件里写死颜色、间距、圆角等视觉常量：

- `packages/core/src/designer/`
- `packages/core/src/widgets/`
- `packages/core/src/renderer/`
- `packages/core/src/propRenders/`

## 禁止写法 ❌

```tsx
// ❌ 写死十六进制颜色
<div style={{ color: '#1677ff', background: '#fff' }} />
const style = { color: '#999' }

// ❌ 写死 RGB / RGBA
<div style={{ color: 'rgb(255, 77, 79)', background: 'rgba(0, 0, 0, 0.45)' }} />

// ❌ 写死 CSS 命名颜色
<div style={{ color: 'red' }} />

// ❌ 写死数字型 spacing / radius / size（应从 token 取）
<div style={{ padding: 8, borderRadius: 4, marginBottom: 16 }} />
```

## 正确写法 ✅

### 第 1 层：工厂函数 / 共享样式

```tsx
import { useStyle } from '@form-engine/core/styles'
const { theme } = useStyle()
const ds = useMemo(() => createDesignerStyles(theme), [theme])
```

### 第 2 层：复杂组件用 token() 取值

```tsx
const { token } = useStyle()
<div style={{ color: token('error'), borderRadius: token('borderRadiusSm') }} />
```

### 第 3 层：纯展示组件用 CSS 变量

```tsx
<div style={{ color: 'var(--fe-text-tertiary)' }} />
```

## 例外（允许写死）

1. `components/*/Props.tsx` 中作为用户输入提示的 placeholder 字符串（如 `placeholder="如: #333"`）—— 这些是**字符串字面量**给用户看的，**不是**实际样式
2. `packages/core/src/styles/defaultTheme.ts`、`tokens.css`、`applyStyles.ts` —— token 定义与工具函数本身就是来源
3. `designer/__tests__/`、组件快照测试 —— 测试固定值
4. 业务反馈色（如 DnD 拖入高亮的 `#f0f8ff` AliceBlue）—— 不属于主题体系，**保留硬编码并在注释里说明**

## 主动验证

- 改完代码后必须跑 `pnpm check:tokens`（已接入 `pnpm build` / `pnpm test`）
- ESLint 已在编辑期拦截，新写硬编码会保存即报错
- pre-commit hook 会再校验一次，未通过不允许 commit

## Token 速查

详见 `packages/core/src/styles/defaultTheme.ts`：

- **颜色**：`primary` / `error` / `textSecondary` / `bgPrimary` / `borderPrimary` 等
- **几何**：`borderRadiusSm/Md/Lg`、`spacingSm/Md/Lg`、`fontSizeSm/Md/Lg`、`shadowSm/Md`
- **组件**：`btnHeightMd`、`inputPadding`、`inputBorderRadius`

## 遇到不知道怎么 token 化怎么办

如复合值 `1px solid ${primary}` 等场景：

1. 查 `defaultTheme.ts` 看是否已有可复用 token
2. 查 `designer/styles.ts` 的工厂函数模式（重构成 `createDesignerStyles(t)`）
3. 都不行就在 `AGENTS.md` / 团队群里讨论，**不要直接写死**
