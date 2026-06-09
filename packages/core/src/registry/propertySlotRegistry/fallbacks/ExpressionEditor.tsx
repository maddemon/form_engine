/**
 * FallbackExpressionEditor
 *
 * 表达式编辑器的核心兜底实现：纯 textarea + 占位提示。
 */

import React from 'react'
import { useLocale } from '../../../locale'
import type { PropertySlotProps } from '../../../types/property-slot'
import { FALLBACK_TEXTAREA_STYLE } from './shared'

const FallbackExpressionEditor: React.FC<PropertySlotProps> = ({ value, onChange }) => {
  const { locale } = useLocale()
  return (
    <textarea
      value={typeof value === 'string' ? value : ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={locale.designer.propertyPanel.expressionPlaceholder}
      rows={2}
      style={FALLBACK_TEXTAREA_STYLE}
    />
  )
}

export default FallbackExpressionEditor
