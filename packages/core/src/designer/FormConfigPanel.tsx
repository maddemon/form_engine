import React from 'react'
import { FieldItem } from '../propRenders/shared'
import { useStyle } from '../styles'
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

  const handleDesktopColChange = (key: 'labelCol' | 'wrapperCol', v: string | undefined) => {
    if (v === undefined) return
    const num = Number(v)
    dispatch({
      type: 'UPDATE_FORM_CONFIG',
      patch: { [key]: { span: num } },
    })
  }

  const handleMobileColChange = (key: 'labelCol' | 'wrapperCol', v: string | undefined) => {
    if (v === undefined) return
    const num = Number(v)
    dispatch({
      type: 'UPDATE_FORM_CONFIG',
      patch: {
        scenes: {
          ...formConfig.scenes,
          mobile: { ...formConfig.scenes.mobile, [key]: { span: num } },
        },
      },
    })
  }

  const handlePageBgChange = (scene: 'desktop' | 'mobile', v: string | number) => {
    const val = String(v)
    dispatch({
      type: 'UPDATE_FORM_CONFIG',
      patch: {
        pageBackground: {
          ...formConfig.pageBackground,
          [scene]: val || undefined,
        },
      },
    })
  }

  const desktopLabelColSpan = formConfig.scenes.desktop.labelCol.span
  const desktopWrapperColSpan = formConfig.scenes.desktop.wrapperCol.span
  const mobileLabelColSpan = formConfig.scenes.mobile.labelCol.span
  const mobileWrapperColSpan = formConfig.scenes.mobile.wrapperCol.span

  const desktopPageBg = formConfig.pageBackground?.desktop ?? ''
  const mobilePageBg = formConfig.pageBackground?.mobile ?? ''

  const renderPageBgField = (scene: 'desktop' | 'mobile', bgValue: string) => (
    <FieldItem label={`${scene === 'desktop' ? '桌面端' : '移动端'}页面背景色`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: token('spacingXs') }}>
        <div
          style={{
            width: token('spacingXl'),
            height: token('spacingXl'),
            borderRadius: 'var(--fe-border-radius-sm)',
            border: '1px solid var(--fe-border)',
            background: bgValue || (scene === 'desktop' ? 'var(--fe-bg-primary)' : 'var(--fe-bg-secondary)'),
            flexShrink: 0,
          }}
        />
        <w.Input value={bgValue} onChange={(v) => handlePageBgChange(scene, v)} placeholder={scene === 'desktop' ? 'var(--fe-bg-primary)' : 'var(--fe-bg-secondary)'} />
      </div>
    </FieldItem>
  )

  const renderColSection = (title: string, labelColSpan: number, wrapperColSpan: number, onColChange: (key: 'labelCol' | 'wrapperCol', v: string | undefined) => void) => (
    <div style={{ marginTop: token('spacingMd'), borderTop: '1px solid var(--fe-border-light)', paddingTop: token('spacingSm') }}>
      <div style={{ fontSize: token('fontSizeSm'), fontWeight: 500, marginBottom: token('spacingSm'), color: 'var(--fe-text-secondary)' }}>{title}</div>
      <FieldItem label="标签宽度">
        <w.Select value={String(labelColSpan)} onChange={(v) => onColChange('labelCol', v)} options={COL_SPAN_OPTIONS} />
      </FieldItem>
      <FieldItem label="控件宽度">
        <w.Select value={String(wrapperColSpan)} onChange={(v) => onColChange('wrapperCol', v)} options={COL_SPAN_OPTIONS} />
      </FieldItem>
    </div>
  )

  return (
    <>
      <h4 style={{ margin: `0 0 ${token('spacingMd')} 0`, fontSize: token('fontSizeMd') }}>表单配置</h4>

      <FieldItem label="显示冒号">
        <w.Switch checked={!!formConfig.colon} onChange={(v: boolean) => dispatch({ type: 'UPDATE_FORM_CONFIG', patch: { colon: v } })} />
      </FieldItem>

      <FieldItem label="标签对齐">
        <w.Select value={formConfig.labelAlign || 'right'} onChange={(v) => dispatch({ type: 'UPDATE_FORM_CONFIG', patch: { labelAlign: v as 'left' | 'right' } })} options={LABEL_ALIGN_OPTIONS} />
      </FieldItem>

      <h4 style={{ margin: `${token('spacingMd')} 0 ${token('spacingSm')} 0`, fontSize: token('fontSizeSm'), color: 'var(--fe-text-secondary)' }}>桌面端配置</h4>
      {renderPageBgField('desktop', desktopPageBg)}
      {renderColSection('桌面端标签/控件宽度', desktopLabelColSpan, desktopWrapperColSpan, handleDesktopColChange)}

      <h4 style={{ margin: `${token('spacingMd')} 0 ${token('spacingSm')} 0`, fontSize: token('fontSizeSm'), color: 'var(--fe-text-secondary)' }}>移动端配置</h4>
      {renderPageBgField('mobile', mobilePageBg)}
      {renderColSection('移动端标签/控件宽度', mobileLabelColSpan, mobileWrapperColSpan, handleMobileColChange)}
    </>
  )
}
