import React from 'react'
import type { FormFieldSchema } from '../types'
import { isContainerComponent } from '../types/component-category'
import { useStyle } from '../styles'
import { useDesignerContext } from './DesignerContext'

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
        <>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 30,
            background: 'var(--fe-primary)',
            borderRadius: 'var(--fe-border-radius-sm) 0 var(--fe-border-radius-sm) 0',
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
              <svg width={12} height={12} viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="4" r="2" />
                <circle cx="12" cy="20" r="2" />
                <circle cx="4" cy="12" r="2" />
                <circle cx="20" cy="12" r="2" />
              </svg>
            </span>
          </div>
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            zIndex: 30,
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--fe-spacing-xs)',
            padding: '2px var(--fe-spacing-xs)',
            lineHeight: 1,
          }}>
            <span
              style={{ color: 'var(--fe-primary)', fontSize: token('widgetFieldHandleFontSize'), cursor: 'pointer', padding: '2px var(--fe-spacing-xs)', userSelect: 'none' }}
              title="复制"
              onClick={e => { e.stopPropagation(); dispatch({ type: 'COPY_FIELD', fieldId: field.id! }) }}
            >
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </span>
            <span
              style={{ color: 'var(--fe-error)', fontSize: token('widgetFieldHandleFontSize'), cursor: 'pointer', padding: '2px var(--fe-spacing-xs)', userSelect: 'none' }}
              title="删除"
              onClick={e => { e.stopPropagation(); dispatch({ type: 'REMOVE_FIELD', fieldId: field.id! }) }}
            >
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </span>
          </div>
        </>
      )}

      <div style={{ pointerEvents: isContainer ? 'auto' : 'none' }}>
        {children}
      </div>
    </div>
  )
}
