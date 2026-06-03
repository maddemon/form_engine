import type { ComponentPalette } from '../../types/palette'
import { Circle } from '../icons'

export const palette: ComponentPalette = {
  label: '警告提示',
  category: 'display',
  icon: <Circle />,
  defaultProps: {
    componentProps: {
      type: 'info',
      content: '提示内容',
      showIcon: true,
      closable: false,
    },
  },
}
