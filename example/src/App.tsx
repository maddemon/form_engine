import type { FormSchema, SupportedLocale, ThemeMode } from '@form-engine/core'
import { registerSimpleCustomComponent } from '@form-engine/core'
import { theme as antdTheme, Button, Card, ConfigProvider, Input, Layout, Space, Typography } from 'antd'
import React, { useEffect, useMemo, useState } from 'react'
import '../custom-component-demo'
import { AppProvider } from './context/AppContext'

// ==== 注册 antd 风格的自定义组件 ====
const CustomCard: React.FC<any> = (props) => {
  const { value, onChange, fieldSchema, ...rest } = props
  return (
    <Card size="small" title={rest.label || '自定义卡片'}>
      <Input
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={rest.placeholder || '请输入'}
      />
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
import schemaEn from './_EN_demo'
import schemaZh from './_ZH_demo'
import DesignerPage from './pages/DesignerPage'
import DocPage from './pages/DocPage'
import RenderPage from './pages/RenderPage'

// ==== 常量 ====

type PageKey = 'designer' | 'render' | 'doc'

const themeOptions: {
  key: ThemeMode
  label: Record<SupportedLocale, string>
  title: Record<SupportedLocale, string>
}[] = [
  {
    key: 'system',
    label: { 'zh-CN': '系统', 'en-US': 'System' },
    title: { 'zh-CN': '跟随系统', 'en-US': 'Follow system' },
  },
  { key: 'light', label: { 'zh-CN': '亮色', 'en-US': 'Light' }, title: { 'zh-CN': '亮色模式', 'en-US': 'Light mode' } },
  { key: 'dark', label: { 'zh-CN': '暗色', 'en-US': 'Dark' }, title: { 'zh-CN': '暗色模式', 'en-US': 'Dark mode' } },
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
  const [locale, setLocale] = useState<SupportedLocale>('zh-CN')
  const [schema, setSchema] = useState<FormSchema>(schemaZh)

  const isDark = useResolvedDark(themeMode)
  const themeAlgorithm = isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm
  const { Header, Content } = Layout

  const navLabels: Record<SupportedLocale, Record<PageKey, string>> = {
    'zh-CN': { designer: '🎨 设计器', render: '📋 渲染', doc: '📖 文档' },
    'en-US': { designer: '🎨 Designer', render: '📋 Render', doc: '📖 Docs' },
  }

  // 切换 locale 时同步切换 schema 数据
  useEffect(() => {
    setSchema(locale === 'zh-CN' ? schemaZh : schemaEn)
  }, [locale])

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
            {(['designer', 'render', 'doc'] as PageKey[]).map((key) => (
              <Button
                key={key}
                type={pageKey === key ? 'primary' : 'text'}
                size="small"
                onClick={() => setPageKey(key)}
              >
                {navLabels[locale][key]}
              </Button>
            ))}
          </Space>

          <Space>
            <Button
              size="small"
              type={locale === 'en-US' ? 'primary' : 'default'}
              onClick={() => setLocale(locale === 'zh-CN' ? 'en-US' : 'zh-CN')}
              style={{ minWidth: 48 }}
            >
              {locale === 'zh-CN' ? 'EN' : '中'}
            </Button>
            <a href="https://github.com/maddemon/form_engine" target="_blank" rel="noopener noreferrer" title="GitHub">
              <GithubIcon />
            </a>
            <Space.Compact>
              {themeOptions.map((opt) => (
                <Button
                  size="small"
                  key={opt.key}
                  type={themeMode === opt.key ? 'primary' : 'default'}
                  onClick={() => setThemeMode(opt.key)}
                  title={opt.title[locale]}
                >
                  {opt.label[locale]}
                </Button>
              ))}
            </Space.Compact>
          </Space>
        </Header>

        <Content style={{ overflow: 'hidden' }} key={locale}>
          <AppProvider value={{ locale, themeMode, isDark }}>
            {pageKey === 'designer' && <DesignerPage schema={schema} onSchemaChange={setSchema} />}
            {pageKey === 'render' && <RenderPage schema={schema} />}
            {pageKey === 'doc' && <DocPage />}
          </AppProvider>
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
