# Token 精简优化方案

## 原则

**自定义 token 能少则少，尽量复用 antd 已有的尺寸体系**。我们的颜色/控件高度等大多通过 adapter bridge 从 antd 映射过来，`ThemeTokens` 只是 fallback。本仓库自己的 token 只定义 antd 没有覆盖到的组件物理尺寸。

---

## 背景

当前 `ThemeTokens` 接口约 100+ 个 token，扁平平铺，存在以下问题：

1. **组件级物理尺寸暴露到全局**：Switch 的 7 个尺寸 token、ItemList 的 6 个尺寸 token 本应属于组件作用域
2. **语义不同但默认值相同的 token 缺少共享基础**：`btnHeightMd` = `inputHeightMd` = 32px，语义不同不应合并，但应共享同一个基础值
3. **图标/辅助文字尺寸碎片化**：`inputActionSize`(16px)、`widgetInputFontSizeXs`(11px)、`widgetInputFontSizeXxs`(10px) 做的是同一类事
4. **无意义 token**：`widgetCheckboxMargin` 值为 0，不需要 token
5. **死代码**：`widgetInputFontSizeXs`、`itemListDragHandleWidth/Height`(非 Lg 版)、`itemListRemoveButtonSize/Padding` 仅定义于接口和默认值，没有任何消费者

---

## 优化项

### 1. Switch 系列 7 个 token → 2 个核心 + calc 派生

**保留**（唯一真实源）：
- `switchTrackHeight: '20px'`
- `switchThumbSize: '16px'`

**移除**（改为 calc 派生）：
- `widgetSwitchTrackWidth`(36px) → `calc(trackHeight * 1.8)`
- `widgetSwitchTrackRadius`(10px) → `calc(trackHeight / 2)`
- `widgetSwitchThumbOffset`(2px) → `calc((trackHeight - thumbSize) / 2)`
- `widgetSwitchThumbActiveOffset`(18px) → `calc(trackWidth - thumbSize - thumbOffset)`
- `widgetSwitchShadow` → 改用 `shadowSm`（最接近的通用 token）

**实现**：JS 端和 CSS 端各自用同一公式，值保证一致。

```ts
// === defaultTheme.ts ===
const SWITCH_TRACK_H = 20
const SWITCH_THUMB = 16

switchTrackHeight: `${SWITCH_TRACK_H}px`,
switchThumbSize: `${SWITCH_THUMB}px`,
widgetSwitchTrackWidth: `${SWITCH_TRACK_H * 1.8}px`,    // 36px
widgetSwitchTrackRadius: `${SWITCH_TRACK_H / 2}px`,     // 10px
widgetSwitchThumbOffset: `${(SWITCH_TRACK_H - SWITCH_THUMB) / 2}px`, // 2px
widgetSwitchThumbActiveOffset: `${SWITCH_TRACK_H * 1.8 - SWITCH_THUMB - (SWITCH_TRACK_H - SWITCH_THUMB) / 2}px`, // 18px
```

```css
/* === tokens.css === */
--fe-switch-track-height: 20px;
--fe-switch-track-width: calc(var(--fe-switch-track-height) * 1.8);
--fe-switch-track-radius: calc(var(--fe-switch-track-height) / 2);
--fe-switch-thumb-offset: calc((var(--fe-switch-track-height) - var(--fe-switch-thumb-size)) / 2);
```

**注意**：CSS `calc()` 在现代引擎中开销可忽略，仅主题切换时重新计算一次，不影响运行时性能。

**消费者**：Switch.tsx 仍然写 `token('widgetSwitchTrackWidth')`，零改动。

**影响文件**：
- `defaultTheme.ts`（接口减少 5 个字段，默认值改为常量派生产出）
- `tokens.css`（Switch 尺寸段改为 calc）
- `Switch.tsx`（无改动，最多验证 token('widgetSwitchShadow') 改成 'shadowSm' 后视觉效果可接受）
- `darkTheme` / `compactOverrides`：Switch 系列均无覆盖，直接移除，无影响

---

### 2. 新增 `fontSizeIcon`，统一图标/辅助文字尺寸

**替换**：
- `inputActionSize`(16px) → 移除，图标容器宽高改为 `calc(fontSizeIcon * 1.333)`（仍 16px）
- `widgetInputFontSizeXxs`(10px) → 移除，用 `fontSizeIcon`(12px)
- `widgetInputFontSizeXs`(11px) → 移除，已是死代码

**新增**：
- `fontSizeIcon: '12px'`

`fontSizeIcon` 与现有 `fontSizeXs`(12px) 值相同，但语义不同：`fontSizeXs` 是「最小字号」，`fontSizeIcon` 是「图标尺寸」。未来可能值不同（如大字号模式下 `fontSizeXs` 增大但图标保持 12px），单独保留以便独立控制。如果确认始终一致，也可以直接复用 `fontSizeXs` 省掉这个新增，留评论即可。

**影响文件**：
- `InputOverlayButton.tsx`（L41-42 宽高从 `token('inputActionSize')` 改为 `calc(token('fontSizeIcon') * 1.333)` 或直接用 `${FONT_SIZE_ICON * 1.333}px`）
- `Select.tsx`（L107-108 箭头图标宽高同上的 calc；L113 箭头字号改为 `token('fontSizeIcon')`）
- `CollapsibleSection.tsx`（L40 展开箭头字号改为 `token('fontSizeIcon')`）
- `ComponentTree.tsx`（L38 类型标签字号改为 `fontSizeSm` 或 `fontSizeIcon`，由价值判断定）
- `defaultTheme.ts`
- `tokens.css`

---

### 3. `btnHeight` / `inputHeight` 引用 antd 映射值，不自创基础高度

antd 通过 adapter bridge 已经映射了 `--fe-btn-height-md`、`--fe-input-height-md`。我们的 `btnHeightMd`、`inputHeightMd` 默认值直接对齐 antd 的 `controlHeight` 体系。

**不做** `controlHeightSm/Md/Lg` 基础 token 的新增——antd 本身有 `controlHeightSM` / `controlHeight` / `controlHeightLG`，通过 bridge 映射过来即可，我们不再自创一套基础高度体系。

**但暴露的问题仍然要解决**：当前 `btnHeightMd` 和 `inputHeightMd` 写死 '32px'，与 `<StyleProvider theme={{ controlHeight: '28px' }}>` 断裂。这个修复属于 bridge 映射工作，不在 token 优化范围内，本方案暂不处理。

**影响**：取消原方案 §2「引入 controlHeight 基础系列」，控件高度 token 保持现有 2 个不变。

---

### 4. 移除 `widgetCheckboxMargin`(0)

值恒为 0，直接在组件内写 `margin: 0`。

**注意**：ButtonGroup.tsx 也引用此 token 作为 gap，语义不对且值为 0 = 按钮间无间距。**这是 BUG**，应改为 `spacingXxs`(2px)。

**影响文件**：
- `Checkbox.tsx`（L18 `margin: token('widgetCheckboxMargin')` → `margin: 0`）
- `ButtonGroup.tsx`（L14 `gap: token('widgetCheckboxMargin')` → `gap: token('spacingXxs')`）
- `defaultTheme.ts`
- `tokens.css`

---

### 5. ItemList 拖拽手柄 4 个 token → 移除

- `itemListDragHandleWidth`(16px) → 死代码，直接移除
- `itemListDragHandleHeight`(24px) → 死代码，直接移除
- `itemListDragHandleWidthLg`(20px) → `sortableListShared.tsx:25` 唯一消费方，改为直接写尺寸 20px x 28px（或复用 spacing 等已有 token 组合，价值不大）
- `itemListDragHandleHeightLg`(28px) → 同上

**影响文件**：
- `sortableListShared.tsx`（L25-26 宽高改为硬编码或 inline calc）
- `defaultTheme.ts`
- `tokens.css`

---

### 6. ItemList 删除按钮 2 个 token → 移除

- `itemListRemoveButtonSize`(18px) → 死代码，直接移除
- `itemListRemoveButtonPadding`(0) → 死代码，直接移除

`InlineDeleteButton` 只用 `WidgetButton size="sm"`，不引用任何 itemList 尺寸 token。

**影响文件**：`defaultTheme.ts`、`tokens.css`

---

## 数量变化

| 类别 | 当前 | 优化后 | 变化 |
|------|------|--------|------|
| 图标/辅助文字尺寸 | 3 | 1 (`fontSizeIcon`) | -2 |
| Switch 系列 | 7 | 2 | -5 |
| Checkbox margin | 1 | 0 | -1 |
| 拖拽手柄 | 4 | 0 | -4 |
| 删除按钮 | 2 | 0 | -2 |
| **合计** | **17** | **3** | **-14** |

> 控件高度（2 个）保持不变，不加不减。接口总数净减 14 个 token。

---

## 迁移策略

**一次性替换，不做 deprecation 过渡**。所有消费方在同一次 PR 中更新完毕。现有外部用户：这些 token 属于内部组件实现细节，移除后不影响公开 API。

---

## 暗黑/紧凑模式同步

所有被移除的 token 在 `darkTheme` 和 `compactOverrides` 中**均无覆盖**，直接移除，不影响。

---

## 执行顺序

1. Switch 重构为核心 token + defaultTheme 内 calc 派生
2. 新增 `fontSizeIcon`，替换 `inputActionSize` / `widgetInputFontSizeXxs` 消费方
3. 移除 `widgetCheckboxMargin`，修复 ButtonGroup bug
4. 移除 `itemList*` 系列
5. 同步更新 `tokens.css`（Switch 段改为 calc，删除其余）
6. 全量 `pnpm build` + `pnpm test` + `pnpm lint` + `pnpm check:tokens`
