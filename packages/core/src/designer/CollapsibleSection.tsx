import React from 'react'

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
  forceExpand = false
}) => {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed && !forceExpand)

  React.useEffect(() => {
    setCollapsed(defaultCollapsed && !forceExpand)
  }, [forceExpand, defaultCollapsed])

  return (
    <div style={{ marginBottom: 12 }}>
      <div
        onClick={() => setCollapsed(!collapsed)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          padding: '6px 0',
          borderBottom: '1px solid #eee',
          marginBottom: 8,
          userSelect: 'none'
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 500 }}>{title}</span>
        <span style={{ fontSize: 12, color: '#999' }}>
          {collapsed ? '▸ 展开' : '▾ 折叠'}
        </span>
      </div>
      {!collapsed && children}
    </div>
  )
}
