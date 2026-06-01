import React from 'react'
import type { FormFieldSchema } from '../types'
import { isContainerComponent } from '../types/component-category'
import { useDesignerContext } from './DesignerContext'
import { colors, borders, radii, spacing, toolbar, dragHandle, iconBtn, fieldItem, fieldContent } from './styles'

const fieldTypeLabels: Record<string, string> = {
  'input': '单行文本', 'textarea': '多行文本', 'password': '密码',
  'input-number': '数字', 'slider': '滑块', 'rate': '评分',
  'select': '下拉', 'radio': '单选', 'checkbox': '多选框', 'switch': '开关',
  'date': '日期', 'datetime': '日期时间', 'date-range': '日期范围', 'time': '时间',
  'grid': '栅格布局', 'flex': '弹性布局', 'container': '容器',
  'collapse': '折叠面板', 'tabs': '标签页',
  'text': '文本展示', 'title': '标题', 'image': '图片展示', 'divider': '分割线',
  'button': '按钮', 'upload': '上传',
}

interface FieldItemProps {
  field: FormFieldSchema
  isSelected: boolean
  withDragHandlers: boolean
  onDragStart?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent) => void
  children: React.ReactNode
}

export const FieldItem: React.FC<FieldItemProps> = ({
  field,
  isSelected,
  withDragHandlers,
  onDragStart,
  onDrop,
  children,
}) => {
  const { dispatch, onSelectField } = useDesignerContext()
  const isContainer = isContainerComponent(field.type)

  const getBorder = () => {
    if (isSelected) return borders.selected
    if (isContainer) return borders.container
    return borders.transparent
  }

  return (
    <div
      onDragOver={withDragHandlers ? (e: React.DragEvent) => e.preventDefault() : undefined}
      onDrop={onDrop}
      onClick={(e) => { if (!isSelected) { e.stopPropagation(); onSelectField(field.id || null) } }}
      style={{
        ...fieldItem,
        border: getBorder(),
        background: isSelected ? colors.primaryBg : colors.transparent,
      }}
    >
      {isSelected && (
        <div style={toolbar}>
          <span
            draggable={!!onDragStart}
            onDragStart={onDragStart}
            style={dragHandle}
            title="拖拽排序"
            onMouseDown={e => e.stopPropagation()}
          >
            ↕ {fieldTypeLabels[field.type] || field.type}
          </span>
          <span
            style={iconBtn}
            title="复制"
            onClick={e => { e.stopPropagation(); dispatch({ type: 'COPY_FIELD', fieldId: field.id! }) }}
          >
            复制
          </span>
          <span
            style={iconBtn}
            title="删除"
            onClick={e => { e.stopPropagation(); dispatch({ type: 'REMOVE_FIELD', fieldId: field.id! }) }}
          >
            🗑
          </span>
        </div>
      )}

      <div style={{ pointerEvents: isContainer ? 'auto' : 'none' }}>
        {children}
      </div>
    </div>
  )
}
