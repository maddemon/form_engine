/**
 * FallbackDataSourceEditor
 *
 * 数据源编辑器的核心兜底实现：JSON textarea（最简版，无静态/远程 tab 切换）。
 */

import React from 'react'
import type { PropertySlotProps } from '../../../types/property-slot'
import { FALLBACK_TEXTAREA_STYLE } from './shared'

const FallbackDataSourceEditor: React.FC<PropertySlotProps> = ({ value, onChange }) => (
  <textarea
    value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
    onChange={(e) => {
      try {
        onChange(JSON.parse(e.target.value))
      } catch {
        onChange(e.target.value)
      }
    }}
    placeholder="数据源配置（JSON）"
    rows={4}
    style={FALLBACK_TEXTAREA_STYLE}
  />
)

export default FallbackDataSourceEditor
