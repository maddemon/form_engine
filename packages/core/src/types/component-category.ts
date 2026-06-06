import type { FieldType } from './schema'
import {
  componentRegistry,
  getComponentCategory as _getComponentCategory,
  getFormFieldTypes as _getFormFieldTypes,
  getContainerFieldTypes as _getContainerFieldTypes,
  type ComponentRegistration,
} from '../components'

export type ComponentCategory = 'form' | 'display' | 'container' | 'button'

export function getComponentCategory(type: string): ComponentCategory | ComponentCategory[] | null {
  return _getComponentCategory(type)
}

export function isFormComponent(type: string): boolean {
  const c = getComponentCategory(type)
  if (!c) return false
  if (Array.isArray(c)) return c.includes('form')
  return c === 'form'
}

export function isDisplayComponent(type: string): boolean {
  const c = getComponentCategory(type)
  if (!c) return false
  if (Array.isArray(c)) return c.includes('display')
  return c === 'display'
}

export function isContainerComponent(type: string): boolean {
  const c = getComponentCategory(type)
  if (!c) return false
  if (Array.isArray(c)) return c.includes('container')
  return c === 'container'
}

export function isButtonComponent(type: string): boolean {
  const c = getComponentCategory(type)
  if (!c) return false
  if (Array.isArray(c)) return c.includes('button')
  return c === 'button'
}

export function getFormFieldTypes(): FieldType[] {
  return _getFormFieldTypes() as FieldType[]
}

export function getContainerFieldTypes(): FieldType[] {
  return _getContainerFieldTypes() as FieldType[]
}
