import React from 'react'
import { createIcon } from './createIcon'

// ── 编辑器/富文本相关图标 ─────────────────────────

export const Bold = createIcon(
  <>
    <path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
    <path d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
  </>,
)

export const AlignLeft = createIcon(
  <>
    <line x1="17" y1="10" x2="3" y2="10" />
    <line x1="21" y1="6" x2="3" y2="6" />
    <line x1="17" y1="14" x2="3" y2="14" />
    <line x1="21" y1="18" x2="3" y2="18" />
  </>,
)