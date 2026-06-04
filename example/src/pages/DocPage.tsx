import { Anchor, Typography } from 'antd'
import React, { useRef } from 'react'

interface Props {
  isDark: boolean
}

const sections = [
  { id: 'intro', title: '介绍' },
  { id: 'core', title: '核心能力' },
  { id: 'quickstart', title: '快速上手' },
  { id: 'submit', title: '提交表单' },
  { id: 'custom-plugin', title: '自定义插件' },
  { id: 'panel-extend', title: '面板扩展' },
  { id: 'custom-theme', title: '自定义主题' },
]

const DocPage: React.FC<Props> = ({ isDark }) => {
  const contentRef = useRef<HTMLDivElement>(null)
  const codeBg = isDark ? '#1a1a1a' : '#f5f5f5'

  const CodeBlock: React.FC<{ code: string }> = ({ code }) => (
    <pre style={{ background: codeBg, padding: 16, borderRadius: 6, fontSize: 13, lineHeight: 1.6, overflow: 'auto', margin: '12px 0' }}>
      <code>{code}</code>
    </pre>
  )

  return (
    <div style={{ height: '100%', display: 'flex', overflow: 'hidden' }}>
      {/* 左侧锚点导航 */}
      <div style={{ width: 200, flexShrink: 0, borderRight: `1px solid ${isDark ? '#303030' : '#e8e8e8'}`, padding: '20px 0', overflow: 'auto' }}>
        <Typography.Text type="secondary" style={{ fontSize: 12, padding: '0 24px', display: 'block', marginBottom: 8 }}>目录</Typography.Text>
        <Anchor
          replace
          items={sections.map((s) => ({ key: s.id, href: `#${s.id}`, title: s.title }))}
          getContainer={() => contentRef.current!}
          targetOffset={16}
        />
      </div>

      {/* 右侧内容 */}
      <div ref={contentRef} style={{ flex: 1, overflow: 'auto', padding: '32px 48px' }}>
        {/* 1. 介绍 */}
        <section id="intro" style={{ marginBottom: 48 }}>
          <Typography.Title level={3}>介绍</Typography.Title>
          <Typography.Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
            Form Engine 是一套轻量、可扩展的 React 表单解决方案，提供<strong>可视化表单设计器</strong>与<strong>多场景表单渲染</strong>能力。
            它采用 Schema 驱动架构，同一份表单定义可同时适配桌面端与移动端。
          </Typography.Paragraph>
          <Typography.Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
            核心设计理念：<Typography.Text code>设计时 (Design Time)</Typography.Text> 与 <Typography.Text code>运行时 (Run Time)</Typography.Text> 分离。
            在设计器中拖拽配置表单，生成一份 JSON Schema；在渲染端消费同一份 Schema，在不同设备上呈现原生体验。
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
              <Typography.Text strong>组件生态</Typography.Text> — 内置 Input / Select / Radio / Checkbox / DatePicker / Upload 等常见字段
            </li>
            <li>
              <Typography.Text strong>自定义组件体系</Typography.Text> — 通过 <Typography.Text code>registerSimpleCustomComponent</Typography.Text> 注册任意 React 组件
            </li>
            <li>
              <Typography.Text strong>数据源联动</Typography.Text> — 字段选项支持静态数据与动态请求，依赖字段变化自动刷新
            </li>
            <li>
              <Typography.Text strong>表单校验</Typography.Text> — 内置必填/正则/自定义校验规则，支持联动校验
            </li>
            <li>
              <Typography.Text strong>主题系统</Typography.Text> — Light / Dark / System 三档模式，CSS 变量注入，antd ConfigProvider 联动
            </li>
          </ul>
        </section>

        {/* 3. 快速上手 */}
        <section id="quickstart" style={{ marginBottom: 48 }}>
          <Typography.Title level={3}>快速上手</Typography.Title>
          <Typography.Title level={5} style={{ marginTop: 16 }}>安装</Typography.Title>
          <CodeBlock code={`npm install @form-engine/core @form-engine/adapter-antd antd`} />

          <Typography.Title level={5} style={{ marginTop: 24 }}>基本结构</Typography.Title>
          <Typography.Paragraph>应用需要三层 Provider 包裹：</Typography.Paragraph>
          <ul style={{ lineHeight: 2, paddingLeft: 20 }}>
            <li><Typography.Text code>StyleProvider</Typography.Text> — Form Engine 主题注入</li>
            <li><Typography.Text code>ConfigProvider</Typography.Text> — antd 主题（联动暗色模式）</li>
            <li><Typography.Text code>AntdBridgeProvider</Typography.Text> — Form Engine 与 antd 桥接</li>
          </ul>
          <CodeBlock code={`import { StyleProvider, Designer } from '@form-engine/core'
import { antdAdapter, AntdBridgeProvider } from '@form-engine/adapter-antd'
import { ConfigProvider, theme } from 'antd'

function App() {
  return (
    <StyleProvider themeMode="system">
      <ConfigProvider theme={{
        algorithm: isDark
          ? theme.darkAlgorithm
          : theme.defaultAlgorithm,
      }}>
        <AntdBridgeProvider>
          <Designer
            schema={schema}
            onSchemaChange={setSchema}
            desktopAdapter={antdAdapter}
          />
        </AntdBridgeProvider>
      </ConfigProvider>
    </StyleProvider>
  )
}`} />

          <Typography.Title level={5} style={{ marginTop: 24 }}>Schema 结构</Typography.Title>
          <CodeBlock code={`{
  version: '0.1',
  name: '我的表单',
  form: {
    layout: 'vertical',     // horizontal | vertical | inline
    size: 'middle',         // small | middle | large
    labelAlign: 'right',
    scenes: {
      desktop: { labelCol: { span: 5 }, wrapperCol: { span: 15 } },
      mobile:  { labelCol: { span: 24 }, wrapperCol: { span: 24 } },
    },
  },
  fields: [
    {
      type: 'input',
      name: 'username',
      label: '用户名',
      placeholder: '请输入',
      required: true,
      rules: [{ required: true, message: '请输入用户名' }],
    },
  ],
}`} />
        </section>

        {/* 4. 提交表单 */}
        <section id="submit" style={{ marginBottom: 48 }}>
          <Typography.Title level={3}>提交表单</Typography.Title>
          <Typography.Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
            使用 <Typography.Text code>FormRender</Typography.Text> 组件渲染表单，通过 ref 调用提交与重置。
          </Typography.Paragraph>
          <Typography.Title level={5}>核心 Props</Typography.Title>
          <ul style={{ lineHeight: 2.2, paddingLeft: 20 }}>
            <li><Typography.Text code>schema</Typography.Text> — 表单 Schema</li>
            <li><Typography.Text code>onSubmit(values)</Typography.Text> — 提交回调</li>
            <li><Typography.Text code>onChange(values)</Typography.Text> — 值变化回调（300ms 防抖）</li>
            <li><Typography.Text code>scene</Typography.Text> — 渲染场景 <Typography.Text code>'desktop' | 'mobile'</Typography.Text></li>
            <li><Typography.Text code>desktopAdapter / mobileAdapter</Typography.Text> — 适配器</li>
          </ul>
          <Typography.Title level={5} style={{ marginTop: 16 }}>示例</Typography.Title>
          <CodeBlock code={`import { FormRender } from '@form-engine/core'
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
}`} />
        </section>

        {/* 5. 自定义插件 */}
        <section id="custom-plugin" style={{ marginBottom: 48 }}>
          <Typography.Title level={3}>自定义插件（自定义组件）</Typography.Title>
          <Typography.Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
            通过 <Typography.Text code>registerSimpleCustomComponent</Typography.Text> 将任意 React 组件注册为表单字段，
            即可在设计器面板中使用。
          </Typography.Paragraph>
          <Typography.Title level={5}>API</Typography.Title>
          <CodeBlock code={`registerSimpleCustomComponent(
  type: string,        // 组件唯一标识
  component: FC,       // 渲染组件
  config: {
    label: string,     // 面板名称
    category: string,  // 分组
    defaultProps: Record<string, any>,
    propertyConfig?: PropConfig[],  // 属性编辑配置
  },
)`} />
          <Typography.Title level={5} style={{ marginTop: 16 }}>示例：自定义卡片</Typography.Title>
          <CodeBlock code={`const CustomCard = ({ value, onChange, ...rest }) => (
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
})`} />
          <Typography.Paragraph style={{ marginTop: 12 }}>
            💡 注册后，在「设计器」页面的组件面板「自定义」分组中即可找到该组件，拖入画布使用。
          </Typography.Paragraph>
        </section>

        {/* 6. 面板扩展 */}
        <section id="panel-extend" style={{ marginBottom: 48 }}>
          <Typography.Title level={3}>面板扩展</Typography.Title>
          <Typography.Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
            Designer 支持通过 <Typography.Text code>sidePanelTabs</Typography.Text> 和 <Typography.Text code>propertyPanelTabs</Typography.Text>
            扩展左右两侧面板。
          </Typography.Paragraph>

          <Typography.Title level={5}>侧边栏 Tab</Typography.Title>
          <Typography.Paragraph>左侧面板底部可添加自定义 Tab，例如字段统计：</Typography.Paragraph>
          <CodeBlock code={`const FieldStatsTab = ({ fields }) => {
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
]`} />

          <Typography.Title level={5} style={{ marginTop: 16 }}>属性面板 Tab</Typography.Title>
          <Typography.Paragraph>右侧属性面板可添加自定义 Tab，例如 JSON 查看器：</Typography.Paragraph>
          <CodeBlock code={`const JsonViewTab = ({ field }) => {
  if (!field) return <span>请选择字段</span>
  return <pre>{JSON.stringify(field, null, 2)}</pre>
}

const propertyPanelTabs = [
  {
    key: 'json-view',
    title: 'JSON',
    content: JsonViewTab,
  },
]`} />
          <Typography.Paragraph style={{ marginTop: 12 }}>
            传入 Designer 即可：<Typography.Text code>{'<Designer sidePanelTabs={sidePanelTabs} propertyPanelTabs={propertyPanelTabs} />'}</Typography.Text>
          </Typography.Paragraph>
        </section>

        {/* 7. 自定义主题 */}
        <section id="custom-theme" style={{ marginBottom: 48 }}>
          <Typography.Title level={3}>自定义主题</Typography.Title>
          <Typography.Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
            Form Engine 通过 <Typography.Text code>StyleProvider</Typography.Text> 管理主题 Token，
            同时通过 <Typography.Text code>ConfigProvider</Typography.Text> 与 antd 主题联动。
          </Typography.Paragraph>

          <Typography.Title level={5}>主题模式</Typography.Title>
          <ul style={{ lineHeight: 2.2, paddingLeft: 20 }}>
            <li><Typography.Text code>light</Typography.Text> — 亮色模式</li>
            <li><Typography.Text code>dark</Typography.Text> — 暗色模式</li>
            <li><Typography.Text code>system</Typography.Text> — 跟随操作系统偏好</li>
          </ul>

          <Typography.Title level={5} style={{ marginTop: 16 }}>覆盖主题 Token</Typography.Title>
          <CodeBlock code={`<StyleProvider
  themeMode="light"
  theme={{
    colorPrimary: '#1677ff',
    borderRadius: 6,
    fontSize: 14,
  }}
>
  {children}
</StyleProvider>`} />

          <Typography.Title level={5} style={{ marginTop: 16 }}>与 antd 联动</Typography.Title>
          <CodeBlock code={`import { theme as antdTheme, ConfigProvider } from 'antd'

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
</StyleProvider>`} />
          <Typography.Paragraph style={{ marginTop: 12 }}>
            💡 <Typography.Text code>AntdBridgeProvider</Typography.Text> 负责将 Form Engine 主题与 antd 主题桥接，
            确保 Designer 与 antd 组件的视觉风格一致。
          </Typography.Paragraph>
        </section>
      </div>
    </div>
  )
}

export default DocPage
