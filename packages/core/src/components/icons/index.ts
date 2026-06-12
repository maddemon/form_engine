/**
 * 表单字段类型对应的图标
 * 使用 Feather Icons 风格的 SVG 图标
 * 零依赖，可直接复用
 */

export type { IconProps } from './createIcon'
export { createIcon, createFilledIcon } from './createIcon'

// ── 按功能分组导出所有图标 ──
export * from './Basic'
export * from './Layout'
export * from './Form'
export * from './Editor'

// ── 图标名称到组件的映射（用于动态获取图标） ──
import { Lock, ChevronDown, Clock, Slash, Minus, Square, FolderOpen, FolderInput, ImageIcon, Edit, Tags, EyeIcon, EyeOffIcon, GitBranch, GitFork, NumberOutlined, CollapseIcon, AlertIcon, CodeIcon, Star, Circle, Grip, Copy, Trash, Monitor, Smartphone, Type, FileText, Hash, Heading, LetterA, CircleDot } from './Basic'
import { GridIcon, Columns, Layout, FlexIcon, CardIcon, TabIcon, SegmentIcon, SubFormIcon } from './Layout'
import { CheckSquare, ToggleLeft, Calendar, UploadIcon, Sliders, DateRangeIcon, DateTimeIcon } from './Form'
import { Bold, AlignLeft } from './Editor'
import type { IconProps } from './createIcon'
import React from 'react'

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