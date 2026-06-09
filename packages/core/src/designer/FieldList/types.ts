import type { FormFieldSchema } from '../../types'
import type { DesignerAction, PaletteGroup, PaletteItem, SidePanelTab } from '../../types/designer'

export interface FieldListProps {
  groups?: PaletteGroup[]
  excludeTypes?: string[]
  width?: number | string
  sidePanelTabs?: SidePanelTab[]
  fields?: FormFieldSchema[]
  selectedFieldId?: string | null
  dispatch?: React.Dispatch<DesignerAction>
}

export interface PaletteItemCardProps {
  item: PaletteItem
}

export const MIN_PALETTE_WIDTH = 160
export const COMPONENT_LIB_TAB_KEY = '__component-lib__'
