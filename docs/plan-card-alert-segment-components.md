# 新增 Card / Alert / Segment 三种组件

> 任务来源：用户在 `/plan` 命令中提出，期望一次性新增 3 个组件，每个组件覆盖一种分类。
> 决定性结论（用户已确认）：
> 1. 新 Segment 的中文名改为非「滑块」以避免与现有 `slider`（数值滑块）冲突，**统一采用 antd 官方译名「分段控制器」**。
> 2. 三个组件均同步实现 `adapter-antd` 与 `adapter-antd-mobile`。
> 3. Card 的 `icon` 属性以**字符串名**方式记录，由 adapter 在渲染时从 `icons/index.tsx` 的 `iconMap` 解析。

---

## 一、目标概览

| 组件 | 类型 | 分类 | 中文名 | 关键属性 | 备注 |
|------|------|------|--------|----------|------|
| Card | `card` | `container` | 卡片 | title / icon / bordered / size / bodyPadding | Body 区域可拖入任意子组件，容器行为 |
| Alert | `alert` | `display` | 警告提示 | type / title / content / showIcon / closable | 触发 `onClose` 事件 |
| Segment | `segment` | `display` | 分段控制器 | options / value / defaultValue / size / block / disabled | 触发 `onChange` 事件，作为「非表单」视觉选择器 |

> Segment 选 `display` 而非 `form`：用户在需求中明确「不作为表单组件」。这意味着 PropertyPanel 不渲染 `label/placeholder`，但 `onChange` 事件仍可通过事件系统暴露给用户配置动作/表达式。

---

## 二、当前状态分析

### 2.1 已有的"组件三件套"模式

每个内置组件在 `packages/core/src/components/<name>/` 都有三个文件：

- `types.ts` —— 导出 `XxxProps` 接口与 `xxxEventDeclarations` 数组
- `palette.tsx` —— 导出 `palette: ComponentPalette`（label/category/icon/defaultProps）
- `Props.tsx` —— 默认导出 `XxxPropsRender`，由 `propRenders/index.ts` 的 `PropsRenderMap` 索引

注册中心在 3 个地方需要分别登记：

1. `packages/core/src/components/paletteRegistry.ts` —— `componentPalettes` 字典
2. `packages/core/src/propRenders/index.ts` —— `PropsRenderMap`
3. `packages/core/src/components/index.ts` —— `EVENT_DECLARATION_MAP` + 类型 re-export

### 2.2 类型注册位置

- `packages/core/src/types/schema.ts` 的 `FieldType` 联合类型需要追加 `'card' | 'alert' | 'segment'`
- `packages/core/src/types/component-props.ts` 的 `ComponentPropsMap` 需要追加三项
- `packages/core/src/index.ts` 顶层 re-export 三种 Props 类型

### 2.3 调色板分组

`packages/core/src/designer/paletteData.ts` 的 `GROUP_MEMBERS`：

- Card → `布局` 组（与 grid/flex/container 同组）
- Alert → `展示` 组（与 text/title/divider 同组）
- Segment → `选择` 组（与 select/radio 同组，**视觉归类**而非表单归类）

### 2.4 容器预览（仅 Card 涉及）

`packages/core/src/designer/ContainerPreview.tsx` 的 `ContainerContent` 第 17 行的白名单：

```ts
if (!['grid', 'table', 'tabs', 'collapse'].includes(field.type)) {
```

Card 应归入"通用容器"分支（不带 regionKey 的扁平子节点列表），**不要**加入该白名单。保持现状即可。

### 2.5 antd / antd-mobile 适配

- `packages/adapter-antd/src/index.tsx` 的 `antdComponents` 字典 + `'card' | 'alert' | 'segment'` 渲染函数
- `packages/adapter-antd-mobile/src/index.tsx` 的 `antdMobileComponents` 字典 + 渲染函数
- 实际组件实现在 `packages/adapter-antd/src/components/` 与 `packages/adapter-antd-mobile/src/components/` 各一个独立 tsx 文件

### 2.6 文档约定（来自 AGENTS.md / .agents/rules）

- 主题 Token 强制约定：所有视觉常量必须走 token，禁止硬编码
- 临时输出写到 `./tmp/`，不在根目录散落 txt
- 多步任务需在 `docs/` 写 MD 记录

---

## 三、详细实施方案

### 3.1 新增图标（按需）

`packages/core/src/components/icons/index.tsx`：

- 复用现有 `Layout`（Card 头/卡面）作为 Card palette 图标
- 复用现有 `Bell` 路径（在现有文件里没有，新增）或选用 `Circle` / `Info`；**优先复用现有** `ToggleLeft`（Segment）和 `Info` 风格的图标
- 实际决定：Card → `Layout`（已有），Alert → 新增 `Bell` icon + 加入 iconMap，Segment → `ToggleLeft`（已有）

> 为简化，本方案**不新增** icon 路径，统一复用现有 `Layout` / `Circle` / `ToggleLeft`（如果风格不符，再新增 SVG 路径）。

> ⚠️ **注意**：`Layout` 已作为 React 组件 export，但**未注册到 `iconMap`**（位于同文件底部）。Card 的 `icon` 属性为字符串名，由 adapter 从 `iconMap` 解析，因此必须将 `Layout` 追加到 `iconMap` 记录中。

### 3.2 Card 组件

**`packages/core/src/components/card/types.ts`**

```ts
import type { BaseLayoutComponentProps } from '../../types/component-props'

export interface CardProps extends BaseLayoutComponentProps {
  title?: string
  /** icons/iconMap 中已注册的图标名（如 'Star' / 'Info'） */
  icon?: string
  bordered?: boolean
  size?: 'default' | 'small'
  /** Body 内边距（px） */
  bodyPadding?: number
  /** Body 间距（px），透传给内部 children 容器 */
  bodyGap?: number
}
```

**`packages/core/src/components/card/palette.tsx`**

```ts
import type { ComponentPalette } from '../../types/palette'
import { Layout } from '../icons'
export const palette: ComponentPalette = {
  label: '卡片',
  category: 'container',
  icon: <Layout />,
  defaultProps: { componentProps: { bodyPadding: 16, bodyGap: 8, bordered: true, size: 'default' } },
}
```

**`packages/core/src/components/card/Props.tsx`**

字段：
- 标题 → `<w.Input>`
- 图标 → `<w.Select>`，options 从 `iconMap` 解析（key 为图标名）；空选项表示不显示
- 边框 → `<w.Switch>`
- 尺寸 → `<w.ButtonGroup>`（默认 / 小）
- Body 内边距 → `<w.NumberInput>` 0-200
- Body 间距 → `<w.NumberInput>` 0-100

### 3.3 Alert 组件

**`packages/core/src/components/alert/types.ts`**

```ts
import type { BaseComponentProps } from '../../types/component-props'
import type { EventDeclaration } from '../../types/events'

export interface AlertProps extends BaseComponentProps {
  type?: 'primary' | 'info' | 'success' | 'warning' | 'error'
  title?: string
  content: string
  showIcon?: boolean
  closable?: boolean
  /** 自定义图标（icons/iconMap 已注册名） */
  icon?: string
}

export const alertEventDeclarations: EventDeclaration[] = [
  { name: 'onClose', label: '关闭', description: '点击关闭按钮时触发' },
]
```

> 类型映射说明：antd `Alert` 用 `type: 'success' | 'info' | 'warning' | 'error'`。本组件在用户层多定义 `primary`，adapter 实现时把 `primary` 映射为 `info`（或采用样式微调以兼容 antd 不支持的语义）。

**`packages/core/src/components/alert/palette.tsx`**

```ts
import type { ComponentPalette } from '../../types/palette'
import { Circle } from '../icons'  // 备选：新增 Bell 图标
export const palette: ComponentPalette = {
  label: '警告提示',
  category: 'display',
  icon: <Circle />,
  defaultProps: {
    componentProps: {
      type: 'info',
      content: '提示内容',
      showIcon: true,
      closable: false,
    },
  },
}
```

**`packages/core/src/components/alert/Props.tsx`**

字段：类型、标题、内容、显示图标、可关闭、自定义图标（同 Card 的 Select 模式）

### 3.4 Segment 组件

**`packages/core/src/components/segment/types.ts`**

```ts
import type { BaseComponentProps } from '../../types/component-props'
import type { OptionItem } from '../../types/schema'
import type { EventDeclaration } from '../../types/events'

export interface SegmentProps extends BaseComponentProps {
  options: OptionItem[]
  value?: string | number
  defaultValue?: string | number
  size?: 'large' | 'middle' | 'small'
  block?: boolean
  disabled?: boolean
}

export const segmentEventDeclarations: EventDeclaration[] = [
  { name: 'onChange', label: '选中变化', description: '选中项变化时触发，参数为新值' },
]
```

**`packages/core/src/components/segment/palette.tsx`**

```ts
import type { ComponentPalette } from '../../types/palette'
import { ToggleLeft } from '../icons'
export const palette: ComponentPalette = {
  label: '分段控制器',
  category: 'display',
  icon: <ToggleLeft />,
  defaultProps: {
    componentProps: {
      options: [
        { label: '选项1', value: 'option_1' },
        { label: '选项2', value: 'option_2' },
        { label: '选项3', value: 'option_3' },
      ],
      size: 'middle',
      block: false,
    },
  },
}
```

**`packages/core/src/components/segment/Props.tsx`**

字段：
- 选项 → `<OptionRender>`（来自 `propRenders/shared`，与 Radio/Select 一致）
- 默认值 → `<w.Input>`（字符串；注意 value 类型为 `string | number`，但 Input widget 按字符串处理，adapter 层不做类型转换）
- 尺寸 → `<w.ButtonGroup>`（大 / 中 / 小）
- 块级（block）→ `<w.Switch>`
- 禁用 → `<w.Switch>`

### 3.5 类型/注册/索引更新

| 文件 | 变更 |
|------|------|
| `packages/core/src/types/schema.ts` | `FieldType` 联合追加 `'card' \| 'alert' \| 'segment'` |
| `packages/core/src/types/component-props.ts` | `ComponentPropsMap` 追加 `Card`/`Alert`/`Segment`；re-export 三种类型 |
| `packages/core/src/index.ts` | re-export `CardProps` / `AlertProps` / `SegmentProps`；**同时追加 `export { iconMap } from './components'`**（adapter 需要从 `@form-engine/core` 引用 `iconMap` 解析图标） |
| `packages/core/src/components/index.ts` | re-export `alertEventDeclarations` / `segmentEventDeclarations`；`EVENT_DECLARATION_MAP` 追加 `card` / `alert` / `segment`（card 无事件声明，按需省略） |
| `packages/core/src/components/paletteRegistry.ts` | `componentPalettes` 追加三条 |
| `packages/core/src/propRenders/index.ts` | `PropsRenderMap` 追加三条（导入 `CardPropsRender` / `AlertPropsRender` / `SegmentPropsRender`） |
| `packages/core/src/designer/paletteData.ts` | `GROUP_MEMBERS`：布局追加 `'card'`，展示追加 `'alert'`，选择追加 `'segment'` |

### 3.6 antd 适配器

`packages/adapter-antd/src/components/Card.tsx`：
- 接收 `icon` 字符串，从 `icons`（`@form-engine/core` 已 re-export `iconMap`）查 SVG 组件，置于 `extra`/`title` 前
- 用 antd `<Card title={...} bordered={...} size={...} styles={{ body: { padding, gap } }}>`

`packages/adapter-antd/src/components/Alert.tsx`：
- 用 antd `<Alert type message description showIcon closable onClose />`
- 字段映射：`title` → `message`，`content` → `description`，`type='primary'` 映射为 `type='info'` 并附 `style={{ border: '1px solid var(--fe-primary)' }}`（或直接降级为 info）

`packages/adapter-antd/src/components/Segment.tsx`：
- 用 antd `<Segmented options={...} value/defaultValue/size/block/disabled onChange />`
- options 兼容 `string | number | {label, value, disabled?}` 三种形态，adapter 在内部做归一

`packages/adapter-antd/src/index.tsx`：
- `antdComponents` 字典追加 `'Card' / 'Alert' / 'Segment'`
- 同步追加 `'card' / 'alert' / 'segment'` 三条 `createFieldRenderer` 入口

### 3.7 antd-mobile 适配器

`packages/adapter-antd-mobile/src/components/Card.tsx`：
- 用 antd-mobile `<Card title={...}>`
- 不支持 `icon` 字符串时回退为左侧的小圆点

`packages/adapter-antd-mobile/src/components/Alert.tsx`：
- antd-mobile **无 Alert**（仅 Toast/Modal）。采用简化实现：`<div>` + 类型对应底色 + 可选关闭按钮
- 视觉上尽量与 antd Alert 接近（type → 颜色、icon → 类型图标占位）

`packages/adapter-antd-mobile/src/components/Segment.tsx`：
- 用 antd-mobile `<Segmented options={...} />`

`packages/adapter-antd-mobile/src/index.tsx`：
- `antdMobileComponents` 追加 `CardField` / `AlertField` / `SegmentField`（与既有命名风格一致）
- `antdMobileAdapter` 渲染函数映射追加 `'card' / 'alert' / 'segment'`

### 3.8 文档

`docs/component-addition-card-alert-segment.md` 记录：
- 三组件的 props、事件、分类
- 调色板分组与中文名
- adapter 映射、注意事项（如 Alert 的 primary 映射、Card icon 解析）

### 3.9 关于主题 Token

- 所有内联样式（padding/gap/border 等）从 `useStyle().token()` 取值
- Card icon 解析不涉及样式（仅替换 React 节点）
- Alert 简化版（mobile）若需直接色值，**必须**通过 `token('primary')` 等取出，禁止硬编码十六进制
- 改完跑 `pnpm check:tokens`

---

## 四、假设与决策

1. **Card 不做嵌套区域（regionKey）**：用户描述「body 可以拖入其他组件」是单一区域扁平子节点，沿用 Container 的处理方式。
2. **Segment 默认分类为 `display`**：与「不作为表单组件」对齐；不显示 label/placeholder；若用户后续希望保留 form 行为，仅需将 palette 的 `category` 改为 `form`，无需改其他代码。
3. **Alert `type='primary'` 的兼容**：antd 自身不支持 primary，方案中映射为 info 风格；如需差异化视觉，移动端实现用 token 化的蓝色左边框。
4. **Card icon 为字符串**：由用户在 PropertyPanel 用下拉选择图标名（来自 `iconMap`），adapter 解析为 React 节点。
5. **Segment 选项编辑复用 `OptionRender`**：与 Radio/Select 完全一致，零额外成本。
6. **mobile 不提供 Alert 语义组件**：使用简化 div 替代，并加注释说明"移动端 Alert 简化实现"。

---

## 五、验证步骤

1. **构建**：
   ```powershell
   pnpm build 2>&1 | Tee-Object ./tmp/build-$(Get-Date -Format 'yyyyMMdd_HHmmss').txt
   ```
   预期 0 报错。
2. **类型检查**：
   ```powershell
   pnpm type-check
   ```
3. **Token 校验**：
   ```powershell
   pnpm check:tokens
   ```
4. **测试**：
   ```powershell
   pnpm test
   ```
5. **手动验证**（`pnpm dev` 起 example）：
   - 调色板三组各能找到 Card/Alert/Segment
   - Card 可拖入子组件，body 区域可继续嵌套
   - Alert 五种 type、可关闭、显示/隐藏图标表现正确
   - Segment 选项可增删改、onChange 事件可在事件编辑器里配置
6. **Lint**：
   ```powershell
   pnpm lint
   ```

---

## 六、文件清单（新增/改动）

**新增**
- `packages/core/src/components/card/types.ts`
- `packages/core/src/components/card/palette.tsx`
- `packages/core/src/components/card/Props.tsx`
- `packages/core/src/components/alert/types.ts`
- `packages/core/src/components/alert/palette.tsx`
- `packages/core/src/components/alert/Props.tsx`
- `packages/core/src/components/segment/types.ts`
- `packages/core/src/components/segment/palette.tsx`
- `packages/core/src/components/segment/Props.tsx`
- `packages/adapter-antd/src/components/Card.tsx`
- `packages/adapter-antd/src/components/Alert.tsx`
- `packages/adapter-antd/src/components/Segment.tsx`
- `packages/adapter-antd-mobile/src/components/Card.tsx`
- `packages/adapter-antd-mobile/src/components/Alert.tsx`
- `packages/adapter-antd-mobile/src/components/Segment.tsx`
- `docs/component-addition-card-alert-segment.md`

**改动**
- `packages/core/src/types/schema.ts`（FieldType 联合）
- `packages/core/src/types/component-props.ts`（ComponentPropsMap + re-export）
- `packages/core/src/index.ts`（re-export + `iconMap` 公开导出）
- `packages/core/src/components/index.ts`（EVENT_DECLARATION_MAP + re-export）
- `packages/core/src/components/icons/index.tsx`（`Layout` 追加到 `iconMap` 记录）
- `packages/core/src/components/paletteRegistry.ts`（componentPalettes）
- `packages/core/src/propRenders/index.ts`（PropsRenderMap）
- `packages/core/src/designer/paletteData.ts`（GROUP_MEMBERS）
- `packages/adapter-antd/src/index.tsx`（antdComponents + createFieldRenderer 入口）
- `packages/adapter-antd-mobile/src/index.tsx`（antdMobileComponents + 渲染函数映射）
