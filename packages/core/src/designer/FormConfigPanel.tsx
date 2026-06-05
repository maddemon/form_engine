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

const LAYOUT_OPTIONS = [
  { label: '水平', value: 'horizontal' },
  { label: '垂直', value: 'vertical' },
  { label: '内联', value: 'inline' },
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

  const handleDesktopColChange = (key: 'labelCol' | 'wrapperCol', v: string | undefined) => {
    if (v === undefined) return
    const num = Number(v)
    dispatch({
      type: 'UPDATE_FORM_CONFIG',
      patch: {
        scenes: {
          ...formConfig.scenes,
          desktop: { ...formConfig.scenes.desktop, [key]: { span: num } },
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

  const desktopPageBg = formConfig.pageBackground?.desktop ?? ''
  const mobilePageBg = formConfig.pageBackground?.mobile ?? ''

  const renderPageBgField = (scene: 'desktop' | 'mobile', bgValue: string) => (
    <FieldItem label={`页面背景色`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: token('spacingXs') }}>
        <div
          style={{
            width: token('spacingXl'),
            height: token('spacingXl'),
            borderRadius: 'var(--fe-border-radius-sm)',
            border: '1px solid var(--fe-border)',
            background: bgValue || 'var(--fe-bg-primary)',
            flexShrink: 0,
          }}
        />
        <w.Input value={bgValue} onChange={(v) => handlePageBgChange(scene, v)} placeholder={'var(--fe-bg-primary)'} />
      </div>
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
      <h4
        style={{
          margin: `0 0 ${token('spacingMd')} 0`,
          fontSize: token('fontSizeMd'),
          color: token('textSecondary') as string,
        }}
      >
        表单配置
      </h4>

      <FieldItem label="布局模式">
        <w.Select value={formConfig.layout} onChange={(v) => dispatch({ type: 'UPDATE_FORM_CONFIG', patch: { layout: v as 'horizontal' | 'vertical' | 'inline' } })} options={LAYOUT_OPTIONS} />
      </FieldItem>

      <FieldItem label="显示冒号">
        <w.Switch checked={!!formConfig.colon} onChange={(v: boolean) => dispatch({ type: 'UPDATE_FORM_CONFIG', patch: { colon: v } })} />
      </FieldItem>

      <FieldItem label="标签对齐">
        <w.Select value={formConfig.labelAlign || 'right'} onChange={(v) => dispatch({ type: 'UPDATE_FORM_CONFIG', patch: { labelAlign: v as 'left' | 'right' } })} options={LABEL_ALIGN_OPTIONS} />
      </FieldItem>

      <FieldItem label="必填标记">
        <w.Select value={formConfig.requiredMark === undefined ? 'true' : formConfig.requiredMark === false ? 'false' : formConfig.requiredMark === true ? 'true' : 'optional'} onChange={(v) => {
          const val = v === 'true' ? true : v === 'false' ? false : 'optional'
          dispatch({ type: 'UPDATE_FORM_CONFIG', patch: { requiredMark: val } })
        }} options={REQUIRED_MARK_OPTIONS} />
      </FieldItem>

      <div
        style={{
          width: '100%',
          background: 'var(--fe-border-primary)',
          margin: `${token('spacingMd')} 0`,
        }}
      />

      <h4
        style={{
          margin: `${token('spacingMd')} 0 ${token('spacingSm')} 0`,
          fontSize: token('fontSizeSm'),
          color: token('textTertiary') as string,
        }}
      >
        桌面端配置
      </h4>
      {renderPageBgField('desktop', desktopPageBg)}
      <FieldItem label="控件变体">
        <w.Select value={formConfig.variant || 'outlined'} onChange={(v) => dispatch({ type: 'UPDATE_FORM_CONFIG', patch: { variant: v as 'outlined' | 'borderless' | 'filled' | 'underlined' } })} options={VARIANT_OPTIONS} />
      </FieldItem>
      {renderColSection('控件宽度', desktopLabelColSpan, desktopWrapperColSpan, handleDesktopColChange)}

      <div style={{ width: '100%', background: 'var(--fe-border-primary)', margin: `${token('spacingMd')} 0` }} />

      <h4
        style={{
          margin: `${token('spacingMd')} 0 ${token('spacingSm')} 0`,
          fontSize: token('fontSizeSm'),
          color: token('textTertiary') as string,
        }}
      >
        移动端配置
      </h4>
      {renderPageBgField('mobile', mobilePageBg)}
    </>
  )
}
