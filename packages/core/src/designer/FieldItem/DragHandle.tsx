import React from 'react'

interface DragHandleProps {
  dragActivatorRef?: (node: HTMLElement | null) => void
  dragListeners?: Record<string, Function>
}

/** 拖拽手柄：选中时显示在左上角 */
export const DragHandle: React.FC<DragHandleProps> = ({ dragActivatorRef, dragListeners }) => (
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
)
