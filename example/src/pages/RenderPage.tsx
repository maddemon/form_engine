import { antdAdapter } from '@form-engine/adapter-antd'
import { antdMobileAdapter } from '@form-engine/adapter-antd-mobile'
import type { FormRenderHandle, FormSchema } from '@form-engine/core'
import { FormRender, type DeviceScene } from '@form-engine/core'
import { Button, Card, Empty, Flex, Segmented } from 'antd'
import React, { useCallback, useRef, useState } from 'react'
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

interface Props {
  schema: FormSchema
  themeMode?: import('@form-engine/core').ThemeMode
}

const sceneOptions = [
  { label: '桌面端', value: 'desktop' as const, icon: <DesktopIcon /> },
  { label: '移动端', value: 'mobile' as const, icon: <MobileIcon /> },
]

const RenderPage: React.FC<Props> = ({ schema, themeMode }) => {
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
    <Flex vertical gap={0} style={{ height: '100%' }}>
      <Card size="small" style={{ flex: 1, overflow: 'auto', borderRadius: 0 }}>
        <div style={{ textAlign: 'center' }}>
          <Segmented
            value={scene}
            onChange={(v) => setScene(v as DeviceScene)}
            options={sceneOptions.map((opt) => ({
              label:
                opt.icon && opt.label ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {opt.icon}
                    {opt.label}
                  </span>
                ) : (
                  opt.label
                ),
              value: opt.value,
            }))}
          />
        </div>
        <PreviewFrame scene={scene}>
          {schema.fields.length === 0 ? (
            <Empty description="暂无字段，请先到「设计器」页面添加字段" />
          ) : (
            <>
              <FormRender
                ref={formRef}
                schema={schema}
                onSubmit={handleSubmit}
                onChange={handleChange}
                mobileAdapter={antdMobileAdapter}
                scene={scene}
                themeMode={themeMode}
              />
              <Flex gap={8} style={{ marginTop: 24 }}>
                <Button type="primary" onClick={() => formRef.current?.submit()}>
                  提交
                </Button>
                <Button onClick={() => formRef.current?.reset()}>重置</Button>
              </Flex>
            </>
          )}
        </PreviewFrame>
      </Card>
    </Flex>
  )
}

/** 预览框 */
const PreviewFrame: React.FC<{ scene: DeviceScene; children: React.ReactNode }> = ({ scene, children }) => {
  if (scene === 'mobile') {
    return (
      <Card
        styles={{ body: { padding: 16 } }}
        style={{
          width: 375,
          maxWidth: '100%',
          margin: '0 auto',
          minHeight: 600,
          border: '8px solid var(--fe-border-heavy, #222)',
          borderRadius: 24,
        }}
      >
        {children}
      </Card>
    )
  }
  return (
    <Card styles={{ body: { padding: 32 } }} style={{ maxWidth: 640, margin: '0 auto' }}>
      {children}
    </Card>
  )
}

export default RenderPage
