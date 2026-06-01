import type { FieldType } from './schema'
import { componentPalettes } from '../components/paletteRegistry'

export type ComponentCategory = 'form' | 'display' | 'container' | 'button'

export function getComponentCategory(type: string): ComponentCategory | null {
  if (type.startsWith('custom:')) return 'form'
  if (type === 'custom') return 'form'
  return componentPalettes[type]?.category ?? null
}

export function isFormComponent(type: string): boolean {
  return getComponentCategory(type) === 'form'
}

export function isDisplayComponent(type: string): boolean {
  return getComponentCategory(type) === 'display'
}

export function isContainerComponent(type: string): boolean {
  return getComponentCategory(type) === 'container'
}

export function isButtonComponent(type: string): boolean {
  return getComponentCategory(type) === 'button'
}

export function getFormFieldTypes(): FieldType[] {
  return (Object.entries(componentPalettes) as [string, typeof componentPalettes[string]][])
    .filter(([_, palette]) => palette.category === 'form')
    .map(([type]) => type as FieldType)
}

export function getContainerFieldTypes(): FieldType[] {
  return (Object.entries(componentPalettes) as [string, typeof componentPalettes[string]][])
    .filter(([_, palette]) => palette.category === 'container')
    .map(([type]) => type as FieldType)
}