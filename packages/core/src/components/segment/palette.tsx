import type { ComponentPalette } from '../../types/palette'
import { ToggleLeft } from '../icons'

const DEFAULT_OPTIONS = [
  { label: '选项1', value: 'option_1' },
  { label: '选项2', value: 'option_2' },
  { label: '选项3', value: 'option_3' },
]

export const palette: ComponentPalette = {
  label: '分段控制器',
  category: 'display',
  icon: <ToggleLeft />,
  defaultProps: {
    dataSource: {
      type: 'static',
      static: { options: DEFAULT_OPTIONS },
    },
    componentProps: {
      size: 'middle',
      block: false,
    },
  },
}
