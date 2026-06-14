/**
 * Form Engine - Antd Adapter
 *
 * 纯对象适配器，无全局注册、无 Proxy、无副作用。
 *
 * 使用方式：
 * ```tsx
 * import { antdAdapter } from '@form-engine/antd'
 * import { FormRender } from '@form-engine/core'
 *
 * <FormRender schema={schema} adapter={antdAdapter} />
 * ```
 */

import type { DesignerWidgets, FieldRendererFn, FormEngineAdapter } from '@form-engine/core'
import { defaultFieldRenderer } from '@form-engine/core/styles'

// JSX Scope 组件
import {
  Avatar as AntAvatar,
  Badge as AntBadge,
  Button as AntButton,
  Card as AntCard,
  Col as AntCol,
  Descriptions as AntDescriptions,
  Empty as AntEmpty,
  List as AntList,
  Popover as AntPopover,
  Progress as AntProgress,
  QRCode as AntQRCode,
  Result as AntResult,
  Row as AntRow,
  Skeleton as AntSkeleton,
  Space as AntSpace,
  Spin as AntSpin,
  Steps as AntSteps,
  Table as AntTable,
  Tag as AntTag,
  Tooltip as AntTooltip,
  Typography,
} from 'antd'
const { Text: AntText, Title: AntTitle, Paragraph: AntParagraph } = Typography

// 静态导入所有字段组件
import { Alert } from './components/Alert'
import { Button } from './components/Button'
import { Card } from './components/Card'
import { Cascader } from './components/Cascader'
import { Checkbox } from './components/Checkbox'
import { Collapse } from './components/Collapse'
import { DatePicker, DateRangePicker, TimePicker } from './components/DatePicker'
import { Divider } from './components/Divider'
import { Flex } from './components/Flex'
import { AntdFormItem } from './components/FormItem'
import { AntdFormWrapper } from './components/FormWrapper'
import { Grid } from './components/Grid'
import { Html } from './components/Html'
import { Image } from './components/Image'
import { Input, Password } from './components/Input'
import { InputNumber } from './components/InputNumber'
import { Radio } from './components/Radio'
import { Rate } from './components/Rate'
import { Segment } from './components/Segment'
import { Select } from './components/Select'
import { Slider } from './components/Slider'
import { SubForm } from './components/SubForm'
import { Switch as SwitchField } from './components/Switch'
import { Tabs } from './components/Tabs'
import { Text } from './components/Text'
import { TextArea } from './components/TextArea'
import { Title } from './components/Title'
import { TreeSelect } from './components/TreeSelect'
import { Upload } from './components/Upload'
import { AntdBridgeProvider } from './themeBridge'
import { designerWidgets } from './widgets'

// 组件导出
export { Alert } from './components/Alert'
export { Button } from './components/Button'
export { Card } from './components/Card'
export { Cascader } from './components/Cascader'
export { Checkbox, CheckboxGroup } from './components/Checkbox'
export { Collapse, CollapsePanel } from './components/Collapse'
export { DatePicker, DateRangePicker, TimePicker } from './components/DatePicker'
export { Divider } from './components/Divider'
export { Flex } from './components/Flex'
export { Grid } from './components/Grid'
export { Html } from './components/Html'
export { Image } from './components/Image'
export { Input, Password } from './components/Input'
export { InputNumber } from './components/InputNumber'
export { Radio, RadioGroup } from './components/Radio'
export { Rate } from './components/Rate'
export { Segment } from './components/Segment'
export { Select } from './components/Select'
export { Slider } from './components/Slider'
export { SubForm } from './components/SubForm'
export { Switch } from './components/Switch'
export { TabPane, Tabs } from './components/Tabs'
export { Text } from './components/Text'
export { TextArea } from './components/TextArea'
export { Title } from './components/Title'
export { TreeSelect } from './components/TreeSelect'
export { Upload } from './components/Upload'

// Theme Bridge
export { AntdBridgeProvider } from './themeBridge'

// Form / FormItem
export { AntdFormItem } from './components/FormItem'
export { AntdFormWrapper } from './components/FormWrapper'

// Designer PropertyPanel Widgets
export { designerWidgets } from './widgets'

// ============================
// 设计器属性面板小组件 — 见 ./widgets
// ============================

// ============================
// Adapter 定义
// ============================

/**
 * Antd Adapter — 桌面端
 *
 * 纯对象，field.type → FieldRendererFn 的映射。
 * 通过 adapter.components['input'] 查找组件。
 */
export const antdAdapter: FormEngineAdapter = {
  name: 'antd',
  scene: 'desktop',

  components: {
    // 表单组件
    input: Input,
    password: Password,
    textarea: TextArea,
    'input-number': InputNumber,
    select: Select,
    'multi-select': Select,
    switch: SwitchField,
    radio: Radio,
    checkbox: Checkbox,
    slider: Slider,
    rate: Rate,
    date: DatePicker,
    datetime: DatePicker,
    'date-range': DateRangePicker,
    time: TimePicker,
    upload: Upload,
    cascader: Cascader,
    'tree-select': TreeSelect,
    // 容器组件
    grid: Grid,
    flex: Flex,
    collapse: Collapse,
    tabs: Tabs,
    'sub-form': SubForm,
    card: Card,
    // 展示组件
    text: Text,
    image: Image,
    divider: Divider,
    title: Title,
    alert: Alert,
    html: Html,
    segment: Segment,
    button: Button,
  } as unknown as Record<string, FieldRendererFn>,

  default: defaultFieldRenderer,
  designerWidgets: designerWidgets as DesignerWidgets,
  bridgeProvider: AntdBridgeProvider,
  FormWrapper: AntdFormWrapper,
  FormItem: AntdFormItem,
  jsxScope: {
    AntCard,
    AntTag,
    AntTable,
    AntBadge,
    AntProgress,
    AntAvatar,
    AntList,
    AntEmpty,
    AntSpin,
    AntTooltip,
    AntPopover,
    AntQRCode,
    AntSkeleton,
    AntResult,
    AntSteps,
    AntDescriptions,
    AntSpace,
    AntRow,
    AntCol,
    AntText,
    AntTitle,
    AntParagraph,
    AntButton,
  },
}

export default antdAdapter
