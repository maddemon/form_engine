import type { OptionItem } from '@form-engine/core'

export function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function formatDateTime(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

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
