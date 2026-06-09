# Debug: jsx-compile-crash

**状态**: [OPEN]
**Session ID**: `jsx-compile-crash`
**现象**: 在设计器 PropertyPanel 中编辑 JSX 字段，点击 CodeEditor 的"编译"按钮后，页面崩溃但**不显示错误信息**
**预期**: 编译成功 → 表单值更新（`compiledCode`）→ 画布渲染该 JSX 组件；编译失败 → 在 CodeEditor 模态框内显示 `compileError`
**影响范围**: JSX 字段的"编译"按钮交互路径

---

## 1. 假设列表（待证据证伪）

| #   | 假设                                                                                                                                                                                                                                                                  | 验证点                                                |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| H1  | `Babel.transform` 抛错被外层 try/catch 接住，`handleCompile` 返回 `{success: false}` → `CodeEditor` 模态框应显示 `compileError` 文本，**不应崩溃页面**                                                                                                                | 收集 `handleCompile` 调用栈与返回结果                 |
| H2  | `compiledCode` 字符串内容异常（如 Babel 产物含 `import`/`export` 等 `new Function` 不支持的语法）→ `JsxRender.compileJsxComponent` 内 `new Function(...)` 抛 SyntaxError，被该函数 try/catch 接住返回 `null` → JsxRender 应渲染 "JSX 编译代码错误" 占位，**不应崩溃** | 收集 `compiledCode` 实际内容、是否进入 error 占位分支 |
| H3  | 编译成功 → `onChange('compiledCode', compiled)` 触发 form re-render → 渲染路径某处抛未捕获错误（如 `FieldRenderer` 或 `useFormRender` 的 ref 访问警告引发 React 卸载）                                                                                                | 收集 `onChange` 后到崩溃之间的所有抛错、React 警告    |
| H4  | `CodeEditor.handleConfirm` 控制流异常（finally 注释说"已 setCompiling"，但**success 路径上 `setCompiling(false)` 在 if 外**，catch 分支的 `setCompiling(false)` + return 看似冗余但仍会先执行）→ 状态机错乱导致 setState-after-unmount                                | 检查 handleConfirm 状态更新顺序                       |
| H5  | `getDefaultCode('jsx')` 产出的默认代码经过 Babel 后包含 `AntCard`/`AntButton` 等未在 scope 注入的引用，运行时报 `ReferenceError`                                                                                                                                      | 收集编译后字符串、scope 注入值                        |

---

## 1.1 用户提供的运行时报错（关键证据）

```text
Uncaught ReferenceError: 的萨芬的萨芬 is not defined
  at Component (eval at compileJsxComponent (JsxRender.tsx:27:16), <anonymous>:4:3)
  Component     @ VM15502:4
  <Component>
  JsxWrapper    @ JsxRender.tsx:41
  <JsxWrapper>
  (匿名)         @ JsxRender.tsx:96
```

**分析**：

- **不是 `SyntaxError`**：Babel 编译通过；是 `ReferenceError`（运行时未定义引用）
- 用户写的代码形如：
  ```jsx
  function Hello() {
    return <div>...</div>
  }
  的萨芬的萨芬 // ← 顶层裸表达式
  ```
  Babel 编译后保留 `function Hello() {...}`，再追加顶层 `return typeof Component === 'function' ? Component : null;`；但用户的 `的萨芬的萨芬` 顶层裸表达式在 `new Function` body 里**会被求值**，因未定义 → ReferenceError
- 抛错点：`JsxRender.tsx:27` 是 `new Function(...)` 行，但**调用时**在第 4 行 col 3（编译产物 body），即 `fn(...args)`
- **根因**：`compileJsxComponent` 的 try/catch **只包了函数定义（`new Function`）和 wrapper 定义，没包 wrapper 内的 `fn(...args)` 调用**。React 渲染 `<InnerComponent />` → 调 wrapper → 调 fn → throw → 冒到 React → 无 ErrorBoundary → 整树卸载
- **H1 排除**：编译步骤返回 `{success: true}`，**模态框会关闭**（handleConfirm 走成功分支），用户看不到错误
- **H2/H3 排除**：错误不是来自 `new Function` 语法错误或 ref 访问
- **H4 无关**：handleConfirm 状态机本身没错
- **H5 部分成立**：根因不在默认代码，而在用户输入的代码模式（顶层裸引用）

**最终根因**：`JsxRender.compileJsxComponent` 调用 `fn(...args)` 时**未捕获**运行时异常。

---

## 2. 修复方案（最小变更）

两层防御，**互补**：

| 层级 | 文件                                          | 改动                                                                                                                           | 目的                                                                                        |
| ---- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| L1   | `packages/core/src/propRenders/jsx/Props.tsx` | `handleCompile` Babel 编译后追加**烟雾测试**：`new Function('React', compiled)` 并调用，捕获抛错返回 `{success: false, error}` | 让用户**在模态框内**看到错误，模态框不关闭、可继续编辑                                      |
| L2   | `packages/core/src/renderer/JsxRender.tsx`    | `compileJsxComponent` 包装的 `JsxWrapper` 内部对 `fn(...args)` 包 try/catch，捕获后渲染 `FieldError`                           | 兜底：即便 L1 漏过（如错误仅在 function body 内的引用），页面也**不崩溃**，字段区域显示错误 |

---

## 2. 证据收集策略

**关键路径**（按调用顺序打点）：

1. `jsx/Props.tsx :: handleCompile` 入口/出口（`Babel.transform` 入参/出参、`onChange` 触发）
2. `propertySlotRegistry/.../CodeEditor.tsx :: handleConfirm`（状态机：compiling / compileStatus / setOpen）
3. `propertySlotRegistry/.../CodeEditor.tsx :: doCompile`（单独点 Compile 按钮）
4. `renderer/JsxRender.tsx :: compileJsxComponent`（`new Function` 构造是否抛错、返回值）
5. `renderer/JsxRender.tsx :: JsxRender` 渲染（InnerComponent 状态、scope 注入）
6. 全局 `window.onerror` 与 `unhandledrejection`（捕获未处理异常）

**收集方式**：通过 Debug Server POST `/log`，**禁止使用 `console.log`/`alert`**。

> 实际进度：因 Python 不可用未启动 Debug Server，但用户在 1.1 节直接提供了运行时报错（关键证据），足以定位根因。

---

## 3. 进展日志

| 时间       | 步骤                                     | 结果                      |
| ---------- | ---------------------------------------- | ------------------------- |
| 2026-06-09 | 创建调试会话                             |                           |
| 2026-06-09 | 启动 Debug Server（未启，Python 不可用） | 由用户提供运行时报错替代  |
| 2026-06-09 | 添加 instrumentation（未做）             | 静态分析 + 用户证据已足够 |
| 2026-06-09 | 复现 + 收集日志（用户在 1.1 节直接提供） | 锁定根因：调用未捕获      |
| 2026-06-09 | 修复（L1 烟雾测试 + L2 渲染兜底）        | 已应用                    |
| 2026-06-09 | 二次验证（新增 2 个单元测试）            | 2/2 通过                  |

---

## 4. 修复结论

**根因**：`JsxRender.compileJsxComponent` 内的 try/catch 只包了 `new Function(...)` 函数定义，**没包** React 渲染时调用的 `fn(...args)`。当编译产物含顶层裸引用（Babel 语法校验通过、运行时抛 ReferenceError）时，错误冒到 React → 无 ErrorBoundary → 整棵子树被卸载 → 页面"崩溃"。

**修复（两层防御）**：

| 层级        | 文件                                                             | 行为                                                                                                                                                                                     |
| ----------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L1 烟雾测试 | `packages/core/src/components/jsx/Props.tsx` `handleCompile`     | Babel 编译后用 `new Function('React', compiled)` 试运行一次，捕获顶层 ReferenceError → 返回 `{success: false, error: 'JSX 运行时错误: ...'}`，模态框**保持打开**显示错误，用户可继续编辑 |
| L2 渲染兜底 | `packages/core/src/renderer/JsxRender.tsx` `compileJsxComponent` | 包装的 `JsxWrapper` 内部对 `fn(...args)` 包 try/catch，捕获后返回 `<div>JSX 运行时错误: ...</div>` 错误占位，**不**让异常冒到 React                                                      |

**验证**：

- 单元测试 `src/renderer/__tests__/JsxRender.test.tsx`：
  - 顶层含 `noSuchIdentifier;` 的 compiledCode → 渲染显示 "JSX 运行时错误"，**无** `window.onerror` 触发
  - 正常 compiledCode → 组件正常返回（null）
- `pnpm check:tokens`：0 violations
- `pnpm --filter @form-engine/core test`：32 passed（含新增）

**剩余**：

- L1 烟雾测试在 `handleCompile` 内只能用 `React` 作为唯一注入依赖，**未**注入 `scopeKeys` 中的 widget 引用。因此若用户代码在顶层直接引用 `props.AntCard` 等 widget（无 `Component` 包装），L1 会报"未定义"假阳性。**当前默认值模板和实际用户场景均在 `function Component() {...}` 内引用 widget，L1 不会误报**；L2 仍兜底捕获。
- 未来可考虑把 L1 的烟雾测试下沉到 `JsxRender` 内部，传入完整 scope 后做端到端验证。
