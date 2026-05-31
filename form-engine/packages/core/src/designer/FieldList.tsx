import React from 'react'
import type { FormFieldSchema, FieldType } from '../../types/schema'
import type { PaletteItem } from '../../types/designer'

// 从统一的图标文件导入
import { Type, FileText, Hash, Lock, ChevronDown, CheckSquare, Circle, ToggleLeft, Slash, Star, Calendar, Clock, UploadIcon, GitBranch, GridIcon } from '../components/icons'

// 组件类型到图标的映射
const iconMap: Record<string, React.ReactNode> = {
  'input': <Type />,
  'textarea': <FileText />,
  'input-number': <Hash />,
  'password': <Lock />,
  'select': <ChevronDown />,
  'multi-select': <CheckSquare />,
  'radio': <Circle />,
  'checkbox': <CheckSquare />,
  'switch': <ToggleLeft />,
  'slider': <Slash />,
  'rate': <Star />,
  'date': <Calendar />,
  'datetime': <Calendar />,
  'date-range': <Calendar />,
  'time': <Clock />,
  'upload': <UploadIcon />,
  'cascader': <GitBranch />,
  'tree-select': <GridIcon />,
}

/**
 * 控件分组
 */
export interface PaletteGroup {
  groupName: string
  items: PaletteItem[]
}

/**
 * 默认控件库（分组）
 */
export const defaultPaletteGroups: PaletteGroup[] = [
  {
    groupName: '文本输入',
    items: [
      { type: 'input', label: '单行文本', defaultProps: { placeholder: '请输入' } },
      { type: 'textarea', label: '多行文本', defaultProps: { placeholder: '请输入' } },
      { type: 'password', label: '密码', defaultProps: {} },
    ],
  },
  {
    groupName: '数值',
    items: [
      { type: 'input-number', label: '数字', defaultProps: {} },
      { type: 'slider', label: '滑块', defaultProps: {} },
      { type: 'rate', label: '评分', defaultProps: {} },
    ],
  },
  {
    groupName: '选择',
    items: [
      { type: 'select', label: '下拉', defaultProps: {} },
      { type: 'multi-select', label: '多选', defaultProps: { componentProps: { mode: 'multiple' } } },
      { type: 'radio', label: '单选', defaultProps: {} },
      { type: 'checkbox', label: '多选框', defaultProps: {} },
      { type: 'switch', label: '开关', defaultProps: { defaultValue: false } },
      { type: 'cascader', label: '级联', defaultProps: {} },
      { type: 'tree-select', label: '树选择', defaultProps: {} },
    ],
  },
  {
    groupName: '日期时间',
    items: [
      { type: 'date', label: '日期', defaultProps: {} },
      { type: 'datetime', label: '日期时间', defaultProps: { componentProps: { showTime: true } } },
      { type: 'date-range', label: '日期范围', defaultProps: {} },
      { type: 'time', label: '时间', defaultProps: {} },
    ],
  },
  {
    groupName: '其他',
    items: [
      { type: 'upload', label: '上传', defaultProps: {} },
    ],
  },
]

/**
 * 生成字段 id
 */
let _counter = 0
export function generateFieldId(type: FieldType): string {
  _counter++
  return `field_${type}_${Date.now()}_${_counter}`
}

/**
 * 根据 PaletteItem 生成默认 FormFieldSchema
 */
export function createFieldFromPalette(item: PaletteItem): FormFieldSchema {
  // 根据类型生成字段名，格式：类型_随机数
  const randomSuffix = Math.random().toString(36).substring(2, 8)
  const fieldName = `${item.type}_${randomSuffix}`
  
  return {
    id: generateFieldId(item.type),
    name: fieldName,
    type: item.type,
    label: item.label,
    ...(item.defaultProps || {}),
  }
}

interface FieldListProps {
  groups?: PaletteGroup[]
  onDragStart: (item: PaletteItem, event: React.DragEvent) => void
}

/**
 * 左侧控件库面板（分组网格布局）
 */
export const FieldList: React.FC<FieldListProps> = ({ groups = defaultPaletteGroups, onDragStart }) => {
  return (
    <div style={{
      width: 220,
      borderRight: '1px solid #eee',
      padding: '8px 10px',
      overflow: 'auto',
      height: '100%',
      background: '#fafafa',
    }}>
      {groups.map(group => (
        <div key={group.groupName} style={{ marginBottom: 12 }}>
          <div style={{
            fontSize: 11,
            color: '#999',
            fontWeight: 500,
            padding: '4px 4px 6px',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}>
            {group.groupName}
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 6,
          }}>
            {group.items.map(item => (
              <div
                key={item.type}
                draggable
                onDragStart={(e) => onDragStart(item, e)}
                title={item.label}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px 4px',
                  border: '1px solid #eee',
                  borderRadius: 6,
                  cursor: 'grab',
                  fontSize: 11,
                  color: '#595959',
                  background: '#fff',
                  userSelect: 'none',
                  transition: 'all 0.2s',
                  gap: 4,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#e6f4ff'
                  e.currentTarget.style.borderColor = '#91caff'
                  e.currentTarget.style.color = '#1677ff'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#fff'
                  e.currentTarget.style.borderColor = '#eee'
                  e.currentTarget.style.color = '#595959'
                }}
              >
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 20,
                  height: 20,
                }}>
                  {iconMap[item.type]}
                </span>
                <span style={{ lineHeight: 1.2, textAlign: 'center' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
