import React from 'react'
import { useStyle } from '../styles'
import { TooltipIcon } from '../designer/UIPrimitives'

interface FieldItemProps {
  label: string
  children: React.ReactNode
  variant?: 'row' | 'group'
  tooltip?: string
  style?: React.CSSProperties
}

export const FieldItem: React.FC<FieldItemProps> = ({ label, children, variant = 'row', tooltip, style }) => {
  const { token } = useStyle()

  const labelNode = (
    <>
      {label}
      {tooltip && <TooltipIcon tooltip={tooltip} />}
    </>
  )

  if (variant === 'group') {
    return (
      <label
        style={{
          display: 'block',
          marginBottom: token('spacingSm'),
          fontSize: token('fontSizeSm'),
          color: token('textSecondary') as string,
        }}
      >
        {labelNode}
        <div style={{ marginTop: token('spacingXs') }}>{children}</div>
      </label>
    )
  }

  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: token('spacingSm'),
        marginBottom: token('spacingSm'),
        fontSize: token('fontSizeSm'),
        color: token('textSecondary') as string,
        ...style,
      }}
    >
      <span style={{ whiteSpace: 'nowrap', flexShrink: 0, minWidth: 80 }}>{labelNode}</span>
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </label>
  )
}
