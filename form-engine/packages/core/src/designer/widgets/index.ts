import type { DesignerWidgets } from '../../types/adapter'
import { WidgetInput } from './Input'
import { WidgetSelect } from './Select'
import { WidgetCheckbox } from './Checkbox'
import { WidgetNumberInput } from './NumberInput'
import { WidgetTextArea } from './TextArea'
import { WidgetSwitch } from './Switch'
import { WidgetButton } from './Button'
import { WidgetOptionsEditor } from './OptionsEditor'

export const defaultDesignerWidgets: DesignerWidgets = {
  Input: WidgetInput,
  Select: WidgetSelect,
  Checkbox: WidgetCheckbox,
  NumberInput: WidgetNumberInput,
  TextArea: WidgetTextArea,
  Switch: WidgetSwitch,
  Button: WidgetButton,
  OptionsEditor: WidgetOptionsEditor,
}
