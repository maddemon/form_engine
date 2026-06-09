import { FormSchema } from '@form-engine/core'

const schemaEn: FormSchema = {
  version: '0.1',
  name: 'Form Engine Demo',
  description: 'A sample form demonstrating various data source types',
  fields: [
    {
      id: 'field-welcome-title',
      name: 'welcomeTitle',
      type: 'title',
      label: '',
      componentProps: { children: 'Welcome to Form Engine', level: 3, textAlign: 'center' },
      children: [],
    },
    {
      id: 'field-welcome-text',
      name: 'welcomeText',
      type: 'text',
      label: '',
      componentProps: {
        children:
          'This is a sample form for testing different data source types. You can edit it freely in the Designer, or switch to the Render page to preview.',
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
      label: 'Full Name',
      placeholder: 'Enter your name',
      rules: [{ required: true, message: 'Please enter your name' }],
      componentProps: { allowClear: true },
      children: [],
    },
    {
      id: 'field-gender',
      name: 'gender',
      type: 'select',
      label: 'Gender',
      placeholder: 'Select gender',
      dataSource: {
        type: 'static',
        static: {
          options: [
            { label: 'Male', value: 'male' },
            { label: 'Female', value: 'female' },
          ],
        },
      },
      help: 'Data Source: Static',
      componentProps: { allowClear: true },
      children: [],
    },
    {
      id: 'field-age',
      name: 'age',
      type: 'input-number',
      label: 'Age',
      placeholder: 'Enter your age',
      rules: [{ required: true, message: 'Please enter your age' }],
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
      componentProps: { children: '▼ Data Source Demo: Static & Remote data sources', strong: true },
      children: [],
    },
    {
      id: 'field-city',
      name: 'city',
      type: 'select',
      label: 'City',
      placeholder: 'Select city (remote data)',
      dataSource: {
        type: 'remote',
        remote: {
          config: {
            url: 'data.json',
            method: 'GET',
            labelField: 'label',
            valueField: 'value',
            resultPath: 'cities',
          },
        },
      },
      help: 'Data Source: Remote (GET data.json → resultPath: "cities")',
      componentProps: { allowClear: true, showSearch: true },
      children: [],
    },
    {
      id: 'field-department',
      name: 'department',
      type: 'cascader',
      label: 'Department',
      placeholder: 'Select department (remote data)',
      dataSource: {
        type: 'remote',
        remote: {
          config: {
            url: 'data.json',
            method: 'GET',
            labelField: 'label',
            valueField: 'value',
            resultPath: 'departments',
          },
        },
      },
      help: 'Data Source: Remote (cascading, with nested children)',
      componentProps: { allowClear: true },
      children: [],
    },
    {
      id: 'field-skills',
      name: 'skills',
      type: 'multi-select',
      label: 'Skills',
      placeholder: 'Select skills (remote, multi-select)',
      dataSource: {
        type: 'remote',
        remote: {
          config: {
            url: 'data.json',
            method: 'GET',
            labelField: 'label',
            valueField: 'value',
            resultPath: 'skills',
          },
        },
      },
      help: 'Data Source: Remote (multi-select)',
      componentProps: { mode: 'multiple', allowClear: true },
      children: [],
    },
    {
      id: 'field-color',
      name: 'color',
      type: 'radio',
      label: 'Favorite Color',
      dataSource: {
        type: 'static',
        static: {
          options: [
            { label: 'Red', value: 'red' },
            { label: 'Blue', value: 'blue' },
            { label: 'Green', value: 'green' },
            { label: 'Yellow', value: 'yellow' },
          ],
        },
      },
      help: 'Data Source: Static (Radio)',
      componentProps: { direction: 'horizontal' },
      children: [],
    },
    {
      id: 'field-birthday',
      name: 'birthday',
      type: 'date',
      label: 'Date of Birth',
      placeholder: 'Select your date of birth',
      componentProps: { allowClear: true },
      children: [],
    },
    {
      id: 'field-hint',
      name: 'hint',
      type: 'text',
      label: '',
      componentProps: {
        children: '💡 Fields marked with * are required. Remote data sources require the dev server to be running.',
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

export default schemaEn
