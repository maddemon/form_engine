# 调色板组件默认数据方案

## 背景

当前大部分组件拖入画布时 `defaultProps` 为空 `{}`，导致用户每次都需要手动配置选项、文本等内容。本方案旨在为合适的组件预设合理的初始数据，提升使用体验。

## 实现方式

修改 `packages/core/src/designer/paletteData.ts` 中各组件 `defaultProps`。

拖入流程（`createFieldFromPalette`）会将 `defaultProps` 直接 spread 到 `FormFieldSchema` 上，因此：

- 选项类组件（select/radio/checkbox）：通过 `dataSource` 字段预设静态选项
- 按钮：通过 `componentProps` 传递 `children` 文本
- 其他属性：直接作用于 schema 顶层字段（如 `defaultValue`）或 `componentProps` 内的子属性

**关于 placeholder**：不预设默认值，应通过 label + 字段类型自动推导生成（例如 label="用户名"、type="input" → placeholder="请输入用户名"）。此项后续统一在渲染层实现。

## 各组件默认数据

### 1. 文本输入

| 组件     | 当前 defaultProps           | 目标 defaultProps |
| -------- | --------------------------- | ----------------- |
| input    | `{ placeholder: '请输入' }` | `{}`              |
| textarea | `{ placeholder: '请输入' }` | `{}`              |
| password | `{}`                        | `{}`              |

### 2. 数值

| 组件         | 当前 defaultProps | 目标 defaultProps                                   |
| ------------ | ----------------- | --------------------------------------------------- |
| input-number | `{}`              | `{}`                                                |
| slider       | `{}`              | `{ componentProps: { min: 0, max: 100, step: 1 } }` |
| rate         | `{}`              | `{ componentProps: { count: 5 } }`                  |

### 3. 选择（核心改动）

| 组件     | 当前 defaultProps         | 目标 defaultProps                                                                                                                                                                  |
| -------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| select   | `{}`                      | `{ dataSource: { type: 'static', static: { options: [ { label: '选项一', value: 'option1' }, { label: '选项二', value: 'option2' }, { label: '选项三', value: 'option3' } ] } } }` |
| radio    | `{}`                      | 同上                                                                                                                                                                               |
| checkbox | `{}`                      | 同上                                                                                                                                                                               |
| switch   | `{ defaultValue: false }` | 不变                                                                                                                                                                               |

### 4. 日期时间

| 组件       | 当前 defaultProps                        | 目标 defaultProps |
| ---------- | ---------------------------------------- | ----------------- |
| date       | `{}`                                     | 不变              |
| datetime   | `{ componentProps: { showTime: true } }` | 不变              |
| date-range | `{}`                                     | 不变              |
| time       | `{}`                                     | 不变              |

### 5. 布局

| 组件      | 当前 defaultProps | 目标 defaultProps                                                                                                                  |
| --------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| grid      | `{}`              | `{ componentProps: { columns: 2, gap: 16 } }`                                                                                      |
| flex      | `{}`              | `{ componentProps: { direction: 'horizontal', gap: 16 } }`                                                                         |
| container | `{}`              | 不变                                                                                                                               |
| collapse  | `{}`              | `{ children: [ { name: 'panel_1', type: 'collapse', label: '面板一' }, { name: 'panel_2', type: 'collapse', label: '面板二' } ] }` |
| tabs      | `{}`              | `{ children: [ { name: 'tab_1', type: 'tabs', label: '标签页一' }, { name: 'tab_2', type: 'tabs', label: '标签页二' } ] }`         |

### 6. 展示

| 组件    | 当前 defaultProps                                       | 目标 defaultProps                                  |
| ------- | ------------------------------------------------------- | -------------------------------------------------- |
| text    | `{}`                                                    | `{ componentProps: { content: '文本内容' } }`      |
| title   | `{ componentProps: { level: 1, content: '标题内容' } }` | 不变                                               |
| image   | `{}`                                                    | `{ componentProps: { alt: '图片描述', src: '' } }` |
| divider | `{}`                                                    | 不变                                               |

### 7. 其他

| 组件   | 当前 defaultProps | 目标 defaultProps                          |
| ------ | ----------------- | ------------------------------------------ |
| button | `{}`              | `{ componentProps: { children: '按钮' } }` |
| upload | `{}`              | 不变                                       |

## 注意事项

1. **dataSource 渲染链路已就绪**：`FormRender.loadDataSource` 已支持 `dataSource.type === 'static'` 的同步解析，选项数据会被存入 `fieldOptions` 并传给渲染组件。
2. **Button children 传递**：`FieldRenderer` 的 `fieldProps` 中已有 `...field.componentProps` 展开，因此 `componentProps: { children: '按钮' }` 会被正确传递到按钮渲染组件。
3. **选项值命名**：使用 `option1/option2/option3` 而非 `1/2/3`，避免与数字类型值混淆，且更语义化。
4. **collapse/tabs 子项**：children 中的 `name` 使用简短标识（`panel_1`、`tab_1`），保持唯一性即可，拖入后用户可按需重命名。
5. **图片 src 留空**：图片的 `src` 不预设值，由用户自行填写，避免无效加载。

## 实施步骤

1. 修改 `packages/core/src/designer/paletteData.ts`，按上表更新各组件的 `defaultProps`
2. 编译验证无类型错误
3. Code Review 确认方案合理性
