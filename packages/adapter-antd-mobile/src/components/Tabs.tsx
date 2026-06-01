import { Tabs } from 'antd-mobile'
import type { FieldRendererFn } from '@form-engine/core'

export const TabsField: FieldRendererFn = (props: any) => {
  const { children, componentProps } = props
  const activeKey = componentProps?.activeKey
  const defaultActiveKey = componentProps?.defaultActiveKey

  return (
    <Tabs activeKey={activeKey} defaultActiveKey={defaultActiveKey}>
      {children}
    </Tabs>
  )
}
