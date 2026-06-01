import type { OptionItem } from '@form-engine/core'

export function toPickerColumns(options?: OptionItem[]) {
  if (!options) return [[]]
  return [
    options.map(opt => ({
      label: opt.label,
      value: String(opt.value),
    })),
  ]
}

export function toCascaderOptions(options?: OptionItem[]): { label: string; value: string; children?: ReturnType<typeof toCascaderOptions> }[] {
  if (!options) return []
  return options.map(opt => ({
    label: opt.label,
    value: String(opt.value),
    children: opt.children ? toCascaderOptions(opt.children) : undefined,
  }))
}
