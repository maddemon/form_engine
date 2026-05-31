/**
 * Form Engine - Core Components
 * 默认 HTML 原生组件实现
 * 当用户未安装任何 adapter 时，自动使用这些组件
 */

// 表单组件
export { Input, Password } from './input'
export { Select } from './select'
export { TextArea } from './textarea'
export { Switch } from './switch'
export { Radio, RadioGroup } from './radio'
export { Checkbox, CheckboxGroup } from './checkbox'
export { InputNumber } from './input-number'
export { Slider } from './slider'
export { Rate } from './rate'
export { DatePicker, DateRangePicker } from './date-picker'
export { Upload } from './upload'
export { Button } from './button'

// 布局组件
export { Grid } from './grid'
export { Flex } from './flex'

// 展示组件
export { Text } from './text'
export { Image } from './image'
export { Divider } from './divider'
export { Container } from './container'

// 图标
export { default as iconMap, type IconProps } from './icons'

// 更多组件待实现...
// export { AutoComplete } from './auto-complete'
// export { Cascader } from './cascader'
// export { TreeSelect } from './tree-select'
// export { TimePicker } from './time-picker'
// export { ColorPicker } from './color-picker'
