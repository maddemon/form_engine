import React from 'react'
import { useStyle } from '../styles'
import { WidgetButton } from './Button'

export interface WidgetModalProps {
  open: boolean
  title: string
  width?: 'sm' | 'md'
  onCancel: () => void
  onConfirm?: () => void
  confirmText?: string
  cancelText?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

const WIDTH_MAP = { sm: 'modalWidthSm', md: 'modalWidthMd' } as const

export const WidgetModal: React.FC<WidgetModalProps> = ({ open, title, width = 'md', onCancel, onConfirm, confirmText = '确定', cancelText = '取消', children, footer }) => {
  const { token } = useStyle()

  if (!open) return null

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'var(--fe-bg-mask)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  }

  const modalStyle: React.CSSProperties = {
    background: 'var(--fe-bg-primary)',
    borderRadius: token('borderRadiusLg'),
    boxShadow: token('shadowLg'),
    width: token(WIDTH_MAP[width]),
    maxWidth: '90vw',
    padding: token('spacingLg'),
  }

  const defaultFooter = onConfirm ? (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: token('spacingSm'), marginTop: token('spacingMd') }}>
      <WidgetButton type="default" onClick={onCancel}>
        {cancelText}
      </WidgetButton>
      <WidgetButton type="primary" onClick={onConfirm}>
        {confirmText}
      </WidgetButton>
    </div>
  ) : undefined

  return (
    <div style={overlayStyle} onClick={onCancel}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ fontSize: token('fontSizeMd'), fontWeight: 500, marginBottom: token('spacingSm') }}>{title}</div>
        {children}
        {footer ?? defaultFooter}
      </div>
    </div>
  )
}
