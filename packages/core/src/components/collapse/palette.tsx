import type { ComponentPalette } from '../../types/palette'
import { FolderOpen } from '../icons'
export const palette: ComponentPalette = {
  label: '折叠面板',
  category: 'container',
  icon: <FolderOpen />,
  defaultProps: {
    componentProps: {
      panels: [
        { id: 'panel_1', key: 'panel_1', header: '面板一' },
        { id: 'panel_2', key: 'panel_2', header: '面板二' },
      ],
      accordion: false,
      ghost: false,
    },
  },
}