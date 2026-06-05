import React, { useState } from 'react'
import { useStyle } from '../styles'

interface CollapsibleSectionProps {
  title: string
  children: React.ReactNode
  defaultCollapsed?: boolean
  forceExpand?: boolean
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  defaultCollapsed = false,
  forceExpand = false,
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  const isExpanded = forceExpand || !collapsed
  const { token } = useStyle()

  return (
    <div style={{ marginTop: token('spacingMd') }}>
      <div
        onClick={() => !forceExpand && setCollapsed(!collapsed)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${token('spacingXs')} 0`,
          cursor: forceExpand ? 'default' : 'pointer',
          borderBottom: '1px solid var(--fe-border-light)',
          fontSize: token('fontSizeSm'),
          fontWeight: 500,
          color: token('textSecondary') as string,
        }}
      >
        <span>{title}</span>
        {!forceExpand && (
          <span
            style={{
              fontSize: token('widgetInputFontSizeXxs'),
              color: token('textTertiary') as string,
              transition: 'transform 0.2s',
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            ▲
          </span>
        )}
      </div>
      {isExpanded && (
        <div style={{ paddingTop: token('spacingSm'), fontSize: token('fontSizeSm') }}>
          {children}
        </div>
      )}
    </div>
  )
}
