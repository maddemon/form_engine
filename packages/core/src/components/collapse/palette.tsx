import type { ComponentPalette } from '../../types/palette'
import { FolderOpen } from '../icons'
export const palette: ComponentPalette = {
  label: '折叠面板',
  category: 'container',
  icon: <FolderOpen />,
  defaultProps: {
    children: [
      { name: 'panel_1', type: 'collapse', label: '面板一' },
      { name: 'panel_2', type: 'collapse', label: '面板二' },
    ],
  },
}