import { useAdapter, type FieldComponentProps, type FieldRendererFn } from '@form-engine/core'
import type { FormFieldSchema } from '@form-engine/core'
import { Button, Card } from 'antd-mobile'
import React from 'react'

interface SubFormColumnConfig {
  id: string
  label: string
  width?: number
  key?: string
}

export const SubFormField: FieldRendererFn = (props: FieldComponentProps) => {
  const { value, onChange, fieldSchema, disabled } = props
  const adapter = useAdapter()
  const rows: Record<string, unknown>[] = (value ?? []) as Record<string, unknown>[]
  const children: FormFieldSchema[] = fieldSchema.children ?? []
  const columns: SubFormColumnConfig[] = (fieldSchema.componentProps?.columns as SubFormColumnConfig[]) ?? []
  const rowMode = fieldSchema.componentProps?.rowMode ?? 'dynamic'

  // 按 regionKey 分组列字段
  const columnChildren = columns.map((_col, colIdx) => children.filter((child) => (child.columnIndex ?? Number(child.regionKey ?? colIdx)) === colIdx))

  if (columns.length === 0) {
    return <div style={{ padding: 16, textAlign: 'center', color: 'var(--fe-text-tertiary)' }}>请先在「表格属性」中配置列</div>
  }

  const handleCellChange = (rowIndex: number, fieldName: string, cellValue: unknown) => {
    const newRows = [...rows]
    newRows[rowIndex] = { ...newRows[rowIndex], [fieldName]: cellValue }
    onChange?.(newRows)
  }

  const handleDeleteRow = (rowIndex: number) => {
    const newRows = rows.filter((_, i) => i !== rowIndex)
    onChange?.(newRows)
  }

  const handleAddRow = () => {
    const newRow: Record<string, unknown> = {}
    for (const child of children) {
      newRow[child.name] = child.defaultValue
    }
    onChange?.([...rows, newRow])
  }

  return (
    <div>
      {rows.map((row, rowIndex) => (
        <Card key={rowIndex} style={{ marginBottom: 12, position: 'relative' }}>
          {rowMode === 'dynamic' && !disabled && (
            <button
              type="button"
              onClick={() => handleDeleteRow(rowIndex)}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                width: 24,
                height: 24,
                borderRadius: '50%',
                border: 'none',
                background: 'rgba(255, 77, 79, 0.1)',
                color: '#ff4d4f',
                fontSize: 14,
                lineHeight: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                zIndex: 1,
              }}
              title="删除"
            >
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          )}
          {columnChildren.map((colChildren, colIdx) => (
            <div key={colIdx}>
              {columns[colIdx] && <div style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6 }}>{columns[colIdx].label}</div>}
              {colChildren.map((child) => {
                const cellValue = row[child.name]
                const renderFn = adapter?.components[child.type]
                return (
                  <div key={child.name} style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>{child.label}</div>
                    {renderFn ? (
                      React.createElement(renderFn, {
                        value: cellValue,
                        onChange: (v: unknown) => handleCellChange(rowIndex, child.name, v),
                        fieldSchema: child,
                        disabled,
                      })
                    ) : (
                      <div style={{ color: '#ccc', fontSize: 12, padding: '6px 0' }}>未知类型: {child.type}</div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </Card>
      ))}
      {rowMode === 'dynamic' && !disabled && (
        <Button block size="small" color="primary" fill="outline" onClick={handleAddRow} style={{ marginTop: 8 }}>
          + 添加行
        </Button>
      )}
    </div>
  )
}
