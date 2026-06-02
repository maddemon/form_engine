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
  return (
    <div
      onClick={() => !disabled && onChange?.(!checked)}
      style={{
        display: 'inline-block',
        width: token('widgetSwitchTrackWidth'),
        height: token('widgetSwitchTrackHeight'),
        borderRadius: token('widgetSwitchTrackRadius'),
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
          top: token('widgetSwitchThumbOffset'),
          left: checked ? token('widgetSwitchThumbActiveOffset') : token('widgetSwitchThumbOffset'),
          width: token('widgetSwitchThumbSize'),
          height: token('widgetSwitchThumbSize'),
          borderRadius: '50%',
          background: token('bgPrimary') as string,
          transition: 'left 0.2s',
          boxShadow: token('widgetSwitchShadow') as string,
        }}
      />
    </div>
  )
}
