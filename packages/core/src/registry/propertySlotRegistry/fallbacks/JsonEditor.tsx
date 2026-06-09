/**
 * FallbackJsonEditor
 *
 * JSON 编辑器的核心兜底实现：textarea + JSON 格式化/校验（解析失败时回退为字符串）。
 */

import React from 'react'
import { useLocale } from '../../../locale'
import type { PropertySlotProps } from '../../../types/property-slot'
import { FALLBACK_TEXTAREA_STYLE } from './shared'

const FallbackJsonEditor: React.FC<PropertySlotProps> = ({ value, onChange }) => {
  const { locale } = useLocale()
  return (
    <textarea
      value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
      onChange={(e) => {
        try {
          onChange(JSON.parse(e.target.value))
        } catch {
          onChange(e.target.value)
        }
      }}
      placeholder={locale.designer.propertyPanel.jsonPlaceholder}
      rows={4}
      style={FALLBACK_TEXTAREA_STYLE}
    />
  )
}

export default FallbackJsonEditor
