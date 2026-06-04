import type { DesignerWidgets } from '../types/adapter'
import { WidgetButton } from './Button'
import { WidgetButtonGroup } from './ButtonGroup'
import { WidgetCheckbox } from './Checkbox'
import { WidgetExpressionInput } from './ExpressionInput'
import { WidgetInput } from './Input'
import { WidgetNumberInput } from './NumberInput'
import { WidgetOptionsEditor } from './OptionsEditor'
import { WidgetSelect } from './Select'
import { WidgetSwitch } from './Switch'
import { WidgetTextArea } from './TextArea'

export const defaultDesignerWidgets: DesignerWidgets = {
  Input: WidgetInput,
  Select: WidgetSelect,
  Checkbox: WidgetCheckbox,
  NumberInput: WidgetNumberInput,
  TextArea: WidgetTextArea,
  Switch: WidgetSwitch,
  Button: WidgetButton,
  OptionsEditor: WidgetOptionsEditor,
  ButtonGroup: WidgetButtonGroup,
  ExpressionInput: WidgetExpressionInput,
}
