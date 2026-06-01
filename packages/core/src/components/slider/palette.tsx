import type { ComponentPalette } from '../../types/palette'
import { Slash } from '../icons'
export const palette: ComponentPalette = {
  label: '滑块',
  category: 'form',
  icon: <Slash />,
  defaultProps: { componentProps: { min: 0, max: 100, step: 1 } },
}