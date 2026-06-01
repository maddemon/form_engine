import type { ComponentType } from 'react'
import ButtonPropsRender from '../components/button/Props'
import CheckboxPropsRender from '../components/checkbox/Props'
import DatePickerPropsRender from '../components/date-picker/Props.tsx'
import InputNumberPropsRender from '../components/input-number/Props'
import InputPropsRender from '../components/input/Props'
import RadioPropsRender from '../components/radio/Props'
import RatePropsRender from '../components/rate/Props'
import SelectPropsRender from '../components/select/Props'
import SliderPropsRender from '../components/slider/Props'
import SwitchPropsRender from '../components/switch/Props'
import TextAreaPropsRender from '../components/textarea/Props'
import UploadPropsRender from '../components/upload/UploadPropsRender'
import type { PropsRenderProps } from './types'

export { FieldGroup, InlineField, OptionRender } from './shared'
export type { PropsRenderProps } from './types'

export const PropsRenderMap: Record<string, ComponentType<PropsRenderProps>> = {
  input: InputPropsRender,
  password: InputPropsRender,
  textarea: TextAreaPropsRender,
  'input-number': InputNumberPropsRender,
  select: SelectPropsRender,
  'multi-select': SelectPropsRender,
  radio: RadioPropsRender,
  checkbox: CheckboxPropsRender,
  switch: SwitchPropsRender,
  slider: SliderPropsRender,
  rate: RatePropsRender,
  date: DatePickerPropsRender,
  'date-range': DatePickerPropsRender,
  datetime: DatePickerPropsRender,
  time: DatePickerPropsRender,
  upload: UploadPropsRender,
  button: ButtonPropsRender,
}
