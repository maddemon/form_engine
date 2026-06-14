import { antdAdapter } from '@form-engine/antd'
import { antdMobileAdapter } from '@form-engine/antd-mobile'
import type { FormRenderHandle, FormSchema, SupportedLocale } from '@form-engine/core'
import { FormRender, Monitor, Smartphone, type DeviceScene } from '@form-engine/core'
import { Button, Card, Empty, Flex, Segmented } from 'antd'
import React, { useCallback, useRef, useState } from 'react'
import { useAppContext } from '../context/AppContext'

interface Props {
  schema: FormSchema
}

const localeSceneLabels: Record<SupportedLocale, { desktop: string; mobile: string }> = {
  'zh-CN': { desktop: '桌面端', mobile: '移动端' },
  'en-US': { desktop: 'Desktop', mobile: 'Mobile' },
}

const RenderPage: React.FC<Props> = ({ schema }) => {
  const { themeMode, locale } = useAppContext()
  const [scene, setScene] = useState<DeviceScene>('desktop')
  const formRef = useRef<FormRenderHandle>(null)
  const labels = localeSceneLabels[locale]

  const sceneOptions = [
    { label: labels.desktop, value: 'desktop' as const, icon: <Monitor size={16} /> },
    { label: labels.mobile, value: 'mobile' as const, icon: <Smartphone size={16} /> },
  ]

  const handleSubmit = useCallback(
    (values: Record<string, unknown>) => {
      console.log('提交:', values)
      alert((locale === 'zh-CN' ? '提交成功！\n' : 'Submit successful!\n') + JSON.stringify(values, null, 2))
    },
    [locale],
  )

  const handleChange = useCallback((values: Record<string, unknown>) => {
    console.log('变化:', values)
  }, [])

  const emptyText =
    locale === 'zh-CN' ? '暂无字段，请先到「设计器」页面添加字段' : 'No fields. Add fields in the Designer page first.'

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
            <Empty description={emptyText} />
          ) : (
            <>
              <FormRender
                ref={formRef}
                schema={schema}
                onSubmit={handleSubmit}
                onChange={handleChange}
                desktopAdapter={antdAdapter}
                mobileAdapter={antdMobileAdapter}
                scene={scene}
                themeMode={themeMode}
                locale={locale}
              />
              <Flex gap={8} style={{ marginTop: 24 }}>
                <Button type="primary" onClick={() => formRef.current?.submit()}>
                  {locale === 'zh-CN' ? '提交' : 'Submit'}
                </Button>
                <Button onClick={() => formRef.current?.reset()}>{locale === 'zh-CN' ? '重置' : 'Reset'}</Button>
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
