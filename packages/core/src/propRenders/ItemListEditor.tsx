import { closestCenter, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import React, { useCallback, useMemo } from 'react'
import { useStyle } from '../styles'

export interface ItemListField<T> {
  key: keyof T | string
  label: string
  kind: 'text' | 'number' | 'switch'
  min?: number
  max?: number
  placeholder?: string
  step?: number
  /** flex 比例，默认 1 */
  flex?: number
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
}

const SORTABLE_PREFIX = '__ileditor_'

function SortableRow({
  id,
  sortable,
  dragHandle,
  children,
}: {
  id: string
  sortable: boolean
  dragHandle: React.ReactNode
  children: React.ReactNode
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: sortable ? `${SORTABLE_PREFIX}${id}` : id,
    disabled: !sortable,
  })

  const style: React.CSSProperties = sortable
    ? {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }
    : {}

  return (
    <div ref={setNodeRef} style={style}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'inherit' }}>
        {sortable && (
          <div {...attributes} {...listeners} style={{ touchAction: 'none', display: 'flex' }}>
            {dragHandle}
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

function arrayMove<T>(arr: T[], from: number, to: number): T[] {
  const copy = [...arr]
  const [moved] = copy.splice(from, 1)
  copy.splice(to, 0, moved)
  return copy
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

  const dragHandleStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: token('itemListDragHandleWidthLg'),
    height: token('itemListDragHandleHeightLg'),
    cursor: disabled || !sortable ? 'default' : 'grab',
    color: 'var(--fe-text-secondary)',
    fontSize: token('fontSizeMd'),
    lineHeight: 1,
    userSelect: 'none',
    touchAction: 'none',
    borderRadius: 'var(--fe-border-radius-sm)',
    background: 'var(--fe-bg-tertiary)',
  }

  const inputBaseStyle: React.CSSProperties = {
    width: '100%',
    padding: '1px 0',
    border: 'none',
    outline: 'none',
    fontSize: token('fontSizeXs'),
    boxSizing: 'border-box',
    background: 'transparent',
    color: disabled ? 'var(--fe-disabled-color)' : 'inherit',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: token('fontSizeXs'),
    color: 'var(--fe-text-tertiary)',
    lineHeight: 1.3,
  }

  const sortableIds = useMemo(() => items.map((item) => `${SORTABLE_PREFIX}${item.id}`), [items])

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSortEnd}>
      <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
        <div>
          {items.map((item, index) => {
            const dragHandleNode = sortable ? <div style={dragHandleStyle}>⋮⋮</div> : null
            return (
              <SortableRow key={item.id} id={item.id} sortable={sortable} dragHandle={dragHandleNode}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: token('spacingXs'),
                    marginBottom: token('spacingXs'),
                    background: 'var(--fe-bg-primary)',
                    padding: '2px 4px',
                    borderRadius: 'var(--fe-border-radius-sm)',
                  }}
                >
                  {/* 字段列表 */}
                  {fields.map((field) => {
                    let fieldFlex = field.flex ?? 1
                    // number 类型默认更窄
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
                          <input
                            type="checkbox"
                            checked={!!(item as Record<string, unknown>)[String(field.key)]}
                            disabled={disabled}
                            onChange={(e) => handleFieldChange(index, String(field.key), e.target.checked)}
                          />
                        </label>
                      )
                    }
                    return (
                      <div key={String(field.key)} style={{ flex: fieldFlex, minWidth: 0 }}>
                        <div style={labelStyle}>{field.label}</div>
                        <input
                          type={field.kind === 'number' ? 'number' : 'text'}
                          value={String((item as Record<string, unknown>)[String(field.key)] ?? '')}
                          disabled={disabled}
                          min={field.min}
                          max={field.max}
                          step={field.step ?? (field.kind === 'number' ? 1 : undefined)}
                          placeholder={field.placeholder}
                          onChange={(e) => {
                            if (field.kind === 'number') {
                              const val = e.target.value === '' ? '' : Number(e.target.value) || 0
                              handleFieldChange(
                                index,
                                String(field.key),
                                field.min !== undefined ? Math.max(field.min, val as number) : val,
                              )
                            } else {
                              handleFieldChange(index, String(field.key), e.target.value)
                            }
                          }}
                          style={inputBaseStyle}
                        />
                      </div>
                    )
                  })}

                  {/* 删除按钮 */}
                  <button
                    type="button"
                    disabled={disabled || items.length <= minItems}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemove(index)
                    }}
                    title={items.length <= minItems ? `至少保留 ${minItems} 项` : '删除'}
                    style={{
                      flexShrink: 0,
                      width: token('itemListRemoveButtonSize'),
                      height: token('itemListRemoveButtonSize'),
                      padding: token('itemListRemoveButtonPadding'),
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--fe-text-tertiary)',
                      cursor: disabled || items.length <= minItems ? 'not-allowed' : 'pointer',
                      fontSize: token('fontSizeXs'),
                      lineHeight: 1,
                      opacity: disabled || items.length <= minItems ? 0.3 : 0.6,
                    }}
                  >
                    ✕
                  </button>
                </div>
              </SortableRow>
            )
          })}

          {/* 错误提示 */}
          {errorMsg && (
            <div
              style={{
                color: 'var(--fe-error)',
                fontSize: token('fontSizeXs'),
                marginBottom: token('spacingXs'),
              }}
            >
              {errorMsg}
            </div>
          )}

          {/* 添加按钮 */}
          <button
            type="button"
            disabled={disabled}
            onClick={handleAdd}
            style={{
              width: '100%',
              padding: '4px 0',
              border: '1px dashed var(--fe-primary)',
              borderRadius: 'var(--fe-border-radius-sm)',
              background: 'transparent',
              cursor: disabled ? 'not-allowed' : 'pointer',
              fontSize: token('fontSizeXs'),
              fontWeight: 500,
              color: 'var(--fe-primary)',
              opacity: disabled ? 0.4 : 1,
              textAlign: 'center',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!disabled) e.currentTarget.style.background = 'var(--fe-primary-hover-bg)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
            }}
          >
            + {addLabel ?? '添加'}
          </button>
        </div>
      </SortableContext>
    </DndContext>
  )
}

/**
 * 通用键控列表编辑器
 * 4 个组件（Grid/Table/Collapse/Tabs）共用
 */
export const ItemListEditor = React.memo(ItemListEditorInner) as typeof ItemListEditorInner
