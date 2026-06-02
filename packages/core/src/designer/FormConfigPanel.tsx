import React from 'react'
import { FieldItem } from '../propRenders/shared'
import { useStyle } from '../styles'
import type { DesignerWidgets } from '../types/adapter'
import type { DesignerAction } from '../types/designer'
import type { FormConfig } from '../types/schema'
import { resolvePanelWidth } from '../utils'

const COL_SPAN_OPTIONS = Array.from({ length: 24 }, (_, i) => ({ label: `${i + 1}`, value: String(i + 1) }))

interface FormConfigPanelProps {
  formConfig: FormConfig
  dispatch: React.Dispatch<DesignerAction>
  widgets: DesignerWidgets
  /**
   * 可选：面板宽度
   *  - `number`：px（小于 240 自动降级到 240）
   *  - `string`：透传 CSS 宽度（如 '24%'、'min(280px, 22vw)'）
   *  - 缺省：token 默认（`--fe-panel-config-width`）
   */
  width?: number | string
}

export const FormConfigPanel: React.FC<FormConfigPanelProps> = ({ formConfig, dispatch, widgets: w, width }) => {
  const { token } = useStyle()
  const resolvedWidth = resolvePanelWidth(width, token('panelConfigWidth') as string, 240)
  return (
    <div style={{ width: resolvedWidth, borderLeft: '1px solid var(--fe-border-light)', padding: token('spacingMd'), overflow: 'auto', height: '100%' }}>
      <h4 style={{ margin: `0 0 ${token('spacingMd')} 0`, fontSize: token('fontSizeMd') }}>表单配置</h4>

      <FieldItem label="显示冒号">
        <w.Switch checked={!!formConfig.colon} onChange={(v: boolean) => dispatch({ type: 'UPDATE_FORM_CONFIG', patch: { colon: v } })} />
      </FieldItem>

      <div style={{ marginTop: token('spacingMd'), borderTop: '1px solid var(--fe-border-light)', paddingTop: token('spacingSm') }}>
        <div style={{ fontSize: token('fontSizeSm'), fontWeight: 500, marginBottom: token('spacingSm'), color: 'var(--fe-text-secondary)' }}>标签/控件宽度</div>
        <FieldItem label="标签宽度">
          <w.Select
            value={String(formConfig.labelCol?.span ?? 6)}
            onChange={(v: string) => {
              const num = Number(v)
              dispatch({
                type: 'UPDATE_FORM_CONFIG',
                patch: { labelCol: num ? { span: num } : undefined },
              })
            }}
            options={COL_SPAN_OPTIONS}
          />
        </FieldItem>
        <FieldItem label="控件宽度">
          <w.Select
            value={String(formConfig.wrapperCol?.span ?? 18)}
            onChange={(v: string) => {
              const num = Number(v)
              dispatch({
                type: 'UPDATE_FORM_CONFIG',
                patch: { wrapperCol: num ? { span: num } : undefined },
              })
            }}
            options={COL_SPAN_OPTIONS}
          />
        </FieldItem>
      </div>
    </div>
  )
}
