[简体中文](./README.zh-CN.md)

# Form Engine

A lightweight, schema-driven React form engine with a visual designer and multi-scene rendering.

**[Live Demo](https://maddemon.github.io/form_engine/)**

## Features

- **Visual Designer** — Drag-and-drop form builder with undo/redo, nested containers, and real-time preview
- **Dual-Scene Rendering** — Desktop & Mobile adapters, one schema runs everywhere
- **25+ Built-in Components** — Input, Select, DatePicker, Upload, Grid, Tabs, Collapse, Card, and more
- **4 Component Categories** — Form, Display, Container, Button
- **Custom Components** — Register any React component via `registerSimpleCustomComponent` or `registerCustomComponent`
- **Container Nesting** — Grid, Collapse, Tabs, Card support child fields with recursive rendering
- **Event System** — Expression, action, and callback event handlers with `$self` / `$form` context
- **Data Source** — Static options or remote APIs with dependency auto-refresh and caching
- **Form Validation** — Built-in required/regex/custom rules with conditional validation
- **Theme System** — Light / Dark / System modes, compact size, CSS variable injection, antd integration

## Quick Start

### Install

```bash
npm install @form-engine/core @form-engine/antd antd
```

### Basic Usage

```tsx
import { Designer } from '@form-engine/core'
import { antdAdapter } from '@form-engine/antd'
import { ConfigProvider, theme } from 'antd'

function App() {
  const [schema, setSchema] = useState(defaultSchema)

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <Designer value={schema} onChange={setSchema} desktopAdapter={antdAdapter} themeMode="system" />
    </ConfigProvider>
  )
}
```

### Render a Form

```tsx
import { FormRender } from '@form-engine/core'
import { antdAdapter } from '@form-engine/antd'

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
      <Button onClick={() => formRef.current?.submit()}>Submit</Button>
      <Button onClick={() => formRef.current?.reset()}>Reset</Button>
    </>
  )
}
```

## Packages

| Package                    | Description                                  |
| -------------------------- | -------------------------------------------- |
| `@form-engine/core`        | Core types, designer, renderer, theme system |
| `@form-engine/antd`        | Ant Design adapter (desktop)                 |
| `@form-engine/antd-mobile` | Ant Design Mobile adapter                    |

## Development

```bash
pnpm install
pnpm build          # Build all packages
pnpm dev:example    # Start demo app
pnpm test           # Run tests
pnpm lint           # Lint
```

## License

MIT

---

> 沉舟侧畔千帆过，病树前头万木春。
>
> Beside the sunken boat a thousand sails glide past,
> Before the withered tree ten thousand blooms spring forth.
>
> — Liu Yuxi, _To Bai Juyi Met at the First Banquet in Yangzhou_
