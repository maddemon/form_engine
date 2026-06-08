import { FormSchema } from '@form-engine/core'

// ==== Schema 数据（中文版） ====
const schemaZh: FormSchema = {
  version: '0.1',
  name: '表单引擎演示',
  description: '用于演示和测试各种数据源类型的示例表单',
  fields: [
    {
      id: 'field-welcome-title',
      name: 'welcomeTitle',
      type: 'title',
      label: '',
      componentProps: { children: '欢迎使用 Form Engine', level: 3, textAlign: 'center' },
      children: [],
    },
    {
      id: 'field-welcome-text',
      name: 'welcomeText',
      type: 'text',
      label: '',
      componentProps: {
        children:
          '这是一份示例表单，用于测试不同数据源类型的控件。您可以在设计器中自由编辑，或切换到「渲染」页面预览效果。',
        type: 'secondary',
      },
      children: [],
    },
    {
      id: 'field-divider-1',
      name: 'divider1',
      type: 'divider',
      label: '',
      componentProps: {},
      children: [],
    },
    {
      id: 'field-name',
      name: 'name',
      type: 'input',
      label: '姓名',
      placeholder: '请输入您的姓名',
      rules: [{ required: true, message: '请输入姓名' }],
      componentProps: { allowClear: true },
      children: [],
    },
    {
      id: 'field-gender',
      name: 'gender',
      type: 'select',
      label: '性别',
      placeholder: '请选择性别',
      dataSource: {
        type: 'static',
        static: {
          options: [
            { label: '男', value: 'male' },
            { label: '女', value: 'female' },
          ],
        },
      },
      help: '数据源：静态（Static）',
      componentProps: { allowClear: true },
      children: [],
    },
    {
      id: 'field-age',
      name: 'age',
      type: 'input-number',
      label: '年龄',
      placeholder: '请输入年龄',
      rules: [{ required: true, message: '请输入年龄' }],
      componentProps: { min: 1, max: 150 },
      children: [],
    },
    {
      id: 'field-divider-2',
      name: 'divider2',
      type: 'divider',
      label: '',
      componentProps: {},
      children: [],
    },
    {
      id: 'field-ds-title',
      name: 'dsTitle',
      type: 'text',
      label: '',
      componentProps: { children: '▼ 数据源测试区：下面演示了静态数据源和远程数据源', strong: true },
      children: [],
    },
    {
      id: 'field-city',
      name: 'city',
      type: 'select',
      label: '所在城市',
      placeholder: '请选择城市（远程数据）',
      dataSource: {
        type: 'remote',
        remote: {
          config: {
            url: '/data.json',
            method: 'GET',
            labelField: 'label',
            valueField: 'value',
            resultPath: 'cities',
          },
        },
      },
      help: '数据源：远程接口（GET /data.json → resultPath: "cities"）',
      componentProps: { allowClear: true, showSearch: true },
      children: [],
    },
    {
      id: 'field-department',
      name: 'department',
      type: 'cascader',
      label: '所属部门',
      placeholder: '请选择部门（远程数据）',
      dataSource: {
        type: 'remote',
        remote: {
          config: {
            url: '/data.json',
            method: 'GET',
            labelField: 'label',
            valueField: 'value',
            resultPath: 'departments',
          },
        },
      },
      help: '数据源：远程接口（级联数据，带 children 嵌套）',
      componentProps: { allowClear: true },
      children: [],
    },
    {
      id: 'field-skills',
      name: 'skills',
      type: 'multi-select',
      label: '擅长技能',
      placeholder: '请选择技能（远程数据，可多选）',
      dataSource: {
        type: 'remote',
        remote: {
          config: {
            url: '/data.json',
            method: 'GET',
            labelField: 'label',
            valueField: 'value',
            resultPath: 'skills',
          },
        },
      },
      help: '数据源：远程接口（多选模式）',
      componentProps: { mode: 'multiple', allowClear: true },
      children: [],
    },
    {
      id: 'field-color',
      name: 'color',
      type: 'radio',
      label: '颜色偏好',
      dataSource: {
        type: 'static',
        static: {
          options: [
            { label: '红色', value: 'red' },
            { label: '蓝色', value: 'blue' },
            { label: '绿色', value: 'green' },
            { label: '黄色', value: 'yellow' },
          ],
        },
      },
      help: '数据源：静态（Radio 组件）',
      componentProps: { direction: 'horizontal' },
      children: [],
    },
    {
      id: 'field-birthday',
      name: 'birthday',
      type: 'date',
      label: '出生日期',
      placeholder: '请选择出生日期',
      componentProps: { allowClear: true },
      children: [],
    },
    {
      id: 'field-hint',
      name: 'hint',
      type: 'text',
      label: '',
      componentProps: {
        children: '💡 提示：带 * 标记的为必填项，远程数据源需要启动开发服务器才能正常加载。',
        type: 'secondary',
      },
      children: [],
    },
  ],
  form: {
    size: 'middle' as const,
    colon: false,
    desktop: {
      layout: 'horizontal' as const,
      labelAlign: 'right' as const,
      labelCol: { span: 5 },
      wrapperCol: { span: 15 },
    },
    mobile: {
      layout: 'vertical' as const,
    },
  },
}

export default schemaZh
