import type { OptionItem } from '../../types/schema'

export function parseUrlDeps(url: string): string[] {
  const regex = /\{(\w+)\}/g
  const deps: string[] = []
  let match
  while ((match = regex.exec(url)) !== null) {
    if (!deps.includes(match[1])) deps.push(match[1])
  }
  return deps
}

export function toFlatLines(options: OptionItem[]): string {
  return options.map((o) => `${o.label} ${o.value}`).join('\n')
}

export function fromFlatLines(text: string): OptionItem[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const parts = l.split(/\s+/)
      const label = parts[0] || ''
      const value = parts.length > 1 ? parts[1] : label
      return { label, value }
    })
}