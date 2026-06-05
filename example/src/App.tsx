import type { FormSchema, ThemeMode } from '@form-engine/core'
import { registerSimpleCustomComponent } from '@form-engine/core'
import { theme as antdTheme, Button, Card, ConfigProvider, Input, Layout, Space, Typography } from 'antd'
import React, { useEffect, useMemo, useState } from 'react'
import '../custom-component-demo'

// ==== 注册 antd 风格的自定义组件 ====
const CustomCard: React.FC<any> = (props) => {
  const { value, onChange, fieldSchema, ...rest } = props
  return (
    <Card size="small" title={rest.label || '自定义卡片'}>
      <Input value={value ?? ''} onChange={(e) => onChange?.(e.target.value)} placeholder={rest.placeholder || '请输入'} />
    </Card>
  )
}

registerSimpleCustomComponent('custom:custom-card' as any, CustomCard, {
  label: '自定义卡片',
  category: '自定义',
  defaultProps: {
    label: '卡片标题',
    placeholder: '输入内容…',
  },
})

// ==== 页面组件 ====
import DesignerPage from './pages/DesignerPage'
import DocPage from './pages/DocPage'
import RenderPage from './pages/RenderPage'

// ==== 常量 ====

type PageKey = 'designer' | 'render' | 'doc'

const navItems: { key: PageKey; label: string }[] = [
  { key: 'designer', label: '🎨 设计器' },
  { key: 'render', label: '📋 渲染' },
  { key: 'doc', label: '📖 文档' },
]

const themeOptions: { key: ThemeMode; label: string; title: string }[] = [
  { key: 'system', label: '系统', title: '跟随系统' },
  { key: 'light', label: '亮色', title: '亮色模式' },
  { key: 'dark', label: '暗色', title: '暗色模式' },
]

const GithubIcon = () => (
  <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
  </svg>
)

// ==== 主题 Hook ====
function useResolvedDark(themeMode: ThemeMode): boolean {
  return useMemo(() => {
    if (themeMode === 'dark') return true
    if (themeMode === 'light') return false
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }, [themeMode])
}

// ==== App ====
const App: React.FC = () => {
  const [pageKey, setPageKey] = useState<PageKey>('designer')
  const [themeMode, setThemeMode] = useState<ThemeMode>('system')
  const [schema, setSchema] = useState<FormSchema>({
    version: '0.1',
    name: '未命名表单',
    fields: [],
    form: {
      layout: 'vertical' as const,
      size: 'middle' as const,
      labelAlign: 'right' as const,
      colon: false,
      scenes: {
        desktop: { labelCol: { span: 5 }, wrapperCol: { span: 15 } },
        mobile: { labelCol: { span: 24 }, wrapperCol: { span: 24 } },
      },
    },
  })

  const isDark = useResolvedDark(themeMode)
  const themeAlgorithm = isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm
  const { Header, Content } = Layout

  useEffect(() => {
    document.documentElement.setAttribute('data-prefers-color-scheme', isDark ? 'dark' : 'light')
  }, [isDark])

  return (
    <ConfigProvider theme={{ algorithm: themeAlgorithm }}>
      <Layout style={{ height: '100vh', overflow: 'hidden' }}>
        <Header style={headerStyle(isDark)}>
          <Space>
            <Typography.Title level={5} style={{ margin: 0 }}>
              Form Engine
            </Typography.Title>
            {navItems.map((item) => (
              <Button key={item.key} type={pageKey === item.key ? 'primary' : 'text'} size="small" onClick={() => setPageKey(item.key)}>
                {item.label}
              </Button>
            ))}
          </Space>

          <Space>
            <a href="https://github.com/maddemon/form_engine" target="_blank" rel="noopener noreferrer" title="GitHub">
              <GithubIcon />
            </a>
            <Space.Compact>
              {themeOptions.map((opt) => (
                <Button size="small" key={opt.key} type={themeMode === opt.key ? 'primary' : 'default'} onClick={() => setThemeMode(opt.key)} title={opt.title}>
                  {opt.label}
                </Button>
              ))}
            </Space.Compact>
          </Space>
        </Header>

        <Content style={{ overflow: 'hidden' }}>
          {pageKey === 'designer' && <DesignerPage schema={schema} onSchemaChange={setSchema} themeMode={themeMode} />}
          {pageKey === 'render' && <RenderPage schema={schema} themeMode={themeMode} />}
          {pageKey === 'doc' && <DocPage schema={schema} />}
        </Content>
      </Layout>
    </ConfigProvider>
  )
}

/** Header 样式：根据主题切换背景和边框 */
function headerStyle(isDark: boolean): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    height: 48,
    lineHeight: '48px',
    background: isDark ? '#141414' : '#fff',
    borderBottom: `1px solid ${isDark ? '#303030' : '#f0f0f0'}`,
  }
}

export default App
