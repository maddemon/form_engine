import { Tabs } from 'antd-mobile'
import type { FieldRendererFn } from '@form-engine/core'

export const TabsField: FieldRendererFn = (props: any) => {
  const { children } = props
  const activeKey = props.activeKey
  const defaultActiveKey = props.defaultActiveKey

  return (
    <Tabs activeKey={activeKey} defaultActiveKey={defaultActiveKey}>
      {children}
    </Tabs>
  )
}
