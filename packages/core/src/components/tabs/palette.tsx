import type { ComponentPalette } from '../../types/palette'
import { Minus } from '../icons'
export const palette: ComponentPalette = {
  label: '标签页',
  category: 'container',
  icon: <Minus />,
  defaultProps: {
    componentProps: {
      tabs: [
        { id: 'tab_1', key: 'tab_1', title: '标签页一' },
        { id: 'tab_2', key: 'tab_2', title: '标签页二' },
      ],
    },
  },
}