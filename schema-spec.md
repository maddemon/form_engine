# Form Engine Schema 协议规范 v0.1

> 目标：一套框架无关的 JSON Schema 协议，驱动表单设计器、渲染器和代码生成。
> 定位：**纯表单引擎**，不碰页面级 state 和数据源执行，这些交给使用者。

---

## 设计原则

1. **框架无关**：Schema 本身不包含 React/Vue 特有概念
2. **AI 友好**：字段命名贴近 Ant Design / Element Plus，便于 AI 生成
3. **可扩展**：支持自定义组件、自定义数据源编辑器
4. **设计器优先**：支持 mock 数据，设计器里能正常预览
5. **最小侵入**：数据源只存配置，不存数据；执行逻辑完全由使用者控制

---

## 完整结构

```jsonc
{
  // ===== 元信息 =====
  "version": "0.1",
  "id": "form_xxx",
  "name": "用户表单",
  "description": "",

  // ===== 表单级配置 =====
  "form": {
    "layout": "vertical",        // horizontal | vertical | inline
    "labelCol": { "span": 6 },  // layout=horizontal 时生效
    "wrapperCol": { "span": 18 },
    "colon": true,
    "size": "middle",           // small | middle | large
    "disabled": false,
    "autoComplete": "off",
    "labelAlign": "right",       // left | right
    "requiredMark": true         // 是否显示必填标记
  },

  // ===== 字段定义 =====
  "fields": [
    {
      // --- 基础标识 ---
      "id": "field_username",    // 唯一标识，设计器自动生成
      "name": "username",        // 字段名，对应数据路径
      "type": "input",           // 内置类型（见下方类型表）
      "label": "用户名",
      "placeholder": "请输入用户名",
      "tooltip": "",              // label 旁的提示文字
      "defaultValue": "",

      // --- 显示控制 ---
      "hidden": false,            // 布尔值 或 表达式字符串
      "disabled": false,          // 布尔值 或 表达式字符串
      "readOnly": false,

      // --- 布局 ---
      "colSpan": 24,             // 栅格占位（24 分栏）
      "order": 1,                // 排序权重
      "newline": false,          // 是否强制换行

      // --- 校验规则 ---
      "rules": [
        { "required": true, "message": "用户名不能为空" },
        { "min": 3, "max": 20, "message": "长度 3-20 个字符" },
        { "pattern": "^[a-zA-Z0-9_]+$", "message": "仅支持字母数字下划线" },
        { "type": "email", "message": "邮箱格式不正确" }
      ],

      // --- 联动表达式（简单场景，AI 友好）---
      "visibleWhen": null,        // 快捷写法：有值就显示字段名
                                   // 或声明式：{ "department": ["tech"] }
      "requiredWhen": null,       // 同理，满足条件时必填

      // --- 联动表达式（复杂场景兜底）---
      "visibleIfExpr": "",        // JS 表达式，上下文含 form / field
      "requiredIfExpr": "",
      "disabledIfExpr": "",

      // --- 组件特有 props（透传给底层 UI 组件）---
      "componentProps": {
        "maxLength": 20,
        "allowClear": true,
        "showSearch": true
      },

      // --- 数据源（下拉框、级联等需要 options 的组件）---
      "dataSource": {
        "type": "static",        // static | remote
        "static": {
          "options": [
            { "label": "管理员", "value": "admin" },
            { "label": "普通用户", "value": "user" }
          ]
        },
        "remote": {
          "config": {
            "url": "/api/users?dept={deptId}",
            "method": "GET",
            "dependencies": ["deptId"],
            "requiredDeps": ["deptId"],  // 这些依赖有值才发请求
            "labelField": "name",
            "valueField": "id",
            "resultPath": "data.list",    // 从响应中提取数据的路径
            "skipEmpty": true             // 空值参数不从 URL 中移除
          }
        }
      },

      // --- 自定义组件（type=custom 时必填）---
      "custom": {
        "source": "registry",     // registry | remote | inline
        "componentId": "MyUpload",// source=registry：注册的组件名
        "code": "",               // source=inline：内联 JSX 代码（开发阶段）
        "language": "tsx",       // jsx | tsx
        "dependencies": []        // 代码依赖的 npm 包
      },

      // --- 模拟数据（仅设计器使用，运行时忽略）---
      "mock": {
        "formValue": "test_user", // 模拟的字段值
        "options": [              // 模拟的 options（设计器预览用）
          { "label": "选项1", "value": "a" }
        ]
      }
    }
  ],

  // ===== 提交配置 =====
  "submit": {
    "text": "提交",
    "align": "left",             // left | center | right
    "resetText": "重置",
    "showReset": true
  },

  // ===== 自定义组件注册表（供设计器使用）=====
  "componentRegistry": {
    "MyUpload": {
      "displayName": "自定义上传",
      "icon": "UploadOutlined",
      "props": {
        "maxCount": { "type": "number", "default": 5 },
        "accept": { "type": "string", "default": ".png,.jpg" }
      }
    }
  }
}
```

---

## 内置字段类型表

| type 值 | 说明 | 常用 componentProps |
|---------|------|-------------------|
| `input` | 文本输入 | `maxLength`, `prefix`, `suffix` |
| `input-number` | 数字输入 | `min`, `max`, `step` |
| `textarea` | 多行文本 | `rows`, `maxLength` |
| `password` | 密码输入 | `visibilityToggle` |
| `select` | 下拉选择 | `showSearch`, `allowClear`, `mode` |
| `multi-select` | 多选 | `maxTagCount` |
| `radio` | 单选组 | `options`, `buttonStyle` |
| `checkbox` | 多选框 | `options` |
| `switch` | 开关 | `checkedChildren`, `unCheckedChildren` |
| `slider` | 滑块 | `min`, `max`, `marks` |
| `date` | 日期 | `format`, `showTime` |
| `date-range` | 日期范围 | `format` |
| `time` | 时间 | `format` |
| `upload` | 文件上传 | `maxCount`, `accept`, `listType` |
| `rate` | 评分 | `count`, `allowHalf` |
| `cascader` | 级联选择 | `showSearch` |
| `tree-select` | 树选择 | `treeData`, `multiple` |
| `custom` | 自定义组件 | — |

---

## 联动逻辑详细说明

### 优先级

`visibleIfExpr` > `visibleWhen` > `hidden`（布尔值）

### visibleWhen / requiredWhen 两种写法

```jsonc
// 写法 1：快捷（AI 最容易生成）
"visibleWhen": "deptId",              // deptId 有值就显示

// 写法 2：声明式
"visibleWhen": {
  "department": ["tech", "dev"],     // department 等于其中任一值
  "status": "active"
},

// 写法 3：表达式（复杂逻辑兜底）
"visibleIfExpr": "department === 'tech' && level > 3"
```

### 表达式上下文

表达式执行时注入的变量：

```ts
const context = {
  form,           // 整个表单的当前值
  field,          // 当前字段的值
  ...formValues   // 展开，可直接写 department（等于 form.department）
}
```

示例：
```json
"visibleIfExpr": "department === 'tech' && status !== 'leave'"
```

---

## 数据源设计

### 设计原则

- **Schema 只存配置，不存数据**
- **数据源的解析完全由使用者控制**（通过 `dataSourceResolver`）
- **设计器里的数据源编辑 UI 由使用者传入**（通过 `dataSourceEditor` ReactNode）

### 使用者在渲染时传入 resolver

```tsx
import { FormRender } from '@form-engine/react'

const dataSourceResolver = async (config, context) => {
  // config = dataSource.remote.config
  // context = { formValues, fieldName }
  
  if (config.url) {
    const url = replaceVars(config.url, context.formValues)
    const res = await fetch(url)
    const data = get(config.resultPath, res)
    return data.map(item => ({
      label: item[config.labelField],
      value: item[config.valueField]
    }))
  }
}

<FormRender
  schema={schema}
  dataSourceResolver={dataSourceResolver}
/>
```

### 设计器里传入数据源编辑器

```tsx
import { FormDesigner } from '@form-engine/react'

const MyDataSourceEditor = ({ config, onChange, field, formSchema }) => (
  <div>
    <Input
      label="接口地址"
      value={config.url}
      onChange={url => onChange({ ...config, url })}
    />
    <Select
      label="依赖字段"
      value={config.dependencies}
      onChange={deps => onChange({ ...config, dependencies: deps })}
      mode="multiple"
    />
    <Button onClick={() => testFetch(config)}>测试请求</Button>
  </div>
)

<FormDesigner
  schema={schema}
  dataSourceEditor={<MyDataSourceEditor />}
  mockValues={{ deptId: 'tech' }}   // 设计器里的模拟值
/>
```

### requiredDeps 机制

```json
"remote": {
  "config": {
    "url": "/api/cities?province={province}",
    "requiredDeps": ["province"]   // province 有值才发请求
  }
}
```

渲染器逻辑：
```ts
function shouldFetch(config, formValues) {
  return config.requiredDeps?.every(dep => getNested(formValues, dep) != null)
}
```

---

## 模拟数据（mock）

设计器专属，运行时忽略。

```json
{
  "name": "city",
  "type": "select",
  "dataSource": { "type": "remote", "remote": { ... } },
  "mock": {
    "formValue": "bj",              // 模拟字段值（设计器里表单填充用）
    "options": [                    // 模拟 options（设计器预览用）
      { "label": "北京", "value": "bj" },
      { "label": "上海", "value": "sh" }
    ]
  }
}
```

设计器行为：
- `dataSource.type = "remote"` 且有 `mock.options` → 直接用 mock.options 渲染，不发请求
- 使用者可点"从接口响应填充"把真实返回存为 mock

---

## 自定义组件

### 三种来源

| source | 说明 | 使用场景 |
|--------|------|---------|
| `registry` | 开发阶段注册到渲染器 | 生产环境推荐 |
| `remote` | 代码存在后端，运行时 babel 编译 | 低代码平台场景 |
| `inline` | 代码内联在 Schema 里 | 仅设计器开发阶段 |

### registry 用法

```tsx
import { FormRender } from '@form-engine/react'

const customComponents = {
  MyUpload: MyUploadComponent,
  RichText: RichTextComponent,
}

<FormRender
  schema={schema}
  components={customComponents}
/>
```

Schema 引用：
```json
{
  "type": "custom",
  "custom": {
    "source": "registry",
    "componentId": "MyUpload"
  }
}
```

---

## 校验规则完整定义

```ts
type Rule = {
  // 基础
  required?: boolean
  message?: string

  // 长度
  min?: number
  max?: number
  len?: number

  // 正则（字符串形式，渲染器转 RegExp）
  pattern?: string

  // 类型校验
  type?: 'string' | 'number' | 'boolean' | 'url' | 'email' | 'phone'

  // 自定义校验（字符串形式，remote/inline 时由渲染器执行）
  validator?: string
  // 示例："async ({ value }) => value > 0 ? Promise.resolve() : Promise.reject('必须大于0')"
}
```

---

## AI 生成友好设计

### 约定

1. **字段名对齐 Ant Design Form Item**：`name`、`label`、`rules`、`placeholder`
2. **type 使用 kebab-case**，与 Ant Design 组件名对应
3. **rules 支持简写**：`"required": true` 等价于完整 rule 对象
4. **不强制写 `id`**：AI 生成时可省略，设计器打开时自动补全
5. **visibleWhen 优先用快捷写法**：AI 准确率最高

### AI 生成示例

**Prompt**：
> 生成一个用户表单，包含用户名（必填、3-20字符）、角色（下拉选择管理员/普通用户）、备注（多行文本）

**生成的 Schema**：
```json
{
  "version": "0.1",
  "form": { "layout": "vertical" },
  "fields": [
    {
      "name": "username",
      "type": "input",
      "label": "用户名",
      "rules": [
        { "required": true, "message": "用户名不能为空" },
        { "min": 3, "max": 20, "message": "长度 3-20 个字符" }
      ]
    },
    {
      "name": "role",
      "type": "select",
      "label": "角色",
      "dataSource": {
        "type": "static",
        "static": {
          "options": [
            { "label": "管理员", "value": "admin" },
            { "label": "普通用户", "value": "user" }
          ]
        }
      }
    },
    {
      "name": "remark",
      "type": "textarea",
      "label": "备注"
    }
  ]
}
```

---

## 版本与兼容性

- `version` 字段标识 Schema 协议版本
- 渲染器向下兼容至少一个大版本
- 设计器保存时自动升级旧版 Schema

---

## 待讨论

- [ ] 子表单 / 数组字段（`type: "array"` / `"object"`）
- [ ] 表单分步骤（Wizard 模式）
- [ ] 事件系统（`onChange` / `onSubmit` 前的拦截）
- [ ] 国际化（`label` / `message` 支持 i18n key）
- [ ] 字段分组 / 折叠面板
- [ ] 表单网格布局（更精细的 colSpan / rowSpan）
