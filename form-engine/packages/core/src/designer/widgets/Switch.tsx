import React from 'react'

export const WidgetSwitch: React.FC<{
  checked?: boolean
  onChange?: (v: boolean) => void
  disabled?: boolean
  style?: React.CSSProperties
}> = ({ checked, onChange, disabled, style }) => {
  const trackColor = checked ? '#1677ff' : '#ccc'
  return (
    <div
      onClick={() => !disabled && onChange?.(!checked)}
      style={{
        display: 'inline-block',
        width: 36,
        height: 20,
        borderRadius: 10,
        background: trackColor,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background 0.2s',
        position: 'relative',
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 2,
          left: checked ? 18 : 2,
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: '#fff',
          transition: 'left 0.2s',
          boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
        }}
      />
    </div>
  )
}
