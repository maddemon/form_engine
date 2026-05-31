# Form Engine

A schema-driven form engine with adapter support for multiple UI libraries.

## Architecture

```
form-engine/
├── packages/
│   ├── core/              # 核心包（类型定义 + 默认 HTML 组件 + 设计器）
│   ├── adapter-antd/      # Antd 适配器
│   ├── adapter-antd-mobile/ # Antd Mobile 适配器
│   └── example/          # 示例项目
```

## Features

- **Schema 驱动**：通过 JSON Schema 定义表单
- **Adapter 模式**：支持多种 UI 库（antd、antd-mobile、material-ui 等）
- **默认 HTML 组件**：不安装任何 adapter 也能使用
- **设计器**：可视化表单设计器（即将完成）
- **多端适配**：支持 desktop/mobile 场景

## Usage

### 1. 默认使用（HTML 组件）

```typescript
import { FormRender } from '@form-engine/core'

const schema = {
  id: 'my-form',
  fields: [
    { type: 'Input', id: 'name', title: '姓名' }
  ]
}

<FormRender schema={schema} onSubmit={console.log} />
```

### 2. 使用 antd 组件

```typescript
// 导入 antd adapter（自动覆盖默认 HTML 组件）
import '@form-engine/adapter-antd'

// 然后使用相同的 schema
<FormRender schema={schema} onSubmit={console.log} />
```

## Development

```bash
# 安装依赖
pnpm install

# 启动示例项目
cd packages/example
pnpm dev

# 构建所有包
pnpm build
```

## License

MIT
