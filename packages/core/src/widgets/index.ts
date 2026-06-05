import type { DesignerWidgets } from '../types/adapter'
import { WidgetButton } from './Button'
import { WidgetButtonGroup } from './ButtonGroup'
import { WidgetCheckbox } from './Checkbox'
import { WidgetColorPicker } from './ColorPicker'
import { WidgetExpressionInput } from './ExpressionInput'
import { WidgetInput } from './Input'
import { WidgetModal } from './Modal'
import { WidgetNumberInput } from './NumberInput'
import { WidgetOptionsEditor } from './OptionsEditor'
import { WidgetTreeDataEditor } from './TreeDataEditor'
import { WidgetSelect } from './Select'
import { WidgetSwitch } from './Switch'
import { WidgetTextArea } from './TextArea'

export {
  WidgetButton,
  WidgetButtonGroup,
  WidgetCheckbox,
  WidgetColorPicker,
  WidgetExpressionInput,
  WidgetInput,
  WidgetModal,
  WidgetNumberInput,
  WidgetOptionsEditor,
  WidgetTreeDataEditor,
  WidgetSelect,
  WidgetSwitch,
  WidgetTextArea,
}

export const defaultDesignerWidgets: DesignerWidgets = {
  Input: WidgetInput,
  Select: WidgetSelect,
  Checkbox: WidgetCheckbox,
  NumberInput: WidgetNumberInput,
  TextArea: WidgetTextArea,
  Switch: WidgetSwitch,
  Button: WidgetButton,
  OptionsEditor: WidgetOptionsEditor,
  TreeDataEditor: WidgetTreeDataEditor,
  ButtonGroup: WidgetButtonGroup,
  ExpressionInput: WidgetExpressionInput,
  ColorPicker: WidgetColorPicker,
}
