import { antdAdapter } from '@form-engine/adapter-antd'
import { antdMobileAdapter, AntdMobileBridgeProvider } from '@form-engine/adapter-antd-mobile'
import type { FormRenderHandle, FormSchema } from '@form-engine/core'
import { FormRender, type DeviceScene } from '@form-engine/core'
import { Button, Card, Empty, Space, Typography } from 'antd'
import React, { useCallback, useRef, useState } from 'react'

interface Props {
  isDark: boolean
  schema: FormSchema
}

const RenderPage: React.FC<Props> = ({ isDark, schema }) => {
  const [scene, setScene] = useState<DeviceScene>('desktop')
  const formRef = useRef<FormRenderHandle>(null)

  const handleSubmit = useCallback((values: Record<string, unknown>) => {
    console.log('提交:', values)
    alert('提交成功！\n' + JSON.stringify(values, null, 2))
  }, [])

  const handleChange = useCallback((values: Record<string, unknown>) => {
    console.log('变化:', values)
  }, [])

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 场景切换 */}
      <div style={{ padding: '8px 24px', borderBottom: `1px solid ${isDark ? '#303030' : '#f0f0f0'}`, background: isDark ? '#1f1f1f' : '#fff', flexShrink: 0 }}>
        <Space>
          <Button
            type={scene === 'desktop' ? 'primary' : 'default'}
            size="small"
            onClick={() => setScene('desktop')}
            icon={<DesktopIcon />}
          >
            桌面端
          </Button>
          <Button
            type={scene === 'mobile' ? 'primary' : 'default'}
            size="small"
            onClick={() => setScene('mobile')}
            icon={<MobileIcon />}
          >
            移动端
          </Button>
        </Space>
      </div>

      {/* 渲染预览 */}
      <div style={{ flex: 1, overflow: 'auto', padding: 32, background: isDark ? '#1f1f1f' : '#f5f5f5' }}>
        <PreviewFrame scene={scene} isDark={isDark}>
          {schema.fields.length === 0 ? (
            <Card>
              <Empty description="暂无字段，请先到「设计器」页面添加字段" />
            </Card>
          ) : (
            <AntdMobileBridgeProvider key={scene}>
              <FormRender
                ref={formRef}
                schema={schema}
                onSubmit={handleSubmit}
                onChange={handleChange}
                desktopAdapter={antdAdapter}
                mobileAdapter={antdMobileAdapter}
                scene={scene}
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
                <Button type="primary" onClick={() => formRef.current?.submit()}>
                  提交
                </Button>
                <Button onClick={() => formRef.current?.reset()}>重置</Button>
              </div>
            </AntdMobileBridgeProvider>
          )}
        </PreviewFrame>
      </div>
    </div>
  )
}

/** 桌面图标 */
const DesktopIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: -2 }}>
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
)

/** 手机图标 */
const MobileIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: -2 }}>
    <rect x="6" y="2" width="12" height="20" rx="2" />
    <line x1="12" y1="18" x2="12" y2="18" />
  </svg>
)

/** 预览框 */
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
  return (
    <div style={{ maxWidth: 640, margin: '0 auto', background: isDark ? '#141414' : '#fff', borderRadius: 8, padding: 32, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      {children}
    </div>
  )
}

export default RenderPage
