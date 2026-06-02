import type { ComponentPalette } from '../../types/palette'
import { CheckSquare } from '../icons'

const DEFAULT_OPTIONS = [
  { label: '选项一', value: 'option1' },
  { label: '选项二', value: 'option2' },
  { label: '选项三', value: 'option3' },
]

export const palette: ComponentPalette = {
  label: '多选框',
  category: 'form',
  icon: <CheckSquare />,
  defaultProps: { componentProps: { options: DEFAULT_OPTIONS } },
}