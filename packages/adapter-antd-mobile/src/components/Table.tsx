import React from 'react'
import { Card, Button } from 'antd-mobile'
import type { FieldRendererFn } from '@form-engine/core'

export const TableField: FieldRendererFn = (props: any) => {
  const { value, onChange, fieldSchema, disabled, adapter } = props
  const rows: Record<string, any>[] = value ?? []
  const children: any[] = fieldSchema?.children ?? []
  const rowMode = props.rowMode ?? 'dynamic'

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
            {children.map((child) => {
              const cellValue = row[child.name]
              const renderFn = adapter?.[child.type]

              return (
                <div key={child.name} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>{child.label}</div>
                  {renderFn ? (
                    React.createElement(renderFn, {
                      value: cellValue,
                      onChange: (v: any) => handleCellChange(rowIndex, child.name, v),
                      fieldSchema: child,
                      disabled,
                      adapter,
                    })
                  ) : (
                    <div style={{ color: '#ccc', fontSize: 12, padding: '6px 0' }}>
                      未知类型: {child.type}
                    </div>
                  )}
                </div>
              )
            })}
            {rowMode === 'dynamic' && !disabled && (
              <div style={{ textAlign: 'right', marginTop: 4 }}>
                <Button
                  size="mini"
                  color="danger"
                  fill="none"
                  onClick={() => handleDeleteRow(rowIndex)}
                >
                  删除
                </Button>
              </div>
            )}
          </Card.Body>
        </Card>
      ))}
      {rowMode === 'dynamic' && !disabled && (
        <Button
          block
          size="small"
          color="primary"
          fill="outline"
          onClick={handleAddRow}
          style={{ marginTop: 8 }}
        >
          + 添加行
        </Button>
      )}
    </div>
  )
}