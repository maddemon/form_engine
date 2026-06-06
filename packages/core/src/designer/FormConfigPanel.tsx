import React from 'react'
import { FieldItem } from '../propRenders/shared'
import { useStyle } from '../styles'
import type { DesignerWidgets } from '../types/adapter'
import type { DesignerAction } from '../types/designer'
import type { FormConfig } from '../types/schema'
import { Divider, SectionTitle } from './UIPrimitives'

const COL_SPAN_OPTIONS = Array.from({ length: 24 }, (_, i) => ({ label: `${i + 1}`, value: String(i + 1) }))

const LAYOUT_OPTIONS_DESKTOP = [
  { label: '水平', value: 'horizontal' },
  { label: '垂直', value: 'vertical' },
  { label: '内联', value: 'inline' },
]

const LAYOUT_OPTIONS_MOBILE = [
  { label: '水平', value: 'horizontal' },
  { label: '垂直', value: 'vertical' },
]

const LABEL_ALIGN_OPTIONS = [
  { label: '左对齐', value: 'left' },
  { label: '右对齐', value: 'right' },
]

const VARIANT_OPTIONS = [
  { label: '外边框', value: 'outlined' },
  { label: '填充', value: 'filled' },
  { label: '无边框', value: 'borderless' },
  { label: '下划线', value: 'underlined' },
]

const REQUIRED_MARK_OPTIONS = [
  { label: '默认', value: 'true' },
  { label: '选填标记', value: 'optional' },
  { label: '隐藏', value: 'false' },
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

  const handleColChange = (scene: 'desktop' | 'mobile', key: 'labelCol' | 'wrapperCol', v: string | undefined) => {
    if (v === undefined) return
    const num = Number(v)
    dispatch({
      type: 'UPDATE_FORM_CONFIG',
      patch: {
        [scene]: { ...formConfig[scene], [key]: { span: num } },
      },
    })
  }

  const handlePageBgChange = (scene: 'desktop' | 'mobile', v: string | number) => {
    const val = String(v)
    dispatch({
      type: 'UPDATE_FORM_CONFIG',
      patch: {
        [scene]: { ...formConfig[scene], pageBackground: val || undefined },
      },
    })
  }

  const desktopLabelColSpan = formConfig.desktop.labelCol.span
  const desktopWrapperColSpan = formConfig.desktop.wrapperCol.span
  const desktopPageBg = formConfig.desktop.pageBackground ?? ''
  const mobilePageBg = formConfig.mobile.pageBackground ?? ''

  const renderPageBgField = (scene: 'desktop' | 'mobile', bgValue: string) => (
    <FieldItem label={`页面背景色`}>
      <w.ColorPicker value={bgValue} onChange={(v) => handlePageBgChange(scene, v)} placeholder={'var(--fe-bg-primary)'} allowClear />
    </FieldItem>
  )

  const renderColSection = (title: string, labelColSpan: number, wrapperColSpan: number, onColChange: (key: 'labelCol' | 'wrapperCol', v: string | undefined) => void) => (
    <div
      style={{
        marginTop: token('spacingMd'),
        paddingTop: token('spacingSm'),
      }}
    >
      <div
        style={{
          fontSize: token('fontSizeSm'),
          fontWeight: 500,
          marginBottom: token('spacingSm'),
          color: token('textSecondary') as string,
        }}
      >
        {title}
      </div>
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
      <SectionTitle>表单配置</SectionTitle>

      <FieldItem label="显示冒号">
        <w.Switch checked={!!formConfig.colon} onChange={(v: boolean) => dispatch({ type: 'UPDATE_FORM_CONFIG', patch: { colon: v } })} />
      </FieldItem>

      <FieldItem label="必填标记">
        <w.Select value={formConfig.requiredMark === undefined ? 'true' : formConfig.requiredMark === false ? 'false' : formConfig.requiredMark === true ? 'true' : 'optional'} onChange={(v) => {
          const val = v === 'true' ? true : v === 'false' ? false : 'optional'
          dispatch({ type: 'UPDATE_FORM_CONFIG', patch: { requiredMark: val } })
        }} options={REQUIRED_MARK_OPTIONS} />
      </FieldItem>

      <Divider />

      <SectionTitle variant="secondary">桌面端配置</SectionTitle>
      {renderPageBgField('desktop', desktopPageBg)}
      <FieldItem label="布局模式">
        <w.Select value={formConfig.desktop.layout} onChange={(v) => dispatch({ type: 'UPDATE_FORM_CONFIG', patch: { desktop: { ...formConfig.desktop, layout: v as 'horizontal' | 'vertical' | 'inline' } } })} options={LAYOUT_OPTIONS_DESKTOP} />
      </FieldItem>
      <FieldItem label="标签对齐">
        <w.Select value={formConfig.desktop.labelAlign || 'right'} onChange={(v) => dispatch({ type: 'UPDATE_FORM_CONFIG', patch: { desktop: { ...formConfig.desktop, labelAlign: v as 'left' | 'right' } } })} options={LABEL_ALIGN_OPTIONS} />
      </FieldItem>
      <FieldItem label="控件变体">
        <w.Select value={formConfig.desktop.variant || 'outlined'} onChange={(v) => dispatch({ type: 'UPDATE_FORM_CONFIG', patch: { desktop: { ...formConfig.desktop, variant: v as 'outlined' | 'borderless' | 'filled' | 'underlined' } } })} options={VARIANT_OPTIONS} />
      </FieldItem>
      {renderColSection('控件宽度', desktopLabelColSpan, desktopWrapperColSpan, (key, v) => handleColChange('desktop', key, v))}

      <Divider />

      <SectionTitle variant="secondary">移动端配置</SectionTitle>
      {renderPageBgField('mobile', mobilePageBg)}
      <FieldItem label="布局模式">
        <w.Select value={formConfig.mobile.layout} onChange={(v) => dispatch({ type: 'UPDATE_FORM_CONFIG', patch: { mobile: { ...formConfig.mobile, layout: v as 'horizontal' | 'vertical' } } })} options={LAYOUT_OPTIONS_MOBILE} />
      </FieldItem>
    </>
  )
}
