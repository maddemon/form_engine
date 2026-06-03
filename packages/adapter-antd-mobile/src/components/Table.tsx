import { useAdapter, type FieldRendererFn } from '@form-engine/core'
import { Button, Card } from 'antd-mobile'
import React from 'react'

export const TableField: FieldRendererFn = (props: any) => {
  const { value, onChange, fieldSchema, disabled } = props
  const adp = useAdapter() ?? (props as any).adapter
  const rows: Record<string, any>[] = value ?? []
  const children: any[] = fieldSchema?.children ?? []
  const columns: any[] = fieldSchema?.componentProps?.columns ?? []
  const rowMode = fieldSchema?.componentProps?.rowMode ?? 'dynamic'

  // 按 regionKey 分组列字段
  const columnChildren = columns.map((col: any, colIdx: number) => children.filter((child: any) => (child.columnIndex ?? Number(child.regionKey ?? colIdx)) === colIdx))

  if (columns.length === 0) {
    return <div style={{ padding: 16, textAlign: 'center', color: 'var(--fe-text-tertiary)' }}>请先在「表格属性」中配置列</div>
  }

  const handleCellChange = (rowIndex: number, fieldName: string, cellValue: any) => {
    const newRows = [...rows]
    newRows[rowIndex] = { ...newRows[rowIndex], [fieldName]: cellValue }
    onChange?.(newRows)
  }

  const handleDeleteRow = (rowIndex: number) => {
    const newRows = rows.filter((_, i) => i !== rowIndex)
    onChange?.(newRows)
  }

  const handleAddRow = () => {
    const newRow: Record<string, any> = {}
    for (const child of children) {
      newRow[child.name] = child.defaultValue
    }
    onChange?.([...rows, newRow])
  }

  return (
    <div>
      {rows.map((row, rowIndex) => (
        <Card key={rowIndex} style={{ marginBottom: 12 }}>
          <Card.Body>
            {columnChildren.map((colChildren: any[], colIdx: number) => (
              <div key={colIdx}>
                {columns[colIdx] && <div style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6 }}>{columns[colIdx].label}</div>}
                {colChildren.map((child: any) => {
                  const cellValue = row[child.name]
                  const renderFn = adp?.[child.type]
                  return (
                    <div key={child.name} style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>{child.label}</div>
                      {renderFn ? (
                        React.createElement(renderFn, {
                          value: cellValue,
                          onChange: (v: any) => handleCellChange(rowIndex, child.name, v),
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
            {rowMode === 'dynamic' && !disabled && (
              <div style={{ textAlign: 'right', marginTop: 4 }}>
                <Button size="mini" color="danger" fill="none" onClick={() => handleDeleteRow(rowIndex)}>
                  删除
                </Button>
              </div>
            )}
          </Card.Body>
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
