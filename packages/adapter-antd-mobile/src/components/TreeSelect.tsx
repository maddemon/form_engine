import React, { useCallback, useMemo } from 'react'
import { Button, Cascader } from 'antd-mobile'
import type { OptionItem, FieldComponentProps, FieldRendererFn } from '@form-engine/core'
import { toCascaderOptions } from '../utils'

/**
 * 移动端 TreeSelect 适配器
 *
 * 使用 antd-mobile Cascader 实现多层树选择。
 * 值格式与 desktop TreeSelect 保持一致：仅存储叶子节点 value（如 "child-1"）。
 * Cascader 内部使用路径数组（["parent-1", "child-1"]），在此组件中完成双向转换。
 */
export const TreeSelectField: FieldRendererFn = (props: FieldComponentProps) => {
  const { value, onChange, disabled, fieldSchema, options } = props
  const cascaderOptions = useMemo(() => toCascaderOptions((options || []) as OptionItem[]), [options])
  const placeholder = fieldSchema.placeholder || '请选择'

  // 叶子节点值 → 路径数组
  const toPath = useCallback((opts: OptionItem[], target: string): string[] => {
    for (const opt of opts) {
      if (String(opt.value) === target) return [String(opt.value)]
      if (opt.children) {
        const sub = toPath(opt.children, target)
        if (sub.length) return [String(opt.value), ...sub]
      }
    }
    return []
  }, [])

  // 路径数组 → 标签文本
  const toLabels = useCallback((opts: OptionItem[], vals: string[]): string[] => {
    const labels: string[] = []
    let cur: OptionItem[] = opts
    for (const v of vals) {
      const found = cur.find((o) => String(o.value) === v)
      if (!found) break
      labels.push(found.label)
      cur = found.children || []
    }
    return labels
  }, [])

  const valArr = useMemo(() => {
    if (!value) return []
    return toPath((options as OptionItem[]) || [], String(value))
  }, [value, options, toPath])

  return (
    <Cascader
      options={cascaderOptions}
      value={valArr}
      onConfirm={(vals) => {
        // 回传叶子节点 value，保持与 desktop TreeSelect 一致的格式
        onChange?.(vals[vals.length - 1] ?? undefined)
      }}
    >
      {(vals: any, actions: any) => {
        const pathValues = (vals ?? []).map((v: any) => v?.value ?? v ?? '')
        const labels = toLabels((options as OptionItem[]) || [], pathValues)
        return (
          <Button
            onClick={actions.open}
            disabled={disabled}
            style={{ width: '100%', textAlign: 'left', color: labels.length ? undefined : '#999' }}
          >
            {labels.length > 0 ? labels.join(' / ') : placeholder}
          </Button>
        )
      }}
    </Cascader>
  )
}