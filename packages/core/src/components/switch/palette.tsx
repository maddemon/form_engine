import type { ComponentPalette } from '../../types/palette'
import { ToggleLeft } from '../icons'
export const palette: ComponentPalette = {
  label: '开关',
  category: 'form',
  icon: <ToggleLeft />,
  defaultProps: { defaultValue: false },
}