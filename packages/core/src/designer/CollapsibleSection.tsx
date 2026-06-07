import React, { useState } from 'react'
import { useStyle } from '../styles'
import { Space } from '../widgets/Space'
import { Divider } from '../widgets/Divider'

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
          padding: `${token('spacingXs')} 0`,
          cursor: forceExpand ? 'default' : 'pointer',
          fontSize: token('fontSizeSm'),
          fontWeight: 500,
          color: token('textSecondary') as string,
        }}
      >
        <Space justify="space-between">
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
        </Space>
      </div>
      <Divider direction="bottom" padding={false} />
      {isExpanded && (
        <div style={{ paddingTop: token('spacingSm'), fontSize: token('fontSizeSm') }}>
          {children}
        </div>
      )}
    </div>
  )
}
