## CodeGraph 使用规范

本仓库已启用 CodeGraph（`.codegraph/`），AI 助手需优先使用 CodeGraph MCP 工具进行代码查询，减少 grep/glob/read 调用。

使用方法：

- `codegraph_search` — 按名称或语义搜索符号
- `codegraph_explore` — 一次性获取多个相关符号的完整源码（替代多次 read）
- `codegraph_callers` / `codegraph_callees` — 追踪调用链
- `codegraph_impact` — 修改前的波及范围分析
- `codegraph_context` — 为任务构建上下文

- **codegraph_explore 优先** — 理解代码时优先调用 `codegraph_explore`（一次返回入口点+相关符号+代码片段），只有在其结果不足时才逐个调用其他工具
- **禁止盲目扫描** — 有 CodeGraph 可用时，不应使用 grep/glob/Read 反复扫描文件来理解代码结构。先用 CodeGraph 定位，精准读取几个文件即可
- **路径引用** — 所有 CodeGraph 返回的文件路径均相对于项目根目录，需拼接为绝对路径后再用 Read 工具打开

### 组件分类体系

所有组件通过 `ComponentCategory` 分为四类（`types/component-category.ts`）：

- **form**: 表单输入组件，PropertyPanel 显示 label/placeholder/name
- **display**: 展示组件，PropertyPanel 仅显示 name
- **container**: 容器组件，PropertyPanel 仅显示 name，Canvas 中支持嵌套渲染子组件
- **button**: 按钮组件，PropertyPanel 仅显示 name

### 容器嵌套

- 容器组件的 `FormFieldSchema.children` 存储子字段
- Canvas 递归渲染，容器区域可拖入新组件或移动已有组件
- Reducer 支持 `parentId` 参数来操作嵌套字段
- 获取所有表单组件：`getFormFieldTypes()`
