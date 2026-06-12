import React from 'react'
import { getComponentIcon, ALL_FIELD_TYPES as REGISTRY_ALL_FIELD_TYPES } from '../../components'
import { LocalePack } from '../../locale'
import { customComponentRegistry } from '../../registry/customComponentRegistry'
import type { ThemeTokens } from '../../styles'
import { FieldType, FormFieldSchema } from '../../types'
import type { PaletteGroup, PaletteItem } from '../../types/designer'
import { defaultPaletteGroups } from '../data/paletteData'
import { DefaultIcon } from './DefaultIcon'

// ── 图标工具 ───────────────────────────────────────────────────────

/** 纯工具函数：根据 palette item 获取图标，token 由调用方组件传入 */
export function getIcon(
  item: PaletteItem,
  token: <K extends keyof ThemeTokens>(key: K) => ThemeTokens[K],
): React.ReactNode {
  const icon = getComponentIcon(item.type)
  if (icon) return icon

  const customConfig = customComponentRegistry.get(item.type)
  if (customConfig?.icon) {
    if (typeof customConfig.icon === 'string') {
      return <span style={{ fontSize: token('fontSizeSm') as string }}>{customConfig.icon}</span>
    }
    return customConfig.icon
  }
  return <DefaultIcon />
}

// ── Palette 工具函数（供外部使用）──────────────────────────────────

const ALL_FIELD_TYPES: readonly string[] = [...REGISTRY_ALL_FIELD_TYPES, 'custom']

function isValidFieldType(type: string): type is FieldType {
  return ALL_FIELD_TYPES.includes(type) || type.startsWith('custom:')
}

let _counter = 0
export function generateFieldId(type: FieldType): string {
  _counter++
  return `field_${type}_${Date.now()}_${_counter}`
}

function resolveDefaultProps(item: PaletteItem, locale?: LocalePack): Partial<FormFieldSchema> {
  const props = item.defaultProps
  if (typeof props === 'function') return props(locale!)
  return props ?? {}
}

export function createFieldFromPalette(item: PaletteItem, locale?: LocalePack): FormFieldSchema {
  const randomSuffix = Math.random().toString(36).substring(2, 8)
  const base = {
    id: generateFieldId(item.type),
    name: `${item.type}_${randomSuffix}`,
    type: item.type,
    label: item.label,
    children: [] as FormFieldSchema[],
    ...resolveDefaultProps(item, locale),
  } as FormFieldSchema
  if (item.extraData) {
    base.componentProps = { ...(base.componentProps || {}), ...item.extraData }
  }
  return base
}

export function getFullPaletteGroups(excludeTypes?: string[]): PaletteGroup[] {
  const customGrouped = customComponentRegistry.getGrouped()
  const merged = defaultPaletteGroups.map((group) => ({ ...group, items: [...group.items] }))

  if (Object.keys(customGrouped).length > 0) {
    for (const [groupName, configs] of Object.entries(customGrouped)) {
      const existingGroup = merged.find((g) => g.groupName === groupName)
      const paletteItems = configs
        .filter((config) => isValidFieldType(config.type))
        .map((config) => ({
          type: config.type as FieldType,
          label: config.label,
          defaultProps: config.defaultProps ?? {},
        }))
      if (existingGroup) {
        existingGroup.items.push(...paletteItems)
      } else {
        merged.push({ groupName, items: paletteItems })
      }
    }
  }

  if (excludeTypes && excludeTypes.length > 0) {
    const excludeSet = new Set(excludeTypes)
    return merged
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => !excludeSet.has(item.type)),
      }))
      .filter((group) => group.items.length > 0)
  }

  return merged
}
