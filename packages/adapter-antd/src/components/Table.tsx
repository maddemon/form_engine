import React from 'react'
import { Button } from 'antd'
import { getAdapter, useFieldSchema } from '@form-engine/core'
import type { FieldComponentProps, TableColumnConfig } from '@form-engine/core'

export const Table: React.FC<FieldComponentProps> = ({
  value = [],
  onChange,
  ...rest
}) => {
  const fieldSchema = useFieldSchema()
  const adapter = getAdapter()
  const children = fieldSchema?.children || []
  const columns = (fieldSchema?.componentProps?.columns || []) as TableColumnConfig[]
  const rowMode = (fieldSchema?.componentProps?.rowMode as 'dynamic' | 'fixed') || 'dynamic'
  const rows = Array.isArray(value) ? (value as Record<string, unknown>[]) : []

  const handleCellChange = (rowIndex: number, fieldName: string, cellValue: unknown) => {
    const newRows = rows.map((row, idx) =>
      idx === rowIndex ? { ...row, [fieldName]: cellValue } : row
    )
    onChange?.(newRows)
  }

  const handleAddRow = () => {
    const newRow: Record<string, unknown> = {}
    children.forEach(child => {
      newRow[child.name] = child.defaultValue ?? ''
    })
    onChange?.([...rows, newRow])
  }

  const handleDeleteRow = (rowIndex: number) => {
    onChange?.(rows.filter((_, idx) => idx !== rowIndex))
  }

  const renderCell = (child: Record<string, unknown>, row: Record<string, unknown>, rowIndex: number) => {
    const renderFn = (adapter as any)[child.type as string]
    if (!renderFn) {
      return <span style={{ color: '#ff4d4f', fontSize: 12 }}>未知类型: {child.type as string}</span>
    }
    return renderFn({
      value: row[child.name as string],
      onChange: (v: unknown) => handleCellChange(rowIndex, child.name as string, v),
      fieldSchema: child,
      disabled: false,
    })
  }

  return (
    <div {...rest}>
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #d9d9d9' }}>
        <thead>
          <tr style={{ background: '#fafafa' }}>
            {columns.map((col, idx) => (
              <th
                key={idx}
                style={{
                  padding: '8px 12px',
                  textAlign: 'left',
                  fontWeight: 600,
                  fontSize: 14,
                  borderBottom: '1px solid #d9d9d9',
                  width: col.width ? `${col.width}%` : undefined,
                  minWidth: col.minWidth ? `${col.minWidth}%` : undefined,
                }}
              >
                {col.label}
              </th>
            ))}
            {rowMode === 'dynamic' && (
              <th style={{
                width: 60,
                padding: '8px 12px',
                textAlign: 'center',
                borderBottom: '1px solid #d9d9d9',
              }}>
                操作
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td
                colSpan={rowMode === 'dynamic' ? columns.length + 1 : columns.length}
                style={{ padding: '24px 12px', textAlign: 'center', color: '#999', fontSize: 13 }}
              >
                暂无数据
              </td>
            </tr>
          )}
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {children.map((child: Record<string, unknown>) => (
                <td
                  key={(child.id || child.name) as string}
                  style={{ padding: '4px 12px', borderBottom: '1px solid #f0f0f0' }}
                >
                  {renderCell(child, row, rowIndex)}
                </td>
              ))}
              {rowMode === 'dynamic' && (
                <td style={{
                  padding: '4px 12px',
                  borderBottom: '1px solid #f0f0f0',
                  textAlign: 'center',
                }}>
                  <Button size="small" danger onClick={() => handleDeleteRow(rowIndex)}>
                    删除
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 8 }}>
        {rowMode === 'dynamic' ? (
          <Button size="small" type="dashed" onClick={handleAddRow}>+ 添加行</Button>
        ) : (
          <span style={{ fontSize: 13, color: '#888' }}>共 {rows.length} 行（固定行数）</span>
        )}
      </div>
    </div>
  )
}