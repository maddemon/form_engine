import React from 'react'
import { useStyle } from '../styles'
import { TooltipIcon } from '../shared/UIPrimitives'
import { Space } from '../widgets/Space'
import { resolveSlot } from '../registry/propertySlotRegistry'
import type { PropertySlots } from '../types/property-slot'
import type { DesignerWidgets } from '../types/adapter-designer'
import type { FieldDataSource } from '../types/schema'

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
    <Space
      gap="sm"
      align="center"
      style={{
        marginBottom: token('spacingSm'),
        fontSize: token('fontSizeSm'),
        color: token('textSecondary') as string,
        ...style,
      }}
    >
      <span style={{ whiteSpace: 'nowrap', flexShrink: 0, minWidth: 80 }}>{labelNode}</span>
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </Space>
  )
}

interface DataSourceEditorFieldProps {
  dataSource?: FieldDataSource
  onChange?: (ds: FieldDataSource) => void
  optionsType: 'flat' | 'tree'
  slots?: PropertySlots
  widgets: DesignerWidgets
}

export const DataSourceEditorField: React.FC<DataSourceEditorFieldProps> = ({
  dataSource,
  onChange,
  optionsType,
  slots,
  widgets,
}) => {
  const Slot = React.useMemo(
    () => resolveSlot('dataSourceEditor', slots, widgets),
    [slots, widgets],
  )
  return React.createElement(Slot, {
    value: dataSource,
    onChange: (v: unknown) => onChange?.(v as FieldDataSource),
    context: { optionsType },
  })
}
