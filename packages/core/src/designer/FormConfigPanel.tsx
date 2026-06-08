import React from 'react'
import { useLocale } from '../locale'
import { FieldItem } from '../propRenders/shared'
import { useStyle } from '../styles'
import type { DesignerWidgets } from '../types/adapter'
import type { DesignerAction } from '../types/designer'
import type { FormConfig } from '../types/schema'
import { Divider, SectionTitle } from './UIPrimitives'

const COL_SPAN_OPTIONS = Array.from({ length: 24 }, (_, i) => ({ label: `${i + 1}`, value: String(i + 1) }))

interface FormConfigPanelProps {
  formConfig: FormConfig
  dispatch: React.Dispatch<DesignerAction>
  widgets: DesignerWidgets
}

export const FormConfigPanel: React.FC<FormConfigPanelProps> = ({ formConfig, dispatch, widgets: w }) => {
  const { token } = useStyle()
  const { locale } = useLocale()
  const fc = locale.designer.formConfig

  const layoutDesktop = [
    { label: fc.horizontal, value: 'horizontal' },
    { label: fc.vertical, value: 'vertical' },
    { label: fc.inline, value: 'inline' },
  ]
  const layoutMobile = [
    { label: fc.horizontal, value: 'horizontal' },
    { label: fc.vertical, value: 'vertical' },
  ]
  const labelAlign = [
    { label: fc.leftAlign, value: 'left' },
    { label: fc.rightAlign, value: 'right' },
  ]
  const variants = [
    { label: fc.outline, value: 'outlined' },
    { label: fc.filled, value: 'filled' },
    { label: fc.borderless, value: 'borderless' },
    { label: fc.underline, value: 'underlined' },
  ]
  const requiredMark = [
    { label: fc.default, value: 'true' },
    { label: fc.optionalMark, value: 'optional' },
    { label: fc.hidden, value: 'false' },
  ]

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
    <FieldItem label={fc.pageBg}>
      <w.ColorPicker value={bgValue} onChange={(v) => handlePageBgChange(scene, v)} placeholder={fc.bgPlaceholder} allowClear />
    </FieldItem>
  )

  const renderColSection = (labelColSpan: number, wrapperColSpan: number, onColChange: (key: 'labelCol' | 'wrapperCol', v: string | undefined) => void) => (
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
        {fc.controlWidth}
      </div>
      <FieldItem label={fc.labelWidth}>
        <w.Select value={String(labelColSpan)} onChange={(v) => onColChange('labelCol', v)} options={COL_SPAN_OPTIONS} />
      </FieldItem>
      <FieldItem label={fc.controlWidth}>
        <w.Select value={String(wrapperColSpan)} onChange={(v) => onColChange('wrapperCol', v)} options={COL_SPAN_OPTIONS} />
      </FieldItem>
    </div>
  )

  return (
    <>
      <SectionTitle>{fc.title}</SectionTitle>

      <FieldItem label={fc.showColon}>
        <w.Switch checked={!!formConfig.colon} onChange={(v: boolean) => dispatch({ type: 'UPDATE_FORM_CONFIG', patch: { colon: v } })} />
      </FieldItem>

      <FieldItem label={fc.requiredMark}>
        <w.Select value={formConfig.requiredMark === undefined ? 'true' : formConfig.requiredMark === false ? 'false' : formConfig.requiredMark === true ? 'true' : 'optional'} onChange={(v) => {
          const val = v === 'true' ? true : v === 'false' ? false : 'optional'
          dispatch({ type: 'UPDATE_FORM_CONFIG', patch: { requiredMark: val } })
        }} options={requiredMark} />
      </FieldItem>

      <Divider />

      <SectionTitle variant="secondary">{fc.desktopConfig}</SectionTitle>
      {renderPageBgField('desktop', desktopPageBg)}
      <FieldItem label={fc.layoutMode}>
        <w.Select value={formConfig.desktop.layout} onChange={(v) => dispatch({ type: 'UPDATE_FORM_CONFIG', patch: { desktop: { ...formConfig.desktop, layout: v as 'horizontal' | 'vertical' | 'inline' } } })} options={layoutDesktop} />
      </FieldItem>
      <FieldItem label={fc.labelAlign}>
        <w.Select value={formConfig.desktop.labelAlign || 'right'} onChange={(v) => dispatch({ type: 'UPDATE_FORM_CONFIG', patch: { desktop: { ...formConfig.desktop, labelAlign: v as 'left' | 'right' } } })} options={labelAlign} />
      </FieldItem>
      <FieldItem label={fc.controlVariant}>
        <w.Select value={formConfig.desktop.variant || 'outlined'} onChange={(v) => dispatch({ type: 'UPDATE_FORM_CONFIG', patch: { desktop: { ...formConfig.desktop, variant: v as 'outlined' | 'borderless' | 'filled' | 'underlined' } } })} options={variants} />
      </FieldItem>
      {renderColSection(desktopLabelColSpan, desktopWrapperColSpan, (key, v) => handleColChange('desktop', key, v))}

      <Divider />

      <SectionTitle variant="secondary">{fc.mobileConfig}</SectionTitle>
      {renderPageBgField('mobile', mobilePageBg)}
      <FieldItem label={fc.layoutMode}>
        <w.Select value={formConfig.mobile.layout} onChange={(v) => dispatch({ type: 'UPDATE_FORM_CONFIG', patch: { mobile: { ...formConfig.mobile, layout: v as 'horizontal' | 'vertical' } } })} options={layoutMobile} />
      </FieldItem>
    </>
  )
}
