import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import React, { useCallback, useMemo } from 'react'
import type { FormFieldSchema } from '../types/schema'
import { useStyle } from '../styles'
import { NestedField } from './NestedField'
import { useDesignerContext } from './DesignerContext'
import { ColumnDropZone, useColumnResize } from './ColumnDropZone'

interface ContainerPreviewProps {
  field: FormFieldSchema
}

function isHorizontalLayout(field: FormFieldSchema): boolean {
  if (field.type === 'grid' || field.type === 'flex') return true
  if (field.type === 'container') {
    const layout = field.componentProps?.layout as string | undefined
    return layout === 'horizontal'
  }
  return false
}

function getGridColumns(field: FormFieldSchema): number {
  const columns = field.componentProps?.columns
  return typeof columns === 'number' ? columns : 2
}

function getGridColWidths(field: FormFieldSchema): number[] {
  const colWidths = field.componentProps?.colWidths as number[] | undefined
  const columns = getGridColumns(field)
  if (colWidths && colWidths.length === columns) return colWidths
  return Array.from({ length: columns }, () => Math.floor(100 / columns))
}

export const ContainerPreview: React.FC<ContainerPreviewProps> = ({ field }) => {
  const { dispatch } = useDesignerContext()
  const { setNodeRef, isOver } = useDroppable({
    id: `${field.id}__container`,
    data: { parentId: field.id },
  })
  const { token } = useStyle()
  const childIds = useMemo(() => (field.children || []).map(c => c.id!), [field.children])
  const horizontal = isHorizontalLayout(field)
  const gridColumns = field.type === 'grid' ? getGridColumns(field) : 0

  const colWidths = field.type === 'grid' ? getGridColWidths(field) : []
  const handleWidthsChange = useCallback((widths: number[]) => {
    dispatch({
      type: 'UPDATE_FIELD',
      fieldId: field.id!,
      patch: { componentProps: { ...field.componentProps, colWidths: widths } },
    })
  }, [dispatch, field.id, field.componentProps])
  const { handleResizeStart } = useColumnResize(gridColumns, colWidths, handleWidthsChange)

  const getTableColWidths = (): number[] => {
    const cols = (field.componentProps?.columns || []) as { width?: number; minWidth?: number }[]
    if (cols.length === 0) return []
    return cols.map(c => c.width ?? Math.floor(100 / cols.length))
  }

  const tableColWidths = field.type === 'table' ? getTableColWidths() : []
  const tableColumnsCount = field.type === 'table' ? (field.componentProps?.columns as any[] | undefined)?.length || 0 : 0
  const handleTableWidthsChange = useCallback((widths: number[]) => {
    const cols = ((field.componentProps?.columns || []) as any[]).map((c, i) => ({
      ...c,
      width: widths[i] ?? c.width,
    }))
    dispatch({
      type: 'UPDATE_FIELD',
      fieldId: field.id!,
      patch: { componentProps: { ...field.componentProps, columns: cols } },
    })
  }, [dispatch, field.id, field.componentProps])
  const { handleResizeStart: handleTableResizeStart } = useColumnResize(tableColumnsCount, tableColWidths, handleTableWidthsChange)

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    minHeight: token('containerMinHeight'),
    padding: token('spacingSm'),
    border: isOver ? '2px solid var(--fe-primary)' : '1px dashed var(--fe-border-primary)',
    borderRadius: 'var(--fe-border-radius-sm)',
    background: isOver ? 'var(--fe-primary-hover-bg)' : 'var(--fe-bg-tertiary)',
  }

  if (field.children && field.children.length > 0) {
    if (field.type === 'grid' && gridColumns > 0) {
      const grouped: FormFieldSchema[][] = Array.from({ length: gridColumns }, () => [])
      for (const child of field.children) {
        const idx = child.columnIndex ?? 0
        if (idx >= 0 && idx < gridColumns) {
          grouped[idx].push(child)
        } else {
          grouped[0].push(child)
        }
      }

      return (
        <div ref={setNodeRef} style={containerStyle} data-grid-container>
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            gap: token('spacingSm'),
            minHeight: token('containerMinHeight'),
          }}>
            {grouped.map((columnItems, colIdx) => (
              <ColumnDropZone
                key={colIdx}
                parentId={field.id!}
                columnIndex={colIdx}
                children={columnItems}
                colWidth={colWidths[colIdx] || Math.floor(100 / gridColumns)}
                showResizeHandle={colIdx < gridColumns - 1}
                onResizeStart={handleResizeStart}
              />
            ))}
          </div>
        </div>
      )
    }

    if (field.type === 'table' && tableColumnsCount > 0) {
      const grouped: FormFieldSchema[][] = Array.from({ length: tableColumnsCount }, () => [])
      for (const child of field.children) {
        const idx = child.columnIndex ?? 0
        if (idx >= 0 && idx < tableColumnsCount) {
          grouped[idx].push(child)
        } else {
          grouped[0].push(child)
        }
      }

      const columns = (field.componentProps?.columns || []) as { label: string; width: number }[]
      const rowMode = (field.componentProps?.rowMode as string) || 'dynamic'

      return (
        <div ref={setNodeRef} style={containerStyle}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: token('fontSizeSm'),
          }}>
            <thead>
              <tr>
                {columns.map((col, colIdx) => (
                  <th key={colIdx} style={{
                    padding: token('spacingXs'),
                    textAlign: 'left',
                    borderBottom: '1px solid var(--fe-border-primary)',
                    fontWeight: 600,
                    color: 'var(--fe-text-primary)',
                    width: `${col.width}%`,
                  }}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {grouped.map((columnItems, colIdx) => (
                  <td key={colIdx} style={{
                    padding: token('spacingXs'),
                    verticalAlign: 'top',
                  }}>
                    <ColumnDropZone
                      parentId={field.id!}
                      columnIndex={colIdx}
                      children={columnItems}
                      colWidth={100}
                      showResizeHandle={false}
                      onResizeStart={handleTableResizeStart}
                    />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          <div style={{
            padding: token('spacingXs'),
            borderTop: '1px solid var(--fe-border-light)',
            color: 'var(--fe-text-muted)',
            fontSize: token('fontSizeXs'),
            textAlign: 'center',
          }}>
            {rowMode === 'dynamic' ? '可动态增减行' : `固定 ${(field.componentProps?.fixedRowCount as number) || 3} 行`}
          </div>
        </div>
      )
    }

    return (
      <div ref={setNodeRef} style={containerStyle}>
        <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
          {horizontal ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: gridColumns > 0 ? `repeat(${gridColumns}, 1fr)` : 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: token('spacingSm'),
            }}>
              {field.children.map((child, index) => (
                <NestedField
                  key={child.id}
                  field={child}
                  parentContainerId={field.id!}
                  childIndex={index}
                />
              ))}
            </div>
          ) : (
            field.children.map((child, index) => (
              <NestedField
                key={child.id}
                field={child}
                parentContainerId={field.id!}
                childIndex={index}
              />
            ))
          )}
        </SortableContext>
      </div>
    )
  }

  return (
    <div ref={setNodeRef} style={containerStyle}>
      <div style={{
        color: 'var(--fe-text-muted)',
        fontSize: token('fontSizeSm'),
        textAlign: 'center',
        padding: token('spacingSm'),
      }}>
        拖拽组件到此处
      </div>
    </div>
  )
}