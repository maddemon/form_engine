/**
 * 事件处理器编辑器
 *
 * 在设计器属性面板中为单个事件渲染配置界面：
 * - 选择处理类型（未配置 / expression / action / callback）
 * - expression：多行文本框
 * - action：下拉选择（actions 注册表）
 * - callback：回调名输入
 */

import React, { useState } from 'react'
import type { EventHandler, EventHandlerType } from '../types/events'
import { listActionNames } from '../events'
import { FieldGroup, InlineField } from '../propRenders/shared'

export interface EventHandlerEditorProps {
  /** 当前事件处理器（未配置时为 undefined） */
  value?: EventHandler
  /** 变更回调 */
  onChange: (handler: EventHandler | undefined) => void
  /** 事件名（用于日志/调试） */
  eventName: string
}

const HANDLER_TYPE_OPTIONS: { label: string; value: EventHandlerType | '' }[] = [
  { label: '未配置', value: '' },
  { label: '表达式（expression）', value: 'expression' },
  { label: '动作（action）', value: 'action' },
  { label: '回调（callback）', value: 'callback' },
]

export const EventHandlerEditor: React.FC<EventHandlerEditorProps> = ({
  value,
  onChange,
  eventName,
}) => {
  const [type, setType] = useState<EventHandlerType | ''>(value?.type ?? '')

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
    <div style={{ marginBottom: 8, padding: 6, background: '#fafafa', border: '1px solid #eee', borderRadius: 4 }}>
      <FieldGroup label={`事件：${eventName}`}>
        <select
          value={type}
          onChange={e => handleTypeChange(e.target.value as EventHandlerType | '')}
          style={{ width: '100%', padding: '2px 6px', fontSize: 12 }}
        >
          {HANDLER_TYPE_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </FieldGroup>

      {type === 'expression' && value?.type === 'expression' && (
        <FieldGroup label="表达式">
          <textarea
            value={value.expression || ''}
            onChange={e => onChange({ ...value, expression: e.target.value })}
            placeholder={`如：$form.setFieldValue('other', $event)`}
            style={{ width: '100%', minHeight: 60, padding: 4, fontSize: 12, fontFamily: 'monospace' }}
          />
          <div style={{ fontSize: 10, color: '#999', marginTop: 2 }}>
            可用变量：$self（当前字段）、$form（表单 API）、$event（事件对象）
          </div>
        </FieldGroup>
      )}

      {type === 'action' && value?.type === 'action' && (
        <>
          <FieldGroup label="动作">
            <select
              value={value.action || ''}
              onChange={e => onChange({ ...value, action: e.target.value })}
              style={{ width: '100%', padding: '2px 6px', fontSize: 12 }}
            >
              {listActionNames().map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </FieldGroup>
          <FieldGroup label="参数（JSON）">
            <textarea
              value={value.params ? JSON.stringify(value.params, null, 2) : ''}
              onChange={e => {
                const text = e.target.value.trim()
                if (!text) {
                  onChange({ ...value, params: undefined })
                  return
                }
                try {
                  onChange({ ...value, params: JSON.parse(text) })
                } catch {
                  // 解析失败时保留原值，不更新
                }
              }}
              placeholder='如：{ "name": "other", "value": "x" }'
              style={{ width: '100%', minHeight: 50, padding: 4, fontSize: 12, fontFamily: 'monospace' }}
            />
          </FieldGroup>
        </>
      )}

      {type === 'callback' && value?.type === 'callback' && (
        <FieldGroup label="回调名（FormRenderProps.callbacks 中的 key）">
          <input
            value={value.callback || ''}
            onChange={e => onChange({ ...value, callback: e.target.value })}
            placeholder="如：onCustomClick"
            style={{ width: '100%', padding: '2px 6px', fontSize: 12 }}
          />
        </FieldGroup>
      )}
    </div>
  )
}
