/**
 * Form Engine - Antd Mobile Adapter
 *
 * 纯对象适配器，无全局注册、无 Proxy、无副作用。
 *
 * 使用方式：
 * ```tsx
 * import { antdMobileAdapter } from '@form-engine/adapter-antd-mobile'
 * import { FormRender } from '@form-engine/core'
 *
 * <FormRender schema={schema} adapter={antdMobileAdapter} />
 * ```
 */

import type { FieldComponentProps, FieldRendererFn, FormEngineAdapter } from '@form-engine/core'

import {
  Avatar as AntmAvatar,
  Badge as AntmBadge,
  Button as AntmButton,
  CapsuleTabs as AntmCapsuleTabs,
  Card as AntmCard,
  Empty as AntmEmpty,
  List as AntmList,
  NoticeBar as AntmNoticeBar,
  Popover as AntmPopover,
  ProgressBar as AntmProgress,
  Result as AntmResult,
  Skeleton as AntmSkeleton,
  SpinLoading as AntmSpinLoading,
  Steps as AntmSteps,
  Swiper as AntmSwiper,
} from 'antd-mobile'

import { Alert } from './components/Alert'
import { Button } from './components/Button'
import { Card } from './components/Card'
import { Cascader } from './components/Cascader'
import { Checkbox } from './components/Checkbox'
import { Collapse } from './components/Collapse'
import { DatePicker } from './components/DatePicker'
import { DateRangePicker } from './components/DateRange'
import { Divider } from './components/Divider'
import { Flex } from './components/Flex'
import { AntdMobileFormItem } from './components/FormItem'
import { AntdMobileFormWrapper } from './components/FormWrapper'
import { Grid } from './components/Grid'
import { Html } from './components/Html'
import { Image } from './components/Image'
import { Input } from './components/Input'
import { InputNumber } from './components/InputNumber'
import { Password } from './components/Password'
import { Radio } from './components/Radio'
import { Rate } from './components/Rate'
import { Segment } from './components/Segment'
import { Select } from './components/Select'
import { Slider } from './components/Slider'
import { SubForm } from './components/SubForm'
import { Switch } from './components/Switch'
import { Tabs } from './components/Tabs'
import { Text } from './components/Text'
import { TextArea } from './components/TextArea'
import { TimePicker } from './components/TimePicker'
import { Title } from './components/Title'
import { TreeSelect } from './components/TreeSelect'
import { Upload } from './components/Upload'
import { AntdMobileBridgeProvider } from './themeBridge'

// Theme Bridge
export { AntdMobileBridgeProvider } from './themeBridge'

// Form / FormItem
export { AntdMobileFormItem } from './components/FormItem'
export { AntdMobileFormWrapper } from './components/FormWrapper'

// ============================
// 兜底渲染
// ============================

const DefaultField: FieldRendererFn = (props: FieldComponentProps) => {
  const { fieldSchema } = props
  const displayName = fieldSchema.label || fieldSchema.name || fieldSchema.type
  return <div style={{ padding: '8px 0', color: '#999', fontSize: 12 }}>{displayName}</div>
}

// ============================
// 设计器属性面板小组件
// ============================
// 注意：adapter-antd-mobile 面向移动端场景。属性面板是 desktop 渲染器，
// 不应在此提供 widgets 覆盖，应回退到 core 的 defaultDesignerWidgets。
// 移动端适配器按场景只需提供 components（field.type 渲染器）。

// ============================
// Adapter 定义
// ============================

/**
 * Antd Mobile Adapter — 移动端
 *
 * 纯对象，field.type → FieldRendererFn 的映射。
 * 通过 adapter.components['input'] 查找组件。
 */
export const antdMobileAdapter: FormEngineAdapter = {
  name: 'antd-mobile',
  scene: 'mobile',

  components: {
    // 表单组件
    input: Input,
    password: Password,
    textarea: TextArea,
    'input-number': InputNumber,
    select: Select,
    'multi-select': Select,
    radio: Radio,
    checkbox: Checkbox,
    switch: Switch,
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
    // 按钮组件
    button: Button,
    // 展示组件
    text: Text,
    html: Html,
    image: Image,
    divider: Divider,
    title: Title,
    alert: Alert,
    segment: Segment,
  } as unknown as Record<string, FieldRendererFn>,

  default: DefaultField as FieldRendererFn,
  bridgeProvider: AntdMobileBridgeProvider,
  FormWrapper: AntdMobileFormWrapper,
  FormItem: AntdMobileFormItem,
  jsxScope: {
    AntmCard,
    AntmBadge,
    AntmAvatar,
    AntmList,
    AntmEmpty,
    AntmSpinLoading,
    AntmSwiper,
    AntmCapsuleTabs,
    AntmProgress,
    AntmSteps,
    AntmResult,
    AntmSkeleton,
    AntmNoticeBar,
    AntmPopover,
    AntmButton,
  },
  // designerWidgets: 不提供 — PropertyPanel 是 desktop 渲染器，
  // 移动端适配器无 widgets 覆盖时自动回退到 core 的 defaultDesignerWidgets。
}

export default antdMobileAdapter
