import type { ComponentType } from 'react'
import ButtonPropsRender from '../components/button/Props'
import CheckboxPropsRender from '../components/checkbox/Props'
import CollapsePropsRender from '../components/collapse/Props'
import ContainerPropsRender from '../components/container/Props'
import DatePickerPropsRender from '../components/date-picker/Props'
import DividerPropsRender from '../components/divider/Props'
import FlexPropsRender from '../components/flex/Props'
import GridPropsRender from '../components/grid/Props'
import ImagePropsRender from '../components/image/Props'
import InputNumberPropsRender from '../components/input-number/Props'
import InputPropsRender from '../components/input/Props'
import RadioPropsRender from '../components/radio/Props'
import RatePropsRender from '../components/rate/Props'
import SelectPropsRender from '../components/select/Props'
import SliderPropsRender from '../components/slider/Props'
import SwitchPropsRender from '../components/switch/Props'
import TabsPropsRender from '../components/tabs/Props'
import TextPropsRender from '../components/text/Props'
import TextAreaPropsRender from '../components/textarea/Props'
import TitlePropsRender from '../components/title/Props'
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
  grid: GridPropsRender,
  flex: FlexPropsRender,
  container: ContainerPropsRender,
  collapse: CollapsePropsRender,
  tabs: TabsPropsRender,
  text: TextPropsRender,
  image: ImagePropsRender,
  divider: DividerPropsRender,
  title: TitlePropsRender,
}
