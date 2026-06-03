import { antdAdapter } from '@form-engine/adapter-antd'
import { antdMobileAdapter } from '@form-engine/adapter-antd-mobile'
import type { FormEngineAdapter, FormFieldSchema, FormSchema, PropertyPanelTab, PropertyPanelTabContentProps, SidePanelTab, SidePanelTabContentProps } from '@form-engine/core'
import { Designer, FormRender, defaultAdapter, registerSimpleCustomComponent, type DeviceScene } from '@form-engine/core'
import React, { useCallback, useMemo, useState } from 'react'

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
          background: '#f5f5f5',
          border: '1px solid #e8e8e8',
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
  const [schema, setSchema] = useState<FormSchema>({
    version: '0.1',
    name: '未命名表单',
    fields: [],
    form: { layout: 'vertical', size: 'middle', labelAlign: 'right', labelCol: { span: 5 }, wrapperCol: { span: 15 }, colon: false },
    submit: { text: '提交', showReset: true, resetText: '重置' },
  })

  const handleSubmit = useCallback((values: Record<string, unknown>) => {
    console.log('提交:', values)
    alert('提交成功！\n' + JSON.stringify(values, null, 2))
  }, [])

  const handleChange = useCallback((values: Record<string, unknown>) => {
    console.log('变化:', values)
  }, [])

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '-apple-system, sans-serif',
        overflow: 'hidden',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          height: 56,
          borderBottom: '1px solid #e8e8e8',
          background: '#fff',
          flexShrink: 0,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Form Engine</h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {/* 设计 / 预览 + 桌面 / 手机（合并为一段） */}
          <div style={{ display: 'flex', gap: 2, background: '#f5f5f5', borderRadius: 6, padding: 2, alignItems: 'center' }}>
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
                  background: tab === tabItem.key ? '#fff' : 'transparent',
                  boxShadow: tab === tabItem.key ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                  fontWeight: tab === tabItem.key ? 500 : 400,
                  fontSize: 14,
                  color: '#333',
                }}
              >
                {tabItem.label}
              </button>
            ))}

            {/* 分隔条：仅在 preview tab 时显示桌面/手机图标 */}
            {tab === 'preview' && (
              <>
                <div style={{ width: 1, height: 18, background: '#d9d9d9', margin: '0 4px' }} />
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
                    background: previewScene === 'desktop' ? '#fff' : 'transparent',
                    boxShadow: previewScene === 'desktop' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                    color: previewScene === 'desktop' ? '#1677ff' : '#666',
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
                    background: previewScene === 'mobile' ? '#fff' : 'transparent',
                    boxShadow: previewScene === 'mobile' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                    color: previewScene === 'mobile' ? '#1677ff' : '#666',
                  }}
                >
                  <MobileIcon />
                </button>
              </>
            )}
          </div>
        </div>

        {/* 右侧留空，保留头部布局对称 */}
        <div style={{ width: 1 }} />
      </header>

      <div style={{ flex: 1, overflow: 'hidden' }}>
        {tab === 'design' ? (
          <Designer schema={schema} onSchemaChange={setSchema} adapter={defaultAdapter} panelWidths={{ palette: 260, properties: 'min(320px, 26vw)' }} excludeTypes={['date-range']} sidePanelTabs={sidePanelTabs} propertyPanelTabs={propertyPanelTabs} />
        ) : (
          <div style={{ height: '100%', overflow: 'auto', padding: 32, background: '#f5f5f5' }}>
            <PreviewFrame scene={previewScene}>{schema.fields.length === 0 ? <div style={{ textAlign: 'center', color: '#999', padding: 64 }}>暂无字段，请切换到「设计」Tab 添加字段</div> : <FormRender schema={schema} onSubmit={handleSubmit} onChange={handleChange} adapter={(previewScene === 'mobile' ? antdMobileAdapter : antdAdapter) as unknown as FormEngineAdapter} />}</PreviewFrame>
          </div>
        )}
      </div>
    </div>
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

/** 预览框：mobile 场景下显示手机外框，desktop 场景下显示常规卡片 */
const PreviewFrame: React.FC<{ scene: DeviceScene; children: React.ReactNode }> = ({ scene, children }) => {
  if (scene === 'mobile') {
    return (
      <div
        style={{
          width: 375,
          maxWidth: '100%',
          margin: '0 auto',
          background: '#fff',
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
  return <div style={{ maxWidth: 640, margin: '0 auto', background: '#fff', borderRadius: 8, padding: 32, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>{children}</div>
}

export default App
