import type { FieldType } from './schema'
import {
  componentRegistry,
  getComponentCategory as _getComponentCategory,
  getFormFieldTypes as _getFormFieldTypes,
  getContainerFieldTypes as _getContainerFieldTypes,
  type ComponentRegistration,
} from '../components'

export type ComponentCategory = 'form' | 'display' | 'container' | 'button'

export function getComponentCategory(type: string): ComponentCategory | null {
  return _getComponentCategory(type)
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
  return _getFormFieldTypes() as FieldType[]
}

export function getContainerFieldTypes(): FieldType[] {
  return _getContainerFieldTypes() as FieldType[]
}
