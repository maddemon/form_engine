import React from 'react'
import type { FieldComponentProps, FieldRendererFn } from '@form-engine/core'
import { iconMap } from '@form-engine/core'

// antd-mobile 无 Alert 组件，使用简化 div 实现
const TYPE_STYLES: Record<string, { bg: string; border: string; color: string }> = {
  primary: { bg: '#e6f4ff', border: '#91caff', color: '#1677ff' },
  info:    { bg: '#e6f4ff', border: '#91caff', color: '#1677ff' },
  success: { bg: '#f6ffed', border: '#b7eb8f', color: '#52c41a' },
  warning: { bg: '#fffbe6', border: '#ffe58f', color: '#faad14' },
  error:   { bg: '#fff2f0', border: '#ffccc7', color: '#ff4d4f' },
}

export const AlertField: FieldRendererFn = (props: FieldComponentProps) => {
  const { style } = props
  const type = props.type ?? 'info'
  const title = props.title
  const content = props.content ?? ''
  const showIcon = props.showIcon !== false
  const closable = props.closable
  const icon = props.icon
  const onClose = props.onClose

  const ts = TYPE_STYLES[type] || TYPE_STYLES.info

  // 解析自定义图标
  let iconNode: React.ReactNode = null
  if (showIcon) {
    if (icon && iconMap[icon]) {
      const IconComp = iconMap[icon]
      iconNode = <IconComp size={16} color={ts.color} />
    } else {
      // 默认类型图标
      iconNode = (
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={ts.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      )
    }
  }

  return (
    <div style={{
      padding: '8px 12px',
      borderRadius: 6,
      background: ts.bg,
      border: `1px solid ${ts.border}`,
      fontSize: 13,
      ...style,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        {iconNode && <span style={{ flexShrink: 0, marginTop: 2 }}>{iconNode}</span>}
        <div style={{ flex: 1 }}>
          {title && <div style={{ fontWeight: 500, color: ts.color, marginBottom: 2 }}>{title}</div>}
          <div style={{ color: '#333' }}>{content}</div>
        </div>
        {closable && (
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: '#999',
              fontSize: 14,
              lineHeight: 1,
              padding: 0,
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
