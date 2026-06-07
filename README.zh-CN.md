[English](./README.md)

# Form Engine

一套轻量、Schema 驱动的 React 表单引擎，提供可视化设计器与多场景渲染能力。

**[在线演示](https://maddemon.github.io/form_engine/)**

## 特性

- **可视化设计器** — 拖拽构建表单，支持撤销/重做、容器嵌套、实时预览
- **双场景渲染** — Desktop / Mobile 双适配器，一份 Schema 跨设备运行
- **25+ 内置组件** — Input、Select、DatePicker、Upload、Grid、Tabs、Collapse、Card 等
- **4 大组件分类** — 表单输入、展示、容器、按钮
- **自定义组件** — 通过 `registerSimpleCustomComponent` 或 `registerCustomComponent` 注册任意 React 组件
- **容器嵌套** — 栅格、折叠面板、标签页、卡片支持子字段递归渲染
- **事件系统** — 表达式、预定义动作、回调函数三种事件处理器，支持 `$self` / `$form` 上下文
- **数据源** — 静态选项或远程 API，依赖字段变化自动刷新，支持缓存
- **表单校验** — 内置必填/正则/自定义校验规则，支持联动校验
- **主题系统** — Light / Dark / System 三档模式，紧凑尺寸，CSS 变量注入，antd 联动

## 快速上手

### 安装

```bash
npm install @form-engine/core @form-engine/adapter-antd antd
```

### 基本用法

```tsx
import { Designer } from '@form-engine/core'
import { antdAdapter } from '@form-engine/adapter-antd'
import { ConfigProvider, theme } from 'antd'

function App() {
  const [schema, setSchema] = useState(defaultSchema)

  return (
    <ConfigProvider theme={{
      algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
    }}>
      <Designer
        value={schema}
        onChange={setSchema}
        desktopAdapter={antdAdapter}
        themeMode="system"
      />
    </ConfigProvider>
  )
}
```

### 渲染表单

```tsx
import { FormRender } from '@form-engine/core'
import { antdAdapter } from '@form-engine/adapter-antd'

function MyForm({ schema }) {
  const formRef = useRef<FormRenderHandle>(null)

  return (
    <>
      <FormRender
        ref={formRef}
        schema={schema}
        onSubmit={(values) => console.log(values)}
        desktopAdapter={antdAdapter}
        scene="desktop"
      />
      <Button onClick={() => formRef.current?.submit()}>提交</Button>
      <Button onClick={() => formRef.current?.reset()}>重置</Button>
    </>
  )
}
```

## 包

| 包 | 说明 |
|---|---|
| `@form-engine/core` | 核心类型、设计器、渲染器、主题系统 |
| `@form-engine/adapter-antd` | Ant Design 适配器（桌面端） |
| `@form-engine/adapter-antd-mobile` | Ant Design Mobile 适配器 |

## 开发

```bash
pnpm install
pnpm build          # 构建所有包
pnpm dev:example    # 启动演示应用
pnpm test           # 运行测试
pnpm lint           # 代码检查
```

## 许可证

MIT

---

> 沉舟侧畔千帆过，病树前头万木春。
>
> —— 刘禹锡《酬乐天扬州初逢席上见赠》
