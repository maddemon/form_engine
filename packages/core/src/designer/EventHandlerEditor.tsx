/**
 * 事件处理器编辑器
 *
 * 在设计器属性面板中为单个事件渲染配置界面：
 * - 选择处理类型（未配置 / expression / action / callback）
 * - expression：expressionEditor slot
 * - action：下拉选择（actions 注册表）+ jsonEditor slot（参数）
 * - callback：回调名输入
 */

import React, { useState } from 'react'
import { listActionNames } from '../events'
import { resolveSlot } from '../registry/propertySlotRegistry'
import { FieldItem } from '../propRenders/shared'
import { useStyle } from '../styles/useStyle'
import type { DesignerWidgets } from '../types/adapter'
import type { EventHandler, EventHandlerType } from '../types/events'
import type { PropertySlots } from '../types/property-slot'

/** EventHandlerEditor 所需的 widgets 子集（TextArea 为必选） */
type RequiredWidgets = Omit<DesignerWidgets, 'TextArea'> & {
  TextArea: NonNullable<DesignerWidgets['TextArea']>
}

export interface EventHandlerEditorProps {
  /** 当前事件处理器（未配置时为 undefined） */
  value?: EventHandler
  /** 变更回调 */
  onChange: (handler: EventHandler | undefined) => void
  /** 事件名（用于日志/调试） */
  eventName: string
  /** 设计器小组件（由 PropertyPanel 注入，必须包含 TextArea） */
  widgets: RequiredWidgets
  /** 属性编辑器 Slot */
  slots?: PropertySlots
}

const HANDLER_TYPE_OPTIONS: { label: string; value: EventHandlerType | '' }[] = [
  { label: '未配置', value: '' },
  { label: '表达式（expression）', value: 'expression' },
  { label: '动作（action）', value: 'action' },
  { label: '回调（callback）', value: 'callback' },
]

export const EventHandlerEditor: React.FC<EventHandlerEditorProps> = ({ value, onChange, eventName, widgets: w, slots }) => {
  const { token } = useStyle()
  const [type, setType] = useState<EventHandlerType | ''>(value?.type ?? '')

  const ExpressionEditorSlot = resolveSlot('expressionEditor', slots, w)
  const JsonEditorSlot = resolveSlot('jsonEditor', slots)

  const containerStyle: React.CSSProperties = {
    marginBottom: token('spacingSm') as string,
    padding: token('spacingXs') as string,
    background: token('bgTertiary'),
    border: `1px solid ${token('borderColorSplit')}`,
    borderRadius: token('borderRadiusSm') as string,
  }

  const handleTypeChange = (newType: EventHandlerType | '') => {
    setType(newType)
    if (!newType) {
      onChange(undefined)
      return
    }
    // 切换类型时初始化对应字段
    const next: EventHandler = { type: newType }
    if (newType === 'expression') next.expression = ''
    else if (newType === 'action') next.action = listActionNames()[0] ?? ''
    else if (newType === 'callback') next.callback = ''
    onChange(next)
  }

  return (
    <div style={containerStyle}>
      <FieldItem label={eventName}>
        <w.Select value={type} onChange={(v) => handleTypeChange(v as EventHandlerType | '')} options={HANDLER_TYPE_OPTIONS.map((opt) => ({ label: opt.label, value: opt.value }))} />
      </FieldItem>

      {type === 'expression' && value?.type === 'expression' && (
        <FieldItem label="表达式" variant="group">
          <ExpressionEditorSlot
            value={value.expression || ''}
            onChange={(v) => onChange({ ...value, expression: v as string })}
            placeholder={`如：$form.setFieldValue('other', $event)`}
          />
          <div style={{ fontSize: token('fontSizeXs') as string, color: token('textTertiary') as React.CSSProperties['color'], marginTop: 2 }}>可用变量：$self（当前字段）、$form（表单 API）、$event（事件对象）</div>
        </FieldItem>
      )}

      {type === 'action' && value?.type === 'action' && (
        <>
          <FieldItem label="动作" variant="group">
            <w.Select value={value.action || ''} onChange={(v) => onChange({ ...value, action: v })} options={listActionNames().map((name) => ({ label: name, value: name }))} />
          </FieldItem>
          <FieldItem label="参数（JSON）">
            <JsonEditorSlot
              value={value.params}
              onChange={(v) => onChange({ ...value, params: v as Record<string, unknown> | undefined })}
              placeholder='如：{ "name": "other", "value": "x" }'
            />
          </FieldItem>
        </>
      )}

      {type === 'callback' && value?.type === 'callback' && (
        <FieldItem variant="group" label="回调名（FormRenderProps.callbacks 中的 key）">
          <w.Input value={value.callback || ''} onChange={(v) => onChange({ ...value, callback: String(v) })} placeholder="如：onCustomClick" />
        </FieldItem>
      )}
    </div>
  )
}
