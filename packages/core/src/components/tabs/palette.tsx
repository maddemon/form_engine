import type { ComponentPalette } from '../../types/palette'
import { Minus } from '../icons'
export const palette: ComponentPalette = {
  label: '标签页',
  category: 'container',
  icon: <Minus />,
  defaultProps: {
    children: [
      { name: 'tab_1', type: 'tabs', label: '标签页一' },
      { name: 'tab_2', type: 'tabs', label: '标签页二' },
    ],
  },
}