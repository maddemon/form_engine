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

import { AlertField } from './components/Alert'
import { ButtonField } from './components/Button'
import { CardField } from './components/Card'
import { CascaderField } from './components/Cascader'
import { CheckboxField } from './components/Checkbox'
import { CollapseField } from './components/Collapse'
import { DateField } from './components/DatePicker'
import { DateRangeField } from './components/DateRange'
import { DividerField } from './components/Divider'
import { FlexField } from './components/Flex'
import { AntdMobileFormItem } from './components/FormItem'
import { AntdMobileFormWrapper } from './components/FormWrapper'
import { GridField } from './components/Grid'
import { HtmlField } from './components/Html'
import { ImageField } from './components/Image'
import { InputField } from './components/Input'
import { InputNumberField } from './components/InputNumber'
import { PasswordField } from './components/Password'
import { RadioField } from './components/Radio'
import { RateField } from './components/Rate'
import { SegmentField } from './components/Segment'
import { SelectField } from './components/Select'
import { SliderField } from './components/Slider'
import { SubFormField } from './components/SubForm'
import { SwitchField } from './components/Switch'
import { TabsField } from './components/Tabs'
import { TextField } from './components/Text'
import { TextAreaField } from './components/TextArea'
import { TimeField } from './components/TimePicker'
import { TitleField } from './components/Title'
import { TreeSelectField } from './components/TreeSelect'
import { UploadField } from './components/Upload'
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
    input: InputField,
    password: PasswordField,
    textarea: TextAreaField,
    'input-number': InputNumberField,
    select: SelectField,
    'multi-select': SelectField,
    radio: RadioField,
    checkbox: CheckboxField,
    switch: SwitchField,
    slider: SliderField,
    rate: RateField,
    date: DateField,
    datetime: DateField,
    'date-range': DateRangeField,
    time: TimeField,
    upload: UploadField,
    cascader: CascaderField,
    'tree-select': TreeSelectField,
    // 容器组件
    grid: GridField,
    flex: FlexField,
    collapse: CollapseField,
    tabs: TabsField,
    'sub-form': SubFormField,
    card: CardField,
    // 按钮组件
    button: ButtonField,
    // 展示组件
    text: TextField,
    html: HtmlField,
    image: ImageField,
    divider: DividerField,
    title: TitleField,
    alert: AlertField,
    segment: SegmentField,
  },

  default: DefaultField,
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
