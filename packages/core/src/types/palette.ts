import type React from 'react'
import type { ComponentCategory } from './component-category'
import type { FormFieldSchema } from './schema'

export interface ComponentPalette {
  label: string
  category: ComponentCategory
  icon: React.ReactNode
  defaultProps?: Partial<FormFieldSchema>
}