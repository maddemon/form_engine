import React from 'react'
import { createIcon } from './createIcon'

// ── 布局相关图标 ─────────────────────────────────

export const GridIcon = createIcon(
  <>
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </>,
)

export const Columns = createIcon(
  <>
    <path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7m0-18H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7m0-18v18" />
  </>,
)

export const Layout = createIcon(
  <>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="9" y1="21" x2="9" y2="9" />
  </>,
)

export const FlexIcon = createIcon(
  <>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="9" y1="3" x2="9" y2="21" />
  </>,
)

export const CardIcon = createIcon(
  <>
    <rect x="2" y="3" width="20" height="18" rx="3" />
    <line x1="2" y1="9" x2="22" y2="9" />
  </>,
)

export const TabIcon = createIcon(
  <>
    <rect x="3" y="9" width="18" height="12" rx="1.5" />
    <rect x="6" y="5" width="5" height="4" rx="1" />
    <rect x="12" y="5" width="5" height="4" rx="1" />
  </>,
)

export const SegmentIcon = createIcon(
  <>
    <rect x="2" y="6" width="20" height="12" rx="3" />
    <line x1="10" y1="6" x2="10" y2="18" />
    <line x1="16" y1="6" x2="16" y2="18" />
  </>,
)

export const SubFormIcon = createIcon(
  <>
    <path d="M3 3h18v18H3z" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="3" y1="15" x2="21" y2="15" />
    <line x1="9" y1="3" x2="9" y2="21" />
    <line x1="15" y1="3" x2="15" y2="21" />
  </>,
)