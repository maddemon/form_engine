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
            <ThemeSwitcher value={themeMode} onChange={setThemeMode} isDark={isDark} />
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
