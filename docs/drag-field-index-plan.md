# 拖拽性能优化 — 全局字段位置索引方案

> 对应主文档：[code-optimization-analysis.md](./code-optimization-analysis.md) — 3.12  
> 状态：已完成
> 日期：2026-06-04

---

## 1. 目标

消除拖拽过程中 `handleDragOver` / `handleDragEnd` 对 `findInTree` / `findFieldPosition` / `isAncestorOf` 的重复 O(n) 树遍历，将单次拖拽事件的查找复杂度从 **O(n) × 多次** 降至 **O(1) 或 O(d)**（d 为树深度）。

---

## 2. 现状分析（优化前）

> 以下行号均为优化前的代码参考，当前代码行号已因重构发生变化。

**文件**：[Designer.tsx](file:///d:/Repos/form_engine/packages/core/src/designer/Designer.tsx)

### 2.1 `handleDragOver`（优化前 L208-268，高频 ~60fps）

每次事件按分支执行以下 O(n) 遍历：

| 调用 | 函数                                          | 位置             | 说明                     |
| ---- | --------------------------------------------- | ---------------- | ------------------------ |
| 1    | `findFieldPosition(fields, activeId)`         | 优化前 L222      | 获取源位置               |
| 2    | `isAncestorOf(fields, activeId, containerId)` | 优化前 L234/L242 | 防止拖入自身子树         |
| 3    | `findInTree(fields, containerId)`             | 优化前 L235/L243 | 获取目标容器             |
| 4    | `findFieldPosition(fields, overId)`           | 优化前 L248      | 非 container/region 分支 |

> 注：L2/L3 在 region 分支和 container 分支中各出现一次，同一事件只走一个分支，因此单次事件最多 3-4 次 O(n) 遍历。

### 2.2 `handleDragEnd`（优化前 L272-374，低频但逻辑重）

| 调用 | 函数                                          | 位置                  |
| ---- | --------------------------------------------- | --------------------- |
| 1    | `findFieldPosition(fields, activeId)`         | 优化前 L305/L327/L343 |
| 2    | `isAncestorOf(fields, activeId, containerId)` | 优化前 L307/L330      |
| 3    | `findInTree(fields, containerId)`             | 优化前 L310/L331      |
| 4    | `findFieldPosition(fields, overId)`           | 优化前 L345           |

此外 `handleDragEnd` 调用了 `resolveDropTarget`（优化前 L291），该函数内部还有 2 次 `findInTree` + 1 次 `findFieldPosition`。

### 2.3 其他调用点（优化前，非热路径，但索引建成后应一并替换）

| 调用                 | 函数                                               | 位置        |
| -------------------- | -------------------------------------------------- | ----------- |
| `handleDragStart`    | `findInTree(fields, activeId)`                     | 优化前 L192 |
| `selectedField` 计算 | `findInTree(state.schema.fields, selectedFieldId)` | 优化前 L135 |

即使 schema 树只有 50 个节点，每次 dragOver 也要遍历 150-200 次节点。在复杂表单（嵌套容器、大量字段）下卡顿风险显著。

---

## 3. 设计思路

### 核心方案：位置索引（`FieldIndex`）

构建一个 `Map<string, FieldIndexEntry>` 作为 schema 的扁平索引，在 schema 变化时重建，拖拽时 O(1) 查询。

```typescript
interface FieldIndexEntry {
  field: FormFieldSchema
  parentId: string | null // 根字段为 null
  index: number // 在父 children 数组中的位置
  path: string[] // 从根到该字段的 id 路径
  regionKey?: string // 容器 region 标识
}

type FieldIndex = Map<string, FieldIndexEntry>
```

### `path` 字段的必要性

`path` 不仅用于后续校验上下文，更是**优化 `isAncestorOf` 的关键**。实际实现为独立函数 `isAncestorOfByIndex`：

```typescript
// 原实现：O(n) 递归遍历整棵树
function isAncestorOf(fields, ancestorId, descendantId): boolean

// 索引实现（isAncestorOfByIndex）：O(d) 检查 path 包含关系（d 为深度，通常 < 10）
function isAncestorOfByIndex(fieldIndex: FieldIndex, ancestorId: string, descendantId: string): boolean {
  if (ancestorId === descendantId) return true
  const entry = fieldIndex.get(descendantId)
  if (!entry) return false // 索引中不存在则直接返回 false，不回退到原函数
  return entry.path.includes(ancestorId)
}
```

### `regionKey` 字段的必要性

`findFieldPosition` 返回值包含 `regionKey`，用于容器 region 功能。索引中必须保留此字段，否则替换后功能缺失。

### 关键设计决策

| 决策         | 选项                              | 选择理由                                                        |
| ------------ | --------------------------------- | --------------------------------------------------------------- |
| **存储位置** | Reducer state vs. `useMemo`       | `useMemo`：避免污染 reducer，索引是派生数据                     |
| **更新时机** | 每次 schema 变化重建 vs. 增量更新 | 初始实现全量重建（schema 变化不频繁，全量重建 O(n) 可接受）     |
| **层级信息** | 只存 parentId vs. 存完整 path     | **存 path**：必须用于 `isAncestorOf` 优化，同时方便后续校验需求 |
| **导出范围** | 模块内 vs. 导出                   | 先模块内，按需导出                                              |
| **缓存策略** | `useMemo` 直接依赖 vs. 浅比较守卫 | **必须使用浅比较**（见 3.1）                                    |

### 3.1 `useMemo` 依赖引用稳定性问题（关键）

`state.schema.fields` 在 reducer 中每次 dispatch 都会产生新引用（immutable update），直接用作 `useMemo` 依赖会导致**索引每次渲染都重建**，等于没有缓存。

**解决方案**：使用 `useRef` + 浅比较守卫，仅在 fields 数组内容实际变化时重建索引：

```typescript
function useFieldIndex(fields: FormFieldSchema[]): FieldIndex {
  const prevFieldsRef = useRef<FormFieldSchema[]>(fields)
  const indexRef = useRef<FieldIndex>(buildFieldIndex(fields))

  if (prevFieldsRef.current !== fields) {
    // 引用变了，检查内容是否真的变了（浅比较第一层数组元素）
    const prev = prevFieldsRef.current
    const changed = fields.length !== prev.length || fields.some((f, i) => f !== prev[i])
    if (changed) {
      indexRef.current = buildFieldIndex(fields)
    }
    prevFieldsRef.current = fields
  }

  return indexRef.current
}
```

> **为什么不用 `useMemo`**：`useMemo` 的依赖比较是 `Object.is`，对 `fields` 这种每次 dispatch 都新建的数组无效。`useRef` + 手动浅比较可以避免不必要的重建，同时保证 schema 真正变化时索引及时更新。

### 使用方式

```typescript
// 在 Designer 组件中
const fieldIndex = useFieldIndex(state.schema.fields)

// handleDragOver 中
const sourceEntry = fieldIndex.get(activeId) // O(1)
const overEntry = fieldIndex.get(overId) // O(1)
const isAncestor = isAncestorOfByIndex(fieldIndex, activeId, containerId) // O(d)
```

### 附加优化：`lastDragOverMoveRef` 去重

`handleDragOver` 中增加移动目标去重：**同一拖拽过程中，若目标位置（sourceId → parentId:index）未变，则跳过 dispatch**。避免 dnd-kit 在同一目标区域内反复触发 dragOver 导致无效 reducer 调用。

```typescript
const moveKey = `${activeId}->${targetParentId || 'root'}:${targetIndex}`
if (lastDragOverMoveRef.current === moveKey) return
lastDragOverMoveRef.current = moveKey
```

> `lastDragOverMoveRef` 在 `handleDragEnd` / `handleDragCancel` 中重置为 `null`。

---

## 4. 实现步骤

### Step 1：实现 `buildFieldIndex` 工具函数

**文件**：`packages/core/src/designer/reducer.ts`（与 `findInTree` 同文件；`findFieldPosition` 为 Designer.tsx 私有函数，不在 reducer.ts 中）

```typescript
export interface FieldIndexEntry {
  field: FormFieldSchema
  parentId: string | null
  index: number
  path: string[]
  regionKey?: string
}

export function buildFieldIndex(fields: FormFieldSchema[]): Map<string, FieldIndexEntry> {
  const index = new Map<string, FieldIndexEntry>()

  function walk(nodes: FormFieldSchema[], parentId: string | null, parentPath: string[]): void {
    nodes.forEach((field, idx) => {
      if (!field.id) return // 防御性：跳过无 id 的异常字段
      const currentPath = [...parentPath, field.id]
      index.set(field.id, { field, parentId, index: idx, path: currentPath, regionKey: field.regionKey })
      if (field.children?.length) {
        walk(field.children, field.id, currentPath)
      }
    })
  }

  walk(fields, null, [])
  return index
}
```

### Step 2：实现 `useFieldIndex` Hook

**文件**：`packages/core/src/designer/Designer.tsx`（模块内，与组件同文件）

使用 `useRef` + 浅比较守卫，避免 `useMemo` 因引用不稳定导致每次重建。详见 3.1 节代码。

### Step 3：在 `Designer` 中集成索引

**文件**：`packages/core/src/designer/Designer.tsx`

替换范围（按优先级排序）：

#### 3a. `handleDragOver`（高优先级 — 热路径）

- `findFieldPosition(fields, activeId)` → `fieldIndex.get(activeId)`
- `findFieldPosition(fields, overId)` → `fieldIndex.get(overId)`
- `findInTree(fields, containerId)` → `fieldIndex.get(containerId)?.field`
- `isAncestorOf(fields, activeId, containerId)` → `fieldIndex.get(activeId)?.path.includes(containerId)`

#### 3b. `handleDragEnd`（中优先级 — 逻辑完整性）

- 同上替换所有 `findFieldPosition` / `findInTree` / `isAncestorOf` 调用
- `resolveDropTarget` 也使用了 `findInTree` / `findFieldPosition`，需同步修改（传入 `fieldIndex` 参数）

#### 3c. 其他调用点（低优先级 — 一致性）

- `handleDragStart` 中 `findInTree` → `fieldIndex.get`
- `selectedField` 计算中 `findInTree` → `fieldIndex.get`

#### 3d. 保留原有函数作为 fallback

- `findInTree` / `findFieldPosition` / `isAncestorOf` **保留不删除**（reducer.ts 中的 `findInTree` 仍被 reducer 内部使用）
- 索引查询失败时回退到原有函数（防御性编程）

### Step 4：修改 `resolveDropTarget` 签名

**文件**：`packages/core/src/designer/Designer.tsx`

`resolveDropTarget` 当前签名接收 `fields: FormFieldSchema[]`，需增加 `fieldIndex: FieldIndex` 参数，内部替换 `findInTree` / `findFieldPosition` 为索引查询。保留 `fields` 参数作为 fallback。

### Step 5：验证与测试

- `buildFieldIndex` 单元测试：空数组、单层、多层嵌套、1000+ 节点性能基线
- `useFieldIndex` Hook 测试：验证浅比较守卫在引用变化但内容不变时不重建
- `isAncestorOf` 替换测试：验证 path.includes 与原递归实现结果一致
- 拖拽功能回归测试：根字段拖拽、容器间拖拽、嵌套拖拽、region 拖拽
- 使用 React DevTools Profiler 对比拖拽性能（火焰图时长）

---

## 5. 依赖关系

- 当前代码无破坏性修改
- `findInTree` / `findFieldPosition` / `isAncestorOf` **保留不删除**（`findInTree` 仍被 reducer 内部 `COPY_FIELD` 和 `SET_SCHEMA` 使用）
- 索引仅为 Designer 拖拽使用，不改动 reducer 逻辑
- `resolveDropTarget` 签名变更仅影响 Designer.tsx 内部调用

---

## 6. 边界与异常

| 场景                                  | 处理方式                                                      |
| ------------------------------------- | ------------------------------------------------------------- |
| `activeId` / `overId` 不在索引中      | 回退到 `findFieldPosition` / `findInTree`                     |
| schema 为空                           | 索引为空 Map，拖拽逻辑短路返回                                |
| 字段 `id` 为空（undefined/null/''）   | `buildFieldIndex` 中 `if (!field.id) return` 跳过，不纳入索引 |
| 字段在拖拽中被删除                    | React 确保拖拽结束后才更新 schema，索引同步更新               |
| 极深嵌套（深度 > 10）                 | 递归 `walk` 深度由调用栈限制，必要时改为迭代                  |
| 动态 children 变化                    | `useFieldIndex` 浅比较检测到变化后自动重建                    |
| `fields` 引用变化但内容不变           | 浅比较守卫跳过重建，复用已有索引                              |
| `isAncestorOf` 索引查询返回 undefined | 回退到原递归实现                                              |
| `resolveDropTarget` 中索引查询失败    | 回退到原 `findInTree` / `findFieldPosition`                   |

---

## 7. 已解决问题

| 问题                                   | 结论                                                          |
| -------------------------------------- | ------------------------------------------------------------- |
| 是否将 `FieldIndexEntry.path` 纳入索引 | **是**。`path` 是优化 `isAncestorOf` 的必要字段，O(d) vs O(n) |
| `useMemo` 依赖引用不稳定               | **改用 `useRef` + 浅比较守卫**，避免每次 dispatch 重建索引    |
| `FieldIndexEntry` 是否需要 `regionKey` | **是**。`findFieldPosition` 返回 `regionKey`，替换后不可丢失  |
| `isAncestorOf` 索引版命名              | **`isAncestorOfByIndex`**，独立函数，与原 `isAncestorOf` 并存 |
| `handleDragOver` 同位置反复触发        | **`lastDragOverMoveRef` 去重**，避免无效 dispatch             |
| `findFieldPosition` 位置               | Designer.tsx 私有函数，与 `buildFieldIndex`（在 reducer.ts）分离 |

## 8. 未解决问题（待讨论）

- 是否需要导出 `buildFieldIndex` 给外部使用
- 是否在 Reducer 层提供索引缓存（避免 Designer 组件重复计算）
- `path` 数组的内存开销在超大规模 schema（10000+ 节点）下是否可接受，是否改用 `parentId` 链式回溯

## 8.1 补充修复记录（2026-06-04）

- `handleDragEnd` 中 `isValidCanvasTarget` 检查原为 `fields.some()` + 嵌套 `fields.some()`（O(n²)），且仅检查前两层嵌套。已改为 `fieldIndex.has(overStr)`（O(1)，覆盖所有嵌套层级）。

---

## 9. 验证方法

1. `pnpm test` — 单元测试全部通过
2. `pnpm build` — 编译无错误
3. 手动拖拽测试：简单 / 复杂（50+ 字段）schema 下拖拽排序、跨容器拖拽、region 拖拽
4. Profiler 录制：对比优化前后的 `handleDragOver` 执行耗时
5. 验证 `useFieldIndex` 浅比较守卫：在 schema 未实质变化时确认索引未重建
