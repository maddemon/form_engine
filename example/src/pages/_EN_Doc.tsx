import { Anchor, Layout, Typography } from 'antd'
import { Content } from 'antd/es/layout/layout'
import Sider from 'antd/es/layout/Sider'
import { useRef } from 'react'
import { useAppContext } from '../context/AppContext'
import CodeBlock from './_CodeBlock'

export default function EnDocContent() {
  const { isDark } = useAppContext()
  const contentRef = useRef<HTMLDivElement>(null)
  const sections = [
    { id: 'intro', title: 'Introduction' },
    { id: 'core', title: 'Core Features' },
    { id: 'components', title: 'Components' },
    { id: 'quickstart', title: 'Quick Start' },
    { id: 'submit', title: 'Form Submission' },
    { id: 'custom-plugin', title: 'Custom Plugins' },
    { id: 'panel-extend', title: 'Panel Extension' },
    { id: 'container', title: 'Container Nesting' },
    { id: 'events', title: 'Event System' },
    { id: 'datasource', title: 'Data Source' },
    { id: 'custom-theme', title: 'Custom Theme' },
  ]
  return (
    <Layout style={{ height: '100%', overflow: 'hidden' }}>
      <Sider width={200} style={{ padding: '20px 0', overflow: 'auto' }} theme={isDark ? 'dark' : 'light'}>
        <Typography.Text
          type="secondary"
          style={{ fontSize: 12, padding: '0 24px', display: 'block', marginBottom: 8 }}
        >
          Contents
        </Typography.Text>
        <Anchor
          replace
          items={sections.map((s) => ({ key: s.id, href: `#${s.id}`, title: s.title }))}
          getContainer={() => contentRef.current!}
          targetOffset={16}
        />
      </Sider>
      <Content ref={contentRef as React.Ref<HTMLDivElement>} style={{ overflow: 'auto', padding: '32px 48px' }}>
        {/* Introduction */}
        <section id="intro" style={{ marginBottom: 48 }}>
          <Typography.Title level={3}>Introduction</Typography.Title>
          <Typography.Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
            Form Engine is a lightweight, extensible React form solution that provides a{' '}
            <strong>visual form designer</strong> and
            <strong> multi-scenario form rendering</strong>. It uses a Schema-driven architecture where a single form
            definition works across both desktop and mobile.
          </Typography.Paragraph>
          <Typography.Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
            Core design principle: <Typography.Text code>Design Time</Typography.Text> and{' '}
            <Typography.Text code>Run Time</Typography.Text> are separated. Configure forms by dragging in the Designer
            to generate a JSON Schema; consume the same Schema in the Renderer for a native experience on different
            devices.
          </Typography.Paragraph>
        </section>

        {/* Core Features */}
        <section id="core" style={{ marginBottom: 48 }}>
          <Typography.Title level={3}>Core Features</Typography.Title>
          <ul style={{ fontSize: 15, lineHeight: 2.2, paddingLeft: 20 }}>
            <li>
              <Typography.Text strong>Visual Designer</Typography.Text> — Drag components onto the canvas, reorder, nest
              containers, undo/redo, WYSIWYG
            </li>
            <li>
              <Typography.Text strong>Dual-Scene Rendering</Typography.Text> — Desktop / Mobile adapters, one Schema
              runs across devices
            </li>
            <li>
              <Typography.Text strong>Component Ecosystem</Typography.Text> — 25+ built-in components across form input,
              display, container, and button categories
            </li>
            <li>
              <Typography.Text strong>Custom Component System</Typography.Text> — Register any React component via{' '}
              <Typography.Text code>registerSimpleCustomComponent</Typography.Text> or{' '}
              <Typography.Text code>registerCustomComponent</Typography.Text>
            </li>
            <li>
              <Typography.Text strong>Data Source Linking</Typography.Text> — Static data and dynamic API requests,
              auto-refresh on dependency changes
            </li>
            <li>
              <Typography.Text strong>Form Validation</Typography.Text> — Built-in required/regex/custom validation
              rules
            </li>
            <li>
              <Typography.Text strong>Container Nesting</Typography.Text> — Grid, collapse, tabs, card containers
              support recursive child component dragging
            </li>
            <li>
              <Typography.Text strong>Event System</Typography.Text> — Expression, action, and callback event handlers
              at the field level
            </li>
            <li>
              <Typography.Text strong>Theme System</Typography.Text> — Light / Dark / System modes, CSS variable
              injection, compact mode, antd ConfigProvider integration
            </li>
          </ul>
        </section>

        {/* Components */}
        <section id="components" style={{ marginBottom: 48 }}>
          <Typography.Title level={3}>Components</Typography.Title>
          <Typography.Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
            Built-in components are categorized into four types: <Typography.Text code>form</Typography.Text> (input),
            <Typography.Text code>display</Typography.Text>, <Typography.Text code>container</Typography.Text>, and{' '}
            <Typography.Text code>button</Typography.Text>.
          </Typography.Paragraph>
          <Typography.Title level={5}>Form Components</Typography.Title>
          <Typography.Paragraph>
            Used for data input. Property panel shows label / placeholder / name.
          </Typography.Paragraph>
          <ul style={{ lineHeight: 2.2, paddingLeft: 20 }}>
            <li>
              <Typography.Text code>input</Typography.Text> — Single-line text
            </li>
            <li>
              <Typography.Text code>textarea</Typography.Text> — Multi-line text
            </li>
            <li>
              <Typography.Text code>input-number</Typography.Text> — Number
            </li>
            <li>
              <Typography.Text code>password</Typography.Text> — Password
            </li>
            <li>
              <Typography.Text code>select</Typography.Text> — Dropdown
            </li>
            <li>
              <Typography.Text code>multi-select</Typography.Text> — Multi-select dropdown
            </li>
            <li>
              <Typography.Text code>radio</Typography.Text> — Radio group
            </li>
            <li>
              <Typography.Text code>checkbox</Typography.Text> — Checkbox group
            </li>
            <li>
              <Typography.Text code>switch</Typography.Text> — Toggle switch
            </li>
            <li>
              <Typography.Text code>slider</Typography.Text> — Slider
            </li>
            <li>
              <Typography.Text code>rate</Typography.Text> — Rating
            </li>
            <li>
              <Typography.Text code>date</Typography.Text> — Date picker
            </li>
            <li>
              <Typography.Text code>date-range</Typography.Text> — Date range
            </li>
            <li>
              <Typography.Text code>datetime</Typography.Text> — Date time
            </li>
            <li>
              <Typography.Text code>time</Typography.Text> — Time picker
            </li>
            <li>
              <Typography.Text code>upload</Typography.Text> — File upload
            </li>
            <li>
              <Typography.Text code>cascader</Typography.Text> — Cascading selector
            </li>
            <li>
              <Typography.Text code>tree-select</Typography.Text> — Tree selector
            </li>
            <li>
              <Typography.Text code>sub-form</Typography.Text> — Sub form
            </li>
          </ul>
          <Typography.Title level={5} style={{ marginTop: 16 }}>
            Display Components
          </Typography.Title>
          <Typography.Paragraph>Used for displaying information. Property panel shows name only.</Typography.Paragraph>
          <ul style={{ lineHeight: 2.2, paddingLeft: 20 }}>
            <li>
              <Typography.Text code>text</Typography.Text> — Text display
            </li>
            <li>
              <Typography.Text code>title</Typography.Text> — Title
            </li>
            <li>
              <Typography.Text code>image</Typography.Text> — Image
            </li>
            <li>
              <Typography.Text code>divider</Typography.Text> — Divider
            </li>
            <li>
              <Typography.Text code>alert</Typography.Text> — Alert
            </li>
            <li>
              <Typography.Text code>segment</Typography.Text> — Segment control
            </li>
          </ul>
          <Typography.Title level={5} style={{ marginTop: 16 }}>
            Container Components
          </Typography.Title>
          <Typography.Paragraph>
            Support nested children. New components can be dragged into the canvas.
          </Typography.Paragraph>
          <ul style={{ lineHeight: 2.2, paddingLeft: 20 }}>
            <li>
              <Typography.Text code>grid</Typography.Text> — Grid layout
            </li>
            <li>
              <Typography.Text code>flex</Typography.Text> — Flex layout
            </li>
            <li>
              <Typography.Text code>collapse</Typography.Text> — Collapse panel
            </li>
            <li>
              <Typography.Text code>tabs</Typography.Text> — Tabs
            </li>
            <li>
              <Typography.Text code>card</Typography.Text> — Card
            </li>
          </ul>
          <Typography.Title level={5} style={{ marginTop: 16 }}>
            Button Components
          </Typography.Title>
          <Typography.Paragraph>Trigger actions. Property panel shows name only.</Typography.Paragraph>
          <ul style={{ lineHeight: 2.2, paddingLeft: 20 }}>
            <li>
              <Typography.Text code>button</Typography.Text> — Button
            </li>
          </ul>
        </section>

        {/* Quick Start */}
        <section id="quickstart" style={{ marginBottom: 48 }}>
          <Typography.Title level={3}>Quick Start</Typography.Title>
          <Typography.Title level={5} style={{ marginTop: 16 }}>
            Installation
          </Typography.Title>
          <CodeBlock code={`npm install @form-engine/core @form-engine/adapter-antd antd`} />
          <Typography.Title level={5} style={{ marginTop: 24 }}>
            Basic Structure
          </Typography.Title>
          <Typography.Paragraph>
            Wrap with <Typography.Text code>ConfigProvider</Typography.Text> for antd theming. Designer and FormRender
            handle <Typography.Text code>StyleProvider</Typography.Text> internally via the{' '}
            <Typography.Text code>themeMode</Typography.Text> prop.
          </Typography.Paragraph>
          <CodeBlock
            code={`import { Designer } from '@form-engine/core'
import { antdAdapter } from '@form-engine/adapter-antd'
import { ConfigProvider, theme } from 'antd'

function App() {
  const [schema, setSchema] = useState(defaultSchema)
  return (
    <ConfigProvider theme={{
      algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
    }}>
      <Designer value={schema} onChange={setSchema} desktopAdapter={antdAdapter} themeMode="system" />
    </ConfigProvider>
  )
}`}
          />
          <Typography.Title level={5} style={{ marginTop: 24 }}>
            Schema Structure
          </Typography.Title>
          <CodeBlock
            code={`{
  version: '0.1',
  name: 'My Form',
  description: 'Form description',
  form: {
    size: 'middle',
    colon: false,
    desktop: { layout: 'horizontal', labelAlign: 'right', labelCol: { span: 5 }, wrapperCol: { span: 15 } },
    mobile: { layout: 'vertical' },
  },
  fields: [{
    type: 'input', name: 'username', label: 'Username',
    placeholder: 'Enter username', required: true,
    rules: [{ required: true, message: 'Required' }],
    children: [],
  }],
}`}
          />
        </section>

        {/* Form Submission */}
        <section id="submit" style={{ marginBottom: 48 }}>
          <Typography.Title level={3}>Form Submission</Typography.Title>
          <Typography.Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
            Use <Typography.Text code>FormRender</Typography.Text> with a ref to trigger submit and reset.
          </Typography.Paragraph>
          <Typography.Title level={5}>Core Props</Typography.Title>
          <ul style={{ lineHeight: 2.2, paddingLeft: 20 }}>
            <li>
              <Typography.Text code>schema</Typography.Text> — Form Schema
            </li>
            <li>
              <Typography.Text code>onSubmit(values)</Typography.Text> — Submit callback
            </li>
            <li>
              <Typography.Text code>onChange(values)</Typography.Text> — Value change callback (300ms debounce)
            </li>
            <li>
              <Typography.Text code>scene</Typography.Text> — Render scene{' '}
              <Typography.Text code>'desktop' | 'mobile'</Typography.Text>
            </li>
            <li>
              <Typography.Text code>desktopAdapter / mobileAdapter</Typography.Text> — Adapters
            </li>
            <li>
              <Typography.Text code>initialValues</Typography.Text> — Initial values
            </li>
            <li>
              <Typography.Text code>loading</Typography.Text> — Loading state
            </li>
            <li>
              <Typography.Text code>dataSourceResolver</Typography.Text> — Custom data source resolver
            </li>
            <li>
              <Typography.Text code>callbacks</Typography.Text> — Event callback functions (for{' '}
              <Typography.Text code>type: 'callback'</Typography.Text>)
            </li>
            <li>
              <Typography.Text code>beforeSubmit</Typography.Text> — Pre-submit hook
            </li>
            <li>
              <Typography.Text code>afterSubmit</Typography.Text> — Post-submit hook (success/fail)
            </li>
            <li>
              <Typography.Text code>themeMode / sizeMode / theme</Typography.Text> — Theme configuration
            </li>
          </ul>
          <Typography.Title level={5} style={{ marginTop: 16 }}>
            Ref Methods
          </Typography.Title>
          <ul style={{ lineHeight: 2.2, paddingLeft: 20 }}>
            <li>
              <Typography.Text code>submit()</Typography.Text> — Trigger submit
            </li>
            <li>
              <Typography.Text code>reset()</Typography.Text> — Reset form
            </li>
            <li>
              <Typography.Text code>validate(name?)</Typography.Text> — Validate form, returns Promise&lt;boolean&gt;
            </li>
          </ul>
          <Typography.Title level={5} style={{ marginTop: 16 }}>
            Example
          </Typography.Title>
          <CodeBlock
            code={`import { FormRender } from '@form-engine/core'
import { antdAdapter } from '@form-engine/adapter-antd'
function MyForm({ schema }) {
  const formRef = useRef(null)
  return (
    <>
      <FormRender ref={formRef} schema={schema} onSubmit={(v) => console.log(v)} desktopAdapter={antdAdapter} />
      <Button onClick={() => formRef.current?.submit()}>Submit</Button>
      <Button onClick={() => formRef.current?.reset()}>Reset</Button>
    </>
  )
}`}
          />
        </section>

        {/* Custom Plugins */}
        <section id="custom-plugin" style={{ marginBottom: 48 }}>
          <Typography.Title level={3}>Custom Plugins</Typography.Title>
          <Typography.Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
            Register any React component as a form field using{' '}
            <Typography.Text code>registerSimpleCustomComponent</Typography.Text> or{' '}
            <Typography.Text code>registerCustomComponent</Typography.Text>.
          </Typography.Paragraph>
          <Typography.Title level={5}>Simple Registration</Typography.Title>
          <Typography.Paragraph>
            For quick registration. <Typography.Text code>type</Typography.Text> must start with{' '}
            <Typography.Text code>custom:</Typography.Text>.
          </Typography.Paragraph>
          <CodeBlock
            code={`registerSimpleCustomComponent(
  type: \`custom:\${string}\`,
  component: ComponentType,
  options: { label, icon?, category?, defaultProps?, propertyConfig? },
)`}
          />
          <Typography.Title level={5} style={{ marginTop: 16 }}>
            Full Registration
          </Typography.Title>
          <Typography.Paragraph>
            For full control. Requires explicit <Typography.Text code>propertyConfig</Typography.Text>.
          </Typography.Paragraph>
          <CodeBlock code={`registerCustomComponent(type, component, config: CustomComponentConfig)`} />
          <Typography.Title level={5} style={{ marginTop: 16 }}>
            Other Registration APIs
          </Typography.Title>
          <ul style={{ lineHeight: 2.2, paddingLeft: 20 }}>
            <li>
              <Typography.Text code>unregisterCustomComponent(type)</Typography.Text> — Unregister a custom component
            </li>
            <li>
              <Typography.Text code>customComponentRegistry</Typography.Text> — Registry singleton (register /
              registerMany / get / getAll / getGrouped / has / unregister / clear)
            </li>
            <li>
              <Typography.Text code>customPropertyWidgetRegistry</Typography.Text> — Custom property widget registry
              singleton
            </li>
            <li>
              <Typography.Text code>propertySlotRegistry</Typography.Text> — Property Slot registry (expressionEditor /
              dataSourceEditor / jsonEditor / codeEditor)
            </li>
          </ul>
          <Typography.Title level={5} style={{ marginTop: 16 }}>
            Example: Custom Card
          </Typography.Title>
          <CodeBlock
            code={`const CustomCard = ({ value, onChange, ...rest }) => (
  <Card size="small" title={rest.label || 'Card'}>
    <Input value={value ?? ''} onChange={(e) => onChange?.(e.target.value)} />
  </Card>
)
registerSimpleCustomComponent('custom:card', CustomCard, {
  label: 'Custom Card', category: 'Custom',
  defaultProps: { label: 'Card', placeholder: 'Enter…' },
})`}
          />
          <Typography.Paragraph style={{ marginTop: 12 }}>
            After registration, the component appears in the Designer palette under the "Custom" group.
          </Typography.Paragraph>
        </section>

        {/* Panel Extension */}
        <section id="panel-extend" style={{ marginBottom: 48 }}>
          <Typography.Title level={3}>Panel Extension</Typography.Title>
          <Typography.Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
            Designer supports extending left and right panels via <Typography.Text code>sidePanelTabs</Typography.Text>{' '}
            and <Typography.Text code>propertyPanelTabs</Typography.Text>.
          </Typography.Paragraph>
          <Typography.Title level={5}>Designer Core Props</Typography.Title>
          <ul style={{ lineHeight: 2.2, paddingLeft: 20 }}>
            <li>
              <Typography.Text code>value</Typography.Text> — Controlled Schema
            </li>
            <li>
              <Typography.Text code>onChange</Typography.Text> — Schema change callback
            </li>
            <li>
              <Typography.Text code>desktopAdapter / mobileAdapter</Typography.Text> — Adapters
            </li>
            <li>
              <Typography.Text code>groups</Typography.Text> — Custom palette groups
            </li>
            <li>
              <Typography.Text code>excludeTypes</Typography.Text> — Excluded palette component types
            </li>
            <li>
              <Typography.Text code>readOnly</Typography.Text> — Read-only mode
            </li>
            <li>
              <Typography.Text code>sidePanelTabs</Typography.Text> — Left panel extension tabs
            </li>
            <li>
              <Typography.Text code>propertyPanelTabs</Typography.Text> — Right property panel extension tabs
            </li>
            <li>
              <Typography.Text code>panelWidths</Typography.Text> — Panel width (palette / properties)
            </li>
            <li>
              <Typography.Text code>onSceneChange</Typography.Text> — Scene change callback
            </li>
            <li>
              <Typography.Text code>themeMode / sizeMode / theme</Typography.Text> — Theme configuration
            </li>
            <li>
              <Typography.Text code>propertySlots</Typography.Text> — Property editor slot injection
            </li>
          </ul>
          <Typography.Title level={5}>Side Panel Tab</Typography.Title>
          <Typography.Paragraph>
            Add custom tabs at the bottom of the left panel, e.g. field statistics:
          </Typography.Paragraph>
          <CodeBlock
            code={`const FieldStatsTab = ({ fields }) => {
  const stats = useMemo(() => {
    const countByType = {}; let total = 0
    const walk = (items) => { for (const f of items) { total++; countByType[f.type] = (countByType[f.type]||0)+1; if (f.children) walk(f.children) } }
    walk(fields); return { total, countByType }
  }, [fields])
  return <div>{Object.entries(stats.countByType).map(([t,c]) => <div key={t}><span>{t}</span><strong>{c}</strong></div>)}</div>
}
const sidePanelTabs = [{ key: 'field-stats', title: 'Field Stats', icon: <Icon />, content: FieldStatsTab }]`}
          />
          <Typography.Title level={5} style={{ marginTop: 16 }}>
            Property Panel Tab
          </Typography.Title>
          <Typography.Paragraph>Add custom tabs to the right property panel, e.g. JSON viewer:</Typography.Paragraph>
          <CodeBlock
            code={`const JsonViewTab = ({ field }) => {
  if (!field) return <span>Select a field</span>
  return <pre>{JSON.stringify(field, null, 2)}</pre>
}
const propertyPanelTabs = [{ key: 'json-view', title: 'JSON', content: JsonViewTab }]`}
          />
        </section>

        {/* Container Nesting */}
        <section id="container" style={{ marginBottom: 48 }}>
          <Typography.Title level={3}>Container Nesting</Typography.Title>
          <Typography.Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
            Container components (grid / flex / collapse / tabs / card) store children in{' '}
            <Typography.Text code>FormFieldSchema.children</Typography.Text>. The Canvas renders recursively and
            supports dragging child components in the designer.
          </Typography.Paragraph>
          <Typography.Title level={5}>Container-Specific Field Props</Typography.Title>
          <ul style={{ lineHeight: 2.2, paddingLeft: 20 }}>
            <li>
              <Typography.Text code>children: FormFieldSchema[]</Typography.Text> — Child field list
            </li>
            <li>
              <Typography.Text code>columnIndex: number</Typography.Text> — Grid column index (used by grid children)
            </li>
            <li>
              <Typography.Text code>regionKey: string</Typography.Text> — Region key (associates collapse/tabs children)
            </li>
          </ul>
          <Typography.Title level={5} style={{ marginTop: 16 }}>
            Example: Collapse
          </Typography.Title>
          <CodeBlock
            code={`{
  type: 'collapse', name: 'collapse1', label: 'Collapse',
  children: [
    { type: 'input', name: 'field1', label: 'Panel 1 Field', regionKey: 'panel1' },
    { type: 'select', name: 'field2', label: 'Panel 2 Field', regionKey: 'panel2' },
  ],
}`}
          />
        </section>

        {/* Event System */}
        <section id="events" style={{ marginBottom: 48 }}>
          <Typography.Title level={3}>Event System</Typography.Title>
          <Typography.Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
            Field-level event-driven architecture supporting three handler types.
          </Typography.Paragraph>
          <Typography.Title level={5}>Handler Types</Typography.Title>
          <ul style={{ lineHeight: 2.2, paddingLeft: 20 }}>
            <li>
              <Typography.Text code>type: 'expression'</Typography.Text> — Inline expression with access to{' '}
              <Typography.Text code>$self</Typography.Text> and <Typography.Text code>$form</Typography.Text>
            </li>
            <li>
              <Typography.Text code>type: 'action'</Typography.Text> — Predefined actions
            </li>
            <li>
              <Typography.Text code>type: 'callback'</Typography.Text> — Callback function reference via{' '}
              <Typography.Text code>FormRender</Typography.Text>'s <Typography.Text code>callbacks</Typography.Text>{' '}
              prop
            </li>
          </ul>
          <Typography.Title level={5} style={{ marginTop: 16 }}>
            Predefined Actions
          </Typography.Title>
          <ul style={{ lineHeight: 2.2, paddingLeft: 20 }}>
            <li>
              <Typography.Text code>submit</Typography.Text> — Submit form
            </li>
            <li>
              <Typography.Text code>reset</Typography.Text> — Reset form
            </li>
            <li>
              <Typography.Text code>validate</Typography.Text> — Validate form
            </li>
            <li>
              <Typography.Text code>setFieldValue</Typography.Text> — Set field value
            </li>
          </ul>
          <Typography.Title level={5} style={{ marginTop: 16 }}>
            Event Context Variables
          </Typography.Title>
          <ul style={{ lineHeight: 2.2, paddingLeft: 20 }}>
            <li>
              <Typography.Text code>$self</Typography.Text> — Current field (name / value / schema / props)
            </li>
            <li>
              <Typography.Text code>$form</Typography.Text> — Form-level API (values / setFieldValue / setFieldsValue /
              getFieldValue / submit / reset / validate)
            </li>
          </ul>
          <Typography.Title level={5} style={{ marginTop: 16 }}>
            Example: Button triggers submit
          </Typography.Title>
          <CodeBlock
            code={`{
  type: 'button', name: 'submitBtn', label: 'Submit',
  events: {
    onClick: [
      { type: 'action', action: 'validate' },
      { type: 'action', action: 'submit' },
    ],
  },
}`}
          />
        </section>

        {/* Data Source */}
        <section id="datasource" style={{ marginBottom: 48 }}>
          <Typography.Title level={3}>Data Source</Typography.Title>
          <Typography.Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
            Field options support static data and dynamic remote requests. Auto-refresh when dependency field values
            change.
          </Typography.Paragraph>
          <Typography.Title level={5}>Remote Data Source Config</Typography.Title>
          <CodeBlock
            code={`{
  dataSource: {
    type: 'remote', url: '/api/options?category={category}',
    method: 'GET',
    dependencies: ['category'],
    requiredDeps: ['category'],
    resultPath: 'data.list',
    labelField: 'name', valueField: 'id',
    cacheTTL: 60000, skipEmpty: true,
  },
}`}
          />
          <Typography.Title level={5} style={{ marginTop: 16 }}>
            Custom Data Source Resolver
          </Typography.Title>
          <Typography.Paragraph>
            Override the built-in resolver via <Typography.Text code>FormRender</Typography.Text>'s{' '}
            <Typography.Text code>dataSourceResolver</Typography.Text> prop.
          </Typography.Paragraph>
          <CodeBlock
            code={`import { builtinDataSourceResolver } from '@form-engine/core'
<FormRender dataSourceResolver={async (config, context) => {
  return builtinDataSourceResolver(config, context)
}} />`}
          />
        </section>

        {/* Custom Theme */}
        <section id="custom-theme" style={{ marginBottom: 48 }}>
          <Typography.Title level={3}>Custom Theme</Typography.Title>
          <Typography.Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
            Form Engine uses <Typography.Text code>StyleProvider</Typography.Text> for theme tokens and integrates with
            antd via <Typography.Text code>ConfigProvider</Typography.Text>.
          </Typography.Paragraph>
          <Typography.Title level={5}>StyleProvider Props</Typography.Title>
          <ul style={{ lineHeight: 2.2, paddingLeft: 20 }}>
            <li>
              <Typography.Text code>themeMode</Typography.Text> — Theme mode:{' '}
              <Typography.Text code>light | dark | system</Typography.Text>
            </li>
            <li>
              <Typography.Text code>sizeMode</Typography.Text> — Size mode:{' '}
              <Typography.Text code>default | compact</Typography.Text>
            </li>
            <li>
              <Typography.Text code>theme</Typography.Text> — Theme token overrides
            </li>
            <li>
              <Typography.Text code>prefix</Typography.Text> — CSS variable prefix (default{' '}
              <Typography.Text code>fe</Typography.Text>)
            </li>
            <li>
              <Typography.Text code>autoInject</Typography.Text> — Auto-inject CSS variables into head (default true)
            </li>
          </ul>
          <Typography.Title level={5} style={{ marginTop: 16 }}>
            Theme Hooks
          </Typography.Title>
          <ul style={{ lineHeight: 2.2, paddingLeft: 20 }}>
            <li>
              <Typography.Text code>useStyle()</Typography.Text> — Get token() / cssVar() methods
            </li>
            <li>
              <Typography.Text code>useTheme()</Typography.Text> — Get full theme object
            </li>
            <li>
              <Typography.Text code>useToken(key)</Typography.Text> — Get single token value
            </li>
          </ul>
          <Typography.Title level={5} style={{ marginTop: 16 }}>
            Overriding Theme Tokens
          </Typography.Title>
          <CodeBlock
            code={`<StyleProvider themeMode="light" sizeMode="default" theme={{ colorPrimary: '#1677ff', borderRadius: 6, fontSize: 14 }}>
  {children}
</StyleProvider>`}
          />
          <Typography.Title level={5} style={{ marginTop: 16 }}>
            antd Integration
          </Typography.Title>
          <CodeBlock
            code={`import { theme as antdTheme, ConfigProvider } from 'antd'
<StyleProvider themeMode={themeMode}>
  <ConfigProvider theme={{ algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm }}>
    <AntdBridgeProvider><Designer ... /></AntdBridgeProvider>
  </ConfigProvider>
</StyleProvider>`}
          />
          <Typography.Paragraph style={{ marginTop: 12 }}>
            💡 <Typography.Text code>AntdBridgeProvider</Typography.Text> bridges Form Engine theme tokens with antd's
            theme system for consistent visual style.
          </Typography.Paragraph>
        </section>
      </Content>
    </Layout>
  )
}
