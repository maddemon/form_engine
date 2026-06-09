import React from 'react'

/**
 * 表单字段类型对应的图标
 * 使用 Feather Icons 风格的 SVG 图标
 * 零依赖，可直接复用
 */

// 图标属性类型
interface IconProps {
  size?: number
  color?: string
  strokeWidth?: number
}

// 创建图标组件的工厂函数
function createIcon(path: React.ReactNode, viewBox: string = '0 0 24 24') {
  return ({ size = 16, color = 'currentColor', strokeWidth = 2 }: IconProps = {}) => (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {path}
    </svg>
  )
}

// 所有图标定义
export const Type = createIcon(
  <>
    <polyline points="4 7 4 4 20 4 20 7" />
    <line x1="9" y1="20" x2="15" y2="20" />
    <line x1="12" y1="4" x2="12" y2="20" />
  </>,
  '0 0 24 24',
)

export const FileText = createIcon(
  <>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </>,
  '0 0 24 24',
)

export const Hash = createIcon(
  <>
    <line x1="4" y1="9" x2="20" y2="9" />
    <line x1="4" y1="15" x2="20" y2="15" />
    <line x1="10" y1="3" x2="8" y2="21" />
    <line x1="16" y1="3" x2="14" y2="21" />
  </>,
  '0 0 24 24',
)

export const Lock = createIcon(
  <>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </>,
  '0 0 24 24',
)

export const ChevronDown = createIcon(<polyline points="6 9 12 15 18 9" />, '0 0 24 24')

export const CheckSquare = createIcon(
  <>
    <polyline points="9 11 12 14 22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </>,
  '0 0 24 24',
)

export const Circle = createIcon(<circle cx="12" cy="12" r="10" />, '0 0 24 24')

export const ToggleLeft = createIcon(
  <>
    <rect x="1" y="5" width="22" height="14" rx="7" ry="7" />
    <circle cx="8" cy="12" r="3" />
  </>,
  '0 0 24 24',
)

export const Slash = createIcon(<line x1="5" y1="12" x2="19" y2="12" />, '0 0 24 24')

export const Star = createIcon(
  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />,
  '0 0 24 24',
)

export const Calendar = createIcon(
  <>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </>,
  '0 0 24 24',
)

export const Clock = createIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </>,
  '0 0 24 24',
)

export const UploadIcon = createIcon(
  <>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </>,
  '0 0 24 24',
)

export const GitBranch = createIcon(
  <>
    <line x1="6" y1="3" x2="6" y2="15" />
    <circle cx="18" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <path d="M18 9a9 9 0 0 1-9 9" />
  </>,
  '0 0 24 24',
)

export const GridIcon = createIcon(
  <>
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </>,
  '0 0 24 24',
)

export const Monitor = createIcon(
  <>
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </>,
  '0 0 24 24',
)

export const Smartphone = createIcon(
  <>
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
    <line x1="12" y1="18" x2="12.01" y2="18" />
  </>,
  '0 0 24 24',
)

// 新增图标：布局 & 展示组件
export const Columns = createIcon(
  <>
    <path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7m0-18H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7m0-18v18" />
  </>,
  '0 0 24 24',
)

export const Layout = createIcon(
  <>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="9" y1="21" x2="9" y2="9" />
  </>,
  '0 0 24 24',
)

export const Square = createIcon(
  <>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
  </>,
  '0 0 24 24',
)

export const Minus = createIcon(<line x1="5" y1="12" x2="19" y2="12" />, '0 0 24 24')

export const FolderOpen = createIcon(
  <>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </>,
  '0 0 24 24',
)

export const ImageIcon = createIcon(
  <>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </>,
  '0 0 24 24',
)

export const Bold = createIcon(
  <>
    <path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
    <path d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
  </>,
  '0 0 24 24',
)

export const Edit = createIcon(
  <>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </>,
  '0 0 24 24',
)

export const AlignLeft = createIcon(
  <>
    <line x1="17" y1="10" x2="3" y2="10" />
    <line x1="21" y1="6" x2="3" y2="6" />
    <line x1="17" y1="14" x2="3" y2="14" />
    <line x1="21" y1="18" x2="3" y2="18" />
  </>,
  '0 0 24 24',
)

export const Sliders = createIcon(
  <>
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <circle cx="4" cy="12" r="2" />
    <circle cx="12" cy="10" r="2" />
    <circle cx="20" cy="14" r="2" />
  </>,
  '0 0 24 24',
)

export const CircleDot = createIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4" fill="currentColor" />
  </>,
  '0 0 24 24',
)

export const Tags = createIcon(
  <>
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </>,
  '0 0 24 24',
)

export const EyeIcon = createIcon(
  <>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </>,
  '0 0 24 24',
)

export const EyeOffIcon = createIcon(
  <>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </>,
  '0 0 24 24',
)

// 创建填充风格图标组件的工厂函数（fill 而非 stroke）
function createFilledIcon(path: React.ReactNode, viewBox: string = '0 0 24 24') {
  return ({ size = 16, color = 'currentColor' }: IconProps = {}) => (
    <svg width={size} height={size} viewBox={viewBox} fill={color}>
      {path}
    </svg>
  )
}

// 新增图标：子表单
export const SubFormIcon = createIcon(
  <>
    <path d="M3 3h18v18H3z" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="3" y1="15" x2="21" y2="15" />
    <line x1="9" y1="3" x2="9" y2="21" />
    <line x1="15" y1="3" x2="15" y2="21" />
  </>,
  '0 0 24 24',
)

// 新增图标：设计器操作
export const Copy = createIcon(
  <>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </>,
  '0 0 24 24',
)

export const Trash = createIcon(
  <>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </>,
  '0 0 24 24',
)

export const Grip = createFilledIcon(
  <>
    <circle cx="12" cy="4" r="2" />
    <circle cx="12" cy="20" r="2" />
    <circle cx="4" cy="12" r="2" />
    <circle cx="20" cy="12" r="2" />
  </>,
  '0 0 24 24',
)

export const NumberOutlined = createIcon(
  <>
    <line x1="4" y1="9" x2="20" y2="9" />
    <line x1="4" y1="15" x2="20" y2="15" />
    <line x1="10" y1="3" x2="8" y2="21" />
    <line x1="16" y1="3" x2="14" y2="21" />
  </>,
  '0 0 24 24',
)

export const GitFork = createIcon(
  <>
    <circle cx="12" cy="18" r="3" />
    <circle cx="6" cy="6" r="3" />
    <circle cx="18" cy="6" r="3" />
    <path d="M18 9a6 6 0 0 1-6 6 6 6 0 0 1-6-6" />
  </>,
  '0 0 24 24',
)

export const Heading = createIcon(
  <>
    <polyline points="4 7 4 4 20 4 20 7" />
    <line x1="9" y1="20" x2="15" y2="20" />
    <line x1="12" y1="4" x2="12" y2="20" />
  </>,
  '0 0 24 24',
)

export const FolderInput = createIcon(
  <>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    <polyline points="12 11 12 17" />
    <line x1="9" y1="14" x2="12" y2="17" />
    <line x1="15" y1="14" x2="12" y2="17" />
  </>,
  '0 0 24 24',
)

export const LetterA = createIcon(
  <>
    <path d="M12 2L3 22" />
    <path d="M12 2L21 22" />
    <line x1="6" y1="16" x2="18" y2="16" />
  </>,
  '0 0 24 24',
)

export const TabIcon = createIcon(
  <>
    <rect x="3" y="9" width="18" height="12" rx="1.5" />
    <rect x="6" y="5" width="5" height="4" rx="1" />
    <rect x="12" y="5" width="5" height="4" rx="1" />
  </>,
  '0 0 24 24',
)

export const SegmentIcon = createIcon(
  <>
    <rect x="2" y="6" width="20" height="12" rx="3" />
    <line x1="10" y1="6" x2="10" y2="18" />
    <line x1="16" y1="6" x2="16" y2="18" />
  </>,
  '0 0 24 24',
)

export const CollapseIcon = createIcon(
  <>
    <line x1="9" y1="6" x2="21" y2="6" />
    <polyline points="5 4 8 6 5 8" />
    <line x1="9" y1="12" x2="21" y2="12" />
    <polyline points="5 10 8 12 5 14" />
    <line x1="9" y1="18" x2="21" y2="18" />
    <polyline points="5 16 8 18 5 20" />
  </>,
  '0 0 24 24',
)

export const DateRangeIcon = createIcon(
  <>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <circle cx="9" cy="16" r="1.5" fill="currentColor" />
    <circle cx="15" cy="16" r="1.5" fill="currentColor" />
    <line x1="11" y1="16" x2="13" y2="16" />
  </>,
  '0 0 24 24',
)

export const DateTimeIcon = createIcon(
  <>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <circle cx="12" cy="16" r="3.5" />
    <line x1="12" y1="16" x2="12" y2="13.5" strokeWidth="1.5" />
    <line x1="12" y1="16" x2="14" y2="16.5" strokeWidth="1" />
  </>,
  '0 0 24 24',
)

export const AlertIcon = createIcon(
  <>
    <path d="M12 2L2 22h20L12 2z" />
    <line x1="12" y1="9" x2="12" y2="14" />
    <line x1="12" y1="18" x2="12.01" y2="18" />
  </>,
  '0 0 24 24',
)

export const FlexIcon = createIcon(
  <>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="9" y1="3" x2="9" y2="21" />
  </>,
  '0 0 24 24',
)

export const CardIcon = createIcon(
  <>
    <rect x="2" y="3" width="20" height="18" rx="3" />
    <line x1="2" y1="9" x2="22" y2="9" />
  </>,
  '0 0 24 24',
)

export const CodeIcon = createIcon(
  <>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </>,
  '0 0 24 24',
)

// 图标名称到组件的映射（用于动态获取图标）
export const iconMap: Record<string, React.FC<IconProps>> = {
  Type,
  FileText,
  Hash,
  Lock,
  ChevronDown,
  CheckSquare,
  Circle,
  ToggleLeft,
  Slash,
  Star,
  Calendar,
  Clock,
  Upload: UploadIcon,
  GitBranch,
  Grid: GridIcon,
  Monitor,
  Smartphone,
  Table: SubFormIcon,
  Layout,
  Columns,
  Square,
  Minus,
  FolderOpen,
  Image: ImageIcon,
  Bold,
  Edit,
  AlignLeft,
  Sliders,
  CircleDot,
  Tags,
  NumberOutlined,
  GitFork,
  Heading,
  FolderInput,
  LetterA,
  TabIcon,
  SegmentIcon,
  AlertIcon,
  CollapseIcon,
  DateRangeIcon,
  DateTimeIcon,
  FlexIcon,
  CardIcon,
  Code: CodeIcon,
  Copy,
  Trash,
  Grip,
}

export default iconMap
