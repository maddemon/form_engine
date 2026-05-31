import React, { useState, useCallback, useEffect, useRef } from 'react'
import { Designer, FormRender, defaultAdapter, getScene, setScene, autoDetectScene } from '@form-engine/core'
import type { FormSchema } from '@form-engine/core'

type Tab = 'design' | 'preview'

const App: React.FC = () => {
  const [tab, setTab] = useState<Tab>('design')
  // 将 scene 纳入 state，变化时自动重新渲染
  const [scene, setSceneState] = useState<ReturnType<typeof getScene>>(getScene)
  const [schema, setSchema] = useState<FormSchema>({
    version: '0.1',
    name: '未命名表单',
    fields: [],
    form: { layout: 'vertical', size: 'middle' },
    submit: { text: '提交', showReset: true, resetText: '重置' },
  })

  const handleSubmit = useCallback((values: Record<string, unknown>) => {
    console.log('提交:', values)
    alert('提交成功！\n' + JSON.stringify(values, null, 2))
  }, [])

  const handleChange = useCallback((values: Record<string, unknown>) => {
    console.log('变化:', values)
  }, [])

  // 监听 resize，更新 scene state（驱动重新渲染）
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
      {/* 顶部导航栏 - 固定高度，不收缩 */}
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

      {/* 主体内容 */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {tab === 'design' ? (
          <Designer
            schema={schema}
            onSchemaChange={setSchema}
            onSceneChange={(s) => setSceneState(s)}
            adapter={defaultAdapter}
          />
        ) : (
          <div
            style={{
              height: '100%',
              overflow: 'auto',
              padding: 32,
              background: '#f5f5f5',
            }}
          >
            <div
              style={{
                maxWidth: 640,
                margin: '0 auto',
                background: '#fff',
                borderRadius: 8,
                padding: 32,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              {schema.fields.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#999', padding: 64 }}>
                  暂无字段，请切换到「设计」Tab 添加字段
                </div>
              ) : (
                <FormRender
                  schema={schema}
                  onSubmit={handleSubmit}
                  onChange={handleChange}
                  adapter={defaultAdapter}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
