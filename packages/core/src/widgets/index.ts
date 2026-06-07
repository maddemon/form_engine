import type { DesignerWidgets } from '../types/adapter'
import { WidgetButton } from './Button'
import { WidgetButtonGroup } from './ButtonGroup'
import { WidgetCheckbox } from './Checkbox'
import { WidgetColorPicker } from './ColorPicker'
import { WidgetExpressionInput } from './ExpressionInput'
import { WidgetInput } from './Input'
import { WidgetModal } from './Modal'
import { WidgetNumberInput } from './NumberInput'
import { WidgetDataSourceEditor } from './DataSourceEditor'
import { SortableTableEditor } from './SortableTableEditor'
import { WidgetTreeDataEditor } from './TreeDataEditor'
import { WidgetSelect } from './Select'
import { WidgetSwitch } from './Switch'
import { WidgetTextArea } from './TextArea'
import { Space } from './Space'
import { Divider } from './Divider'
import { Text } from './Text'

export {
  WidgetButton,
  WidgetButtonGroup,
  WidgetCheckbox,
  WidgetColorPicker,
  WidgetExpressionInput,
  WidgetInput,
  WidgetModal,
  WidgetNumberInput,
  WidgetDataSourceEditor,
  SortableTableEditor,
  WidgetTreeDataEditor,
  WidgetSelect,
  WidgetSwitch,
  WidgetTextArea,
  Space,
  Divider,
  Text,
}

export const defaultDesignerWidgets: DesignerWidgets = {
  Input: WidgetInput,
  Select: WidgetSelect,
  Checkbox: WidgetCheckbox,
  NumberInput: WidgetNumberInput,
  TextArea: WidgetTextArea,
  Switch: WidgetSwitch,
  Button: WidgetButton,
  DataSourceEditor: WidgetDataSourceEditor,
  TreeDataEditor: WidgetTreeDataEditor,
  ButtonGroup: WidgetButtonGroup,
  ExpressionInput: WidgetExpressionInput,
  ColorPicker: WidgetColorPicker,
}
