# 组件属性配置审查报告

## 综述

对所有组件的属性面板 (`Props.tsx`)、类型定义 (`types.ts`) 以及 antd/antd-mobile 适配层实现进行了逐一审查。

> **文档版本记录**：
> - 初始审查：2026-06-01
> - 补充 Cascader/TreeSelect/Flex/Grid 等问题：2026-06-01
> - **已全量修复**：补充缺失属性、Select→ButtonGroup 改造、新建独立面板、PropertyPanel 分类控制、类型定义对齐

---

## 修复状态总览

| 组件 | 缺失属性补充 | Select→ButtonGroup | 独立面板 | 类型补充 | 状态 |
|------|------------|-------------------|---------|---------|------|
| Button | icon/children/block | type/htmlType ✅ | — | icon/block ✅ | ✅ 全量修复 |
| Input | defaultValue/suffix/addonBefore/addonAfter/autoComplete | type(text) ✅ | — | visibilityToggle ✅ | ✅ 全量修复 |
| InputNumber | defaultValue/placeholder/decimalSeparator | — | — | — | ✅ 全量修复 |
| Password | defaultValue/visibilityToggle/独立面板 | — | 新建 PasswordPropsRender ✅ | visibilityToggle ✅ | ✅ 全量修复 |
| TextArea | defaultValue | — | — | — | ✅ 全量修复 |
| Select | defaultValue/notFoundContent | — | — | — | ✅ 全量修复 |
| Radio | defaultValue/direction | optionType/buttonStyle ✅ | — | direction ✅ | ✅ 全量修复 |
| Checkbox | defaultValue/direction | — | — | direction ✅ | ✅ 全量修复 |
| Switch | — | size ✅ | — | — | ✅ 全量修复 |
| Slider | defaultValue/tooltip.formatter | — | — | — | ✅ 全量修复 |
| Rate | defaultValue/tooltips | — | — | — | ✅ 全量修复 |
| DatePicker | defaultValue/placeholder/minDate/maxDate | — | — | minDate/maxDate ✅ | ✅ 全量修复 |
| TimePicker | defaultValue/minuteStep/secondStep/placeholder/allowClear | — | 新建 TimePickerPropsRender ✅ | — | ✅ 全量修复 |
| DateTime | defaultValue/placeholder/allowClear | picker(date/week/month/year) ✅ | 新建 DateTimePropsRender ✅ | — | ✅ 全量修复 |
| DateRange | defaultValue/placeholder/allowClear | picker ✅ | 新建 DateRangePropsRender ✅ | →BaseFormComponentProps ✅ | ✅ 全量修复 |
| Upload | action/defaultValue/directory/beforeUpload | — | — | — | ✅ 全量修复 |
| Text | fontSize/color/textAlign/keyboard | type ✅ | — | fontSize/color/textAlign ✅ | ✅ 全量修复 |
| Title | textAlign/color | level ✅ | — | textAlign/color ✅ | ✅ 全量修复 |
| Image | borderRadius | — | — | borderRadius ✅ | ✅ 全量修复 |
| Divider | color/thickness | type/orientation ✅ | — | color/thickness ✅ | ✅ 全量修复 |
| Container | padding/margin/gap | layout ✅ | — | — | ✅ 全量修复 |
| Flex | padding/margin/wrap | direction ✅ | — | — | ✅ 全量修复 |
| Grid | padding/margin/variant | — | — | — | ✅ 全量修复（variant 名称对齐） |
| Collapse | defaultActiveKey | — | — | — | ⚠️ 面板项编辑器待实现 |
| Tabs | — | type/size/tabPosition ✅ | — | — | ⚠️ 标签项编辑器待实现 |
| Cascader | 新建 Props+types | — | 新建 CascaderPropsRender ✅ | 移到独立目录 ✅ | ✅ 全量修复 |
| TreeSelect | 新建 Props+types | — | 新建 TreeSelectPropsRender ✅ | 移到独立目录 ✅ | ✅ 全量修复 |

---

## 1. Button（按钮）

| 分类 | 问题 | 说明 | 状态 |
|------|------|------|------|
| 缺少 | 图标（icon） | 按钮应有图标配置能力，ButtonProps 类型中缺少 icon 字段 | ✅ 已补充类型和面板 |
| 缺少 | 文本（children/text） | 按钮显示文字未在属性面板暴露 | ✅ 已补充面板（类型已有 ReactNode） |
| 缺少 | 宽度铺满（block） | 按钮是否占满父容器宽度 | ✅ 已补充类型和面板 |
| 不合理 | 按钮类型 & HTML 类型使用 Select | 选项分别只有 5 个和 3 个，应改用 Button Group 一行展示 | ✅ 已改为 ButtonGroup |
| 不合理 | 显示"字段名（name）" | Button 是 button 类别，非表单组件，不需要 name | ✅ PropertyPanel 已按类别控制 |
| 不合理 | 显示"列宽（colSpan）" | 按钮在表单中通常是独立操作，不需要 colSpan 布局 | ✅ PropertyPanel 已按类别控制 |

---

## 2. Input（单行文本）

| 分类 | 问题 | 说明 | 状态 |
|------|------|------|------|
| 缺少 | 默认值（defaultValue） | 所有表单组件都应能在属性面板配置默认值 | ✅ 已补充 |
| 缺少 | 后缀（suffix） | 类型定义了 `suffix` 但属性面板未暴露，antd 适配层已支持 | ✅ 已补充 |
| 缺少 | 前置标签（addonBefore） | 类型定义了但属性面板未暴露，antd 适配层已支持 | ✅ 已补充 |
| 缺少 | 后置标签（addonAfter） | 类型定义了但属性面板未暴露，antd 适配层已支持 | ✅ 已补充 |
| 缺少 | 自动完成（autoComplete） | 类型定义了但属性面板未暴露，antd 适配层已支持 | ✅ 已补充 |
| 不合理 | "输入类型"使用 Select | 5 个选项（text/password/email/tel/url），用 Button Group 更方便 | ✅ 已改为 ButtonGroup（移除 password，因 Password 为独立组件） |

---

## 3. InputNumber（数字）

| 分类 | 问题 | 说明 | 状态 |
|------|------|------|------|
| 缺少 | 默认值（defaultValue） | 所有表单组件都应能在属性面板配置默认值 | ✅ 已补充 |
| 缺少 | 占位文本（placeholder） | 继承自 BaseFormComponentProps 但属性面板未暴露 | ✅ 已补充 |
| 缺少 | 小数分隔符（decimalSeparator） | 类型定义了但属性面板未暴露，antd 适配层已支持 | ✅ 已补充 |

---

## 4. Password（密码）

| 分类 | 问题 | 说明 | 状态 |
|------|------|------|------|
| 缺少 | 独立的属性面板 | 当前复用 InputPropsRender，但 Password 应有"显示密码切换"等特有属性 | ✅ 已创建独立 PasswordPropsRender |
| 缺少 | 默认值（defaultValue） | 所有表单组件都应能在属性面板配置默认值 | ✅ 已补充 |
| 缺少 | 显示密码切换（visibilityToggle） | Password 组件的标配能力，类型 `InputProps` 中也缺少此字段 | ✅ 已补充类型和面板 |
| 注意 | 允许清除（allowClear） | 已通过独立面板暴露 | ✅ |

---

## 5. TextArea（多行文本）

| 分类 | 问题 | 说明 | 状态 |
|------|------|------|------|
| 缺少 | 默认值（defaultValue） | 所有表单组件都应能在属性面板配置默认值 | ✅ 已补充 |

当前已有：占位文本、行数、最大长度、显示字数、自适应高度(autoSize)、允许清除 —— 这些均已在属性和适配层实现，正确覆盖。

---

## 6. Select（下拉）

| 分类 | 问题 | 说明 | 状态 |
|------|------|------|------|
| 缺少 | 默认值（defaultValue） | 所有表单组件都应能在属性面板配置默认值 | ✅ 已补充（提示多选用逗号分隔） |
| 缺少 | 无匹配时文本（notFoundContent） | 类型定义了但属性面板未暴露，antd 适配层已支持 | ✅ 已补充 |

当前已有：占位文本、选项、模式、可搜索、允许清除、最多标签数 —— 覆盖正确。

---

## 7. Radio（单选）

| 分类 | 问题 | 说明 | 状态 |
|------|------|------|------|
| 缺少 | 默认值（defaultValue） | 所有表单组件都应能在属性面板配置默认值 | ✅ 已补充 |
| 缺少 | 横排/竖排（direction） | 目前选项默认横向排列，缺少竖排配置（通过 CSS flex-direction 实现） | ✅ 已补充类型和面板 |
| 不合理 | "选项类型"使用 Select | 只有 2 个选项（default/button），用 Button Group 更方便 | ✅ 已改为 ButtonGroup |
| 不合理 | "按钮样式"使用 Select | 只有 2 个选项（outline/solid），用 Button Group 更方便 | ✅ 已改为 ButtonGroup |

---

## 8. Checkbox（多选框）

| 分类 | 问题 | 说明 | 状态 |
|------|------|------|------|
| 缺少 | 默认值（defaultValue） | 所有表单组件都应能在属性面板配置默认值 | ✅ 已补充（提示多个值用逗号分隔） |
| 缺少 | 横排/竖排（direction） | 目前选项默认横向排列，缺少竖排配置（通过 CSS flex-direction 实现） | ✅ 已补充类型和面板 |

---

## 9. Switch（开关）

| 分类 | 问题 | 说明 | 状态 |
|------|------|------|------|
| 缺少 | 默认值（defaultValue） | 所有表单组件都应能在属性面板配置默认值 —— 注意：Switch 的 defaultValue 是 boolean，当前属性面板有"默认选中"Checkbox，但此配置写入了 defaultValue 字段，用法正确但命名不够直观 | ✅ 已有（保持"默认选中"命名） |
| 不合理 | "尺寸"使用 Select | 只有 2 个选项（default/small），用 Button Group 更方便 | ✅ 已改为 ButtonGroup |

---

## 10. Slider（滑块）

| 分类 | 问题 | 说明 | 状态 |
|------|------|------|------|
| 缺少 | 默认值（defaultValue） | 所有表单组件都应能在属性面板配置默认值 | ✅ 已补充（字符串输入，支持 number 和 [number,number]） |
| 缺少 | tooltip 配置 | 类型定义了 `tooltip.formatter`，属性面板未暴露 | ✅ 已补充 |

---

## 11. Rate（评分）

| 分类 | 问题 | 说明 | 状态 |
|------|------|------|------|
| 缺少 | 默认值（defaultValue） | 所有表单组件都应能在属性面板配置默认值 | ✅ 已补充 |
| 缺少 | tooltips（提示文字） | 类型定义了 `tooltips`，属性面板未暴露，antd 适配层已支持 | ✅ 已补充（逗号分隔输入） |

---

## 12. DatePicker（日期）

| 分类 | 问题 | 说明 | 状态 |
|------|------|------|------|
| 缺少 | 默认值（defaultValue） | 所有表单组件都应能在属性面板配置默认值 | ✅ 已补充 |
| 缺少 | 占位文本（placeholder） | 类型定义了但属性面板未暴露 | ✅ 已补充 |
| 缺少 | 最小值（minDate） | 应支持相对日期预设：今日、昨天、明天、上周、下周、上月、下月 | ✅ 已补充（Select 选项含"不限"） |
| 缺少 | 最大值（maxDate） | 同上，应支持相对日期预设 | ✅ 已补充 |

---

## 13. TimePicker（时间）

| 分类 | 问题 | 说明 | 状态 |
|------|------|------|------|
| 缺少 | 独立的属性面板 | 当前复用 DatePickerPropsRender | ✅ 已创建独立 TimePickerPropsRender |
| ❌ 错误 | 格式（format）默认值错误 | 格式应默认为 **HH:mm** | ✅ 已修正为 HH:mm |
| 缺少 | 分钟步长（minuteStep） | 类型定义了但属性面板未暴露 | ✅ 已补充 |
| 缺少 | 秒步长（secondStep） | 类型定义了但属性面板未暴露 | ✅ 已补充 |
| 缺少 | 默认值（defaultValue） | 所有表单组件都应能在属性面板配置默认值 | ✅ 已补充（Code Review 后追加） |
| 缺少 | 占位文本（placeholder） | 类型定义了但属性面板未暴露 | ✅ 已补充 |
| 缺少 | 允许清除（allowClear） | 未在面板暴露 | ✅ 已补充 |

> TimePickerProps 当前定义在 `component-props.ts` 中，非独立 `components/time-picker/types.ts`。如需要可后续迁移。

---

## 14. DateTime（日期时间）

| 分类 | 问题 | 说明 | 状态 |
|------|------|------|------|
| 缺少 | 独立的属性面板 | 当前复用 DatePickerPropsRender | ✅ 已创建独立 DateTimePropsRender |
| ❌ 错误 | 格式（format）默认值错误 | 格式应默认为 **YYYY-MM-DD HH:mm** | ✅ 已修正为 YYYY-MM-DD HH:mm |
| 缺少 | 默认值（defaultValue） | 所有表单组件都应能在属性面板配置默认值 | ✅ 已补充（Code Review 后追加） |
| 缺少 | 占位文本（placeholder） | 类型定义了但属性面板未暴露 | ✅ 已补充 |
| 缺少 | 允许清除（allowClear） | 未在面板暴露 | ✅ 已补充 |

---

## 15. DateRange（日期范围）

| 分类 | 问题 | 说明 | 状态 |
|------|------|------|------|
| 缺少 | 独立的属性面板 | 当前复用 DatePickerPropsRender | ✅ 已创建独立 DateRangePropsRender |
| 缺少 | 允许清除（allowClear） | antd 适配层已支持，属性面板未暴露 | ✅ 已补充 |
| 缺少 | 占位文本（placeholder） | 类型定义了 `[string, string]` 但属性面板未暴露 | ✅ 已补充（开始/结束分别输入） |
| 缺少 | 默认值（defaultValue） | 所有表单组件都应能在属性面板配置默认值 | ✅ 已补充（Code Review 后追加） |
| 不一致 | 继承链问题 | DateRangeProps 继承 BaseComponentProps 而非 BaseFormComponentProps | ✅ 已改为 `Omit<BaseFormComponentProps, 'placeholder'>` |

---

## 16. Upload（上传）

| 分类 | 问题 | 说明 | 状态 |
|------|------|------|------|
| 缺少 | 上传地址（action） | 最核心的属性，类型定义了但属性面板未暴露 | ✅ 已补充 |
| 缺少 | 默认值（defaultValue） | 所有表单组件都应能在属性面板配置默认值 | ✅ 已补充 |
| 缺少 | 文件夹上传（directory） | 类型定义了但属性面板未暴露，antd 适配层已支持 | ✅ 已补充 |
| 缺少 | 上传前置处理（beforeUpload） | 类型定义了但属性面板未暴露，antd 适配层已支持 | ✅ 已补充 |

---

## 17. Text（文本展示）

| 分类 | 问题 | 说明 | 状态 |
|------|------|------|------|
| 缺少 | 字号（fontSize） | 文本组件应能配置字号大小 | ✅ 已补充类型和面板 |
| 缺少 | 颜色（color） | 应能配置文字颜色 | ✅ 已补充类型和面板 |
| 缺少 | 对齐方式（textAlign） | 应能配置左/中/右对齐 | ✅ 已补充类型和面板（ButtonGroup） |
| 缺少 | 键盘样式（keyboard） | 类型定义了 `keyboard` 但属性面板未暴露 | ✅ 已补充面板 |
| 不合理 | "类型"使用 Select | 5 个选项（secondary/success/warning/danger），用 Button Group 更方便 | ✅ 已改为 ButtonGroup |

---

## 18. Title（标题）

| 分类 | 问题 | 说明 | 状态 |
|------|------|------|------|
| 缺少 | 对齐方式（textAlign） | 标题应能配置对齐方式 | ✅ 已补充类型和面板（ButtonGroup） |
| 缺少 | 颜色（color） | 应能配置文字颜色 | ✅ 已补充类型和面板 |
| 不合理 | "级别"使用 Select | 5 个选项（H1-H5），用 Button Group 更方便 | ✅ 已改为 ButtonGroup |

---

## 19. Image（图片展示）

| 分类 | 问题 | 说明 | 状态 |
|------|------|------|------|
| 缺少 | 圆角（borderRadius） | 图片应能配置圆角大小 | ✅ 已补充类型和面板 |

当前已有：地址、替代文本、宽高（支持数字和百分比）、可预览 —— 覆盖合理。

---

## 20. Divider（分割线）

| 分类 | 问题 | 说明 | 状态 |
|------|------|------|------|
| 缺少 | 颜色（color） | 应能配置分割线颜色 | ✅ 已补充类型和面板 |
| 缺少 | 粗细（thickness） | 应能配置分割线粗细 | ✅ 已补充类型和面板 |
| 不合理 | "方向"使用 Select | 只有 2 个选项（horizontal/vertical），用 Button Group 更方便 | ✅ 已改为 ButtonGroup |
| 不合理 | "文字位置"使用 Select | 只有 3 个选项（center/left/right），用 Button Group 更方便 | ✅ 已改为 ButtonGroup |

---

## 21. Container（容器）

| 分类 | 问题 | 说明 | 状态 |
|------|------|------|------|
| 缺少 | 内边距（padding） | BaseLayoutComponentProps 定义了但属性面板未暴露 | ✅ 已补充 |
| 缺少 | 外边距（margin） | BaseLayoutComponentProps 定义了但属性面板未暴露 | ✅ 已补充 |
| 缺少 | 间距（gap） | BaseLayoutComponentProps 定义了但属性面板未暴露 | ✅ 已补充 |
| 不合理 | "布局方向"使用 Select | 只有 2 个选项（vertical/horizontal），用 Button Group 更方便 | ✅ 已改为 ButtonGroup |

---

## 22. Flex（弹性布局）

| 分类 | 问题 | 说明 | 状态 |
|------|------|------|------|
| 缺少 | 内边距（padding） | BaseLayoutComponentProps 定义了但属性面板未暴露（同 Container） | ✅ 已补充 |
| 缺少 | 外边距（margin） | BaseLayoutComponentProps 定义了但属性面板未暴露（同 Container） | ✅ 已补充 |
| 缺少 | 间距（gap） | 当前已暴露 gap 为 NumberInput | ✅ 已有 |
| 缺少 | 换行方式（wrap） | 类型定义了 'nowrap' / 'wrap' / 'wrap-reverse' 但属性面板未暴露 | ✅ 已补充（Select） |
| 不合理 | "方向"使用 Select | 4 个选项，用 Button Group 更方便 | ✅ 已改为 ButtonGroup |

---

## 23. Grid（栅格布局）

| 分类 | 问题 | 说明 | 状态 |
|------|------|------|------|
| 缺少 | 内边距（padding） | BaseLayoutComponentProps 定义了但属性面板未暴露（同 Container） | ✅ 已补充 |
| 缺少 | 外边距（margin） | BaseLayoutComponentProps 定义了但属性面板未暴露（同 Container） | ✅ 已补充 |
| 缺少 | 间距（gap） | 当前已暴露 gap 为 NumberInput | ✅ 已有 |
| 缺少 | 布局模式（variant） | 类型定义了 'grid' / 'flex' 两种模式但属性面板未暴露 | ✅ 已补充（Code Review 修复 layoutMode→variant 名称对齐） |

---

## 24. Collapse（折叠面板）

| 分类 | 问题 | 说明 | 状态 |
|------|------|------|------|
| 缺少 | 面板项数据编辑器 | 需要有类似 OptionsEditor 的多面板编辑器，配置每个面板的 key/header/children | ⏳ 待实现（需设计面板项数据模型） |
| 缺少 | 默认展开 key（defaultActiveKey） | 类型定义了 `defaultActiveKey` 但属性面板未暴露 | ✅ 已补充 |
| 已有 | 手风琴模式 | 属性面板已有 accordion 配置 | ✅ 已有 |

---

## 25. Tabs（标签页）

| 分类 | 问题 | 说明 | 状态 |
|------|------|------|------|
| 缺少 | 标签项数据编辑器 | 与 Collapse 类似，需要有配置每个标签页标题和内容的编辑器 | ⏳ 待实现 |
| 不合理 | 样式类型/尺寸/标签位置使用 Select | 3~4 个选项，用 Button Group 更方便 | ✅ 已改为 ButtonGroup |

当前已有：样式类型、尺寸、标签位置、居中展示 —— 覆盖正确。

---

## 跨组件共性问题

### 问题 A：所有表单组件缺少"默认值"配置 ✅ 已全量修复

所有继承 `BaseFormComponentProps` 的组件均已在属性面板补充 `defaultValue` 配置。

| 组件 | defaultValue 类型 | 修复方式 |
|------|------------------|----------|
| Input | string | Input |
| TextArea | string | Input |
| InputNumber | number | NumberInput |
| Password | string | Input（独立面板） |
| Select | string/string[] | Input（提示多选用逗号分隔） |
| Radio | string | Input |
| Checkbox | string[] | Input（提示多个值用逗号分隔） |
| Switch | boolean | 已有"默认选中"Checkbox（用法正确） |
| Slider | number/[number,number] | Input（字符串输入） |
| Rate | number | NumberInput |
| DatePicker | string | Input |
| DateTime | string | Input（独立面板） |
| TimePicker | string | Input（独立面板） |
| DateRange | string[] | Input（独立面板） |
| Upload | string[] | Input |

### 问题 B：PropertyPanel 对非表单组件显示不必要的属性 ✅ 已修复

[PropertyPanel.tsx](file:///d:/Repos/form_engine/packages/core/src/designer/PropertyPanel.tsx#L63-L83) 中已按类别区分：

| 类别 | 显示属性 |
|------|----------|
| form | name, label, placeholder, colSpan |
| display | name（仅） |
| container | name（仅） |
| button | 不显示 name 和 colSpan |

### 问题 C：Select → Button Group 改造清单 ✅ 已全量完成

| 组件 | 属性 | 选项数 | 状态 |
|------|------|--------|------|
| Button | 按钮类型 (type) | 5 | ✅ ButtonGroup |
| Button | HTML 类型 (htmlType) | 3 | ✅ ButtonGroup |
| Input | 输入类型 (type) | 4（移除 password） | ✅ ButtonGroup |
| Radio | 选项类型 (optionType) | 2 | ✅ ButtonGroup |
| Radio | 按钮样式 (buttonStyle) | 2 | ✅ ButtonGroup |
| Switch | 尺寸 (size) | 2 | ✅ ButtonGroup |
| Text | 类型 (type) | 5 | ✅ ButtonGroup |
| Title | 级别 (level) | 5 | ✅ ButtonGroup |
| Divider | 方向 (type) | 2 | ✅ ButtonGroup |
| Divider | 文字位置 (orientation) | 3 | ✅ ButtonGroup |
| Container | 布局方向 (layout) | 2 | ✅ ButtonGroup |
| Flex | 方向 (direction) | 4 | ✅ ButtonGroup |
| Tabs | 样式类型 (type) | 3 | ✅ ButtonGroup |
| Tabs | 尺寸 (size) | 3 | ✅ ButtonGroup |
| Tabs | 标签位置 (tabPosition) | 4 | ✅ ButtonGroup |

### 问题 D：Time / DateTime / DateRange 缺少独立属性面板 ✅ 已全量修复

三个类型已各自拥有独立属性面板：

| 类型 | 面板 | 默认格式 | 核心属性 |
|------|------|---------|---------|
| **time** | TimePickerPropsRender | HH:mm | format/minuteStep/secondStep/placeholder/allowClear/defaultValue |
| **datetime** | DateTimePropsRender | YYYY-MM-DD HH:mm | format/picker/placeholder/allowClear/defaultValue |
| **date-range** | DateRangePropsRender | YYYY-MM-DD | format/picker/showTime/placeholder(start/end)/allowClear/defaultValue |

### 问题 E：Radio / Checkbox 缺少"横排/竖排"配置 ✅ 已修复

- 已为 Radio 和 Checkbox 类型添加 `direction?: 'horizontal' | 'vertical'`
- 属性面板使用 ButtonGroup 提供"横向/竖向"选项

### 问题 F：Date 缺少"最小值/最大值"配置 ✅ 已修复

- 已为 DatePickerProps 添加 `minDate?: string` 和 `maxDate?: string`
- 属性面板使用 Select 提供相对日期预设：不限/今日/昨天/明天/上周/下周/上月/下月

### 问题 G：Upload 缺失核心属性 ✅ 已修复

Upload 属性面板已补充：**上传地址（action）**、默认值、文件夹上传、上传前置处理。

### 问题 H：antd 与 antd-mobile 适配层差异分析

(保持观察，适配层不在此次修复范围内)

| 组件 | antd 已支持 | antd-mobile 已支持 | 属性面板缺失 | 面板状态 |
|------|-------------|-------------------|-------------|---------|
| Input | suffix, addonBefore, addonAfter, autoComplete | 基础输入 | suffix, addonBefore, addonAfter | ✅ 已补齐 |
| InputNumber | decimalSeparator, formatter, parser | 步进器(Stepper) | decimalSeparator | ✅ 已补齐 |
| Select | filterOption, placement, onSearch, notFoundContent | Picker 弹窗 | notFoundContent | ✅ 已补齐 |
| DatePicker | format, showTime, picker, disabledDate | DatePicker 弹窗 | minDate, maxDate, placeholder | ✅ 已补齐 |
| DateRangePicker | format, showTime, picker, allowClear, disabledDate | 两个独立 DatePicker | allowClear, placeholder | ✅ 已补齐（独立面板） |
| TimePicker | format, allowClear, minuteStep, secondStep（`HH:mm:ss`） | 自定义 Picker（15分钟步长） | 独立面板, minuteStep, secondStep | ✅ 已补齐（独立面板） |
| Upload | action, accept, maxCount, listType, directory, beforeUpload | ImageUploader（仅图片） | action, directory | ✅ 已补齐 |
| Radio | optionType, buttonStyle | 基础单选 | direction(横排/竖排) | ✅ 已补齐 |
| Checkbox | 基础多选 | 基础多选 | direction(横排/竖排) | ✅ 已补齐 |
| Switch | checkedChildren, unCheckedChildren | 基础开关 | — | — |
| Slider | marks, dots, included, tooltip, vertical | 基础滑块 | tooltip | ✅ 已补齐 |
| Rate | count, allowHalf, character, tooltips | 基础评分 | tooltips | ✅ 已补齐 |

### 问题 I：Cascader / TreeSelect 无属性面板实现 ✅ 已修复

| 组件 | 状态 | 说明 |
|------|------|------|
| Cascader | ✅ 已实现 | 新建 `components/cascader/` 目录，含 types.ts + Props.tsx，已注册 PropsRenderMap |
| TreeSelect | ✅ 已实现 | 新建 `components/tree-select/` 目录，含 types.ts + Props.tsx，已注册 PropsRenderMap |

### 问题 J：Flex / Grid 也缺失 padding/margin/gap 配置 ✅ 已修复

| 组件 | padding | margin | gap |
|------|---------|--------|-----|
| Container | ✅ 已补充 | ✅ 已补充 | ✅ 已补充 |
| Flex | ✅ 已补充 | ✅ 已补充 | ✅ 已有 |
| Grid | ✅ 已补充 | ✅ 已补充 | ✅ 已有 |

---

## 新增基础设施

| 项目 | 说明 |
|------|------|
| **ButtonGroup widget** | 新建 `widgets/ButtonGroup.tsx`，支持选项平铺选择（替代 Select） |
| **DesignerWidgets 接口** | 新增 `ButtonGroup` 字段 |
| **Password 独立面板** | 新建 `components/password/Props.tsx`，含 visibilityToggle |
| **独立面板** | 新建 5 个：TimePicker / DateTime / DateRange / Cascader / TreeSelect |
| **PropertyPanel 分类控制** | 根据 componentCategory 控制 name 和 colSpan 显示 |
| **Grid 属性命名修正** | Code Review 修复 layoutMode → variant |
| **index.ts 导出补充** | Code Review 补充 CollapseProps/TabsProps/CascaderProps/TreeSelectProps/TimePickerProps |

---

## 后续待办

- [ ] Collapse 面板项数据编辑器（类似 OptionsEditor，配置多个面板的 key/header/children）
- [ ] Tabs 标签项数据编辑器（类似 OptionsEditor，配置多个标签页的标题和内容）
- [ ] 统一 Props.tsx 导入风格（`../../propRenders` vs `../../propRenders/shared` + `../../propRenders/types`）

---

## 运行时问题修复记录

### 问题 1：Radio/Checkbox 横排竖排不生效 ✅ 已修复

**现象**：属性面板中切换 Radio/Checkbox 的 "横排/竖排" 选项，画布预览无变化。

**根因**：antd 适配层的 Radio/Checkbox 组件未接收并应用 `direction` 属性。

**修复**：
- `packages/adapter-antd/src/components/Radio.tsx`：添加 `direction` 参数，通过 `flexDirection: direction === 'vertical' ? 'column' : undefined` 控制排列方向
- `packages/adapter-antd/src/components/Checkbox.tsx`：同上修复

### 问题 2：属性值变更导致无限刷新卡死 ✅ 已修复

**现象**：在属性面板中修改某些属性（如下拉框模式、数字输入值等），界面卡死，CPU 飙升。

**根因**：Props 渲染中的 `w.Select` `options` 使用内联数组（每次渲染创建新引用），触发子组件不必要的重渲染；部分 NumberInput 在 `value=undefined` 且 `min=0` 时触发 onChange 修正，形成渲染循环。

**修复**：
- 将所有 `w.Select` 的内联 `options` 提取为模块级常量（`MODE_OPTIONS`、`JUSTIFY_OPTIONS`、`ALIGN_OPTIONS`、`PICKER_OPTIONS`、`LIST_TYPE_OPTIONS`）
- `select/Props.tsx`：`mode` 的 `onChange` 保持空字符串而非转为 `undefined`，避免 `<select>` 浏览器自动修正触发二次 onChange

涉及文件：
- `select/Props.tsx` (MODE_OPTIONS)
- `flex/Props.tsx` (JUSTIFY_OPTIONS, ALIGN_OPTIONS)
- `date-picker/Props.tsx` (PICKER_OPTIONS)
- `upload/UploadPropsRender.tsx` (LIST_TYPE_OPTIONS)

### 问题 3：日期控件提示"未知字段类型" ✅ 已修复

**现象**：Date/Time/DateTime/DateRange 四个日期控件拖入画布时提示"未知字段类型"。

**根因**：`antdComponents` 中仅注册了 PascalCase 组件名（如 `DatePicker`、`TimePicker`），而 `FieldRenderer` 使用 `field.type` 的小写命名（如 `date`、`time`）查找组件，未找到匹配。

**修复**：在 `antdComponents` 中添加小写类型别名映射：

| 别名 | 映射组件 |
|------|---------|
| `'date'` | DatePicker |
| `'time'` | TimePicker |
| `'datetime'` | DatePicker |
| `'date-range'` | DateRangePicker |

### 问题 4：属性输入框样式不一致 ✅ 已确认无问题

**现象**：部分属性输入框使用普通原生 `<input>`，部分使用带样式的输入框。

**调查结论**：所有 `Props.tsx` 中的输入框均统一使用 `w.Input`（核心包的 `WidgetInput` 组件），该组件应用统一的基本样式（`BASE_STYLE`）。不存在混合使用原生 `<input>` 的情况。