import type { ComponentPalette } from '../../types/palette'
import { Square } from '../icons'
export const palette: ComponentPalette = {
  label: '按钮',
  category: 'button',
  icon: <Square />,
  defaultProps: { componentProps: { children: '按钮' } },
}