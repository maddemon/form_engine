import { useMemo } from 'react'
import { useLocale } from '../../locale'
import { FieldItem } from '../../propRenders/shared'
import { useStyle } from '../../styles'
import type { DesignerWidgets } from '../../types/adapter'
import type { DesignerAction } from '../../types/designer'
import type { FormConfig } from '../../types/schema'
import { COL_SPAN_OPTIONS } from './types'

interface DesktopFormConfigProps {
  desktop: FormConfig['desktop']
  dispatch: React.Dispatch<DesignerAction>
  widgets: DesignerWidgets
}

/**
 * 桌面端表单配置：页面背景、布局模式、标签对齐、控件变体、列宽
 */
export const DesktopFormConfig: React.FC<DesktopFormConfigProps> = ({ desktop, dispatch, widgets: w }) => {
  const { token } = useStyle()
  const { locale } = useLocale()
  const fc = locale.designer.formConfig

  const layoutOptions = useMemo(
    () => [
      { label: fc.horizontal, value: 'horizontal' },
      { label: fc.vertical, value: 'vertical' },
      { label: fc.inline, value: 'inline' },
    ],
    [fc.horizontal, fc.vertical, fc.inline],
  )
  const labelAlignOptions = useMemo(
    () => [
      { label: fc.leftAlign, value: 'left' },
      { label: fc.rightAlign, value: 'right' },
    ],
    [fc.leftAlign, fc.rightAlign],
  )
  const variantOptions = useMemo(
    () => [
      { label: fc.outline, value: 'outlined' },
      { label: fc.filled, value: 'filled' },
      { label: fc.borderless, value: 'borderless' },
      { label: fc.underline, value: 'underlined' },
    ],
    [fc.outline, fc.filled, fc.borderless, fc.underline],
  )

  const handleColChange = (key: 'labelCol' | 'wrapperCol', v: string | undefined) => {
    if (v === undefined) return
    const num = Number(v)
    dispatch({
      type: 'UPDATE_FORM_CONFIG',
      patch: { desktop: { ...desktop, [key]: { span: num } } },
    })
  }

  const handlePageBgChange = (v: string | number) => {
    const val = String(v)
    dispatch({
      type: 'UPDATE_FORM_CONFIG',
      patch: { desktop: { ...desktop, pageBackground: val || undefined } },
    })
  }

  return (
    <>
      <FieldItem label={fc.pageBg}>
        <w.ColorPicker value={desktop.pageBackground ?? ''} onChange={handlePageBgChange} placeholder={fc.bgPlaceholder} allowClear />
      </FieldItem>

      <FieldItem label={fc.layoutMode}>
        <w.Select
          value={desktop.layout}
          onChange={(v) => dispatch({ type: 'UPDATE_FORM_CONFIG', patch: { desktop: { ...desktop, layout: v as 'horizontal' | 'vertical' | 'inline' } } })}
          options={layoutOptions}
        />
      </FieldItem>

      <FieldItem label={fc.labelAlign}>
        <w.Select
          value={desktop.labelAlign || 'right'}
          onChange={(v) => dispatch({ type: 'UPDATE_FORM_CONFIG', patch: { desktop: { ...desktop, labelAlign: v as 'left' | 'right' } } })}
          options={labelAlignOptions}
        />
      </FieldItem>

      <FieldItem label={fc.controlVariant}>
        <w.Select
          value={desktop.variant || 'outlined'}
          onChange={(v) => dispatch({ type: 'UPDATE_FORM_CONFIG', patch: { desktop: { ...desktop, variant: v as 'outlined' | 'borderless' | 'filled' | 'underlined' } } })}
          options={variantOptions}
        />
      </FieldItem>

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
          <w.Select value={String(desktop.labelCol.span)} onChange={(v) => handleColChange('labelCol', v)} options={COL_SPAN_OPTIONS} />
        </FieldItem>
        <FieldItem label={fc.controlWidth}>
          <w.Select value={String(desktop.wrapperCol.span)} onChange={(v) => handleColChange('wrapperCol', v)} options={COL_SPAN_OPTIONS} />
        </FieldItem>
      </div>
    </>
  )
}
