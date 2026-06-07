import { closestCenter, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import React, { useCallback, useMemo } from 'react'
import { ErrorMessage } from '../designer/UIPrimitives'
import { useStyle } from '../styles'
import type { DesignerWidgets } from '../types/adapter'
import { WidgetButton } from '../widgets/Button'
import { WidgetInput } from '../widgets/Input'
import { WidgetNumberInput } from '../widgets/NumberInput'
import { WidgetSwitch } from '../widgets/Switch'
import {
  arrayMove,
  DragHandleIcon,
  getLabelStyle,
  getSortableRowContentStyle,
  InlineDeleteButton,
  SortableRow,
} from '../widgets/sortableListShared'

export interface ItemListField<T> {
  key: keyof T | string
  label: string
  kind: 'text' | 'number' | 'switch'
  min?: number
  max?: number
  placeholder?: string
  step?: number
  /** flex 比例（仅 inline 模式生效），默认 1 */
  flex?: number
  /** 列宽（仅 table 模式生效），如 '120px' / '20%' */
  width?: string | number
  /** 标记为唯一字段，输入时与列表其他项对比 */
  unique?: boolean
}

export interface ItemListEditorProps<T extends { id: string }> {
  value?: T[]
  onChange?: (v: T[]) => void
  fields: ItemListField<T>[]
  newItem: () => T
  /** 总和校验 */
  validateTotal?: (items: T[]) => string | null
  /** 唯一性校验 */
  validateUnique?: (items: T[]) => string | null
  /** 最小条目数（默认 0） */
  minItems?: number
  addLabel?: string
  disabled?: boolean
  /** 是否支持拖拽排序（默认 true） */
  sortable?: boolean
  /**
   * 布局模式：
   * - `inline`：单行平铺字段（旧风格，节省空间）
   * - `table`：表格布局，字段名作为表头，字段值作为单元格
   */
  layout?: 'inline' | 'table'
  /**
   * 可选：属性面板 widgets 子集。
   * 传入后，text/number 字段会优先使用 `widgets.Input` / `widgets.NumberInput`
   * （如 antd 的 Input/InputNumber，自动随主题），不传则回退到内置的 Widget*。
   */
  widgets?: Pick<DesignerWidgets, 'NumberInput' | 'Input' | 'Switch'>
}

const SORTABLE_PREFIX = '__ileditor_'

/**
 * 表格模式下专用的可排序行。
 *
 * 与 `SortableRow` 不同的是：本组件直接渲染 `<tr>` 并把 ref/style 挂在自己身上，
 * children 函数返回行内所有 `<td>` 节点，由调用方组织。
 */
const TableSortableRow: React.FC<{
  id: string
  sortable: boolean
  disabled: boolean
  children: (dragHandleNode: React.ReactNode) => React.ReactNode
}> = ({ id, sortable, disabled, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: sortable ? id : `__nosort_${id}`,
    disabled: !sortable,
  })

  const rowStyle: React.CSSProperties = sortable
    ? {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }
    : {}

  const handleNode = sortable ? (
    <div {...attributes} {...listeners} style={{ touchAction: 'none', display: 'inline-flex', cursor: 'grab' }}>
      <DragHandleIcon disabled={disabled} sortable={sortable} />
    </div>
  ) : null

  return (
    <tr ref={setNodeRef as unknown as React.Ref<HTMLTableRowElement>} style={rowStyle}>
      {children(handleNode)}
    </tr>
  )
}

/**
 * 渲染单个字段输入控件（adapter 优先，core widget 兜底）
 */
function renderFieldControl<T extends { id: string }>(args: {
  field: ItemListField<T>
  item: T
  index: number
  disabled: boolean
  widgets: ItemListEditorProps<T>['widgets']
  onChange: (index: number, fieldKey: string, fieldValue: unknown) => void
}) {
  const { field, item, index, disabled, widgets, onChange } = args
  const rawValue = (item as Record<string, unknown>)[String(field.key)]

  if (field.kind === 'switch') {
    const SwitchComp = widgets?.Switch ?? WidgetSwitch
    return (
      <SwitchComp
        checked={!!rawValue}
        disabled={disabled}
        onChange={(v: boolean) => onChange(index, String(field.key), v)}
      />
    )
  }

  if (field.kind === 'number') {
    if (widgets?.NumberInput) {
      const num = Number(rawValue)
      return (
        <widgets.NumberInput
          value={Number.isNaN(num) ? undefined : num}
          disabled={disabled}
          min={field.min}
          max={field.max}
          variant="filled"
          onChange={(val: number) => {
            const n = Number(val)
            if (Number.isNaN(n)) return
            const clamped = field.min !== undefined ? Math.max(field.min, n) : n
            onChange(index, String(field.key), clamped)
          }}
        />
      )
    }
    return (
      <WidgetNumberInput
        value={(rawValue as number | undefined) ?? undefined}
        disabled={disabled}
        min={field.min}
        max={field.max}
        step={field.step ?? 1}
        placeholder={field.placeholder}
        variant="filled"
        onChange={(val) => {
          const clamped = field.min !== undefined ? Math.max(field.min, val) : val
          onChange(index, String(field.key), clamped)
        }}
      />
    )
  }

  // text
  if (widgets?.Input) {
    return (
      <widgets.Input
        value={String(rawValue ?? '')}
        disabled={disabled}
        placeholder={field.placeholder}
        variant="filled"
        onChange={(val: string | number) => onChange(index, String(field.key), val)}
      />
    )
  }
  return (
    <WidgetInput
      value={String(rawValue ?? '')}
      disabled={disabled}
      placeholder={field.placeholder}
      variant="filled"
      onChange={(val) => onChange(index, String(field.key), val)}
    />
  )
}

function ItemListEditorInner<T extends { id: string }>({
  value = [],
  onChange,
  fields,
  newItem,
  validateTotal,
  validateUnique,
  minItems = 0,
  addLabel,
  disabled = false,
  sortable = true,
  layout = 'inline',
  widgets,
}: ItemListEditorProps<T>) {
  const { token } = useStyle()

  const items = value

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const handleFieldChange = useCallback(
    (index: number, fieldKey: string, fieldValue: unknown) => {
      const next = items.map((item, i) => (i === index ? { ...item, [fieldKey]: fieldValue } : item))
      onChange?.(next as T[])
    },
    [items, onChange],
  )

  const handleRemove = useCallback(
    (index: number) => {
      if (items.length <= minItems) return
      const next = items.filter((_, i) => i !== index)
      onChange?.(next)
    },
    [items, onChange, minItems],
  )

  const handleAdd = useCallback(() => {
    onChange?.([...items, newItem()])
  }, [items, onChange, newItem])

  const handleSortEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return
      const oldIndex = items.findIndex((item) => `${SORTABLE_PREFIX}${item.id}` === String(active.id))
      const newIndex = items.findIndex((item) => `${SORTABLE_PREFIX}${item.id}` === String(over.id))
      if (oldIndex !== -1 && newIndex !== -1) {
        onChange?.(arrayMove(items, oldIndex, newIndex))
      }
    },
    [items, onChange],
  )

  const totalError = useMemo(() => validateTotal?.(items) ?? null, [items, validateTotal])
  const uniqueError = useMemo(() => validateUnique?.(items) ?? null, [items, validateUnique])
  const minError = items.length < minItems ? `至少保留 ${minItems} 项` : null
  const errorMsg = totalError || uniqueError || minError

  const labelStyle = getLabelStyle(token)
  const sortableIds = useMemo(() => items.map((item) => `${SORTABLE_PREFIX}${item.id}`), [items])

  /** Inline 模式：单个字段块（含 label + 控件） */
  const renderInlineField = (field: ItemListField<T>, item: T, index: number) => {
    let fieldFlex = field.flex ?? 1
    if (field.kind === 'number' && field.flex == null) {
      fieldFlex = 0.6
    }
    if (field.kind === 'switch') {
      return (
        <label
          key={String(field.key)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: token('spacingXs'),
            flex: fieldFlex,
            fontSize: token('fontSizeSm'),
            whiteSpace: 'nowrap',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          <span>{field.label}</span>
          {renderFieldControl({ field, item, index, disabled, widgets, onChange: handleFieldChange })}
        </label>
      )
    }
    return (
      <div key={String(field.key)} style={{ flex: fieldFlex, minWidth: 0 }}>
        <div style={labelStyle}>{field.label}</div>
        {renderFieldControl({ field, item, index, disabled, widgets, onChange: handleFieldChange })}
      </div>
    )
  }

  const isTable = layout === 'table'
  // table 模式：水平 1px 让 td 间有最小间距避免 input 粘连，垂直 0 让行高紧凑。
  // 不用 `padding` 简写，拆成 paddingLeft/Right，避免内联 style 中 CSS 变量在
  // 简写里解析失败时整个 padding 被丢弃。
  const tableCellStyle: React.CSSProperties = {
    paddingLeft: '1px',
    paddingRight: '1px',
    fontSize: token('fontSizeSm'),
    verticalAlign: 'middle',
  }
  const tableHeaderCellStyle: React.CSSProperties = {
    ...tableCellStyle,
    color: 'var(--fe-text-tertiary)',
    fontWeight: 500,
    background: 'var(--fe-bg-secondary)',
    borderBottom: '1px solid var(--fe-border-secondary)',
  }
  const tableBodyCellStyle: React.CSSProperties = {
    ...tableCellStyle,
    borderBottom: '1px solid var(--fe-border-tertiary)',
  }
  const dragColWidth = 32
  const actionColWidth = 32
  // switch 列固定窄一些（开关只需容纳 28px 的控件 + 左右 padding ≈ 36px）
  const switchColWidth = 40

  // 给每个字段的 colgroup 显式 width（fixed 模式必须有具体值），
  // 未指定 width 的字段按内容自动分配，text 字段给 1fr，switch 字段给 switchColWidth。
  const getColWidth = (f: ItemListField<T>): string | number => {
    if (f.width != null) return f.width
    if (f.kind === 'switch') return switchColWidth
    return 'minmax(80px, 1fr)'
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSortEnd}>
      <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
        <div>
          {isTable ? (
            // Table 模式：原生 table 渲染，列对齐
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                tableLayout: 'fixed',
              }}
            >
              <colgroup>
                {sortable && <col style={{ width: dragColWidth }} />}
                {fields.map((f) => (
                  <col key={String(f.key)} style={{ width: getColWidth(f) }} />
                ))}
                <col style={{ width: actionColWidth }} />
              </colgroup>
              <thead>
                <tr>
                  {sortable && <th style={tableHeaderCellStyle} />}
                  {fields.map((f) => (
                    <th key={String(f.key)} style={{ ...tableHeaderCellStyle, textAlign: 'left' }}>
                      {f.label}
                    </th>
                  ))}
                  <th style={tableHeaderCellStyle} />
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <TableSortableRow
                    key={item.id}
                    id={`${SORTABLE_PREFIX}${item.id}`}
                    sortable={sortable}
                    disabled={disabled}
                  >
                    {(dragHandleNode) => (
                      <>
                        {sortable && <td style={{ ...tableBodyCellStyle, textAlign: 'center' }}>{dragHandleNode}</td>}
                        {fields.map((f) => (
                          <td key={String(f.key)} style={tableBodyCellStyle}>
                            {renderFieldControl({
                              field: f,
                              item,
                              index,
                              disabled,
                              widgets,
                              onChange: handleFieldChange,
                            })}
                          </td>
                        ))}
                        <td style={{ ...tableBodyCellStyle, textAlign: 'center' }}>
                          <InlineDeleteButton
                            disabled={disabled || items.length <= minItems}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemove(index)
                            }}
                            title={items.length <= minItems ? `至少保留 ${minItems} 项` : '删除'}
                          />
                        </td>
                      </>
                    )}
                  </TableSortableRow>
                ))}
              </tbody>
            </table>
          ) : (
            // Inline 模式：保持旧行为
            items.map((item, index) => {
              const dragHandleNode = sortable ? <DragHandleIcon disabled={disabled} sortable={sortable} /> : null
              return (
                <SortableRow
                  key={item.id}
                  id={`${SORTABLE_PREFIX}${item.id}`}
                  sortable={sortable}
                  dragHandle={dragHandleNode}
                >
                  <div style={getSortableRowContentStyle(token)}>
                    {fields.map((field) => renderInlineField(field, item, index))}
                    <InlineDeleteButton
                      disabled={disabled || items.length <= minItems}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemove(index)
                      }}
                      title={items.length <= minItems ? `至少保留 ${minItems} 项` : '删除'}
                    />
                  </div>
                </SortableRow>
              )
            })
          )}

          {/* 错误提示 */}
          {errorMsg && <ErrorMessage>{errorMsg}</ErrorMessage>}

          {/* 添加按钮 */}
          <WidgetButton
            type="dashed"
            color="primary"
            size="sm"
            onClick={handleAdd}
            disabled={disabled}
            style={{
              width: '100%',
              marginTop: token('spacingXs'),
            }}
          >
            + {addLabel ?? '添加'}
          </WidgetButton>
        </div>
      </SortableContext>
    </DndContext>
  )
}

/**
 * 通用键控列表编辑器
 * 4 个组件（Grid/SubForm/Collapse/Tabs）共用
 */
export const ItemListEditor = React.memo(ItemListEditorInner) as typeof ItemListEditorInner
