import type { ComponentPalette } from '../../types/palette'
import { ChevronDown } from '../icons'
export const palette: ComponentPalette = {
  label: '下拉',
  category: 'form',
  icon: <ChevronDown />,
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