/**
 * 事件处理器编辑器
 *
 * 在设计器属性面板中为单个事件渲染配置界面：
 * - 选择处理类型（未配置 / expression / action / callback）
 * - expression：expressionEditor slot
 * - action：下拉选择（actions 注册表）+ jsonEditor slot（参数）
 * - callback：回调名输入
 */

import React, { useMemo } from 'react'
import { listActionNames } from '../events'
import { useLocale } from '../locale'
import { FieldItem } from '../propRenders/shared'
import { resolveSlot } from '../registry/propertySlotRegistry'
import { useStyle } from '../styles/useStyle'
import type { DesignerWidgets } from '../types/adapter'
import type { EventHandler, EventHandlerType } from '../types/events'
import type { PropertySlots } from '../types/property-slot'
import { Text } from '../widgets/Text'

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

export const EventHandlerEditor: React.FC<EventHandlerEditorProps> = ({
  value,
  onChange,
  eventName,
  widgets: w,
  slots,
}) => {
  const { token } = useStyle()
  const { locale } = useLocale()
  const eh = locale.designer.eventHandler
  const type = value?.type ?? ''

  const handlerTypeOptions = [
    { label: eh.notConfigured, value: '' },
    { label: eh.expression, value: 'expression' },
    { label: eh.action, value: 'action' },
    { label: eh.callback, value: 'callback' },
  ]

  const ExpressionEditorSlot = useMemo(() => resolveSlot('expressionEditor', slots, w), [slots, w])
  const JsonEditorSlot = useMemo(() => resolveSlot('jsonEditor', slots), [slots])

  const containerStyle: React.CSSProperties = {
    marginBottom: token('spacingSm') as string,
    padding: token('spacingXs') as string,
    background: token('bgTertiary'),
    border: `1px solid ${token('borderColorSplit')}`,
    borderRadius: token('borderRadiusSm') as string,
  }

  const handleTypeChange = (newType: EventHandlerType | '') => {
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
        <w.Select
          value={type}
          onChange={(v) => handleTypeChange(v as EventHandlerType | '')}
          options={handlerTypeOptions.map((opt) => ({ label: opt.label, value: opt.value }))}
        />
      </FieldItem>

      {type === 'expression' && value?.type === 'expression' && (
        <FieldItem label={eh.expressionLabel} variant="group">
          {/* eslint-disable-next-line react-hooks/static-components */}
          <ExpressionEditorSlot
            value={value.expression || ''}
            onChange={(v) => onChange({ ...value, expression: v as string })}
            placeholder={eh.expressionPlaceholder}
          />
          <Text type="tertiary" style={{ marginTop: token('spacingXxs') }}>
            {eh.expressionHelp}
          </Text>
        </FieldItem>
      )}

      {type === 'action' && value?.type === 'action' && (
        <>
          <FieldItem label={eh.actionLabel} variant="group">
            <w.Select
              value={value.action || ''}
              onChange={(v) => onChange({ ...value, action: v })}
              options={listActionNames().map((name) => ({ label: name, value: name }))}
            />
          </FieldItem>
          <FieldItem label={eh.actionParams}>
            {/* eslint-disable-next-line react-hooks/static-components */}
            <JsonEditorSlot
              value={value.params}
              onChange={(v) => onChange({ ...value, params: v as Record<string, unknown> | undefined })}
              placeholder={eh.actionParamsPlaceholder}
            />
          </FieldItem>
        </>
      )}

      {type === 'callback' && value?.type === 'callback' && (
        <FieldItem variant="group" label={eh.callbackNameLabel}>
          <w.Input
            value={value.callback || ''}
            onChange={(v) => onChange({ ...value, callback: String(v) })}
            placeholder={eh.callbackNamePlaceholder}
          />
        </FieldItem>
      )}
    </div>
  )
}
