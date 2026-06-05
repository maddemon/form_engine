/**
 * Adapter Antd - Designer Widget Mappings
 *
 * 将 Form Engine 的 DesignerWidgets 接口映射到 antd 组件。
 * 这些 widget 用在 PropertyPanel（属性面板）中，与运行时 field 组件无关。
 */

export { ButtonGroup } from './ButtonGroup'
export { Checkbox } from './Checkbox'
export { ColorPicker } from './ColorPicker'
export { Input } from './Input'
export { NumberInput } from './NumberInput'
export { Select } from './Select'
export { Switch } from './Switch'

import type { DesignerWidgets } from '@form-engine/core/types/adapter'
import { ButtonGroup } from './ButtonGroup'
import { Checkbox } from './Checkbox'
import { ColorPicker } from './ColorPicker'
import { Input } from './Input'
import { NumberInput } from './NumberInput'
import { Select } from './Select'
import { Switch } from './Switch'

/**
 * Antd 适配器的 PropertyPanel 小组件集合
 */
export const designerWidgets: DesignerWidgets = {
  Input,
  Select,
  Checkbox,
  Switch,
  NumberInput,
  ButtonGroup,
  ColorPicker,
}
