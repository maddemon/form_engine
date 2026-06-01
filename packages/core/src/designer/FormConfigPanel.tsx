import React from 'react'
import { RowField } from '../propRenders/shared'
import type { DeviceScene } from '../registry/componentRegistry'
import { Monitor, Smartphone } from '../components/icons'
import type { DesignerAction } from '../types/designer'
import type { FormConfig, SubmitConfig } from '../types/schema'
import type { DesignerWidgets } from '../types/adapter'

const LAYOUT_OPTIONS = [
  { label: '水平', value: 'horizontal' },
  { label: '垂直', value: 'vertical' },
  { label: '行内', value: 'inline' },
]
const SIZE_OPTIONS = [
  { label: '小', value: 'small' },
  { label: '中', value: 'middle' },
  { label: '大', value: 'large' },
]
const COL_SPAN_OPTIONS = Array.from({ length: 24 }, (_, i) => ({ label: `${i + 1}`, value: String(i + 1) }))

const FieldGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label style={{ display: 'block', marginBottom: 8, fontSize: 12 }}>
    {label}
    <div style={{ marginTop: 2 }}>{children}</div>
  </label>
)

const InlineField: React.FC<{ label: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ label, children, style }) => (
  <label style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4, fontSize: 12, ...style }}>
    {children}
    {label}
  </label>
)

interface FormConfigPanelProps {
  formConfig: FormConfig
  submitConfig: SubmitConfig
  dispatch: React.Dispatch<DesignerAction>
  scene: DeviceScene
  onSceneChange?: (scene: DeviceScene) => void
  widgets: DesignerWidgets
}

export const FormConfigPanel: React.FC<FormConfigPanelProps> = ({
  formConfig,
  submitConfig,
  dispatch,
  scene,
  onSceneChange,
  widgets: w,
}) => (
  <div style={{ width: 280, borderLeft: '1px solid #eee', padding: 12, overflow: 'auto', height: '100%' }}>
    <h4 style={{ margin: '0 0 12px 0', fontSize: 14 }}>表单配置</h4>

    <FieldGroup label="设计场景">
      <div style={{ display: 'flex', gap: 4 }}>
        {(
          [
            { key: 'desktop' as const, label: '桌面', icon: Monitor },
            { key: 'mobile' as const, label: '手机', icon: Smartphone },
          ] as { key: DeviceScene; label: string; icon: React.FC<{ size?: number; color?: string }> }[]
        ).map(item => (
          <button
            key={item.key}
            onClick={() => onSceneChange?.(item.key)}
            style={{
              flex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              padding: '4px 0',
              border: scene === item.key ? '1px solid #1677ff' : '1px solid #d9d9d9',
              background: scene === item.key ? '#e6f4ff' : '#fff',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: scene === item.key ? 500 : 400,
            }}
          >
            <item.icon size={14} color={scene === item.key ? '#1677ff' : '#666'} />
            {item.label}
          </button>
        ))}
      </div>
    </FieldGroup>

    <FieldGroup label="布局">
      <w.Select
        value={formConfig.layout || 'vertical'}
        onChange={(v: string) => dispatch({ type: 'UPDATE_FORM_CONFIG', patch: { layout: v as FormConfig['layout'] } })}
        options={LAYOUT_OPTIONS}
      />
    </FieldGroup>

    <FieldGroup label="尺寸">
      <w.Select
        value={formConfig.size || 'middle'}
        onChange={(v: string) => dispatch({ type: 'UPDATE_FORM_CONFIG', patch: { size: v as FormConfig['size'] } })}
        options={SIZE_OPTIONS}
      />
    </FieldGroup>

    <InlineField label="显示冒号">
      <w.Checkbox
        checked={!!formConfig.colon}
        onChange={(v: boolean) => dispatch({ type: 'UPDATE_FORM_CONFIG', patch: { colon: v } })}
      />
    </InlineField>

    <div style={{ marginTop: 12, borderTop: '1px solid #eee', paddingTop: 8 }}>
      <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8, color: '#666' }}>标签/控件宽度（{scene === 'desktop' ? '桌面' : '手机'}）</div>
      <RowField label="标签宽度">
        <w.Select
          value={String(formConfig.scenes?.[scene]?.labelCol?.span ?? formConfig.labelCol?.span ?? 6)}
          onChange={(v: string) => {
            const num = Number(v)
            dispatch({
              type: 'UPDATE_FORM_CONFIG',
              patch: {
                scenes: {
                  ...formConfig.scenes,
                  [scene]: { ...formConfig.scenes?.[scene], labelCol: num ? { span: num } : undefined },
                },
              },
            })
          }}
          options={COL_SPAN_OPTIONS}
        />
      </RowField>
      <RowField label="控件宽度">
        <w.Select
          value={String(formConfig.scenes?.[scene]?.wrapperCol?.span ?? formConfig.wrapperCol?.span ?? 18)}
          onChange={(v: string) => {
            const num = Number(v)
            dispatch({
              type: 'UPDATE_FORM_CONFIG',
              patch: {
                scenes: {
                  ...formConfig.scenes,
                  [scene]: { ...formConfig.scenes?.[scene], wrapperCol: num ? { span: num } : undefined },
                },
              },
            })
          }}
          options={COL_SPAN_OPTIONS}
        />
      </RowField>
    </div>

    <div style={{ marginTop: 16 }}>
      <h4 style={{ margin: '0 0 8px 0', fontSize: 14 }}>提交按钮</h4>
      <FieldGroup label="按钮文字">
        <w.Input
          value={submitConfig.text || ''}
          onChange={(v: string | number) => dispatch({ type: 'UPDATE_SUBMIT_CONFIG', patch: { text: String(v) } })}
        />
      </FieldGroup>
      <InlineField label="显示重置按钮">
        <w.Checkbox
          checked={!!submitConfig.showReset}
          onChange={(v: boolean) => dispatch({ type: 'UPDATE_SUBMIT_CONFIG', patch: { showReset: v } })}
        />
      </InlineField>
    </div>
  </div>
)
