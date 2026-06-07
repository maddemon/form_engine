import React from 'react'
import { useStyle } from '../styles'

export const WidgetSwitch: React.FC<{
  checked?: boolean
  onChange?: (v: boolean) => void
  disabled?: boolean
  style?: React.CSSProperties
}> = ({ checked, onChange, disabled, style }) => {
  const { token } = useStyle()
  const trackColor = checked ? token('primary') as string : token('borderPrimary') as string
  const trackH = token('switchTrackHeight') as string
  const thumbSize = token('switchThumbSize') as string
  return (
    <div
      onClick={() => !disabled && onChange?.(!checked)}
      style={{
        display: 'inline-block',
        width: `calc(${trackH} * 1.8)`,
        height: trackH,
        borderRadius: `calc(${trackH} / 2)`,
        background: trackColor,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: token('transitionNormal') as string,
        position: 'relative',
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: thumbSize ? `calc((${trackH} - ${thumbSize}) / 2)` : 0,
          left: checked ? `calc(${trackH} * 1.8 - ${thumbSize} - (${trackH} - ${thumbSize}) / 2)` : `calc((${trackH} - ${thumbSize}) / 2)`,
          width: thumbSize,
          height: thumbSize,
          borderRadius: '50%',
          background: token('bgPrimary') as string,
          transition: 'left 0.2s',
          boxShadow: token('shadowSm') as string,
        }}
      />
    </div>
  )
}
