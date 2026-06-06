# AGENTS.md

本文件只保留**最关键的硬约束**与**详细文档索引**。具体规则、使用方法、Token 速查等内容见 [`.agents/rules/`](./.agents/rules/) 下的独立文件。

---

## CodeGraph（必须传 `projectPath`）

本仓库已启用 CodeGraph（`.codegraph/`），AI 助手**必须**优先使用 CodeGraph MCP 工具进行代码查询。

**项目根目录（`projectPath` 固定值）**：`d:\Repos\form_engine`

> ⚠️ **强制要求：所有 CodeGraph MCP 工具调用都必须传 `projectPath: "d:\\Repos\\form_engine"`**（Windows 路径用双反斜杠转义）。
>
> 不传时会报：`Error: Tool execution failed: No CodeGraph project is loaded for this session. Searched for a .codegraph/ directory starting from: C:\Users\...`
>
> 根因：MCP 服务从 CWD 向上找 `.codegraph/`，如果当前工作目录不在项目内（或 MCP server 启动时未传 `--path`），就会找不到。每次显式传 `projectPath` 是最稳的方式。

详细使用见：[`.agents/rules/codegraph.md`](./.agents/rules/codegraph.md)

---

## 组件分类体系（4 类）

所有组件通过 `ComponentCategory` 分为四类（`packages/core/src/types/component-category.ts`）：

- **form**: 表单输入组件，PropertyPanel 显示 label/placeholder/name
- **display**: 展示组件，PropertyPanel 仅显示 name
- **container**: 容器组件，PropertyPanel 仅显示 name，Canvas 中支持嵌套渲染子组件
- **button**: 按钮组件，PropertyPanel 仅显示 name

详细分类与判定函数见：[`.agents/rules/component-categories.md`](./.agents/rules/component-categories.md)

---

## 容器嵌套

- 容器组件的 `FormFieldSchema.children` 存储子字段
- Canvas 递归渲染，容器区域可拖入新组件或移动已有组件
- Reducer 支持 `parentId` 参数来操作嵌套字段
- 获取所有表单组件：`getFormFieldTypes()`

详细数据结构与 Reducer 约定见：[`.agents/rules/container-nesting.md`](./.agents/rules/container-nesting.md)

---

## 主题 Token 强制约定

**本仓库所有视觉样式必须走主题 Token**，禁止在 `packages/core/src/designer/`、`widgets/`、`renderer/`、`propRenders/` 下的 `.ts/.tsx` 文件里写死颜色、间距、圆角等视觉常量。

- 改完代码后必须跑 `pnpm check:tokens`（已接入 `pnpm build` / `pnpm test`）
- ESLint 已在编辑期拦截，新写硬编码会保存即报错
- pre-commit hook 会再校验一次，未通过不允许 commit
- 违反此约定的 PR 不会被合并

详细规则、禁止/正确写法、Token 速查与例外说明见：[`.agents/rules/theme-tokens.md`](./.agents/rules/theme-tokens.md)

---

## 临时输出文件约束

**禁止在仓库根目录散落临时 `.txt` 文件**（`build*.txt` / `*_log.txt` / `*_violations.txt` / `typecheck.txt` 等）。所有调试/构建输出统一写到 `./tmp/`。

- ✅ 正确：`pnpm build 2>&1 | Tee-Object ./tmp/build-$(Get-Date -Format 'yyyyMMdd_HHmmss').txt`
- ❌ 禁止：`pnpm build 2>&1 | Tee-Object build.txt`（污染根目录、扰乱 `git status`，并迫使加 `.gitignore` 兜底）
- `./tmp/` 已在 `.gitignore`，**无需手动清理**也不会被提交
- 命名建议带时间戳，避免多次运行相互覆盖
- 若必须保存到仓库内其他位置，请放进对应子目录的 `tmp/`，不要直接放根目录
- 调试完立即 `Remove-Item ./tmp/*` 清理，避免长期堆积

---

## 禁止通过 AI Sandbox 执行 `git stash`

**在 Trae IDE 的 AI sandbox 终端中禁止执行 `git stash`**。已确认该操作会导致 `.git` 目录被删除（sandbox bug：当 `git stash` 因 dangling object 等原因失败时，sandbox 的错误恢复逻辑会错误地删除整个 `.git` 目录）。

- ❌ 禁止：`git stash`、`git stash pop`、`git stash apply` 等 stash 相关命令
- ✅ 替代方案：使用 IDE 内置的 Git 操作面板，或在系统原生终端中执行 stash 命令
- 其他 git 命令（`git status`、`git diff`、`git add`、`git commit`、`git log` 等）不受影响
