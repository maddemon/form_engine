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
  <><polyline points="4 7 4 4 20 4 20 7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" /></>,
  '0 0 24 24'
)

export const FileText = createIcon(
  <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></>,
  '0 0 24 24'
)

export const Hash = createIcon(
  <><line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /><line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" /></>,
  '0 0 24 24'
)

export const Lock = createIcon(
  <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>,
  '0 0 24 24'
)

export const ChevronDown = createIcon(
  <polyline points="6 9 12 15 18 9" />,
  '0 0 24 24'
)

export const CheckSquare = createIcon(
  <><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></>,
  '0 0 24 24'
)

export const Circle = createIcon(
  <circle cx="12" cy="12" r="10" />,
  '0 0 24 24'
)

export const ToggleLeft = createIcon(
  <><rect x="1" y="5" width="22" height="14" rx="7" ry="7" /><circle cx="8" cy="12" r="3" /></>,
  '0 0 24 24'
)

export const Slash = createIcon(
  <line x1="5" y1="12" x2="19" y2="12" />,
  '0 0 24 24'
)

export const Star = createIcon(
  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />,
  '0 0 24 24'
)

export const Calendar = createIcon(
  <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>,
  '0 0 24 24'
)

export const Clock = createIcon(
  <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
  '0 0 24 24'
)

export const UploadIcon = createIcon(
  <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></>,
  '0 0 24 24'
)

export const GitBranch = createIcon(
  <><line x1="6" y1="3" x2="6" y2="15" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M18 9a9 9 0 0 1-9 9" /></>,
  '0 0 24 24'
)

export const GridIcon = createIcon(
  <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></>,
  '0 0 24 24'
)

export const Monitor = createIcon(
  <><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></>,
  '0 0 24 24'
)

export const Smartphone = createIcon(
  <><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></>,
  '0 0 24 24'
)

// 新增图标：布局 & 展示组件
export const Columns = createIcon(
  <><path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7m0-18H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7m0-18v18" /></>,
  '0 0 24 24'
)

export const Layout = createIcon(
  <><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></>,
  '0 0 24 24'
)

export const Square = createIcon(
  <><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /></>,
  '0 0 24 24'
)

export const Minus = createIcon(
  <line x1="5" y1="12" x2="19" y2="12" />,
  '0 0 24 24'
)

export const FolderOpen = createIcon(
  <><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></>,
  '0 0 24 24'
)

export const ImageIcon = createIcon(
  <><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></>,
  '0 0 24 24'
)

export const Bold = createIcon(
  <><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /></>,
  '0 0 24 24'
)

// 新增图标：表格
export const TableIcon = createIcon(
  <><path d="M3 3h18v18H3z" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" /></>,
  '0 0 24 24'
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
  Table: TableIcon,
}

export default iconMap
