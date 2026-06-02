import React from 'react'
import type { ComponentPalette } from '../types/palette'
import type { ComponentCategory } from '../types/component-category'
import type { FormFieldSchema } from '../types/schema'
import { palette as buttonPalette } from './button/palette'
import { palette as checkboxPalette } from './checkbox/palette'
import { palette as collapsePalette } from './collapse/palette'
import { palette as containerPalette } from './container/palette'
import { datePalette, dateRangePalette } from './date-picker/palette'
import { palette as dateTimePalette } from './date-time/palette'
import { palette as dividerPalette } from './divider/palette'
import { palette as flexPalette } from './flex/palette'
import { palette as gridPalette } from './grid/palette'
import { palette as imagePalette } from './image/palette'
import { palette as inputPalette } from './input/palette'
import { palette as inputNumberPalette } from './input-number/palette'
import { palette as passwordPalette } from './password/palette'
import { palette as radioPalette } from './radio/palette'
import { palette as ratePalette } from './rate/palette'
import { palette as selectPalette } from './select/palette'
import { palette as sliderPalette } from './slider/palette'
import { palette as switchPalette } from './switch/palette'
import { palette as tablePalette } from './table/palette'
import { palette as tabsPalette } from './tabs/palette'
import { palette as textPalette } from './text/palette'
import { palette as textareaPalette } from './textarea/palette'
import { palette as timePalette } from './time-picker/palette'
import { palette as titlePalette } from './title/palette'
import { palette as uploadPalette } from './upload/palette'

export const componentPalettes: Record<string, ComponentPalette> = {
  input: inputPalette,
  textarea: textareaPalette,
  'input-number': inputNumberPalette,
  password: passwordPalette,
  select: selectPalette,
  radio: radioPalette,
  checkbox: checkboxPalette,
  switch: switchPalette,
  slider: sliderPalette,
  rate: ratePalette,
  date: datePalette,
  'date-range': dateRangePalette,
  datetime: dateTimePalette,
  time: timePalette,
  upload: uploadPalette,
  button: buttonPalette,
  grid: gridPalette,
  flex: flexPalette,
  container: containerPalette,
  collapse: collapsePalette,
  table: tablePalette,
  tabs: tabsPalette,
  text: textPalette,
  image: imagePalette,
  divider: dividerPalette,
  title: titlePalette,
}

export function getComponentLabel(type: string): string {
  return componentPalettes[type]?.label ?? type
}

export function getComponentCategory(type: string): ComponentCategory | null {
  if (type.startsWith('custom:')) return 'form'
  if (type === 'custom') return 'form'
  return componentPalettes[type]?.category ?? null
}

export function getComponentIcon(type: string): React.ReactNode | null {
  return componentPalettes[type]?.icon ?? null
}

export function getComponentDefaultProps(type: string): Partial<FormFieldSchema> {
  return componentPalettes[type]?.defaultProps ?? {}
}