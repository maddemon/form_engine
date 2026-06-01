import type { ComponentPalette } from '../../types/palette'
import { Star } from '../icons'
export const palette: ComponentPalette = {
  label: '评分',
  category: 'form',
  icon: <Star />,
  defaultProps: { componentProps: { count: 5 } },
}