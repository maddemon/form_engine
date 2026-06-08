import { closestCenter, DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import React, { useCallback, useMemo } from 'react'
import { ErrorMessage } from '../designer/UIPrimitives'
import { useStyle } from '../styles'
import { useLocale } from '../locale'
import { arrayMove, DragHandleIcon, InlineDeleteButton } from './sortableListShared'

export interface Column<T> {
  key: keyof T
  label: string
  width?: string | number
  render: (props: { value: unknown; onChange: (val: unknown) => void; disabled: boolean }) => React.ReactNode
}

export interface SortableTableEditorProps<T extends { id: string }> {
  value: T[]
  onChange: (v: T[]) => void
  columns: Column<T>[]
  minItems?: number
  disabled?: boolean
}

const SORTABLE_PREFIX = '__steditor_'
const DRAG_COL_WIDTH = 32
const ACTION_COL_WIDTH = 32

function TableSortableRow({
  id,
  sortable,
  disabled,
  children,
}: {
  id: string
  sortable: boolean
  disabled: boolean
  children: (dragHandleNode: React.ReactNode) => React.ReactNode
}) {
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
    <tr ref={setNodeRef as React.Ref<HTMLTableRowElement>} style={rowStyle}>
      {children(handleNode)}
    </tr>
  )
}

function SortableTableEditorInner<T extends { id: string }>({
  value = [],
  onChange,
  columns,
  minItems = 0,
  disabled = false,
}: SortableTableEditorProps<T>) {
  const { token } = useStyle()
  const { locale } = useLocale()

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const handleFieldChange = useCallback(
    (index: number, key: keyof T, fieldValue: unknown) => {
      const next = value.map((item, i) => (i === index ? { ...item, [key]: fieldValue } : item))
      onChange(next as T[])
    },
    [value, onChange],
  )

  const handleRemove = useCallback(
    (index: number) => {
      if (value.length <= minItems) return
      const next = value.filter((_, i) => i !== index)
      onChange(next)
    },
    [value, onChange, minItems],
  )

  const handleSortEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return
      const oldIndex = value.findIndex((item) => `${SORTABLE_PREFIX}${item.id}` === String(active.id))
      const newIndex = value.findIndex((item) => `${SORTABLE_PREFIX}${item.id}` === String(over.id))
      if (oldIndex !== -1 && newIndex !== -1) {
        onChange(arrayMove(value, oldIndex, newIndex))
      }
    },
    [value, onChange],
  )

  const minError = value.length < minItems ? `至少保留 ${minItems} 项` : null

  const sortableIds = useMemo(() => value.map((item) => `${SORTABLE_PREFIX}${item.id}`), [value])

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

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSortEnd}>
      <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
        <div>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              tableLayout: 'fixed',
            }}
          >
            <colgroup>
              <col style={{ width: DRAG_COL_WIDTH }} />
              {columns.map((col) => (
                <col key={String(col.key)} style={{ width: col.width ?? 'minmax(80px, 1fr)' }} />
              ))}
              <col style={{ width: ACTION_COL_WIDTH }} />
            </colgroup>
            <thead>
              <tr>
                <th style={tableHeaderCellStyle} />
                {columns.map((col) => (
                  <th key={String(col.key)} style={{ ...tableHeaderCellStyle, textAlign: 'left' }}>
                    {col.label}
                  </th>
                ))}
                <th style={tableHeaderCellStyle} />
              </tr>
            </thead>
            <tbody>
              {value.map((item, index) => (
                <TableSortableRow
                  key={item.id}
                  id={`${SORTABLE_PREFIX}${item.id}`}
                  sortable
                  disabled={disabled}
                >
                  {(dragHandleNode) => (
                    <>
                      <td style={{ ...tableBodyCellStyle, textAlign: 'center' }}>{dragHandleNode}</td>
                      {columns.map((col) => (
                        <td key={String(col.key)} style={tableBodyCellStyle}>
                          {col.render({
                            value: (item as Record<string, unknown>)[String(col.key)],
                            onChange: (val) => handleFieldChange(index, col.key, val),
                            disabled,
                          })}
                        </td>
                      ))}
                      <td style={{ ...tableBodyCellStyle, textAlign: 'center' }}>
                        <InlineDeleteButton
                          disabled={disabled || value.length <= minItems}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemove(index)
                          }}
                          title={locale.widget.sortableTableEditor.delete}
                        />
                      </td>
                    </>
                  )}
                </TableSortableRow>
              ))}
            </tbody>
          </table>

          {minError && <ErrorMessage>{minError}</ErrorMessage>}
        </div>
      </SortableContext>
    </DndContext>
  )
}

export const SortableTableEditor = React.memo(SortableTableEditorInner) as typeof SortableTableEditorInner
