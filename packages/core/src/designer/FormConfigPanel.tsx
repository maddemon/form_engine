import React from 'react'
import { FieldItem } from '../propRenders/shared'
import { useStyle } from '../styles'
import { useDesignerContext } from './DesignerContext'
import type { DesignerWidgets } from '../types/adapter'
import type { DesignerAction } from '../types/designer'
import type { FormConfig } from '../types/schema'

const COL_SPAN_OPTIONS = Array.from({ length: 24 }, (_, i) => ({ label: `${i + 1}`, value: String(i + 1) }))

const LABEL_ALIGN_OPTIONS = [
  { label: '左对齐', value: 'left' },
  { label: '右对齐', value: 'right' },
]

interface FormConfigPanelProps {
  formConfig: FormConfig
  dispatch: React.Dispatch<DesignerAction>
  widgets: DesignerWidgets
}

/**
 * 表单配置面板内容（不包含外层宽度/边框容器）
 * 容器由 PropertyPanel 统一管理，便于在有 propertyPanelTabs 时把 Tabs 与该内容并入同一布局
 */
export const FormConfigPanel: React.FC<FormConfigPanelProps> = ({ formConfig, dispatch, widgets: w }) => {
  const { token } = useStyle()
  const { scene } = useDesignerContext()
  const isMobile = scene === 'mobile'

  const handleColChange = (key: 'labelCol' | 'wrapperCol', v: string) => {
    const num = Number(v)
    if (isMobile) {
      dispatch({
        type: 'UPDATE_FORM_CONFIG',
        patch: {
          scenes: {
            ...formConfig.scenes,
            mobile: { ...formConfig.scenes?.mobile, [key]: num ? { span: num } : undefined },
          },
        },
      })
    } else {
      dispatch({
        type: 'UPDATE_FORM_CONFIG',
        patch: { [key]: num ? { span: num } : undefined },
      })
    }
  }

  const labelColSpan = isMobile
    ? (formConfig.scenes?.mobile?.labelCol?.span ?? 24)
    : (formConfig.labelCol?.span ?? 5)
  const wrapperColSpan = isMobile
    ? (formConfig.scenes?.mobile?.wrapperCol?.span ?? 24)
    : (formConfig.wrapperCol?.span ?? 15)

  return (
    <>
      <h4 style={{ margin: `0 0 ${token('spacingMd')} 0`, fontSize: token('fontSizeMd') }}>表单配置</h4>

      <FieldItem label="显示冒号">
        <w.Switch checked={!!formConfig.colon} onChange={(v: boolean) => dispatch({ type: 'UPDATE_FORM_CONFIG', patch: { colon: v } })} />
      </FieldItem>

      <FieldItem label="标签对齐">
        <w.Select
          value={formConfig.labelAlign || 'right'}
          onChange={(v: string) => dispatch({ type: 'UPDATE_FORM_CONFIG', patch: { labelAlign: v as 'left' | 'right' } })}
          options={LABEL_ALIGN_OPTIONS}
        />
      </FieldItem>

      <div style={{ marginTop: token('spacingMd'), borderTop: '1px solid var(--fe-border-light)', paddingTop: token('spacingSm') }}>
        <div style={{ fontSize: token('fontSizeSm'), fontWeight: 500, marginBottom: token('spacingSm'), color: 'var(--fe-text-secondary)' }}>
          {isMobile ? '移动端标签/控件宽度' : '桌面端标签/控件宽度'}
        </div>
        <FieldItem label="标签宽度">
          <w.Select
            value={String(labelColSpan)}
            onChange={(v: string) => handleColChange('labelCol', v)}
            options={COL_SPAN_OPTIONS}
          />
        </FieldItem>
        <FieldItem label="控件宽度">
          <w.Select
            value={String(wrapperColSpan)}
            onChange={(v: string) => handleColChange('wrapperCol', v)}
            options={COL_SPAN_OPTIONS}
          />
        </FieldItem>
      </div>
    </>
  )
}
