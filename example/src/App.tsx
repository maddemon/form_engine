import { antdAdapter, AntdBridgeProvider } from '@form-engine/adapter-antd'
import { antdMobileAdapter, AntdMobileBridgeProvider } from '@form-engine/adapter-antd-mobile'
import type { FormFieldSchema, FormRenderHandle, FormSchema, PropertyPanelTab, PropertyPanelTabContentProps, SidePanelTab, SidePanelTabContentProps } from '@form-engine/core'
import { Designer, FormRender, registerSimpleCustomComponent, StyleProvider, type DeviceScene, type ThemeMode } from '@form-engine/core'
import { Button, theme as antdTheme, ConfigProvider } from 'antd'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// 注册自定义组件示例
import '../custom-component-demo'

// ==== 注册额外自定义组件用于测试 ====
const CustomCard: React.FC<any> = (props) => {
  const { value, onChange, fieldSchema, ...rest } = props
  return (
    <div
      style={{
        border: '1px solid #d9d9d9',
        borderRadius: 8,
        padding: 16,
        background: '#fafafa',
      }}
    >
      <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>{rest.label || '自定义卡片'}</label>
      <input value={value ?? ''} onChange={(e) => onChange?.(e.target.value)} placeholder={rest.placeholder || '请输入'} style={{ width: '100%', border: '1px solid #d9d9d9', borderRadius: 4, padding: '4px 8px' }} />
    </div>
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

// ==== 左侧面板自定义 Tab：字段统计 ====
const FieldStatsTab: React.FC<SidePanelTabContentProps> = ({ fields }) => {
  const stats = useMemo(() => {
    const countByType: Record<string, number> = {}
    let total = 0
    const walk = (items: FormFieldSchema[]) => {
      for (const f of items) {
        total++
        countByType[f.type] = (countByType[f.type] || 0) + 1
        if (f.children) walk(f.children)
      }
    }
    walk(fields)
    return { total, countByType }
  }, [fields])

  return (
    <div style={{ padding: 16 }}>
      <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600 }}>字段统计</h4>
      <div style={{ fontSize: 13, marginBottom: 12 }}>共 {stats.total} 个字段</div>
      {Object.entries(stats.countByType).map(([type, count]) => (
        <div key={type} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13, borderBottom: '1px solid #f0f0f0' }}>
          <span>{type}</span>
          <span style={{ color: '#1677ff', fontWeight: 500 }}>{count}</span>
        </div>
      ))}
    </div>
  )
}

const sidePanelTabs: SidePanelTab[] = [
  {
    key: 'field-stats',
    title: '字段统计',
    icon: <span style={{ fontSize: 16 }}>📊</span>,
    content: FieldStatsTab,
  },
]

// ==== 右侧属性面板自定义 Tab：JSON 查看 ====
const JsonViewTab: React.FC<PropertyPanelTabContentProps> = ({ field }) => {
  if (!field) return <div style={{ padding: 16, fontSize: 13, color: '#999' }}>请选择一个字段</div>

  return (
    <div style={{ padding: 8 }}>
      <h4 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600 }}>字段 Schema (JSON)</h4>
      <pre
        style={{
          fontSize: 12,
          lineHeight: 1.6,
          background: 'var(--fe-bg-color)',
          border: '1px solid var(--fe-border-primary)',
          borderRadius: 4,
          padding: 12,
          overflow: 'auto',
          maxHeight: 400,
          margin: 0,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
        }}
      >
        {JSON.stringify(field, null, 2)}
      </pre>
    </div>
  )
}

const propertyPanelTabs: PropertyPanelTab[] = [
  {
    key: 'json-view',
    title: 'JSON',
    content: JsonViewTab,
  },
]

// ==========================================

type Tab = 'design' | 'preview'

const App: React.FC = () => {
  const [tab, setTab] = useState<Tab>('design')
  const [previewScene, setPreviewScene] = useState<DeviceScene>('desktop')
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

  const formRef = useRef<FormRenderHandle>(null)

  const handleSubmit = useCallback((values: Record<string, unknown>) => {
    console.log('提交:', values)
    alert('提交成功！\n' + JSON.stringify(values, null, 2))
  }, [])

  const handleChange = useCallback((values: Record<string, unknown>) => {
    console.log('变化:', values)
  }, [])

  // 是否暗色模式（用于 App 自己的 header/背景色）
  const isDark = useMemo(() => {
    if (themeMode === 'dark') return true
    if (themeMode === 'light') return false
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }, [themeMode])

  // 同步到 antd-mobile 的 data-prefers-color-scheme（暗色模式入口）
  useEffect(() => {
    document.documentElement.setAttribute('data-prefers-color-scheme', isDark ? 'dark' : 'light')
  }, [isDark])

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
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            height: 56,
            borderBottom: `1px solid ${isDark ? '#303030' : '#e8e8e8'}`,
            background: isDark ? '#1f1f1f' : '#fff',
            flexShrink: 0,
          }}
        >
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Form Engine</h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {/* 设计 / 预览 + 桌面 / 手机（合并为一段） */}
            <div style={{ display: 'flex', gap: 2, background: isDark ? '#2a2a2a' : '#f5f5f5', borderRadius: 6, padding: 2, alignItems: 'center' }}>
              {(
                [
                  { key: 'design' as const, label: '设计' },
                  { key: 'preview' as const, label: '预览' },
                ] as { key: Tab; label: string }[]
              ).map((tabItem) => (
                <button
                  key={tabItem.key}
                  onClick={() => setTab(tabItem.key)}
                  style={{
                    padding: '4px 16px',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    background: tab === tabItem.key ? (isDark ? '#1677ff' : '#fff') : 'transparent',
                    boxShadow: tab === tabItem.key ? '0 1px 2px rgba(0,0,0,0.2)' : 'none',
                    fontWeight: tab === tabItem.key ? 500 : 400,
                    fontSize: 14,
                    color: tab === tabItem.key ? (isDark ? '#fff' : '#1677ff') : isDark ? '#bbb' : '#666',
                  }}
                >
                  {tabItem.label}
                </button>
              ))}

              {/* 分隔条：仅在 preview tab 时显示桌面/手机图标 */}
              {tab === 'preview' && (
                <>
                  <div style={{ width: 1, height: 18, background: isDark ? '#444' : '#d9d9d9', margin: '0 4px' }} />
                  <button
                    onClick={() => setPreviewScene('desktop')}
                    title="预览桌面"
                    aria-label="预览桌面"
                    style={{
                      width: 28,
                      height: 28,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer',
                      background: previewScene === 'desktop' ? (isDark ? '#1677ff' : '#fff') : 'transparent',
                      boxShadow: previewScene === 'desktop' ? '0 1px 2px rgba(0,0,0,0.2)' : 'none',
                      color: previewScene === 'desktop' ? (isDark ? '#fff' : '#1677ff') : isDark ? '#bbb' : '#666',
                    }}
                  >
                    <DesktopIcon />
                  </button>
                  <button
                    onClick={() => setPreviewScene('mobile')}
                    title="预览手机"
                    aria-label="预览手机"
                    style={{
                      width: 28,
                      height: 28,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer',
                      background: previewScene === 'mobile' ? (isDark ? '#1677ff' : '#fff') : 'transparent',
                      boxShadow: previewScene === 'mobile' ? '0 1px 2px rgba(0,0,0,0.2)' : 'none',
                      color: previewScene === 'mobile' ? (isDark ? '#fff' : '#1677ff') : isDark ? '#bbb' : '#666',
                    }}
                  >
                    <MobileIcon />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* 主题切换：跟随系统 / 亮色 / 暗色 */}
          <ThemeSwitcher value={themeMode} onChange={setThemeMode} isDark={isDark} />
        </header>

        <div style={{ flex: 1, overflow: 'hidden', background: isDark ? '#1f1f1f' : 'transparent' }}>
          <ConfigProvider
            theme={{
              algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
            }}
          >
            <AntdBridgeProvider>
              {tab === 'design' ? (
                <Designer schema={schema} onSchemaChange={setSchema} desktopAdapter={antdAdapter} mobileAdapter={antdMobileAdapter} panelWidths={{ palette: 260, properties: 'min(320px, 26vw)' }} excludeTypes={['date-range']} sidePanelTabs={sidePanelTabs} propertyPanelTabs={propertyPanelTabs} />
              ) : (
                <div style={{ height: '100%', overflow: 'auto', padding: 32, background: isDark ? '#1f1f1f' : '#f5f5f5' }}>
                  <PreviewFrame scene={previewScene} isDark={isDark}>
                    {schema.fields.length === 0 ? (
                      <div style={{ textAlign: 'center', color: isDark ? '#888' : '#999', padding: 64 }}>暂无字段，请切换到「设计」Tab 添加字段</div>
                    ) : (
                      <AntdMobileBridgeProvider key="mobile">
                        <FormRender ref={formRef} schema={schema} onSubmit={handleSubmit} onChange={handleChange} desktopAdapter={antdAdapter} mobileAdapter={antdMobileAdapter} scene={previewScene} />
                        <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
                          <Button type="primary" onClick={() => formRef.current?.submit()}>提交</Button>
                          <Button onClick={() => formRef.current?.reset()}>重置</Button>
                        </div>
                      </AntdMobileBridgeProvider>
                    )}
                  </PreviewFrame>
                </div>
              )}
            </AntdBridgeProvider>
          </ConfigProvider>
        </div>
      </div>
    </StyleProvider>
  )
}

/** 桌面 / 手机 图标 */
const DesktopIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
)

const MobileIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="2" width="12" height="20" rx="2" />
    <line x1="12" y1="18" x2="12" y2="18" />
  </svg>
)

/** 主题切换器：跟随系统 / 亮色 / 暗色 */
const ThemeSwitcher: React.FC<{ value: ThemeMode; onChange: (m: ThemeMode) => void; isDark: boolean }> = ({ value, onChange, isDark }) => {
  const options: { key: ThemeMode; label: string; title: string }[] = [
    { key: 'system', label: '系统', title: '跟随系统' },
    { key: 'light', label: '亮色', title: '亮色' },
    { key: 'dark', label: '暗色', title: '暗色' },
  ]
  return (
    <div
      title="切换主题"
      style={{
        display: 'flex',
        gap: 2,
        background: isDark ? '#2a2a2a' : '#f5f5f5',
        borderRadius: 6,
        padding: 2,
      }}
    >
      {options.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          title={opt.title}
          aria-label={opt.title}
          style={{
            padding: '4px 10px',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            background: value === opt.key ? (isDark ? '#1677ff' : '#fff') : 'transparent',
            boxShadow: value === opt.key ? '0 1px 2px rgba(0,0,0,0.2)' : 'none',
            fontWeight: value === opt.key ? 500 : 400,
            fontSize: 12,
            color: value === opt.key ? (isDark ? '#fff' : '#1677ff') : isDark ? '#bbb' : '#666',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

/** 预览框：mobile 场景下显示手机外框，desktop 场景下显示常规卡片 */
const PreviewFrame: React.FC<{ scene: DeviceScene; isDark: boolean; children: React.ReactNode }> = ({ scene, isDark, children }) => {
  if (scene === 'mobile') {
    return (
      <div
        style={{
          width: 375,
          maxWidth: '100%',
          margin: '0 auto',
          background: isDark ? '#141414' : '#fff',
          borderRadius: 24,
          border: '8px solid #222',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          padding: 16,
          minHeight: 600,
        }}
      >
        {children}
      </div>
    )
  }
  return <div style={{ maxWidth: 640, margin: '0 auto', background: isDark ? '#141414' : '#fff', borderRadius: 8, padding: 32, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>{children}</div>
}

export default App
