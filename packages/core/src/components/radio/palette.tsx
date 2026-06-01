import type { ComponentPalette } from '../../types/palette'
import { Circle } from '../icons'
export const palette: ComponentPalette = {
  label: '单选',
  category: 'form',
  icon: <Circle />,
  defaultProps: {
    dataSource: {
      type: 'static',
      static: {
        options: [
          { label: '选项一', value: 'option1' },
          { label: '选项二', value: 'option2' },
          { label: '选项三', value: 'option3' },
        ],
      },
    },
  },
}