import { AntdBridgeProvider } from '@form-engine/adapter-antd'
import type { FormSchema, ThemeMode } from '@form-engine/core'
import { registerSimpleCustomComponent, StyleProvider } from '@form-engine/core'
import { theme as antdTheme, Button, Card, ConfigProvider, Input, Space, Typography } from 'antd'
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
import RenderPage from './pages/RenderPage'
import DocPage from './pages/DocPage'

// ==== 顶部导航 ====
type PageKey = 'designer' | 'render' | 'doc'

const navItems: { key: PageKey; label: string }[] = [
  { key: 'designer', label: '🎨 设计器' },
  { key: 'render', label: '📋 渲染' },
  { key: 'doc', label: '📖 文档' },
]

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

  const isDark = useMemo(() => {
    if (themeMode === 'dark') return true
    if (themeMode === 'light') return false
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }, [themeMode])

  useEffect(() => {
    document.documentElement.setAttribute('data-prefers-color-scheme', isDark ? 'dark' : 'light')
  }, [isDark])

  const themeAlgorithm = isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm

  return (
    <StyleProvider themeMode={themeMode}>
      <div
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: '-apple-system, sans-serif',
          overflow: 'hidden',
          background: isDark ? '#141414' : '#fff',
          color: isDark ? '#e6e6e6' : '#333',
        }}
      >
        <ConfigProvider theme={{ algorithm: themeAlgorithm }}>
          <header
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 24px',
              height: 48,
              borderBottom: `1px solid ${isDark ? '#303030' : '#e8e8e8'}`,
              background: isDark ? '#1f1f1f' : '#fff',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Typography.Title level={5} style={{ margin: 0 }}>Form Engine</Typography.Title>
              <Space size={2}>
                {navItems.map((item) => (
                  <Button
                    key={item.key}
                    type={pageKey === item.key ? 'primary' : 'text'}
                    size="small"
                    onClick={() => setPageKey(item.key)}
                  >
                    {item.label}
                  </Button>
                ))}
              </Space>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <a
                href="https://github.com/maddemon/form_engine"
                target="_blank"
                rel="noopener noreferrer"
                title="GitHub"
                style={{ display: 'flex', alignItems: 'center', color: isDark ? '#e6e6e6' : '#333' }}
              >
                <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
              </a>
              <ThemeSwitcher value={themeMode} onChange={setThemeMode} isDark={isDark} />
            </div>
          </header>

          <div style={{ flex: 1, overflow: 'hidden', background: isDark ? '#1f1f1f' : 'transparent' }}>
            <AntdBridgeProvider>
              {pageKey === 'designer' && <DesignerPage schema={schema} onSchemaChange={setSchema} />}
              {pageKey === 'render' && <RenderPage isDark={isDark} schema={schema} />}
              {pageKey === 'doc' && <DocPage isDark={isDark} />}
            </AntdBridgeProvider>
          </div>
        </ConfigProvider>
      </div>
    </StyleProvider>
  )
}

// ==== 主题切换器 ====
const ThemeSwitcher: React.FC<{ value: ThemeMode; onChange: (m: ThemeMode) => void; isDark: boolean }> = ({ value, onChange, isDark }) => {
  const options: { key: ThemeMode; label: string; title: string }[] = [
    { key: 'system', label: '系统', title: '跟随系统' },
    { key: 'light', label: '亮色', title: '亮色' },
    { key: 'dark', label: '暗色', title: '暗色' },
  ]
  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      }}
    >
      <Space.Compact>
        {options.map((opt) => (
          <Button size="small" key={opt.key} type={value === opt.key ? 'primary' : 'default'} onClick={() => onChange(opt.key)} title={opt.title} aria-label={opt.title}>
            {opt.label}
          </Button>
        ))}
      </Space.Compact>
    </ConfigProvider>
  )
}

export default App
