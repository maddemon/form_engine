import { useMemo } from 'react'
import type { FormFieldSchema, OptionItem } from '../../types/schema'

/**
 * 字段 options 解析 Hook
 *
 * 解析 4 层优先级的 options：
 * 1. field.mock.options（mock 数据，运行时模拟）
 * 2. 外部传入 options（调用方显式指定）
 * 3. field.dataSource.static.options（schema 静态数据源）
 * 4. field.componentProps.options（组件 props 中的 options）
 *
 * 提取自 FieldRenderer 内部逻辑，便于单测与复用。
 */
export function useFieldOptions(field: FormFieldSchema, options: OptionItem[]): OptionItem[] {
  return useMemo<OptionItem[]>(() => {
    if (field.mock?.options?.length) return field.mock.options
    if (options.length) return options
    if (field.dataSource?.type === 'static') return field.dataSource.static.options
    const cpOptions = field.componentProps?.options as OptionItem[] | undefined
    if (cpOptions?.length) return cpOptions
    return []
  }, [field.mock?.options, options, field.dataSource, field.componentProps?.options])
}
