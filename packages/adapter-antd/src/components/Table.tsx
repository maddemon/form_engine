/**
 * Antd Table 组件
 * 适配 Form Engine（columns + children 模式）
 * 使用 Ant Design 的 Table 组件
 */

import React from 'react'
import { Table as AntTable } from 'antd'
import { useAdapter } from '@form-engine/core'
import type { TableColumnConfig } from '@form-engine/core'

export const Table: React.FC<{
  value?: Record<string, unknown>[]
  onChange?: (val: Record<string, unknown>[]) => void
  fieldSchema?: any
  disabled?: boolean
  readOnly?: boolean
  [key: string]: any
}> = ({
  value = [],
  onChange,
  fieldSchema,
  disabled,
  ...rest
}) => {
  const field = fieldSchema ?? (rest as any).fieldSchema
  const adp = useAdapter() ?? (rest as any).adapter
  const children: any[] = field?.children ?? []
  const columns = ((field?.componentProps?.columns as TableColumnConfig[]) || []).filter(Boolean)

  if (columns.length === 0) {
    return (
      <div style={{ padding: 16, textAlign: 'center', color: 'var(--fe-text-tertiary)' }}>
        请先在「表格属性」中配置列
      </div>
    )
  }

  const renderCell = (child: Record<string, unknown>, row: Record<string, unknown>, rowIndex: number) => {
    const renderFn = (adp as any)?.[child.type as string]
    if (!renderFn) {
      return (
        <span style={{ color: 'var(--fe-text-tertiary)', fontSize: 12 }}>
          未知类型: {String(child.type)}
        </span>
      )
    }
    return React.createElement(renderFn, {
      value: row[child.name as string],
      onChange: (newValue: unknown) => {
        const newRows = [...value]
        newRows[rowIndex] = { ...row, [child.name as string]: newValue }
        onChange?.(newRows)
      },
      disabled: !!disabled,
      fieldSchema: child,
    })
  }

  const handleAddRow = () => {
    const newRow: Record<string, unknown> = {}
    children.forEach(child => {
      newRow[child.name as string] = child.defaultValue ?? ''
    })
    onChange?.([...value, newRow])
  }

  const handleRemoveRow = (rowIndex: number) => {
    onChange?.(value.filter((_, i) => i !== rowIndex))
  }

  // 表格列定义
  const antdColumns = [
    ...columns.map(col => {
      // 找这一列下的子字段
      const colChildren = children.filter(
        c => (c.columnIndex ?? Number(c.regionKey ?? -1)) === columns.indexOf(col)
      )
      return {
        title: col.label,
        key: col.key,
        width: col.width,
        render: (_: unknown, _row: Record<string, unknown>, rowIndex: number) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {colChildren.map(child => (
              <div key={child.id as string}>
                {renderCell(child, value[rowIndex] || {}, rowIndex)}
              </div>
            ))}
          </div>
        ),
      }
    }),
    {
      title: '操作',
      key: '__op__',
      width: 60,
      fixed: 'right' as const,
      render: (_: unknown, _row: Record<string, unknown>, rowIndex: number) => (
        <a
          style={{ color: 'var(--fe-error)' }}
          onClick={() => handleRemoveRow(rowIndex)}
        >
          删除
        </a>
      ),
    },
  ]

  return (
    <div>
      <AntTable
        dataSource={value}
        columns={antdColumns}
        rowKey={(_, idx) => String(idx)}
        pagination={false}
        size="small"
        bordered
      />
      <div style={{ marginTop: 8, textAlign: 'right' }}>
        <a onClick={handleAddRow} style={{ color: 'var(--fe-primary)' }}>
          + 添加行
        </a>
      </div>
    </div>
  )
}