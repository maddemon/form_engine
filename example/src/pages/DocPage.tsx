import { FormSchema } from '@form-engine/core'
import { Anchor, Layout, Typography } from 'antd'
import React, { useRef } from 'react'

interface Props {
  schema: FormSchema
}

const sections = [
  { id: 'intro', title: '介绍' },
  { id: 'core', title: '核心能力' },
  { id: 'components', title: '组件一览' },
  { id: 'quickstart', title: '快速上手' },
  { id: 'submit', title: '提交表单' },
  { id: 'custom-plugin', title: '自定义插件' },
  { id: 'panel-extend', title: '面板扩展' },
  { id: 'container', title: '容器嵌套' },
  { id: 'events', title: '事件系统' },
  { id: 'datasource', title: '数据源' },
  { id: 'custom-theme', title: '自定义主题' },
]

const DocPage: React.FC<Props> = () => {
  const contentRef = useRef<HTMLDivElement>(null)
  const { Sider, Content } = Layout

  const CodeBlock: React.FC<{ code: string }> = ({ code }) => (
    <pre style={{ background: 'var(--fe-bg-tertiary)', padding: 16, borderRadius: 6, fontSize: 13, lineHeight: 1.6, overflow: 'auto', margin: '12px 0' }}>
      <code>{code}</code>
    </pre>
  )

  return (
    <Layout style={{ height: '100%', overflow: 'hidden' }}>
      <Sider width={200} style={{ padding: '20px 0', overflow: 'auto' }}>
        <Typography.Text type="secondary" style={{ fontSize: 12, padding: '0 24px', display: 'block', marginBottom: 8 }}>
          目录
        </Typography.Text>
        <Anchor replace items={sections.map((s) => ({ key: s.id, href: `#${s.id}`, title: s.title }))} getContainer={() => contentRef.current!} targetOffset={16} />
      </Sider>

      <Content ref={contentRef as React.Ref<HTMLDivElement>} style={{ overflow: 'auto', padding: '32px 48px' }}>
        {/* 1. 介绍 */}
        <section id="intro" style={{ marginBottom: 48 }}>
          <Typography.Title level={3}>介绍</Typography.Title>
          <Typography.Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
            Form Engine 是一套轻量、可扩展的 React 表单解决方案，提供<strong>可视化表单设计器</strong>与<strong>多场景表单渲染</strong>能力。 它采用 Schema
            驱动架构，同一份表单定义可同时适配桌面端与移动端。
          </Typography.Paragraph>
          <Typography.Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
            核心设计理念：<Typography.Text code>设计时 (Design Time)</Typography.Text> 与 <Typography.Text code>运行时 (Run Time)</Typography.Text> 分离。 在设计器中拖拽配置表单，生成一份 JSON
            Schema；在渲染端消费同一份 Schema，在不同设备上呈现原生体验。
          </Typography.Paragraph>
        </section>

        {/* 2. 核心能力 */}
        <section id="core" style={{ marginBottom: 48 }}>
          <Typography.Title level={3}>核心能力</Typography.Title>
          <ul style={{ fontSize: 15, lineHeight: 2.2, paddingLeft: 20 }}>
            <li>
              <Typography.Text strong>可视化设计器</Typography.Text> — 拖拽组件到画布、排序、嵌套容器、撤销/重做，所见即所得
            </li>
            <li>
              <Typography.Text strong>双场景渲染</Typography.Text> — Desktop / Mobile 两套 Adapter，一份 Schema 跨设备运行
            </li>
            <li>
              <Typography.Text strong>组件生态</Typography.Text> — 内置 25+ 组件，覆盖表单输入、展示、容器、按钮四大分类（详见下方「组件一览」）
            </li>
            <li>
              <Typography.Text strong>自定义组件体系</Typography.Text> — 通过 <Typography.Text code>registerSimpleCustomComponent</Typography.Text> 或 <Typography.Text code>registerCustomComponent</Typography.Text> 注册任意 React 组件
            </li>
            <li>
              <Typography.Text strong>数据源联动</Typography.Text> — 字段选项支持静态数据与动态请求，依赖字段变化自动刷新
            </li>
            <li>
              <Typography.Text strong>表单校验</Typography.Text> — 内置必填/正则/自定义校验规则，支持联动校验
            </li>
            <li>
              <Typography.Text strong>容器嵌套</Typography.Text> — 栅格、折叠面板、标签页、卡片等容器组件支持拖入子组件，递归渲染
            </li>
            <li>
              <Typography.Text strong>事件系统</Typography.Text> — 支持表达式、预定义动作、回调函数三种事件处理器，字段级事件驱动
            </li>
            <li>
              <Typography.Text strong>主题系统</Typography.Text> — Light / Dark / System 三档模式，CSS 变量注入，支持紧凑模式，antd ConfigProvider 联动
            </li>
          </ul>
        </section>

        {/* 3. 组件一览 */}
        <section id="components" style={{ marginBottom: 48 }}>
          <Typography.Title level={3}>组件一览</Typography.Title>
          <Typography.Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
            所有内置组件分为四类：<Typography.Text code>form</Typography.Text>（表单输入）、<Typography.Text code>display</Typography.Text>（展示）、<Typography.Text code>container</Typography.Text>（容器）、<Typography.Text code>button</Typography.Text>（按钮）。
          </Typography.Paragraph>

          <Typography.Title level={5}>表单组件 (form)</Typography.Title>
          <Typography.Paragraph>用于数据输入，属性面板显示 label / placeholder / name。</Typography.Paragraph>
          <ul style={{ lineHeight: 2.2, paddingLeft: 20 }}>
            <li><Typography.Text code>input</Typography.Text> — 单行文本</li>
            <li><Typography.Text code>textarea</Typography.Text> — 多行文本</li>
            <li><Typography.Text code>input-number</Typography.Text> — 数字</li>
            <li><Typography.Text code>password</Typography.Text> — 密码</li>
            <li><Typography.Text code>select</Typography.Text> — 下拉框</li>
            <li><Typography.Text code>multi-select</Typography.Text> — 下拉框(多选)</li>
            <li><Typography.Text code>radio</Typography.Text> — 单选框</li>
            <li><Typography.Text code>checkbox</Typography.Text> — 多选框</li>
            <li><Typography.Text code>switch</Typography.Text> — 开关</li>
            <li><Typography.Text code>slider</Typography.Text> — 滑块</li>
            <li><Typography.Text code>rate</Typography.Text> — 评分</li>
            <li><Typography.Text code>date</Typography.Text> — 日期</li>
            <li><Typography.Text code>date-range</Typography.Text> — 日期范围</li>
            <li><Typography.Text code>datetime</Typography.Text> — 日期时间</li>
            <li><Typography.Text code>time</Typography.Text> — 时间</li>
            <li><Typography.Text code>upload</Typography.Text> — 上传</li>
            <li><Typography.Text code>cascader</Typography.Text> — 级联选择</li>
            <li><Typography.Text code>tree-select</Typography.Text> — 树选择</li>
            <li><Typography.Text code>sub-form</Typography.Text> — 子表单</li>
          </ul>

          <Typography.Title level={5} style={{ marginTop: 16 }}>展示组件 (display)</Typography.Title>
          <Typography.Paragraph>用于信息展示，属性面板仅显示 name。</Typography.Paragraph>
          <ul style={{ lineHeight: 2.2, paddingLeft: 20 }}>
            <li><Typography.Text code>text</Typography.Text> — 文本展示</li>
            <li><Typography.Text code>title</Typography.Text> — 标题</li>
            <li><Typography.Text code>image</Typography.Text> — 图片展示</li>
            <li><Typography.Text code>divider</Typography.Text> — 分割线</li>
            <li><Typography.Text code>alert</Typography.Text> — 警告提示</li>
            <li><Typography.Text code>segment</Typography.Text> — 分段控制器</li>
          </ul>

          <Typography.Title level={5} style={{ marginTop: 16 }}>容器组件 (container)</Typography.Title>
          <Typography.Paragraph>支持嵌套子组件，画布中可拖入新组件。属性面板仅显示 name。</Typography.Paragraph>
          <ul style={{ lineHeight: 2.2, paddingLeft: 20 }}>
            <li><Typography.Text code>grid</Typography.Text> — 栅格布局</li>
            <li><Typography.Text code>flex</Typography.Text> — 弹性布局</li>
            <li><Typography.Text code>collapse</Typography.Text> — 折叠面板</li>
            <li><Typography.Text code>tabs</Typography.Text> — 标签页</li>
            <li><Typography.Text code>card</Typography.Text> — 卡片</li>
          </ul>

          <Typography.Title level={5} style={{ marginTop: 16 }}>按钮组件 (button)</Typography.Title>
          <Typography.Paragraph>触发操作，属性面板仅显示 name。</Typography.Paragraph>
          <ul style={{ lineHeight: 2.2, paddingLeft: 20 }}>
            <li><Typography.Text code>button</Typography.Text> — 按钮</li>
          </ul>
        </section>

        {/* 4. 快速上手 */}
        <section id="quickstart" style={{ marginBottom: 48 }}>
          <Typography.Title level={3}>快速上手</Typography.Title>
          <Typography.Title level={5} style={{ marginTop: 16 }}>
            安装
          </Typography.Title>
          <CodeBlock code={`npm install @form-engine/core @form-engine/adapter-antd antd`} />

          <Typography.Title level={5} style={{ marginTop: 24 }}>
            基本结构
          </Typography.Title>
          <Typography.Paragraph>使用 <Typography.Text code>ConfigProvider</Typography.Text> 包裹 antd 主题即可，Designer 和 FormRender 通过 <Typography.Text code>themeMode</Typography.Text> prop 自行处理主题注入。</Typography.Paragraph>
          <CodeBlock
            code={`import { Designer } from '@form-engine/core'
import { antdAdapter } from '@form-engine/adapter-antd'
import { ConfigProvider, theme } from 'antd'

function App() {
  const [schema, setSchema] = useState(defaultSchema)

  return (
    <ConfigProvider theme={{
      algorithm: isDark
        ? theme.darkAlgorithm
        : theme.defaultAlgorithm,
    }}>
      <Designer
        value={schema}
        onChange={setSchema}
        desktopAdapter={antdAdapter}
        themeMode="system"
      />
    </ConfigProvider>
  )
}`}
          />

          <Typography.Title level={5} style={{ marginTop: 24 }}>
            Schema 结构
          </Typography.Title>
          <CodeBlock
            code={`{
  version: '0.1',
  name: '我的表单',
  description: '表单描述',       // 可选
  form: {
    size: 'middle',              // small | middle | large
    colon: false,                // 是否显示冒号
    disabled: false,             // 全局禁用
    requiredMark: true,         // true | false | 'optional'
    desktop: {
      layout: 'horizontal',      // horizontal | vertical | inline
      labelAlign: 'right',
      labelCol: { span: 5 },
      wrapperCol: { span: 15 },
      variant: 'outlined',      // outlined | borderless | filled | underlined
      pageBackground: '#fff',    // 桌面端页面背景色
    },
    mobile: {
      layout: 'vertical',
      pageBackground: '#fff',
    },
  },
  fields: [
    {
      type: 'input',
      name: 'username',
      label: '用户名',
      placeholder: '请输入',
      required: true,
      tooltip: '用户名提示',     // 标签旁问号提示
      help: '4-20位字符',        // 字段下方帮助文本
      defaultValue: '',
      hidden: false,              // boolean | 表达式字符串
      disabled: false,
      readOnly: false,
      labelHidden: false,
      rules: [{ required: true, message: '请输入用户名' }],
      // 联动配置
      visibleWhen: { ... },      // 联动显隐
      requiredWhen: { ... },     // 联动必填
      // 数据源
      dataSource: { ... },       // 静态/远程数据源
      // 事件
      events: { ... },           // 事件处理器
      // 容器子字段
      children: [],              // 容器组件专用
    },
  ],
}`}
          />
        </section>

        {/* 4. 提交表单 */}
        <section id="submit" style={{ marginBottom: 48 }}>
          <Typography.Title level={3}>提交表单</Typography.Title>
          <Typography.Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
            使用 <Typography.Text code>FormRender</Typography.Text> 组件渲染表单，通过 ref 调用提交与重置。
          </Typography.Paragraph>
          <Typography.Title level={5}>核心 Props</Typography.Title>
          <ul style={{ lineHeight: 2.2, paddingLeft: 20 }}>
            <li>
              <Typography.Text code>schema</Typography.Text> — 表单 Schema
            </li>
            <li>
              <Typography.Text code>onSubmit(values)</Typography.Text> — 提交回调
            </li>
            <li>
              <Typography.Text code>onChange(values)</Typography.Text> — 值变化回调（300ms 防抖）
            </li>
            <li>
              <Typography.Text code>scene</Typography.Text> — 渲染场景 <Typography.Text code>'desktop' | 'mobile'</Typography.Text>
            </li>
            <li>
              <Typography.Text code>desktopAdapter / mobileAdapter</Typography.Text> — 适配器
            </li>
            <li>
              <Typography.Text code>initialValues</Typography.Text> — 初始值
            </li>
            <li>
              <Typography.Text code>loading</Typography.Text> — 加载状态
            </li>
            <li>
              <Typography.Text code>dataSourceResolver</Typography.Text> — 自定义数据源解析器
            </li>
            <li>
              <Typography.Text code>callbacks</Typography.Text> — 事件回调函数表（用于 <Typography.Text code>type: 'callback'</Typography.Text> 事件处理器）
            </li>
            <li>
              <Typography.Text code>beforeSubmit</Typography.Text> — 提交前钩子，可转换数据或阻止提交
            </li>
            <li>
              <Typography.Text code>afterSubmit</Typography.Text> — 提交后钩子（success / fail 回调）
            </li>
            <li>
              <Typography.Text code>themeMode / sizeMode / theme</Typography.Text> — 主题配置（透传 StyleProvider）
            </li>
          </ul>
          <Typography.Title level={5} style={{ marginTop: 16 }}>
            Ref 方法
          </Typography.Title>
          <ul style={{ lineHeight: 2.2, paddingLeft: 20 }}>
            <li><Typography.Text code>submit()</Typography.Text> — 触发提交</li>
            <li><Typography.Text code>reset()</Typography.Text> — 重置表单</li>
            <li><Typography.Text code>validate(name?)</Typography.Text> — 校验表单，返回 Promise&lt;boolean&gt;；可指定单个字段</li>
          </ul>
          <Typography.Title level={5} style={{ marginTop: 16 }}>
            示例
          </Typography.Title>
          <CodeBlock
            code={`import { FormRender } from '@form-engine/core'
import { antdAdapter } from '@form-engine/adapter-antd'

function MyForm({ schema }) {
  const formRef = useRef(null)

  const handleSubmit = (values) => {
    console.log('提交数据:', values)
  }

  return (
    <>
      <FormRender
        ref={formRef}
        schema={schema}
        onSubmit={handleSubmit}
        desktopAdapter={antdAdapter}
        scene="desktop"
      />
      <Button onClick={() => formRef.current?.submit()}>
        提交
      </Button>
      <Button onClick={() => formRef.current?.reset()}>
        重置
      </Button>
    </>
  )
}`}
          />
        </section>

        {/* 5. 自定义插件 */}
        <section id="custom-plugin" style={{ marginBottom: 48 }}>
          <Typography.Title level={3}>自定义插件（自定义组件）</Typography.Title>
          <Typography.Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
            通过 <Typography.Text code>registerSimpleCustomComponent</Typography.Text> 或 <Typography.Text code>registerCustomComponent</Typography.Text> 将任意 React 组件注册为表单字段，即可在设计器面板中使用。
          </Typography.Paragraph>

          <Typography.Title level={5}>简化注册：registerSimpleCustomComponent</Typography.Title>
          <Typography.Paragraph>适用于快速注册，<Typography.Text code>type</Typography.Text> 必须以 <Typography.Text code>custom:</Typography.Text> 开头。</Typography.Paragraph>
          <CodeBlock
            code={`registerSimpleCustomComponent(
  type: \`custom:\${string}\`,  // 必须以 'custom:' 开头
  component: ComponentType,    // 渲染组件
  options: {
    label: string,             // 面板名称
    icon?: ReactNode | string, // 面板图标
    category?: string,         // 分组
    description?: string,      // 描述
    defaultProps?: Record<string, unknown>,
    propertyConfig?: PropertyConfigItem[],  // 属性编辑配置
  },
)`}
          />
          <Typography.Title level={5} style={{ marginTop: 16 }}>
            完整注册：registerCustomComponent
          </Typography.Title>
          <Typography.Paragraph>适用于需要完整控制的场景，需显式定义 <Typography.Text code>propertyConfig</Typography.Text>。</Typography.Paragraph>
          <CodeBlock
            code={`registerCustomComponent(
  type: string,
  component: ComponentType,
  config: CustomComponentConfig,
)`}
          />

          <Typography.Title level={5} style={{ marginTop: 16 }}>
            其他注册 API
          </Typography.Title>
          <ul style={{ lineHeight: 2.2, paddingLeft: 20 }}>
            <li><Typography.Text code>unregisterCustomComponent(type)</Typography.Text> — 注销自定义组件</li>
            <li><Typography.Text code>customComponentRegistry</Typography.Text> — 注册表单例，支持 register / registerMany / get / getAll / getGrouped / has / unregister / clear</li>
            <li><Typography.Text code>customPropertyWidgetRegistry</Typography.Text> — 自定义属性 Widget 注册表单例</li>
            <li><Typography.Text code>propertySlotRegistry</Typography.Text> — Property Slot 注册表（支持 expressionEditor / dataSourceEditor / jsonEditor / codeEditor）</li>
          </ul>

          <Typography.Title level={5} style={{ marginTop: 16 }}>
            示例：自定义卡片
          </Typography.Title>
          <CodeBlock
            code={`const CustomCard = ({ value, onChange, ...rest }) => (
  <Card size="small" title={rest.label || '卡片'}>
    <Input
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value)}
    />
  </Card>
)

registerSimpleCustomComponent('custom:card', CustomCard, {
  label: '自定义卡片',
  category: '自定义',
  defaultProps: { label: '卡片', placeholder: '输入…' },
})`}
          />
          <Typography.Paragraph style={{ marginTop: 12 }}>注册后，在「设计器」页面的组件面板「自定义」分组中即可找到该组件，拖入画布使用。</Typography.Paragraph>
        </section>

        {/* 6. 面板扩展 */}
        <section id="panel-extend" style={{ marginBottom: 48 }}>
          <Typography.Title level={3}>面板扩展</Typography.Title>
          <Typography.Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
            Designer 支持通过 <Typography.Text code>sidePanelTabs</Typography.Text> 和 <Typography.Text code>propertyPanelTabs</Typography.Text>
            扩展左右两侧面板，同时提供丰富的配置项。
          </Typography.Paragraph>

          <Typography.Title level={5}>Designer 核心 Props</Typography.Title>
          <ul style={{ lineHeight: 2.2, paddingLeft: 20 }}>
            <li><Typography.Text code>value</Typography.Text> — 受控 Schema</li>
            <li><Typography.Text code>onChange</Typography.Text> — Schema 变化回调</li>
            <li><Typography.Text code>desktopAdapter / mobileAdapter</Typography.Text> — 适配器</li>
            <li><Typography.Text code>groups</Typography.Text> — 自定义控件库分组</li>
            <li><Typography.Text code>excludeTypes</Typography.Text> — 排除的调色板组件类型</li>
            <li><Typography.Text code>readOnly</Typography.Text> — 只读模式</li>
            <li><Typography.Text code>sidePanelTabs</Typography.Text> — 左侧面板扩展 Tab</li>
            <li><Typography.Text code>propertyPanelTabs</Typography.Text> — 右侧属性面板扩展 Tab</li>
            <li><Typography.Text code>panelWidths</Typography.Text> — 面板宽度配置（palette / properties）</li>
            <li><Typography.Text code>onSceneChange</Typography.Text> — 场景变化回调</li>
            <li><Typography.Text code>themeMode / sizeMode / theme</Typography.Text> — 主题配置（透传 StyleProvider）</li>
            <li><Typography.Text code>propertySlots</Typography.Text> — 属性编辑器 Slot 注入</li>
          </ul>

          <Typography.Title level={5}>侧边栏 Tab</Typography.Title>
          <Typography.Paragraph>左侧面板底部可添加自定义 Tab，例如字段统计：</Typography.Paragraph>
          <CodeBlock
            code={`const FieldStatsTab = ({ fields }) => {
  // 统计各类型字段数量
  const stats = useMemo(() => {
    const countByType = {}
    const walk = (items) => {
      for (const f of items) {
        countByType[f.type] = (countByType[f.type] || 0) + 1
        if (f.children) walk(f.children)
      }
    }
    walk(fields)
    return countByType
  }, [fields])

  return (
    <div>
      {Object.entries(stats).map(([type, count]) => (
        <div key={type}>
          <span>{type}</span>
          <strong>{count}</strong>
        </div>
      ))}
    </div>
  )
}

const sidePanelTabs = [
  {
    key: 'field-stats',
    title: '字段统计',
    icon: <Icon />,
    content: FieldStatsTab,
  },
]`}
          />

          <Typography.Title level={5} style={{ marginTop: 16 }}>
            属性面板 Tab
          </Typography.Title>
          <Typography.Paragraph>右侧属性面板可添加自定义 Tab，例如 JSON 查看器：</Typography.Paragraph>
          <CodeBlock
            code={`const JsonViewTab = ({ field }) => {
  if (!field) return <span>请选择字段</span>
  return <pre>{JSON.stringify(field, null, 2)}</pre>
}

const propertyPanelTabs = [
  {
    key: 'json-view',
    title: 'JSON',
    content: JsonViewTab,
  },
]`}
          />
          <Typography.Paragraph style={{ marginTop: 12 }}>
            传入 Designer 即可：<Typography.Text code>{'<Designer value={schema} onChange={setSchema} sidePanelTabs={sidePanelTabs} propertyPanelTabs={propertyPanelTabs} />'}</Typography.Text>
          </Typography.Paragraph>
        </section>

        {/* 7. 容器嵌套 */}
        <section id="container" style={{ marginBottom: 48 }}>
          <Typography.Title level={3}>容器嵌套</Typography.Title>
          <Typography.Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
            容器组件（grid / flex / collapse / tabs / card）通过 <Typography.Text code>FormFieldSchema.children</Typography.Text> 存储子字段，Canvas 递归渲染，支持在设计器中拖入子组件。
          </Typography.Paragraph>

          <Typography.Title level={5}>容器专用字段属性</Typography.Title>
          <ul style={{ lineHeight: 2.2, paddingLeft: 20 }}>
            <li><Typography.Text code>children: FormFieldSchema[]</Typography.Text> — 子字段列表</li>
            <li><Typography.Text code>columnIndex: number</Typography.Text> — 栅格列索引（grid 子节点使用）</li>
            <li><Typography.Text code>regionKey: string</Typography.Text> — 区域 key（collapse 面板 / tabs 标签页关联子组件）</li>
          </ul>

          <Typography.Title level={5} style={{ marginTop: 16 }}>
            示例：折叠面板
          </Typography.Title>
          <CodeBlock
            code={`{
  type: 'collapse',
  name: 'collapse1',
  label: '折叠面板',
  children: [
    {
      type: 'input',
      name: 'field1',
      label: '面板1-字段',
      regionKey: 'panel1',  // 关联到 collapse 的面板1
    },
    {
      type: 'select',
      name: 'field2',
      label: '面板2-字段',
      regionKey: 'panel2',
    },
  ],
}`}
          />
        </section>

        {/* 8. 事件系统 */}
        <section id="events" style={{ marginBottom: 48 }}>
          <Typography.Title level={3}>事件系统</Typography.Title>
          <Typography.Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
            字段级事件驱动，支持三种事件处理器类型。
          </Typography.Paragraph>

          <Typography.Title level={5}>处理器类型</Typography.Title>
          <ul style={{ lineHeight: 2.2, paddingLeft: 20 }}>
            <li><Typography.Text code>type: 'expression'</Typography.Text> — 内联表达式，可访问 <Typography.Text code>$self</Typography.Text>（当前字段）和 <Typography.Text code>$form</Typography.Text>（表单级 API）</li>
            <li><Typography.Text code>type: 'action'</Typography.Text> — 预定义动作</li>
            <li><Typography.Text code>type: 'callback'</Typography.Text> — 回调函数引用，通过 <Typography.Text code>FormRender</Typography.Text> 的 <Typography.Text code>callbacks</Typography.Text> prop 传入</li>
          </ul>

          <Typography.Title level={5} style={{ marginTop: 16 }}>
            预定义动作
          </Typography.Title>
          <ul style={{ lineHeight: 2.2, paddingLeft: 20 }}>
            <li><Typography.Text code>submit</Typography.Text> — 提交表单</li>
            <li><Typography.Text code>reset</Typography.Text> — 重置表单</li>
            <li><Typography.Text code>validate</Typography.Text> — 校验表单</li>
            <li><Typography.Text code>setFieldValue</Typography.Text> — 设置字段值</li>
          </ul>

          <Typography.Title level={5} style={{ marginTop: 16 }}>
            事件上下文变量
          </Typography.Title>
          <ul style={{ lineHeight: 2.2, paddingLeft: 20 }}>
            <li><Typography.Text code>$self</Typography.Text> — 当前字段（name / value / schema / props）</li>
            <li><Typography.Text code>$form</Typography.Text> — 表单级 API（values / setFieldValue / setFieldsValue / getFieldValue / submit / reset / validate）</li>
          </ul>

          <Typography.Title level={5} style={{ marginTop: 16 }}>
            示例：按钮点击触发提交
          </Typography.Title>
          <CodeBlock
            code={`{
  type: 'button',
  name: 'submitBtn',
  label: '提交',
  events: {
    onClick: [
      { type: 'action', action: 'validate' },
      { type: 'action', action: 'submit' },
    ],
  },
}`}
          />
        </section>

        {/* 9. 数据源 */}
        <section id="datasource" style={{ marginBottom: 48 }}>
          <Typography.Title level={3}>数据源</Typography.Title>
          <Typography.Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
            字段选项支持静态数据与动态远程请求，依赖字段变化时自动刷新。
          </Typography.Paragraph>

          <Typography.Title level={5}>远程数据源配置</Typography.Title>
          <CodeBlock
            code={`{
  dataSource: {
    type: 'remote',
    url: '/api/options?category={category}',
    method: 'GET',
    dependencies: ['category'],    // 依赖字段
    requiredDeps: ['category'],   // 必需依赖（为空时跳过）
    resultPath: 'data.list',       // 响应数据路径
    labelField: 'name',            // 标签字段映射
    valueField: 'id',              // 值字段映射
    cacheTTL: 60000,               // 缓存时间(ms)
    skipEmpty: true,               // 依赖为空时跳过请求
  },
}`}
          />

          <Typography.Title level={5} style={{ marginTop: 16 }}>
            自定义数据源解析器
          </Typography.Title>
          <Typography.Paragraph>
            通过 <Typography.Text code>FormRender</Typography.Text> 的 <Typography.Text code>dataSourceResolver</Typography.Text> prop 可完全覆盖内置解析逻辑。
          </Typography.Paragraph>
          <CodeBlock
            code={`import { builtinDataSourceResolver } from '@form-engine/core'

<FormRender
  dataSourceResolver={async (config, context) => {
    // 自定义解析逻辑，或回退到内置解析器
    return builtinDataSourceResolver(config, context)
  }}
/>`}
          />
        </section>

        {/* 10. 自定义主题 */}
        <section id="custom-theme" style={{ marginBottom: 48 }}>
          <Typography.Title level={3}>自定义主题</Typography.Title>
          <Typography.Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
            Form Engine 通过 <Typography.Text code>StyleProvider</Typography.Text> 管理主题 Token， 同时通过 <Typography.Text code>ConfigProvider</Typography.Text> 与 antd 主题联动。
          </Typography.Paragraph>

          <Typography.Title level={5}>StyleProvider Props</Typography.Title>
          <ul style={{ lineHeight: 2.2, paddingLeft: 20 }}>
            <li><Typography.Text code>themeMode</Typography.Text> — 主题模式：<Typography.Text code>light | dark | system</Typography.Text></li>
            <li><Typography.Text code>sizeMode</Typography.Text> — 尺寸模式：<Typography.Text code>default | compact</Typography.Text>（紧凑模式）</li>
            <li><Typography.Text code>theme</Typography.Text> — 主题 Token 覆盖对象</li>
            <li><Typography.Text code>prefix</Typography.Text> — CSS 变量前缀（默认 <Typography.Text code>fe</Typography.Text>）</li>
            <li><Typography.Text code>autoInject</Typography.Text> — 是否自动注入 CSS 变量到 head（默认 true）</li>
          </ul>

          <Typography.Title level={5} style={{ marginTop: 16 }}>
            主题 Hooks
          </Typography.Title>
          <ul style={{ lineHeight: 2.2, paddingLeft: 20 }}>
            <li><Typography.Text code>useStyle()</Typography.Text> — 获取 token() / cssVar() 方法</li>
            <li><Typography.Text code>useTheme()</Typography.Text> — 获取完整主题对象</li>
            <li><Typography.Text code>useToken(key)</Typography.Text> — 获取单个 Token 值</li>
          </ul>

          <Typography.Title level={5} style={{ marginTop: 16 }}>
            覆盖主题 Token
          </Typography.Title>
          <CodeBlock
            code={`<StyleProvider
  themeMode="light"
  sizeMode="default"
  theme={{
    colorPrimary: '#1677ff',
    borderRadius: 6,
    fontSize: 14,
  }}
>
  {children}
</StyleProvider>`}
          />

          <Typography.Title level={5} style={{ marginTop: 16 }}>
            与 antd 联动
          </Typography.Title>
          <CodeBlock
            code={`import { theme as antdTheme, ConfigProvider } from 'antd'

<StyleProvider themeMode={themeMode}>
  <ConfigProvider theme={{
    algorithm: isDark
      ? antdTheme.darkAlgorithm
      : antdTheme.defaultAlgorithm,
  }}>
    <AntdBridgeProvider>
      <Designer ... />
    </AntdBridgeProvider>
  </ConfigProvider>
</StyleProvider>`}
          />
          <Typography.Paragraph style={{ marginTop: 12 }}>
            💡 <Typography.Text code>AntdBridgeProvider</Typography.Text> 负责将 Form Engine 主题与 antd 主题桥接， 确保 Designer 与 antd 组件的视觉风格一致。
          </Typography.Paragraph>
        </section>
      </Content>
    </Layout>
  )
}

export default DocPage
