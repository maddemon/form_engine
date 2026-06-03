import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { registerSimpleCustomComponent, Designer, FormRender, defaultAdapter, getScene, setScene, autoDetectScene } from '@form-engine/core'
import type { FormSchema, FormFieldSchema } from '@form-engine/core'
import type { SidePanelTab, SidePanelTabContentProps, PropertyPanelTab, PropertyPanelTabContentProps } from '@form-engine/core'

// 注册自定义组件示例
import '../custom-component-demo'

// ==== 注册额外自定义组件用于测试 ====
const CustomCard: React.FC<any> = (props) => {
  const { value, onChange, fieldSchema, ...rest } = props
  return (
    <div style={{
      border: '1px solid #d9d9d9',
      borderRadius: 8,
      padding: 16,
      background: '#fafafa',
    }}>
      <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>{rest.label || '自定义卡片'}</label>
      <input
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={rest.placeholder || '请输入'}
        style={{ width: '100%', border: '1px solid #d9d9d9', borderRadius: 4, padding: '4px 8px' }}
      />
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
      <pre style={{
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
      }}>
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
  const [scene, setSceneState] = useState<ReturnType<typeof getScene>>(getScene)
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

  useEffect(() => {
    const onResize = () => {
      const newScene = autoDetectScene()
      setScene(newScene)
      setSceneState(newScene)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      fontFamily: '-apple-system, sans-serif',
      overflow: 'hidden',
    }}>
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

        <div style={{ display: 'flex', gap: 4, background: '#f5f5f5', borderRadius: 6, padding: 2 }}>
          {(
            [
              { key: 'design', label: '设计' },
              { key: 'preview', label: '预览' },
            ] as { key: Tab; label: string }[]
          ).map(tabItem => (
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
        </div>

        <div style={{ fontSize: 13, color: '#999' }}>
          表单名：{schema.name}
          <span style={{ marginLeft: 12, padding: '2px 8px', background: scene === 'mobile' ? '#1677ff' : '#52c41a', color: '#fff', borderRadius: 4 }}>
            {scene === 'mobile' ? '📱 Mobile' : '🖥️ Desktop'}
          </span>
        </div>
      </header>

      <div style={{ flex: 1, overflow: 'hidden' }}>
        {tab === 'design' ? (
          <Designer
            schema={schema}
            onSchemaChange={setSchema}
            onSceneChange={(s) => setSceneState(s)}
            adapter={defaultAdapter}
            panelWidths={{ palette: 260, properties: 'min(320px, 26vw)' }}
            excludeTypes={['date-range']}
            sidePanelTabs={sidePanelTabs}
            propertyPanelTabs={propertyPanelTabs}
          />
        ) : (
          <div style={{ height: '100%', overflow: 'auto', padding: 32, background: '#f5f5f5' }}>
            <div style={{ maxWidth: 640, margin: '0 auto', background: '#fff', borderRadius: 8, padding: 32, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              {schema.fields.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#999', padding: 64 }}>
                  暂无字段，请切换到「设计」Tab 添加字段
                </div>
              ) : (
                <FormRender schema={schema} onSubmit={handleSubmit} onChange={handleChange} adapter={defaultAdapter} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
