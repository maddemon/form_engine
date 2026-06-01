# 组件属性配置审查报告

## 综述

对所有 22 个组件的属性面板 (`Props.tsx`)、类型定义 (`types.ts`) 以及 antd/antd-mobile 适配层实现进行了逐一审查。

---

## 1. Button（按钮）

| 分类 | 问题 | 说明 |
|------|------|------|
| 缺少 | 图标（icon） | 按钮应有图标配置能力 |
| 缺少 | 文本（children/text） | 按钮显示文字未在属性面板暴露 |
| 缺少 | 宽度铺满（block） | 按钮是否占满父容器宽度 |
| 不合理 | 按钮类型 & HTML 类型使用 Select | 选项分别只有 5 个和 3 个，应改用 Button Group 一行展示 |
| 不合理 | 显示"字段名（name）" | Button 是 button 类别，非表单组件，不需要 name |
| 不合理 | 显示"列宽（colSpan）" | 按钮在表单中通常是独立操作，不需要 colSpan 布局 |

---

## 2. Input（单行文本）

| 分类 | 问题 | 说明 |
|------|------|------|
| 缺少 | 默认值（defaultValue） | 所有表单组件都应能在属性面板配置默认值 |
| 缺少 | 后缀（suffix） | 类型定义了 `suffix` 但属性面板未暴露，antd 适配层已支持 |
| 缺少 | 前置标签（addonBefore） | 类型定义了但属性面板未暴露，antd 适配层已支持 |
| 缺少 | 后置标签（addonAfter） | 类型定义了但属性面板未暴露，antd 适配层已支持 |
| 缺少 | 自动完成（autoComplete） | 类型定义了但属性面板未暴露，antd 适配层已支持 |
| 不合理 | "输入类型"使用 Select | 5 个选项（text/password/email/tel/url），用 Button Group 更方便 |

---

## 3. InputNumber（数字）

| 分类 | 问题 | 说明 |
|------|------|------|
| 缺少 | 默认值（defaultValue） | 所有表单组件都应能在属性面板配置默认值 |
| 缺少 | 占位文本（placeholder） | 继承自 BaseFormComponentProps 但属性面板未暴露 |
| 缺少 | 小数分隔符（decimalSeparator） | 类型定义了但属性面板未暴露，antd 适配层已支持 |

---

## 4. Password（密码）

| 分类 | 问题 | 说明 |
|------|------|------|
| 缺少 | 独立的属性面板 | 当前复用 InputPropsRender，但 Password 应有"显示密码切换"等特有属性 |
| 缺少 | 默认值（defaultValue） | 同上 |
| 缺少 | 允许清除（allowClear） | antd-mobile 跑通需要，属性面板未暴露 |
| 缺少 | 显示密码切换 | Password 组件的标配能力 |

---

## 5. TextArea（多行文本）

| 分类 | 问题 | 说明 |
|------|------|------|
| 缺少 | 默认值（defaultValue） | 所有表单组件都应能在属性面板配置默认值 |

当前已有：占位文本、行数、最大长度、显示字数、自适应高度(autoSize)、允许清除 —— 这些均已在属性和适配层实现，正确覆盖。

---

## 6. Select（下拉）

| 分类 | 问题 | 说明 |
|------|------|------|
| 缺少 | 默认值（defaultValue） | 所有表单组件都应能在属性面板配置默认值 |
| 缺少 | 无匹配时文本（notFoundContent） | 类型定义了但属性面板未暴露，antd 适配层已支持 |

当前已有：占位文本、选项、模式、可搜索、允许清除、最多标签数 —— 覆盖正确。

---

## 7. Radio（单选）

| 分类 | 问题 | 说明 |
|------|------|------|
| 缺少 | 默认值（defaultValue） | 所有表单组件都应能在属性面板配置默认值 |
| 缺少 | 横排/竖排（direction） | 目前选项默认横向排列，缺少竖排配置（通过 CSS flex-direction 实现） |
| 不合理 | "选项类型"使用 Select | 只有 2 个选项（default/button），用 Button Group 更方便 |
| 不合理 | "按钮样式"使用 Select | 只有 2 个选项（outline/solid），用 Button Group 更方便 |

---

## 8. Checkbox（多选框）

| 分类 | 问题 | 说明 |
|------|------|------|
| 缺少 | 默认值（defaultValue） | 所有表单组件都应能在属性面板配置默认值 |
| 缺少 | 横排/竖排（direction） | 目前选项默认横向排列，缺少竖排配置（通过 CSS flex-direction 实现） |

---

## 9. Switch（开关）

| 分类 | 问题 | 说明 |
|------|------|------|
| 缺少 | 默认值（defaultValue） | 所有表单组件都应能在属性面板配置默认值 —— 注意：Switch 的 defaultValue 是 boolean，当前属性面板有"默认选中"Checkbox，但此配置写入了 defaultValue 字段，用法正确但命名不够直观 |
| 不合理 | "尺寸"使用 Select | 只有 2 个选项（default/small），用 Button Group 更方便 |

---

## 10. Slider（滑块）

| 分类 | 问题 | 说明 |
|------|------|------|
| 缺少 | 默认值（defaultValue） | 所有表单组件都应能在属性面板配置默认值 |
| 缺少 | tooltip 配置 | 类型定义了 `tooltip.formatter`，属性面板未暴露 |

---

## 11. Rate（评分）

| 分类 | 问题 | 说明 |
|------|------|------|
| 缺少 | 默认值（defaultValue） | 所有表单组件都应能在属性面板配置默认值 |
| 缺少 | tooltips（提示文字） | 类型定义了 `tooltips`，属性面板未暴露，antd 适配层已支持 |

---

## 12. DatePicker（日期）

| 分类 | 问题 | 说明 |
|------|------|------|
| 缺少 | 默认值（defaultValue） | 所有表单组件都应能在属性面板配置默认值 |
| 缺少 | 占位文本（placeholder） | 类型定义了但属性面板未暴露 |
| 缺少 | 最小值（minDate） | 应支持相对日期预设：今日、昨天、明天、上周、下周、上月、下月 |
| 缺少 | 最大值（maxDate） | 同上，应支持相对日期预设 |

---

## 13. TimePicker（时间）

| 分类 | 问题 | 说明 |
|------|------|------|
| 缺少 | 独立的属性面板 | 当前复用 DatePickerPropsRender，显示的格式是 YYYY-MM-DD 完全错误 |
| ❌ 错误 | 格式（format）默认值错误 | 当前通过 DatePickerPropsRender 显示"YYYY-MM-DD"，时间格式应默认为 **HH:mm**（antd 默认 HH:mm:ss） |
| 缺少 | 分钟步长（minuteStep） | 类型 `TimePickerProps` 定义了但属性面板未暴露 |
| 缺少 | 秒步长（secondStep） | 类型 `TimePickerProps` 定义了但属性面板未暴露 |

---

## 14. DateTime（日期时间）

| 分类 | 问题 | 说明 |
|------|------|------|
| 缺少 | 独立的属性面板 | 当前复用 DatePickerPropsRender |
| ❌ 错误 | 格式（format）默认值错误 | 日期时间的格式应默认为 **YYYY-MM-DD HH:mm**（或 YYYY-MM-DD HH:mm:ss） |

---

## 15. DateRange（日期范围）

| 分类 | 问题 | 说明 |
|------|------|------|
| 缺少 | 独立的属性面板 | 当前复用 DatePickerPropsRender，DateRange 的 placeholder 是 `[string, string]` 类型 |
| 缺少 | 允许清除（allowClear） | antd 适配层已支持（`allowClear = true`），antd-mobile 适配层不支持（无内置 allowClear），属性面板未暴露此配置 |
| 缺少 | 占位文本（placeholder） | 类型定义了 `[string, string]` 但属性面板未暴露 |

---

## 16. Upload（上传）

| 分类 | 问题 | 说明 |
|------|------|------|
| 缺少 | 上传地址（action） | 最核心的属性，类型定义了但属性面板未暴露，antd 适配层已支持 |
| 缺少 | 默认值（defaultValue） | 所有表单组件都应能在属性面板配置默认值 |
| 缺少 | 文件夹上传（directory） | 类型定义了但属性面板未暴露，antd 适配层已支持 |
| 缺少 | 上传前置处理（beforeUpload） | 类型定义了但属性面板未暴露，antd 适配层已支持 |

---

## 17. Text（文本展示）

| 分类 | 问题 | 说明 |
|------|------|------|
| 缺少 | 字号（fontSize） | 文本组件应能配置字号大小 |
| 缺少 | 颜色（color） | 应能配置文字颜色 |
| 缺少 | 对齐方式（textAlign） | 应能配置左/中/右对齐 |
| 不合理 | "类型"使用 Select | 5 个选项（secondary/success/warning/danger），用 Button Group 更方便 |

---

## 18. Title（标题）

| 分类 | 问题 | 说明 |
|------|------|------|
| 缺少 | 对齐方式（textAlign） | 标题应能配置对齐方式 |
| 缺少 | 颜色（color） | 应能配置文字颜色 |
| 不合理 | "级别"使用 Select | 5 个选项（H1-H5），用 Button Group 更方便 |

---

## 19. Image（图片展示）

无显著问题。（宽度/高度用 Input 支持数字和百分比，合理）

---

## 20. Divider（分割线）

| 分类 | 问题 | 说明 |
|------|------|------|
| 不合理 | "方向"使用 Select | 只有 2 个选项（horizontal/vertical），用 Button Group 更方便 |
| 不合理 | "文字位置"使用 Select | 只有 3 个选项（center/left/right），用 Button Group 更方便 |

---

## 21. Container（容器）

| 分类 | 问题 | 说明 |
|------|------|------|
| 缺少 | 内边距（padding） | BaseLayoutComponentProps 定义了但属性面板未暴露 |
| 缺少 | 外边距（margin） | BaseLayoutComponentProps 定义了但属性面板未暴露 |
| 缺少 | 间距（gap） | BaseLayoutComponentProps 定义了但属性面板未暴露 |
| 不合理 | "布局方向"使用 Select | 只有 2 个选项（vertical/horizontal），用 Button Group 更方便 |

---

## 22. Flex（弹性布局）

| 分类 | 问题 | 说明 |
|------|------|------|
| 缺少 | 换行方式（wrap） | 类型定义了但属性面板未暴露 |
| 不合理 | "方向"使用 Select | 4 个选项，用 Button Group 更方便 |

---

## 23. Grid（栅格布局）

| 分类 | 问题 | 说明 |
|------|------|------|
| 缺少 | 布局模式（variant） | 类型定义了 'grid' / 'flex' 两种模式但属性面板未暴露 |

---

## 24. Collapse（折叠面板）

| 分类 | 问题 | 说明 |
|------|------|------|
| 缺少 | 面板标题配置 | 折叠面板应有"标题"配置项（可支持多个面板的标题编辑） |
| 缺少 | 默认展开 key（defaultActiveKey） | 应有配置项控制默认展开哪个面板 |
| 缺少 | 手风琴模式 | 属性面板已有 accordion 配置，正确 |

---

## 25. Tabs（标签页）

无显著问题。

---

## 跨组件共性问题

### 问题 A：所有表单组件缺少"默认值"配置

所有继承 `BaseFormComponentProps` 的组件都支持 `defaultValue`，但属性面板均未暴露此配置。

| 组件 | 说明 |
|------|------|
| Input | defaultValue 为 string |
| TextArea | defaultValue 为 string |
| InputNumber | defaultValue 为 number |
| Password | defaultValue 为 string |
| Select | defaultValue 为 string/string[] |
| Radio | defaultValue 为 string |
| Checkbox | defaultValue 为 string[] |
| Switch | defaultValue 为 boolean（已有近似配置但名为"默认选中"） |
| Slider | defaultValue 为 number/[number,number] |
| Rate | defaultValue 为 number |
| DatePicker | defaultValue 为 string |
| Upload | defaultValue 为 string[] |

### 问题 B：PropertyPanel 对非表单组件显示不必要的属性

[PropertyPanel.tsx](file:///d:/Repos/form_engine/packages/core/src/designer/PropertyPanel.tsx#L63-L83) 中：

- **Button / Display / Container 组件**：当前显示"字段名（name）"和"列宽（colSpan）"
  - **Button**：既不需要 name 也不需要 colSpan
  - **Display 组件**（Text/Title/Image/Divider）：不需要 colSpan，name 可保留用于引用
  - **Container 组件**：不需要 colSpan

建议按类别区分：
| 类别 | 显示属性 |
|------|----------|
| form | name, label, placeholder, colSpan |
| display | name（仅） |
| container | name（仅） |
| button | 不显示 name 和 colSpan |

### 问题 C：Select → Button Group 改造清单

| 组件 | 属性 | 选项数 | 建议 |
|------|------|--------|------|
| Button | 按钮类型 (type) | 5 | Button Group |
| Button | HTML 类型 (htmlType) | 3 | Button Group |
| Input | 输入类型 (type) | 5 | Button Group |
| Radio | 选项类型 (optionType) | 2 | Button Group |
| Radio | 按钮样式 (buttonStyle) | 2 | Button Group |
| Switch | 尺寸 (size) | 2 | Button Group |
| Text | 类型 (type) | 5 | Button Group |
| Title | 级别 (level) | 5 | Button Group |
| Divider | 方向 (type) | 2 | Button Group |
| Divider | 文字位置 (orientation) | 3 | Button Group |
| Container | 布局方向 (layout) | 2 | Button Group |
| Flex | 方向 (direction) | 4 | Button Group |

### 问题 D：Time / DateTime / DateRange 缺少独立属性面板

当前 PropsRenderMap 中 time、datetime、date-range 均复用 DatePickerPropsRender，导致严重问题：

| 类型 | 当前行为 | 正确行为 |
|------|----------|----------|
| **time** | 显示格式 YYYY-MM-DD，显示"选择器类型"无关选项 | 格式应默认 HH:mm，只显示时间相关选项 |
| **datetime** | 显示格式 YYYY-MM-DD | 格式应默认 YYYY-MM-DD HH:mm，默认 showTime=true |
| **date-range** | 复用日期面板，placeholder 类型不匹配 | 需要独立面板，支持 `[string, string]` 类型 placeholder |

### 问题 E：Radio / Checkbox 缺少"横排/竖排"配置

- antd 的 Radio.Group 和 Checkbox.Group 默认横向（inline）排列
- 竖排需要通过 CSS `flex-direction: column` 实现
- 属性面板应增加"排列方向"配置（横排/竖排），适配层通过 style 控制

### 问题 F：Date 缺少"最小值/最大值"配置

- antd 的 DatePicker 支持 `disabledDate` 回调函数
- 但用户需要更直观的"相对日期预设"：今日、昨天、明天、上周、下周、上月、下月
- 属性面板应增加"最小值"和"最大值"两个配置项，每个均支持：
  - 精确日期输入
  - 相对日期预设选择

### 问题 G：Upload 缺失核心属性

Upload 组件缺少 **上传地址（action）** 的配置，这是上传组件的核心能力，必须添加。antd 适配层已完整支持 action、directory、beforeUpload 等属性。

### 问题 H：antd 与 antd-mobile 适配层差异分析

| 组件 | antd 已支持 | antd-mobile 已支持 | 属性面板缺失 |
|------|-------------|-------------------|-------------|
| Input | suffix, addonBefore, addonAfter, autoComplete | 基础输入 | suffix, addonBefore, addonAfter |
| InputNumber | decimalSeparator, formatter, parser | 步进器(Stepper) | decimalSeparator |
| Select | filterOption, placement, onSearch, notFoundContent | Picker 弹窗 | notFoundContent |
| DatePicker | format, showTime, picker, disabledDate | DatePicker 弹窗 | minDate, maxDate, placeholder |
| DateRangePicker | format, showTime, picker, allowClear, disabledDate | 两个独立 DatePicker | allowClear, placeholder |
| TimePicker | format, allowClear | 自定义 Picker | 独立面板 |
| Upload | action, accept, maxCount, listType, directory, beforeUpload | ImageUploader（仅图片） | action, directory |
| Radio | optionType, buttonStyle | 基础单选 | direction(横排/竖排) |
| Checkbox | 基础多选 | 基础多选 | direction(横排/竖排) |
| Switch | checkedChildren, unCheckedChildren | 基础开关 | — |
| Slider | marks, dots, included, tooltip, vertical | 基础滑块 | tooltip |
| Rate | count, allowHalf, character, tooltips | 基础评分 | tooltips |