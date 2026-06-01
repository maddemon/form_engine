import { Collapse } from 'antd-mobile'
import type { FieldRendererFn } from '@form-engine/core'

export const CollapseField: FieldRendererFn = (props: any) => {
  const { children } = props
  const accordion = props.accordion || false
  const activeKey = props.activeKey
  const defaultActiveKey = props.defaultActiveKey

  return (
    <Collapse accordion={accordion} activeKey={activeKey} defaultActiveKey={defaultActiveKey}>
      {children}
    </Collapse>
  )
}
