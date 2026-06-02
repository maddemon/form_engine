import React from 'react'
import type { FormFieldSchema } from '../types'
import { isContainerComponent } from '../types/component-category'
import { useStyle } from '../styles'
import { useDesignerContext } from './DesignerContext'

const fieldTypeLabels: Record<string, string> = {
  'input': '单行文本', 'textarea': '多行文本', 'password': '密码',
  'input-number': '数字', 'slider': '滑块', 'rate': '评分',
  'select': '下拉', 'radio': '单选', 'checkbox': '多选框', 'switch': '开关',
  'date': '日期', 'datetime': '日期时间', 'date-range': '日期范围', 'time': '时间',
  'grid': '栅格布局', 'flex': '弹性布局', 'container': '容器',
  'collapse': '折叠面板', 'tabs': '标签页',
  'text': '文本展示', 'title': '标题', 'image': '图片展示', 'divider': '分割线',
  'button': '按钮', 'upload': '上传',
}

interface FieldItemProps {
  field: FormFieldSchema
  isSelected: boolean
  children: React.ReactNode
  dragListeners?: Record<string, Function>
  dragAttributes?: Record<string, any>
  dragActivatorRef?: (node: HTMLElement | null) => void
  dragNodeRef?: (node: HTMLElement | null) => void
  dragStyle?: React.CSSProperties
}

export const FieldItem: React.FC<FieldItemProps> = ({
  field,
  isSelected,
  children,
  dragListeners,
  dragAttributes,
  dragActivatorRef,
  dragNodeRef,
  dragStyle,
}) => {
  const { dispatch, onSelectField } = useDesignerContext()
  const isContainer = isContainerComponent(field.type)
  const { token } = useStyle()

  const getBorder = () => {
    if (isSelected) return '1px solid var(--fe-primary)'
    if (isContainer) return '1px dashed var(--fe-border-primary)'
    return '1px solid transparent'
  }

  return (
    <div
      ref={dragNodeRef}
      {...dragAttributes}
      style={{
        position: 'relative',
        padding: token('spacingSm'),
        marginBottom: token('spacingSm'),
        borderRadius: 'var(--fe-border-radius-md)',
        border: getBorder(),
        background: isSelected ? 'var(--fe-primary-bg)' : 'transparent',
        transition: 'border-color 0.2s',
        cursor: 'pointer',
        ...dragStyle,
      }}
      onClick={(e) => { if (!isSelected) { e.stopPropagation(); onSelectField(field.id || null) } }}
    >
      {isSelected && (
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--fe-spacing-xs)',
          background: 'var(--fe-primary)',
          borderRadius: '0 var(--fe-border-radius-sm) 0 var(--fe-border-radius-sm)',
          padding: '2px var(--fe-spacing-xs)',
          lineHeight: 1,
        }}>
          <span
            ref={dragActivatorRef}
            {...dragListeners}
            style={{
              color: 'var(--fe-bg-primary)',
              fontSize: 'var(--fe-font-size-xs)',
              cursor: 'grab',
              padding: '2px var(--fe-spacing-xs)',
              userSelect: 'none',
              whiteSpace: 'nowrap',
            }}
            title="拖拽排序"
          >
            ↕ {fieldTypeLabels[field.type] || field.type}
          </span>
          <span
            style={{ color: 'var(--fe-bg-primary)', fontSize: token('widgetFieldHandleFontSize'), cursor: 'pointer', padding: '2px var(--fe-spacing-xs)', userSelect: 'none' }}
            title="复制"
            onClick={e => { e.stopPropagation(); dispatch({ type: 'COPY_FIELD', fieldId: field.id! }) }}
          >
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </span>
          <span
            style={{ color: 'var(--fe-bg-primary)', fontSize: token('widgetFieldHandleFontSize'), cursor: 'pointer', padding: '2px var(--fe-spacing-xs)', userSelect: 'none' }}
            title="删除"
            onClick={e => { e.stopPropagation(); dispatch({ type: 'REMOVE_FIELD', fieldId: field.id! }) }}
          >
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </span>
        </div>
      )}

      <div style={{ pointerEvents: isContainer ? 'auto' : 'none' }}>
        {children}
      </div>
    </div>
  )
}
