import { Collapse } from 'antd-mobile'
import type { FieldRendererFn } from '@form-engine/core'

export const CollapseField: FieldRendererFn = (props: any) => {
  const { children, componentProps } = props
  const accordion = componentProps?.accordion || false

  const activeKey = componentProps?.activeKey
  const defaultActiveKey = componentProps?.defaultActiveKey

  return (
    <Collapse accordion={accordion} activeKey={activeKey} defaultActiveKey={defaultActiveKey}>
      {children}
    </Collapse>
  )
}
