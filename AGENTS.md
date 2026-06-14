# AGENTS.md

本文件只保留**最关键的硬约束**与**仓库概览**。具体规则、Token 速查等见 [`.agents/rules/`](./.agents/rules/)。

## 禁止通过 AI Sandbox 执行 `git stash`

Trae IDE sandbox 中 `git stash` 会触发 sandbox bug 导致 `.git` 目录被删除。替代方案：使用 IDE 内置 Git 面板或在系统原生终端执行。

---

## CodeGraph（必须传 `projectPath`）

所有 CodeGraph MCP 工具调用**必须**传 `projectPath: "d:\\Repos\\form_engine"`（Windows 双反斜杠）。不传会报 `No CodeGraph project is loaded`。

详细使用见 [`.agents/rules/codegraph.md`](./.agents/rules/codegraph.md)。

---

## 仓库结构 & 命令速查

```text
packages/
  core/              @form-engine/core     — 类型、设计器、渲染器、主题系统（有测试）
  antd/      @form-engine/antd — 桌面端 antd v6 适配（无测试）
  antd-mobile/ @form-engine/antd-mobile — 移动端 antd-mobile v5（无测试）
example/             — 演示应用（`pnpm dev:example`）
```

| 命令                                         | 用途                                          |
| -------------------------------------------- | --------------------------------------------- |
| `pnpm dev`                                   | 构建所有包（watch 模式）                      |
| `pnpm dev:example`                           | 启动演示应用                                  |
| `pnpm build`                                 | `check:tokens` → 构建 core + 两个 adapter     |
| `pnpm test`                                  | `check:tokens` → 运行测试（仅 core 包有测试） |
| `pnpm test -- --run`                         | 单次运行 vitest（core）                       |
| `pnpm lint`                                  | ESLint v9 flat config 全量检查                |
| `pnpm lint:fix`                              | ESLint 自动修复                               |
| `pnpm check:tokens`                          | 扫描硬编码样式（接入 build/test）             |
| `pnpm --filter @form-engine/core test`       | 仅跑 core 包测试                              |
| `pnpm --filter @form-engine/core type-check` | 仅 core 包类型检查                            |

**命令顺序**：`pnpm lint` → `pnpm check:tokens` → `pnpm test`（`build` / `test` 已自动跑 `check:tokens`，无需显式执行）。

---

## 核心架构

### Adapter 模式

`@form-engine/core` 不捆绑 UI 库，通过 `FormEngineAdapter` 接口注入渲染能力：

```tsx
import { FormRender } from '@form-engine/core'
import { antdAdapter } from '@form-engine/antd'
import { antdMobileAdapter } from '@form-engine/antd-mobile'

// 显式选 adapter
;<FormRender schema={schema} adapter={scene === 'mobile' ? antdMobileAdapter : antdAdapter} />

// 或运行时自适应
const adapter = useAdaptiveAdapter(antdAdapter, antdMobileAdapter)
```

Adapter 是**纯对象**（无全局状态、无 Proxy），通过 `adapter.components[fieldType]` 映射字段类型到渲染函数。参见 `packages/core/src/types/adapter.ts`。

### 包入口

- **主入口**（`@form-engine/core`）：渲染器 + 类型 + 工具函数 + 样式系统
- **`@form-engine/core/designer`**（子路径导出）：`Designer`、`Canvas`、`PropertyPanel`、`FieldList` 等设计器组件

### 组件分类

所有组件通过 `packages/core/src/types/component-category.ts` 分为 4 类：

- **form**：表单输入，PropertyPanel 显示 label/placeholder/name
- **display**：展示组件，仅显示 name
- **container**：容器组件，关键区别——Canvas 中递归渲染 `children`，支持拖入嵌套
- **button**：按钮组件，仅显示 name

工具函数：`isFormComponent()`、`isContainerComponent()`、`getFormFieldTypes()` 等。

### 容器嵌套

- `FormFieldSchema.children` 存子字段，允许递归嵌套
- Reducer 所有 Action 支持 `parentId` 参数（空=根级，有值=对应容器子字段）
- 修改嵌套逻辑时同步检查：`reducer.ts`、`Canvas.tsx`、`ContainerPreview.tsx`、`NestedField.tsx`

---

## 主题 Token 强制约定

**`packages/core/src/{designer,widgets,renderer,propRenders}/` 下的 `.ts/.tsx` 禁止写死颜色/间距/圆角等视觉常量**，必须走 token。

- ESLint 编辑期拦截（custom rule `ban-hardcoded-style`）
- 改完跑 `pnpm check:tokens`（已嵌入 `build` / `test`）
- 例外：placeholder 提示字符串、测试文件、token 定义文件本身

详细规则与 Token 速查见 [`.agents/rules/theme-tokens.md`](./.agents/rules/theme-tokens.md)。

---

## 测试要点

- **框架**：vitest + jsdom + @testing-library/react
- **范围**：仅 `@form-engine/core` 有测试（adapter 包全无测试）
- **配置**：`packages/core/vitest.config.ts`，setup 文件 `src/renderer/__tests__/setup.ts`
- **单文件运行**：`pnpm --filter @form-engine/core test -- src/path/to/test.test.tsx`

---

## 开发约定

- **构建工具**：tsup（所有包），adapter 包的 `dts: false`（避免类型错误）
- **格式化**：Prettier（singleQuote, noSemi, trailingComma all, printWidth 120）
- **CI**：GitHub Pages 部署，仅 `main` 分支触发，`pnpm build` → `pnpm --filter example build`
- **无 lint-staged 配置**：`simple-git-hooks` 已安装但 `.simple-git-hooks.json` 为空（未配置任何 hook）

---

## 临时输出文件约束

禁止在**根目录**散落 `*.txt` 日志/构建输出。统一写到 `./tmp/`（已在 `.gitignore`，无需清理）：

```powershell
pnpm build 2>&1 | Tee-Object ./tmp/build-$(Get-Date -Format 'yyyyMMdd_HHmmss').txt
```

---
