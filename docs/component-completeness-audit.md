# 组件完整性审计报告

## 概况

| 维度 | 状态 |
|------|------|
| 调色板组件数 | 24（15 表单 + 5 布局 + 3 展示 + 1 按钮） |
| 有完整 Props 定义 | 24 ✅ |
| 有 PropsRender（属性面板可编辑） | 24 ✅ / 0 ❌ |
| Antd 适配器完整 | 24 ✅ / 0 ❌ |
| Antd-mobile 适配器完整 | 23 ✅ / 1 ❌ |

---

## 一、架构不一致问题

### 1. Adapter 目录结构不一致（已解决 ✅）

| 适配器 | 组件目录 | 风格 |
|--------|---------|------|
| `adapter-antd` | `src/components/Input.tsx`, `src/components/Select.tsx`... | 每个组件独立文件 |
| `adapter-antd-mobile` | `src/components/Input.tsx`, `src/components/Select.tsx`... | 每个组件独立文件 |

**已解决：** P1 已重构移动端为 `components/<Name>.tsx` 独立文件结构

### 2. 布局/展示组件缺少核心目录（已解决 ✅）

`collapse`、`tabs` 的 Props 类型已迁移至独立目录，且所有布局/展示组件均有 `Props.tsx`。

---

## 二、组件逐项审计

### 2.1 Input (`input`, `password`)

| 检查项 | 状态 |
|--------|------|
| **Props 定义** | `src/components/input/types.ts` ✅ |
| **PropsRender** | `src/components/input/Props.tsx` ✅ **完整** |
| **Antd 适配器** | `adapter-antd/src/components/Input.tsx` ✅ |
| **移动端适配器** | `adapter-antd-mobile/src/components/Input.tsx` (InputField) ✅ |

**PropsRender 当前渲染：** `placeholder`, `maxLength`, `type`, `allowClear`, `showCount`, `prefix`

---

### 2.2 TextArea (`textarea`)

| 检查项 | 状态 |
|--------|------|
| **Props 定义** | `src/components/textarea/types.ts` ✅ |
| **PropsRender** | `src/components/textarea/Props.tsx` ✅ **完整** |
| **Antd 适配器** | `adapter-antd/src/components/TextArea.tsx` ✅ |
| **移动端适配器** | `adapter-antd-mobile/src/components/TextArea.tsx` (TextAreaField) ✅ |

**PropsRender 当前渲染：** `placeholder`, `rows`, `maxLength`, `showCount`, `autoSize`, `allowClear`

---

### 2.3 InputNumber (`input-number`)

| 检查项 | 状态 |
|--------|------|
| **Props 定义** | `src/components/input-number/types.ts` ✅ |
| **PropsRender** | `src/components/input-number/Props.tsx` ✅ **完整** |
| **Antd 适配器** | `adapter-antd/src/components/InputNumber.tsx` ✅ |
| **移动端适配器** | `adapter-antd-mobile/src/components/InputNumber.tsx` (InputNumberField, 用 Stepper) ✅ 但精度有限 |

**PropsRender 当前渲染：** `min`, `max`, `step`, `precision`, `prefix`, `suffix`

---

### 2.4 Select (`select`, 调色板已移除 `multi-select`)

| 检查项 | 状态 |
|--------|------|
| **Props 定义** | `src/components/select/types.ts` ✅ |
| **PropsRender** | `src/components/select/Props.tsx` ✅ **完整**（含 OptionRender 选项编辑） |
| **Antd 适配器** | `adapter-antd/src/components/Select.tsx` ✅ |
| **移动端适配器** | `adapter-antd-mobile/src/components/Select.tsx` (SelectField, 用 Picker) ✅ |

**PropsRender 当前渲染：** `placeholder`, `mode`, `showSearch`, `allowClear`, `maxTagCount`, `options` (OptionRender)

---

### 2.5 Radio (`radio`)

| 检查项 | 状态 |
|--------|------|
| **Props 定义** | `src/components/radio/types.ts` ✅ |
| **PropsRender** | `src/components/radio/Props.tsx` ✅ **完整** |
| **Antd 适配器** | `adapter-antd/src/components/Radio.tsx` ✅ |
| **移动端适配器** | `adapter-antd-mobile/src/fields/SwitchField.tsx` (RadioField) ✅ |

**PropsRender 渲染：** `options`, `optionType`, `buttonStyle` — 全部已覆盖 ✅

---

### 2.6 Checkbox (`checkbox`)

| 检查项 | 状态 |
|--------|------|
| **Props 定义** | `src/components/checkbox/types.ts` ✅ |
| **PropsRender** | `src/components/checkbox/Props.tsx` ✅ **完整** |
| **Antd 适配器** | `adapter-antd/src/components/Checkbox.tsx` ✅ |
| **移动端适配器** | `adapter-antd-mobile/src/components/Checkbox.tsx` (CheckboxField) ✅ |

**PropsRender 当前渲染：** `options`, `indeterminate`

---

### 2.7 Switch (`switch`)

| 检查项 | 状态 |
|--------|------|
| **Props 定义** | `src/components/switch/types.ts` ✅ |
| **PropsRender** | `src/components/switch/Props.tsx` ✅ **已修正 + 完整** |
| **Antd 适配器** | `adapter-antd/src/components/Switch.tsx` ✅ **已改为 defaultValue** |
| **移动端适配器** | `adapter-antd-mobile/src/components/Switch.tsx` (SwitchField) ✅ |

**PropsRender 当前渲染：** `defaultValue`, `size`, `checkedChildren`, `unCheckedChildren`

---

### 2.8 Slider (`slider`)

| 检查项 | 状态 |
|--------|------|
| **Props 定义** | `src/components/slider/types.ts` ✅ |
| **PropsRender** | `src/components/slider/Props.tsx` ✅ **完整** |
| **Antd 适配器** | `adapter-antd/src/components/Slider.tsx` ✅ |
| **移动端适配器** | `adapter-antd-mobile/src/components/Slider.tsx` (SliderField) ✅ |

**PropsRender 当前渲染：** `min`, `max`, `step`, `range`, `vertical`, `dots`, `marks`

---

### 2.9 Rate (`rate`)

| 检查项 | 状态 |
|--------|------|
| **Props 定义** | `src/components/rate/types.ts` ✅ |
| **PropsRender** | `src/components/rate/Props.tsx` ✅ **完整** |
| **Antd 适配器** | `adapter-antd/src/components/Rate.tsx` ✅ |
| **移动端适配器** | `adapter-antd-mobile/src/components/Rate.tsx` (RateField) ✅ |

**PropsRender 当前渲染：** `count`, `allowHalf`, `character`

---

### 2.10 DatePicker (`date`, `datetime`, `date-range`, `time`)

| 检查项 | 状态 |
|--------|------|
| **Props 定义** | `src/components/date-picker/types.ts` ✅ |
| **PropsRender** | `src/components/date-picker/Props.tsx` ✅ **完整（文件名已修正）** |
| **Antd 适配器** | `adapter-antd/src/components/DatePicker.tsx` ✅ |
| **移动端适配器** | `adapter-antd-mobile/src/components/DatePicker.tsx` ✅ |

**PropsRender 当前渲染：** `format`, `picker`, `showTime`, `allowClear`, `disabledDate`

---

### 2.11 Upload (`upload`)

| 检查项 | 状态 |
|--------|------|
| **Props 定义** | `src/components/upload/types.ts` ✅ |
| **PropsRender** | `src/components/upload/UploadPropsRender.tsx` ✅ **完整** |
| **Antd 适配器** | `adapter-antd/src/components/Upload.tsx` ✅ |
| **移动端适配器** | `adapter-antd-mobile/src/components/Upload.tsx` (UploadField, 用 ImageUploader) ⚠️ **仅图片** |

**PropsRender 当前渲染：** `accept`, `maxCount`, `listType`, `multiple`, `showUploadList`

---

### 2.12 Button (`button`)

| 检查项 | 状态 |
|--------|------|
| **Props 定义** | `src/components/button/types.ts` ✅ |
| **PropsRender** | `src/components/button/Props.tsx` ✅ **完整** |
| **Antd 适配器** | `adapter-antd/src/components/Button.tsx` ✅ |
| **移动端适配器** | ❌ **无**（Button 只在 Picker 内部使用，无独立组件） |

**PropsRender 渲染：** `type`, `htmlType`, `danger`, `loading` — 全部已覆盖 ✅

---

### 2.13 Grid（布局）

| 检查项 | 状态 |
|--------|------|
| **Props 定义** | `src/components/grid/types.ts` ✅ |
| **PropsRender** | `src/components/grid/Props.tsx` ✅ **P1 已实现** |
| **Antd 适配器** | `adapter-antd/src/components/Grid.tsx` ✅ |
| **移动端适配器** | `adapter-antd-mobile/src/components/Grid.tsx` ✅ **P2 已实现** |

---

### 2.14 Flex（布局）

| 检查项 | 状态 |
|--------|------|
| **Props 定义** | `src/components/flex/types.ts` ✅ |
| **PropsRender** | `src/components/flex/Props.tsx` ✅ **P1 已实现** |
| **Antd 适配器** | `adapter-antd/src/components/Flex.tsx` ✅ |
| **移动端适配器** | `adapter-antd-mobile/src/components/Flex.tsx` ✅ **P2 已实现** |

---

### 2.15 Container（布局）

| 检查项 | 状态 |
|--------|------|
| **Props 定义** | `src/components/container/types.ts` ✅ |
| **PropsRender** | `src/components/container/Props.tsx` ✅ **P1 已实现** |
| **Antd 适配器** | `adapter-antd/src/components/Container.tsx` ✅ |
| **移动端适配器** | `adapter-antd-mobile/src/components/Container.tsx` ✅ **P2 已实现** |

---

### 2.16 Collapse（布局）

| 检查项 | 状态 |
|--------|------|
| **Props 定义** | `src/components/collapse/types.ts` ✅ **P1 已迁移至独立目录** |
| **PropsRender** | `src/components/collapse/Props.tsx` ✅ **P1 已实现** |
| **Antd 适配器** | `adapter-antd/src/components/Collapse.tsx` ✅ |
| **移动端适配器** | `adapter-antd-mobile/src/components/Collapse.tsx` ✅ **P2 已实现** |

---

### 2.17 Tabs（布局）

| 检查项 | 状态 |
|--------|------|
| **Props 定义** | `src/components/tabs/types.ts` ✅ **P1 已迁移至独立目录** |
| **PropsRender** | `src/components/tabs/Props.tsx` ✅ **P1 已实现** |
| **Antd 适配器** | `adapter-antd/src/components/Tabs.tsx` ✅ |
| **移动端适配器** | `adapter-antd-mobile/src/components/Tabs.tsx` ✅ **P2 已实现** |

---

### 2.18 Text（展示）

| 检查项 | 状态 |
|--------|------|
| **Props 定义** | `src/components/text/types.ts` ✅ |
| **PropsRender** | `src/components/text/Props.tsx` ✅ **P1 已实现** |
| **Antd 适配器** | `adapter-antd/src/components/Text.tsx` ✅ |
| **移动端适配器** | `adapter-antd-mobile/src/components/Text.tsx` ✅ **P2 已实现** |

---

### 2.19 Image（展示）

| 检查项 | 状态 |
|--------|------|
| **Props 定义** | `src/components/image/types.ts` ✅ |
| **PropsRender** | `src/components/image/Props.tsx` ✅ **P1 已实现** |
| **Antd 适配器** | `adapter-antd/src/components/Image.tsx` ✅ |
| **移动端适配器** | `adapter-antd-mobile/src/components/Image.tsx` ✅ **P2 已实现** |

---

### 2.20 Divider（展示）

| 检查项 | 状态 |
|--------|------|
| **Props 定义** | `src/components/divider/types.ts` ✅ |
| **PropsRender** | `src/components/divider/Props.tsx` ✅ **P1 已实现** |
| **Antd 适配器** | `adapter-antd/src/components/Divider.tsx` ✅ |
| **移动端适配器** | `adapter-antd-mobile/src/components/Divider.tsx` ✅ **P2 已实现** |

---

### 2.21 Title（展示）

| 检查项 | 状态 |
|--------|------|
| **Props 定义** | `src/components/title/types.ts` ✅ |
| **PropsRender** | `src/components/title/Props.tsx` ✅ **P1 已实现** |
| **Antd 适配器** | `adapter-antd/src/components/Title.tsx` ✅ **P1 已实现** |
| **移动端适配器** | `adapter-antd-mobile/src/components/Title.tsx` ✅ **P2 已实现** |
| **调色板** | ✅ **P1 已加入展示分组** |

---

## 三、汇总问题清单

### P0 — 阻塞/Bug

| # | 问题 | 涉及文件 |
|---|------|---------|
| 1 | `date-picker/Props.tsx.tsx` 文件名双后缀 | `core/src/components/date-picker/Props.tsx.tsx` — ✅ **用户已修复** |

### P1 — 高优先级（已全部完成 ✅）

| # | 问题 | 状态 |
|---|------|------|
| 2 | 布局/展示组件完全无 PropsRender，拖入画布后属性面板空白 | ✅ grid, flex, container, collapse, tabs, text, image, divider, title 均已实现 |
| 3 | Title 无 antd 适配器、无调色板入口 | ✅ antd 适配器 + 调色板已加入 |
| 4 | 移动端适配器目录结构与 antd 不一致（`fields/` vs `components/`） | ✅ 已重构为 `components/<Name>.tsx` 独立文件 |

### P2 — 中优先级（除 #7 外均已 ✅ 完成）

| # | 问题 | 涉及组件 | 状态 |
|---|------|---------|------|
| 5 | PropsRender 不完整，缺少常用 antd 属性 | input, textarea, input-number, select, checkbox, switch, slider, rate, date-picker, upload | ✅ **已完成** |
| 6 | Switch 使用 `defaultChecked` 而非 `defaultValue` | switch | ✅ **已修正** |
| 7 | 移动端 Upload 仅支持图片 | upload (mobile) | ⏸ **暂缓**（antd-mobile 无通用上传组件） |
| 8 | Collapse/Tabs Props 类型定义在 component-props.ts 而非独立目录 | collapse, tabs | ✅ **P1 已迁移** |
| 9 | 移动端无布局/展示组件 | grid, flex, container, collapse, tabs, text, image, divider, title | ✅ **已完成** |
| 10 | Select Options 编辑入口缺失 | select | ✅ **已实现** |

---

## 四、实施状态

### ✅ 已完成
- **P0：** `date-picker/Props.tsx.tsx` 文件名双后缀（用户修复）
- **P1：** 布局/展示组件 PropsRender（grid, flex, container, collapse, tabs, text, image, divider, title）
- **P1：** Title 加入调色板 + antd 适配器
- **P1：** 移动端目录重构 `fields/` → `components/`
- **P2：** 补充各表单组件的 PropsRender 缺失属性
- **P2：** Switch 使用 `defaultValue` 修正
- **P2：** 移动端布局/展示组件（grid, flex, container, collapse, tabs, text, image, divider, title）
- **P2：** Select Options 编辑入口

### ⏸ 暂缓
- **P2：移动端 Upload 支持文件上传** — antd-mobile 无通用上传组件，待后续评估

### 📋 待评估 — P3（低优先级）

1. **Button 移动端适配器** — 目前无独立组件
2. **PropsRender 进一步补充** — `addonBefore/addonAfter`, `filterOption`, `tooltips`, `included` 等次要属性
3. **date-picker Props 类型定义迁移至独立目录** — 当前仍直接定义在 `component-props.ts`
4. **Cascader/TreeSelect 调色板恢复** — 需先实现移动端适配器
