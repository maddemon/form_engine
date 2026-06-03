import type { ComponentPalette } from '../../types/palette'
import { GitBranch } from '../icons'

const DEFAULT_OPTIONS = [
  {
    label: '选项一',
    value: 'option1',
    children: [
      { label: '子选项1-1', value: 'option1-1' },
      { label: '子选项1-2', value: 'option1-2' },
    ],
  },
  {
    label: '选项二',
    value: 'option2',
    children: [
      { label: '子选项2-1', value: 'option2-1' },
    ],
  },
  { label: '选项三', value: 'option3' },
]

export const palette: ComponentPalette = {
  label: '级联选择',
  category: 'form',
  icon: <GitBranch />,
  defaultProps: { componentProps: { options: DEFAULT_OPTIONS } },
}