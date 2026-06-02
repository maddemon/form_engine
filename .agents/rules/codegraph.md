# CodeGraph 使用规范

> 简要约束（项目根路径、强制传 `projectPath`）保留在 [`AGENTS.md`](../../AGENTS.md)。本文档只放**详细使用方法**与**实践要点**。

本仓库已启用 CodeGraph（`.codegraph/`），AI 助手需优先使用 CodeGraph MCP 工具进行代码查询，减少 grep/glob/read 调用。

## 使用方法（每个调用都必须带 `projectPath`）

- `codegraph_search` — 按名称或语义搜索符号
- `codegraph_explore` — 一次性获取多个相关符号的完整源码（替代多次 read）
- `codegraph_callers` / `codegraph_callees` — 追踪调用链
- `codegraph_impact` — 修改前的波及范围分析
- `codegraph_context` — 为任务构建上下文

### 调用模板

```json
{
  "projectPath": "d:\\Repos\\form_engine",
  "query": "你的查询内容"
}
```

### 错误示例 ❌（漏传 `projectPath`）

```json
{
  "query": "ThemeTokens 接口、StyleProvider、injectCss 的实现"
}
```

### 正确示例 ✅

```json
{
  "projectPath": "d:\\Repos\\form_engine",
  "query": "ThemeTokens 接口、StyleProvider、injectCss 的实现"
}
```

## 最佳实践

- **codegraph_explore 优先** — 理解代码时优先调用 `codegraph_explore`（一次返回入口点+相关符号+代码片段），只有在其结果不足时才逐个调用其他工具
- **禁止盲目扫描** — 有 CodeGraph 可用时，不应使用 grep/glob/Read 反复扫描文件来理解代码结构。先用 CodeGraph 定位，精准读取几个文件即可
- **路径引用** — 所有 CodeGraph 返回的文件路径均相对于项目根目录，需拼接为绝对路径后再用 Read 工具打开
