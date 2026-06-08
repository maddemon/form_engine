/**
 * Antd Table 组件
 * 适配 Form Engine（columns + children 模式）
 * 使用 Ant Design 的 Table 组件
 */

import type { FormFieldSchema, OptionItem, SubFormColumnConfig } from '@form-engine/core'
import { useAdapter } from '@form-engine/core'
import { useLocale } from '@form-engine/core/locale'
import { Table as AntTable } from 'antd'
import React from 'react'

export const SubForm: React.FC<{
  value?: Record<string, unknown>[]
  onChange?: (val: Record<string, unknown>[]) => void
  fieldSchema: FormFieldSchema
  disabled?: boolean
  readOnly?: boolean
}> = ({ value = [], onChange, fieldSchema, disabled, ...rest }) => {
  const field = fieldSchema
  const adapter = useAdapter()
  const { locale } = useLocale()
  const children = field.children ?? []
  const columns = ((field.componentProps?.columns as SubFormColumnConfig[]) || []).filter(Boolean)

  if (columns.length === 0) {
    return (
      <div style={{ padding: 16, textAlign: 'center', color: 'var(--fe-text-tertiary)' }}>
        请先在「表格属性」中配置列
      </div>
    )
  }

  const resolveChildOptions = (child: FormFieldSchema): OptionItem[] => {
    if (child.mock?.options?.length) return child.mock.options
    if (child.dataSource?.type === 'static' && child.dataSource.static.options?.length)
      return child.dataSource.static.options
    const cpOptions = child.componentProps?.options as OptionItem[] | undefined
    if (cpOptions?.length) return cpOptions
    return []
  }

  const renderCell = (child: Record<string, unknown>, row: Record<string, unknown>, rowIndex: number) => {
    const childSchema = child as unknown as FormFieldSchema
    const renderFn = adapter?.components[child.type as string]
    if (!renderFn) {
      return <span style={{ color: 'var(--fe-text-tertiary)', fontSize: 12 }}>未知类型: {String(child.type)}</span>
    }
    const { options: _ignored, ...restComponentProps } = childSchema.componentProps ?? {}
    return React.createElement(renderFn, {
      value: row[child.name as string],
      onChange: (newValue) => {
        const newRows = [...value]
        newRows[rowIndex] = { ...row, [child.name as string]: newValue }
        onChange?.(newRows)
      },
      disabled: !!disabled,
      fieldSchema: childSchema,
      options: resolveChildOptions(childSchema),
      ...restComponentProps,
    } as React.ComponentProps<typeof renderFn>)
  }

  const handleAddRow = () => {
    const newRow: Record<string, unknown> = {}
    children.forEach((child) => {
      newRow[child.name as string] = child.defaultValue ?? ''
    })
    onChange?.([...value, newRow])
  }

  const handleRemoveRow = (rowIndex: number) => {
    onChange?.(value.filter((_, i) => i !== rowIndex))
  }

  // 表格列定义
  const antdColumns = [
    ...columns.map((col) => {
      // 找这一列下的子字段
      const colChildren = children.filter((c) => (c.columnIndex ?? Number(c.regionKey ?? -1)) === columns.indexOf(col))
      return {
        title: (col as SubFormColumnConfig).label,
        key: (col as unknown as Record<string, unknown>).key as string | undefined,
        width: col.width,
        render: (_: unknown, _row: Record<string, unknown>, rowIndex: number) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {colChildren.map((child) => (
              <div key={child.id as string}>
                {renderCell(child as unknown as Record<string, unknown>, value[rowIndex] || {}, rowIndex)}
              </div>
            ))}
          </div>
        ),
      }
    }),
    {
      title: locale.adapter.antd.subForm.operation,
      key: '__op__',
      width: 60,
      fixed: 'right' as const,
      render: (_: unknown, _row: Record<string, unknown>, rowIndex: number) => (
        <a style={{ color: 'var(--fe-error)' }} onClick={() => handleRemoveRow(rowIndex)}>
          {locale.adapter.antd.subForm.delete}
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
          {locale.adapter.antd.subForm.addRow}
        </a>
      </div>
    </div>
  )
}
