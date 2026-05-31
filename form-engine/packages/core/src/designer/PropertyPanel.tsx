import React from 'react'
import type { FormFieldSchema, FieldType, FormConfig, SubmitConfig } from '../../types/schema'
import type { DesignerAction } from '../../types/designer'
import type { FormAdapter, DesignerWidgets } from '../../types/adapter'
import type { DeviceScene } from '../../registry/componentRegistry'
import { Input, Select, Checkbox, InputNumber } from '../components'

interface PropertyPanelProps {
  field: FormFieldSchema | null
  formConfig: FormConfig
  submitConfig: SubmitConfig
  dispatch: React.Dispatch<DesignerAction>
  /** 当前平台适配器，用于渲染属性面板小组件（风格统一） */
  adapter?: FormAdapter
  /** 当前设计场景 */
  scene?: DeviceScene
  /** 设计器场景切换回调 */
  onSceneChange?: (scene: DeviceScene) => void
}

const FIELD_TYPES: FieldType[] = [
  'input', 'textarea', 'input-number', 'password',
  'select', 'multi-select', 'radio', 'checkbox',
  'switch', 'slider', 'rate', 'date', 'datetime',
  'date-range', 'time', 'upload', 'cascader', 'tree-select',
]

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

// ========================
// 从 adapter 提取小组件，未提供则使用 core 组件兜底
// ========================
function useWidgets(adapter?: FormAdapter): DesignerWidgets {
  const w = (adapter as any)?._designerWidgets as DesignerWidgets | undefined
  if (w) return w
  // 使用 core 已美化的组件兜底
  return {
    Input: CoreInput,
    Select: CoreSelect,
    Checkbox: CoreCheckbox,
    NumberInput: CoreNumberInput,
  }
}

// ========================
// Core 组件包装（适配 DesignerWidgets 接口）
// ========================

/**
 * 将 core Input 适配为 DesignerWidgets 接口
 */
const CoreInput: React.FC<{
  value?: string | number
  onChange?: (v: string | number) => void
  placeholder?: string
  disabled?: boolean
  style?: React.CSSProperties
}> = ({ value, onChange, placeholder, disabled, style }) => (
  <Input
    value={String(value ?? '')}
    onChange={v => onChange?.(v)}
    placeholder={placeholder}
    disabled={disabled}
    style={{ width: '100%', ...style }}
  />
)

/**
 * 将 core Select 适配为 DesignerWidgets 接口
 * 
 * 注意：core Select 的 API 可能与 DesignerWidgets 不同，这里需要做适配
 */
const CoreSelect: React.FC<{
  value?: string
  onChange?: (v: string) => void
  options: { label: string; value: string }[]
  disabled?: boolean
  style?: React.CSSProperties
}> = ({ value, onChange, options, disabled, style }) => {
  // core Select 可能接受 options 作为 children 或者需要通过 componentProps
  // 这里假设 core Select 支持 options prop（需要确认实际 API）
  return (
    <Select
      value={value}
      onChange={v => onChange?.(String(v))}
      options={options}
      disabled={disabled}
      style={{ width: '100%', ...style }}
    />
  )
}

/**
 * 将 core Checkbox 适配为 DesignerWidgets 接口
 * 
 * 注意：core Checkbox 的 onChange 类型是 (value: unknown) => void
 * 而 DesignerWidgets.Checkbox 期望 (checked: boolean) => void
 * 这里需要做类型转换
 */
const CoreCheckbox: React.FC<{
  checked?: boolean
  onChange?: (v: boolean) => void
  disabled?: boolean
  style?: React.CSSProperties
}> = ({ checked, onChange, disabled, style }) => {
  // 核心：将 core Checkbox 的 onChange 转换为期望的 (checked: boolean) => void
  const handleChange = (value: unknown) => {
    // core Checkbox 在单选模式下，value 就是 checked 状态
    if (typeof value === 'boolean') {
      onChange?.(value)
    } else {
      // 如果是其他情况（比如多选），默认当作 unchecked
      onChange?.(false)
    }
  }

  return (
    <div style={{ display: 'inline-block', ...style }}>
      <Checkbox
        checked={!!checked}
        onChange={handleChange}
        disabled={disabled}
      />
    </div>
  )
}

/**
 * 将 core InputNumber 适配为 DesignerWidgets 接口
 */
const CoreNumberInput: React.FC<{
  value?: number
  onChange?: (v: number) => void
  min?: number
  max?: number
  disabled?: boolean
  style?: React.CSSProperties
}> = ({ value, onChange, min, max, disabled, style }) => (
  <InputNumber
    value={value}
    onChange={v => onChange?.(Number(v))}
    min={min}
    max={max}
    disabled={disabled}
    style={{ width: '100%', ...style }}
  />
)

// ========================
// 通用字段行样式
// ========================
const FieldGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label style={{ display: 'block', marginBottom: 8, fontSize: 12 }}>
    {label}
    {children}
  </label>
)
const InlineField: React.FC<{ label: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ label, children, style }) => (
  <label style={{ display: 'block', marginBottom: 4, fontSize: 12, ...style }}>
    {children}
    {' '}{label}
  </label>
)

// ========================
// 折叠面板组件
// ========================
interface CollapsibleSectionProps {
  title: string
  children: React.ReactNode
  defaultCollapsed?: boolean
  forceExpand?: boolean  // 强制展开（如：高级属性已配置）
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ 
  title, 
  children, 
  defaultCollapsed = false,
  forceExpand = false 
}) => {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed && !forceExpand)

  // 当 forceExpand 或 defaultCollapsed 变化时，重置折叠状态
  React.useEffect(() => {
    setCollapsed(defaultCollapsed && !forceExpand)
  }, [forceExpand, defaultCollapsed])

  return (
    <div style={{ marginBottom: 12 }}>
      <div 
        onClick={() => setCollapsed(!collapsed)}
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          cursor: 'pointer',
          padding: '6px 0',
          borderBottom: '1px solid #eee',
          marginBottom: 8,
          userSelect: 'none'
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 500 }}>{title}</span>
        <span style={{ fontSize: 12, color: '#999' }}>
          {collapsed ? '▸ 展开' : '▾ 折叠'}
        </span>
      </div>
      {!collapsed && children}
    </div>
  )
}

// ========================
// 检测高级属性是否已配置
// ========================
function hasAdvancedConfig(field: FormFieldSchema): boolean {
  return !!(
    (typeof field.hidden === 'boolean' && field.hidden) ||
    (typeof field.hidden === 'string' && field.hidden) ||
    field.disabled || 
    field.readOnly ||
    field.requiredIfExpr
  )
}

// ========================
// 主组件
// ========================
export const PropertyPanel: React.FC<PropertyPanelProps> = ({
  field,
  formConfig,
  submitConfig,
  dispatch,
  adapter,
  scene = 'desktop',
  onSceneChange,
}) => {
  const w = useWidgets(adapter)

  // ---- 未选中字段：编辑表单配置 ----
  if (!field) {
    return (
      <div style={{ width: 280, borderLeft: '1px solid #eee', padding: 12, overflow: 'auto', height: '100%' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: 14 }}>表单配置</h4>

        {/* 场景切换（desktop / mobile） */}
        <FieldGroup label="设计场景">
          <div style={{ display: 'flex', gap: 4 }}>
            {(
              [
                { key: 'desktop' as const, label: '🖥 桌面' },
                { key: 'mobile' as const, label: '📱 手机' },
              ] as { key: DeviceScene; label: string }[]
            ).map(item => (
              <button
                key={item.key}
                onClick={() => onSceneChange?.(item.key)}
                style={{
                  flex: 1,
                  padding: '4px 0',
                  border: scene === item.key ? '1px solid #1677ff' : '1px solid #d9d9d9',
                  background: scene === item.key ? '#e6f4ff' : '#fff',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: scene === item.key ? 500 : 400,
                }}
              >
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
  }

  // ---- 选中字段：编辑字段属性 ----
  const hasAdvanced = hasAdvancedConfig(field)

  return (
    <div style={{ width: 280, borderLeft: '1px solid #eee', padding: 12, overflow: 'auto', height: '100%' }}>
      <h4 style={{ margin: '0 0 12px 0', fontSize: 14 }}>字段属性</h4>

      {/* ========== 基本属性 ========== */}
      <CollapsibleSection title="基本属性" defaultCollapsed={false}>
        {/* 字段类型（只读显示，不可修改） */}
        <FieldGroup label="字段类型">
          <div style={{ 
            padding: '4px 8px', 
            marginTop: 2, 
            background: '#f5f5f5', 
            borderRadius: 4, 
            fontSize: 12, 
            color: '#666',
            border: '1px solid #d9d9d9'
          }}>
            {field.type}
          </div>
        </FieldGroup>

        {/* name */}
        <FieldGroup label="字段名（name）">
          <w.Input
            value={field.name}
            onChange={(v: string | number) => dispatch({ type: 'UPDATE_FIELD', fieldId: field.id!, patch: { name: String(v) } })}
          />
        </FieldGroup>

        {/* label */}
        <FieldGroup label="标签（label）">
          <w.Input
            value={field.label || ''}
            onChange={(v: string | number) => dispatch({ type: 'UPDATE_FIELD', fieldId: field.id!, patch: { label: String(v) || undefined } })}
            placeholder="字段标签"
          />
        </FieldGroup>

        {/* placeholder */}
        <FieldGroup label="placeholder">
          <w.Input
            value={field.placeholder || ''}
            onChange={(v: string | number) => dispatch({ type: 'UPDATE_FIELD', fieldId: field.id!, patch: { placeholder: String(v) || undefined } })}
          />
        </FieldGroup>

        {/* colSpan */}
        <FieldGroup label="列宽（colSpan，24=满宽）">
          <w.NumberInput
            value={field.colSpan || 24}
            onChange={(v: number) => dispatch({ type: 'UPDATE_FIELD', fieldId: field.id!, patch: { colSpan: Number(v) } })}
            min={1}
            max={24}
          />
        </FieldGroup>
      </CollapsibleSection>

      {/* ========== 高级属性 ========== */}
      <CollapsibleSection 
        title="高级属性" 
        defaultCollapsed={true}
        forceExpand={hasAdvanced}
      >
        {/* 开关类 props */}
        <InlineField label="隐藏">
          <w.Checkbox
            checked={!!field.hidden && typeof field.hidden === 'boolean'}
            onChange={(v: boolean) => dispatch({ type: 'UPDATE_FIELD', fieldId: field.id!, patch: { hidden: v } })}
          />
        </InlineField>
        <InlineField label="禁用">
          <w.Checkbox
            checked={!!field.disabled}
            onChange={(v: boolean) => dispatch({ type: 'UPDATE_FIELD', fieldId: field.id!, patch: { disabled: v } })}
          />
        </InlineField>
        <InlineField label="只读">
          <w.Checkbox
            checked={!!field.readOnly}
            onChange={(v: boolean) => dispatch({ type: 'UPDATE_FIELD', fieldId: field.id!, patch: { readOnly: v } })}
          />
        </InlineField>

        {/* 联动表达式 */}
        <FieldGroup label="隐藏表达式（hidden expr）">
          <w.Input
            value={typeof field.hidden === 'string' ? field.hidden : ''}
            onChange={(v: string | number) => dispatch({ type: 'UPDATE_FIELD', fieldId: field.id!, patch: { hidden: (v as string) || undefined } })}
            placeholder="如：form.type !== 'admin'"
            style={{ fontSize: 11 }}
          />
        </FieldGroup>
        <FieldGroup label="必填表达式（requiredIfExpr）">
          <w.Input
            value={field.requiredIfExpr || ''}
            onChange={(v: string | number) => dispatch({ type: 'UPDATE_FIELD', fieldId: field.id!, patch: { requiredIfExpr: (v as string) || undefined } })}
            placeholder="如：form.type === 'admin'"
            style={{ fontSize: 11 }}
          />
        </FieldGroup>
      </CollapsibleSection>
    </div>
  )
}
