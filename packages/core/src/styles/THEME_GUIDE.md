# Form Engine - 主题样式系统使用指南

## 概述

Form Engine 提供了一套完整的设计变量（Design Tokens）系统，基于 CSS 变量（CSS Custom Properties）实现，支持：

1. **运行时动态主题切换**
2. **用户自定义覆盖**
3. **暗黑模式 / 紧凑模式**
4. **在 inline styles 中使用主题 Token**

---

## 快速开始

### 方式1：使用 StyleProvider（推荐）

```tsx
import { StyleProvider, FormRender } from '@form-engine/core'

function App() {
  return (
    <StyleProvider 
      theme={{ primary: '#722ed1' }}  // 自定义主色
      themeMode="light"                  // 或 "dark"
      sizeMode="default"                 // 或 "compact"
    >
      <FormRender schema={schema} />
    </StyleProvider>
  )
}
```

### 方式2：在 CSS 中覆盖变量（最简单）

在您项目的 CSS 文件中重新定义 `--fe-*` 变量：

```css
/* 全局覆盖 */
:root {
  --fe-primary: #722ed1;
  --fe-border-radius: 8px;
  --fe-font-size-md: 16px;
}

/* 暗黑模式 */
[data-fe-theme="dark"] {
  --fe-primary: #1d39c4;
  --fe-bg-primary: #141414;
}

/* 紧凑模式 */
[data-fe-size="compact"] {
  --fe-font-size-md: 13px;
  --fe-spacing-lg: 12px;
}
```

### 方式3：在组件中使用主题 Token

```tsx
import { useStyle } from '@form-engine/core/styles'

function MyButton() {
  const { token, cssVar, mergeStyle } = useStyle()
  
  // 方式1：直接使用 Token 值
  const style = {
    background: token('primary'),      // '#1677ff'
    padding: token('spacingMd'),       // '12px'
  }
  
  // 方式2：使用 CSS 变量引用（需要 CSS 变量已注入）
  const styleWithVars = {
    color: cssVar('primary'),         // 'var(--fe-primary)'
  }
  
  return <button style={style}>按钮</button>
}
```

---

## 设计 Token 列表

### 颜色系统

| Token 名称 | CSS 变量 | 默认值 | 说明 |
|-----------|---------|--------|------|
| `primary` | `--fe-primary` | `#1677ff` | 主色 |
| `primaryHover` | `--fe-primary-hover` | `#4096ff` | 主色 hover |
| `primaryActive` | `--fe-primary-active` | `#0958d9` | 主色 active |
| `success` | `--fe-success` | `#52c41a` | 成功色 |
| `warning` | `--fe-warning` | `#faad14` | 警告色 |
| `error` | `--fe-error` | `#ff4d4f` | 错误色 |
| `textPrimary` | `--fe-text-primary` | `rgba(0,0,0,0.88)` | 主文本色 |
| `textSecondary` | `--fe-text-secondary` | `rgba(0,0,0,0.65)` | 次文本色 |
| `bgPrimary` | `--fe-bg-primary` | `#ffffff` | 主背景色 |
| `bgSecondary` | `--fe-bg-secondary` | `#f5f5f5` | 次背景色 |
| `borderPrimary` | `--fe-border-primary` | `#d9d9d9` | 主边框色 |

### 间距系统

| Token 名称 | CSS 变量 | 默认值 |
|-----------|---------|--------|
| `spacingXs` | `--fe-spacing-xs` | `4px` |
| `spacingSm` | `--fe-spacing-sm` | `8px` |
| `spacingMd` | `--fe-spacing-md` | `12px` |
| `spacingLg` | `--fe-spacing-lg` | `16px` |
| `spacingXl` | `--fe-spacing-xl` | `24px` |

### 字体系统

| Token 名称 | CSS 变量 | 默认值 |
|-----------|---------|--------|
| `fontSizeXs` | `--fe-font-size-xs` | `12px` |
| `fontSizeSm` | `--fe-font-size-sm` | `13px` |
| `fontSizeMd` | `--fe-font-size-md` | `14px` |
| `fontSizeLg` | `--fe-font-size-lg` | `16px` |
| `fontWeightRegular` | `--fe-font-weight-regular` | `400` |
| `fontWeightMedium` | `--fe-font-weight-medium` | `500` |

### 边框系统

| Token 名称 | CSS 变量 | 默认值 |
|-----------|---------|--------|
| `borderRadiusXs` | `--fe-border-radius-xs` | `2px` |
| `borderRadiusSm` | `--fe-border-radius-sm` | `4px` |
| `borderRadiusMd` | `--fe-border-radius-md` | `6px` |
| `borderRadiusLg` | `--fe-border-radius-lg` | `8px` |

### 组件变量

| Token 名称 | CSS 变量 | 默认值 | 说明 |
|-----------|---------|--------|------|
| `inputPadding` | `--fe-input-padding` | `4px 8px` | 输入框内边距 |
| `inputBg` | `--fe-input-bg` | `#ffffff` | 输入框背景 |
| `inputBorder` | `--fe-input-border` | `1px solid #d9d9d9` | 输入框边框 |
| `inputBorderRadius` | `--fe-input-border-radius` | `4px` | 输入框圆角 |
| `btnPaddingMd` | `--fe-btn-padding-md` | `8px 16px` | 按钮内边距 |

> **完整 Token 列表请查看**：`packages/core/src/styles/tokens.css` 和 `packages/core/src/styles/defaultTheme.ts`

---

## API 参考

### StyleProvider Props

```typescript
interface StyleProviderProps {
  /** 主题覆盖 - 部分 Token 覆盖 */
  theme?: Partial<ThemeTokens>
  
  /** 主题模式 - light/dark */
  themeMode?: 'light' | 'dark'
  
  /** 尺寸模式 - default/compact */
  sizeMode?: 'default' | 'compact'
  
  /** CSS 前缀 */
  prefix?: string
  
  /** 是否自动注入 CSS 变量 */
  autoInject?: boolean
  
  /** 子组件 */
  children: React.ReactNode
}
```

### useStyle Hook

```typescript
function MyComponent() {
  const { 
    token,      // 获取 Token 值: token('primary') => '#1677ff'
    cssVar,     // 获取 CSS 变量引用: cssVar('primary') => 'var(--fe-primary)'
    mergeStyle, // 合并样式
    theme,      // 完整主题对象
    themeMode,  // 当前主题模式
    sizeMode,   // 当前尺寸模式
  } = useStyle()
}
```

### useTheme Hook

```typescript
function MyComponent() {
  const theme = useTheme()
  // theme.primary => '#1677ff'
  // theme.spacingMd => '12px'
}
```

### useToken Hook

```typescript
function MyComponent() {
  const primaryColor = useToken('primary')       // '#1677ff'
  const fontSize = useToken('fontSizeMd')         // '14px'
  const padding = useToken('spacingMd')           // '12px'
}
```

---

## 在自定义组件中适配主题

### 示例1：创建支持主题的按钮组件

```tsx
import { useStyle } from '@form-engine/core/styles'

interface MyButtonProps {
  type?: 'primary' | 'default'
  children: React.ReactNode
}

function MyButton({ type = 'default', children }: MyButtonProps) {
  const { token, mergeStyle } = useStyle()
  
  const baseStyle: React.CSSProperties = {
    padding: `${token('spacingSm')} ${token('spacingMd')}`,
    borderRadius: token('borderRadiusSm') as string,
    border: `1px solid ${token('borderPrimary')}`,
    cursor: 'pointer',
    transition: 'all 0.2s',
  }
  
  const typeStyle: React.CSSProperties = type === 'primary' 
    ? { background: token('primary'), color: '#fff' }
    : { background: '#fff', color: token('textPrimary') }
  
  return (
    <button style={{ ...baseStyle, ...typeStyle }}>
      {children}
    </button>
  )
}
```

### 示例2：使用 CSS 变量引用

```tsx
import { useStyle } from '@form-engine/core/styles'

function MyCard() {
  const { cssVar } = useStyle()
  
  // 使用 CSS 变量引用，让用户可以通过 CSS 覆盖
  const style: React.CSSProperties = {
    background: cssVar('bgPrimary'),       // var(--fe-bg-primary)
    border: `1px solid ${cssVar('borderPrimary')}`,
    borderRadius: cssVar('borderRadiusMd'),
    padding: cssVar('spacingLg'),
  }
  
  return <div style={style}>Card Content</div>
}
```

---

## 高级用法

### 1. 动态切换主题

```tsx
import { StyleProvider, useStyleContext } from '@form-engine/core/styles'

function ThemeSwitcher() {
  const { themeMode, sizeMode } = useStyleContext()
  
  return (
    <div>
      <button onClick={() => {
        document.documentElement.setAttribute('data-fe-theme', 
          themeMode === 'light' ? 'dark' : 'light'
        )
      }}>
        切换 {themeMode === 'light' ? '暗黑' : '亮色'} 模式
      </button>
    </div>
  )
}
```

### 2. 在 Shadow DOM 中使用

```tsx
import { injectIntoShadowDom } from '@form-engine/core/styles'

class MyWebComponent extends HTMLElement {
  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })
    
    // 注入 CSS 变量到 Shadow DOM
    injectIntoShadowDom(
      { primary: '#722ed1' },  // 主题覆盖
      shadow
    )
  }
}
```

### 3. SSR 兼容

```tsx
import { createStyleTag } from '@form-engine/core/styles'

// 在 SSR 中，通过 style 标签注入
createStyleTag(
  { primary: '#722ed1' },  // 主题
  'fe',                     // 前缀
  document.head             // 目标元素
)
```

---

## 迁移指南

### 从硬编码样式迁移到主题系统

**之前**（硬编码）：
```tsx
const style = {
  color: '#1677ff',
  padding: '8px 16px',
  borderRadius: '4px',
}
```

**之后**（使用主题 Token）：
```tsx
import { useStyle } from '@form-engine/core/styles'

function MyComponent() {
  const { token } = useStyle()
  
  const style = {
    color: token('primary'),
    padding: `${token('spacingSm')} ${token('spacingMd')}`,
    borderRadius: token('borderRadiusSm'),
  }
}
```

---

## 常见问题

### 1. 如何覆盖单个组件的样式？

**方式1**：通过 `style` prop
```tsx
<Button style={{ height: 40, borderRadius: 8 }}>按钮</Button>
```

**方式2**：通过 `className` prop
```tsx
<Button className="my-button">按钮</Button>

/* CSS */
.my-button {
  height: 40px;
  border-radius: 8px;
}
```

**方式3**：通过 CSS 变量覆盖
```css
.my-button-container {
  --fe-primary: #722ed1;
}
```

### 2. 如何在没有 StyleProvider 的情况下使用主题？

组件会自动使用默认主题。如果你想在组件内使用 `useStyle()`，它会自动返回默认主题值。

### 3. 如何自定义前缀？

```tsx
<StyleProvider prefix="my-app">
  <FormRender schema={schema} />
</StyleProvider>

/* CSS */
:root {
  --my-app-primary: #722ed1;
}
```

---

## 文件结构

```
packages/core/src/styles/
├── tokens.css          # CSS 变量定义（可手动引入）
├── defaultTheme.ts     # 默认主题 Token（JS 对象）
├── StyleProvider.tsx   # 主题 Provider 组件
├── useStyle.ts         # useStyle Hook
├── injectCss.ts        # CSS 变量注入工具
├── applyStyles.ts      # 样式应用工具函数
├── types.ts            # 类型定义
├── index.ts            # 模块入口
└── THEME_GUIDE.md     # 本文件
```

---

## 相关链接

- [Ant Design Design Tokens](https://ant.design/docs/react/customize-theme)
- [CSS Custom Properties (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [Design Tokens (W3C)](https://design-tokens.github.io/community-group/)
