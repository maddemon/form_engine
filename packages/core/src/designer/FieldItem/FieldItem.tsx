import React, { useState } from 'react'
import { isContainerComponent } from '../../types/component-category'
import { useDesignerDispatch, useDesignerSelection } from '../DesignerContext'
import { DragHandle } from './DragHandle'
import { FieldActions } from './FieldActions'
import { useStyle } from '../../styles'
import type { FieldItemProps } from './types'

export const FieldItem: React.FC<FieldItemProps> = React.memo(({ field, isSelected, children, dragListeners, dragAttributes, dragActivatorRef, dragNodeRef, dragStyle }) => {
  const dispatch = useDesignerDispatch()
  const { onSelectField } = useDesignerSelection()
  const isContainer = isContainerComponent(field.type)
  const { token } = useStyle()
  const [hovered, setHovered] = useState(false)

  const getBorder = () => {
    if (isSelected) return '1px solid var(--fe-primary)'
    if (hovered) return '1px solid var(--fe-canvas-field-hover-border)'
    if (isContainer) return '1px dashed var(--fe-border-primary)'
    return '1px solid transparent'
  }

  const getBackground = () => {
    if (isSelected) return 'var(--fe-primary-bg)'
    if (hovered) return 'var(--fe-canvas-field-hover-bg)'
    return 'transparent'
  }

  const showActions = isSelected || hovered

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
        background: getBackground(),
        transition: 'border-color 0.2s, background 0.2s',
        cursor: 'pointer',
        ...dragStyle,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => { if (!isSelected) { e.stopPropagation(); onSelectField(field.id || null) } }}
    >
      {isSelected && <DragHandle dragActivatorRef={dragActivatorRef} dragListeners={dragListeners} />}

      {showActions && (
        <FieldActions
          fieldId={field.id}
          onCopy={() => dispatch({ type: 'COPY_FIELD', fieldId: field.id })}
          onRemove={() => dispatch({ type: 'REMOVE_FIELD', fieldId: field.id })}
        />
      )}

      <div style={{ pointerEvents: 'none' }}>{children}</div>
    </div>
  )
})
FieldItem.displayName = 'FieldItem'
