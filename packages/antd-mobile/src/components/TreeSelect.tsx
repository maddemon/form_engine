import type { OptionItem, TreeSelectProps } from '@form-engine/core'
import { Cascader as AntmCascader, Space } from 'antd-mobile'
import { CloseCircleFill, DownOutline } from 'antd-mobile-icons'
import React, { useMemo } from 'react'
import { toCascaderOptions } from '../utils'

function toPath(opts: OptionItem[], target: string): string[] {
  for (const opt of opts) {
    if (String(opt.value) === target) return [String(opt.value)]
    if (opt.children) {
      const sub = toPath(opt.children, target)
      if (sub.length) return [String(opt.value), ...sub]
    }
  }
  return []
}

function toLabels(opts: OptionItem[], vals: string[]): string[] {
  const labels: string[] = []
  let cur: OptionItem[] = opts
  for (const v of vals) {
    const found = cur.find((o) => String(o.value) === v)
    if (!found) break
    labels.push(found.label)
    cur = found.children || []
  }
  return labels
}

export const TreeSelect: React.FC<TreeSelectProps> = ({
  value,
  onChange,
  disabled,
  options = [],
  allowClear,
  placeholder: placeholderProp = '请选择',
  style,
  className,
  id,
}) => {
  const cascaderOptions = useMemo(() => toCascaderOptions((options || []) as OptionItem[]), [options])

  const valArr = useMemo(() => {
    if (!value) return []
    return toPath((options as OptionItem[]) || [], String(value))
  }, [value, options])

  const hasValue = valArr.length > 0

  return (
    <AntmCascader
      options={cascaderOptions}
      value={valArr}
      onConfirm={(vals) => {
        onChange?.(vals[vals.length - 1] ?? undefined)
      }}
    >
      {(vals: any, actions: any) => {
        const pathValues = (vals ?? []).map((v: any) => v?.value ?? v ?? '')
        const labels = toLabels((options as OptionItem[]) || [], pathValues)
        return (
          <Space
            block
            justify="between"
            align="center"
            onClick={disabled ? undefined : actions.open}
            style={{
              color: hasValue ? undefined : 'var(--adm-color-weak)',
              cursor: disabled ? 'default' : 'pointer',
              ...style,
            }}
            className={className}
            id={id}
          >
            <span>{labels.length > 0 ? labels.join(' / ') : placeholderProp}</span>
            {hasValue && allowClear ? (
              <CloseCircleFill
                style={{ fontSize: 16, flexShrink: 0 }}
                onClick={(e) => {
                  e.stopPropagation()
                  onChange?.(undefined)
                }}
              />
            ) : (
              <DownOutline style={{ fontSize: 16, flexShrink: 0 }} />
            )}
          </Space>
        )
      }}
    </AntmCascader>
  )
}
