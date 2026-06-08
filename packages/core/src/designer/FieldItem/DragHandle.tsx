import React from 'react'
import { Grip } from '../../components/icons'
import { useLocale } from '../../locale'

interface DragHandleProps {
  dragActivatorRef?: (node: HTMLElement | null) => void
  dragListeners?: Record<string, Function>
}

export const DragHandle: React.FC<DragHandleProps> = ({ dragActivatorRef, dragListeners }) => {
  const { locale } = useLocale()
  return (
  <div
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: 30,
      background: 'var(--fe-primary)',
      borderRadius: 'var(--fe-border-radius-sm) 0 var(--fe-border-radius-sm) 0',
      padding: '2px var(--fe-spacing-xs)',
      lineHeight: 1,
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--fe-spacing-xs)',
    }}
  >
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
      title={locale.designer.fieldActions.dragSort}
    >
      <Grip size={12} />
    </span>
  </div>
  )
}
