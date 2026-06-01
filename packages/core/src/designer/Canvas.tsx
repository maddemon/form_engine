import React, { useMemo, useState } from 'react'
import type { FormFieldSchema } from '../types/schema'
import type { SelectedFieldId, DesignerAction, PaletteItem } from '../types/designer'
import { createFieldFromPalette } from './FieldList'
import { FieldRenderer } from '../renderer/FieldRenderer'
import defaultAdapter from '../renderer/defaultAdapter'
import type { DeviceScene } from '../registry/componentRegistry'
import { CanvasToolbar } from './CanvasToolbar'
import { ComponentTree } from './ComponentTree'
import { isContainerComponent } from '../types/component-category'

interface CanvasProps {
  fields: FormFieldSchema[]
  selectedFieldId: SelectedFieldId
  dispatch: React.Dispatch<DesignerAction>
  onSelectField: (id: string | null) => void
  scene?: DeviceScene
  onSceneChange?: (scene: DeviceScene) => void
  canUndo?: boolean
  canRedo?: boolean
}

function buildTreeData(fields: FormFieldSchema[]): { id: string; label: string; type: string; children?: any[] }[] {
  return fields.map(f => ({
    id: f.id!,
    label: f.label || f.type,
    type: f.type,
    ...(f.children?.length ? { children: buildTreeData(f.children) } : {}),
  }))
}

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

function renderFieldItem(
  field: FormFieldSchema,
  isSelected: boolean,
  onSelectField: (id: string | null) => void,
  content: React.ReactNode,
  withDragHandlers: boolean,
  dispatch: React.Dispatch<DesignerAction>,
  dragHandlers?: { onDragStart: (e: React.DragEvent) => void; onDrop: (e: React.DragEvent) => void },
) {
  const isContainer = isContainerComponent(field.type)

  const getBorder = () => {
    if (isSelected) return '2px solid #1890ff'
    if (isContainer) return '1px dashed #d9d9d9'
    return '2px solid transparent'
  }

  const toolbarStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 30,
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    background: '#1890ff',
    borderRadius: '0 4px 0 4px',
    padding: '2px 6px',
    lineHeight: 1,
  }

  const iconStyle: React.CSSProperties = {
    color: '#fff',
    fontSize: 12,
    cursor: 'pointer',
    padding: '2px 3px',
    userSelect: 'none',
  }

  return (
    <div
      onDragOver={withDragHandlers ? (e: React.DragEvent) => e.preventDefault() : undefined}
      onDrop={dragHandlers?.onDrop}
      onClick={(e) => { if (!isSelected) { e.stopPropagation(); onSelectField(field.id || null) } }}
      style={{
        position: 'relative',
        padding: '8px',
        marginBottom: 8,
        border: getBorder(),
        borderRadius: 6,
        background: isSelected ? '#e6f4ff' : 'transparent',
        transition: 'border-color 0.2s',
        cursor: 'pointer',
      }}
    >
      {isSelected && (
        <div style={toolbarStyle}>
          <span
            draggable={!!dragHandlers}
            onDragStart={dragHandlers?.onDragStart}
            style={{ ...iconStyle, cursor: 'grab', whiteSpace: 'nowrap' }}
            title="拖拽排序"
            onMouseDown={e => e.stopPropagation()}
          >
            ↕ {fieldTypeLabels[field.type] || field.type}
          </span>
          <span
            style={iconStyle}
            title="复制"
            onClick={e => { e.stopPropagation(); dispatch({ type: 'COPY_FIELD', fieldId: field.id! }) }}
          >
            复制
          </span>
          <span
            style={iconStyle}
            title="删除"
            onClick={e => { e.stopPropagation(); dispatch({ type: 'REMOVE_FIELD', fieldId: field.id! }) }}
          >
            🗑
          </span>
        </div>
      )}

      <div style={{ pointerEvents: isContainer ? 'auto' : 'none' }}>
        {content}
      </div>
    </div>
  )
}

function renderContainerContent(
  field: FormFieldSchema,
  selectedFieldId: SelectedFieldId,
  dispatch: React.Dispatch<DesignerAction>,
  onSelectField: (id: string | null) => void,
  handleDropOnContainer: (e: React.DragEvent, parentId: string) => void,
  scene?: DeviceScene,
): React.ReactNode[] | null {
  if (!field.children?.length) return null
  return field.children.map((child, childIndex) =>
    renderNestedField(child, selectedFieldId, dispatch, onSelectField, handleDropOnContainer, scene, field.id, childIndex),
  )
}

function renderContainerPreview(
  field: FormFieldSchema,
  selectedFieldId: SelectedFieldId,
  dispatch: React.Dispatch<DesignerAction>,
  onSelectField: (id: string | null) => void,
  handleDropOnContainer: (e: React.DragEvent, parentId: string) => void,
  scene?: DeviceScene,
) {
  const childElements = renderContainerContent(field, selectedFieldId, dispatch, onSelectField, handleDropOnContainer, scene)

  const compProps = field.componentProps as Record<string, unknown> | undefined
  const gap = Number(compProps?.gap) || 8
  const childCount = field.children?.length || 0
  const isMobile = scene === 'mobile'

  const isGrid = field.type === 'grid'
  const isFlex = field.type === 'flex'
  const columns = Number(compProps?.columns) || 24
  const eachSpan = isMobile || childCount === 0 ? columns : Math.floor(columns / childCount)
  const childWidthPct = (eachSpan / columns) * 100
  const childWidth = childCount > 1
    ? `calc(${childWidthPct}% - ${gap * (childCount - 1) / childCount}px)`
    : `${childWidthPct}%`

  const containerStyle: React.CSSProperties = {
    minHeight: 60,
    position: 'relative',
    border: '1px dashed #d9d9d9',
    borderRadius: 4,
    background: '#fafafa',
    padding: 8,
    gap: `${gap}px`,
  }

  if (isGrid) {
    containerStyle.display = 'flex'
    containerStyle.flexWrap = 'wrap'
  } else if (isFlex) {
    containerStyle.display = 'flex'
    containerStyle.flexWrap = (compProps?.wrap as string) === 'wrap' ? 'wrap' : 'nowrap'
    containerStyle.flexDirection = (compProps?.direction as React.CSSProperties['flexDirection']) || 'row'
  } else {
    containerStyle.display = 'flex'
    containerStyle.flexDirection = 'column'
  }

  return (
    <div
      style={containerStyle}
      onDragOver={e => { e.preventDefault(); e.stopPropagation(); e.currentTarget.style.borderColor = '#1890ff'; e.currentTarget.style.background = '#f0f5ff' }}
      onDragLeave={e => { e.currentTarget.style.borderColor = '#d9d9d9'; e.currentTarget.style.background = '#fafafa' }}
      onDrop={e => { e.currentTarget.style.borderColor = '#d9d9d9'; e.currentTarget.style.background = '#fafafa'; handleDropOnContainer(e, field.id!) }}
    >
      {childElements ? (
        childElements.map((child, i) => (
          <div key={i} style={{ width: isGrid ? childWidth : undefined, minWidth: 0 }}>
            {child}
          </div>
        ))
      ) : (
        <div style={{ fontSize: 12, color: '#bbb', textAlign: 'center', padding: 16, userSelect: 'none', width: '100%' }}>
          拖入组件到此容器
        </div>
      )}
    </div>
  )
}

function renderNestedField(
  field: FormFieldSchema,
  selectedFieldId: SelectedFieldId,
  dispatch: React.Dispatch<DesignerAction>,
  onSelectField: (id: string | null) => void,
  handleDropOnContainer: (e: React.DragEvent, parentId: string) => void,
  scene?: DeviceScene,
  parentContainerId?: string,
  childIndex?: number,
) {
  const isContainer = isContainerComponent(field.type)
  const content = isContainer
    ? renderContainerPreview(field, selectedFieldId, dispatch, onSelectField, handleDropOnContainer, scene)
    : <FieldRenderer field={field} value={undefined} onChange={() => {}} options={[]} disabled={false} adapter={defaultAdapter} />

  const dragHandlers = parentContainerId !== undefined && childIndex !== undefined
    ? {
        onDragStart: (e: React.DragEvent) => {
          e.dataTransfer.setData('designer-drag', JSON.stringify({
            source: 'canvas',
            index: childIndex,
            fieldId: field.id,
            fromParentId: parentContainerId,
          }))
        },
        onDrop: (e: React.DragEvent) => {
          e.preventDefault()
          const raw = e.dataTransfer.getData('designer-drag')
          if (!raw) return
          try {
            const data = JSON.parse(raw)
            if (data.source === 'canvas' && data.fromParentId) {
              if (data.fieldId === parentContainerId) return
              dispatch({
                type: 'MOVE_FIELD',
                fromIndex: data.index,
                toIndex: 0,
                fromParentId: data.fromParentId,
                toParentId: parentContainerId,
              })
            }
          } catch { /* ignore */ }
        },
      }
    : undefined

  return renderFieldItem(field, selectedFieldId === field.id, onSelectField, content, !!dragHandlers, dispatch, dragHandlers)
}

function renderRootFields(
  fields: FormFieldSchema[],
  selectedFieldId: SelectedFieldId,
  dispatch: React.Dispatch<DesignerAction>,
  onSelectField: (id: string | null) => void,
  handleDragStart: (e: React.DragEvent, index: number, field: FormFieldSchema) => void,
  handleDrop: (e: React.DragEvent, index: number) => void,
  handleDropOnContainer: (e: React.DragEvent, parentId: string) => void,
  scene?: DeviceScene,
) {
  return fields.map((field, index) => {
    const isSelected = selectedFieldId === field.id
    const isContainer = isContainerComponent(field.type)
    const dragHandlers = {
      onDragStart: (e: React.DragEvent) => handleDragStart(e, index, field),
      onDrop: (e: React.DragEvent) => handleDrop(e, index),
    }

    if (isContainer) {
      const preview = renderContainerPreview(field, selectedFieldId, dispatch, onSelectField, handleDropOnContainer, scene)
      return renderFieldItem(field, isSelected, onSelectField, preview, true, dispatch, dragHandlers)
    }

    const content = (
      <FieldRenderer field={field} value={undefined} onChange={() => {}} options={[]} disabled={false} adapter={defaultAdapter} />
    )

    return renderFieldItem(field, isSelected, onSelectField, content, true, dispatch, dragHandlers)
  })
}

export const Canvas: React.FC<CanvasProps> = ({
  fields,
  selectedFieldId,
  dispatch,
  onSelectField,
  scene = 'desktop',
  onSceneChange,
  canUndo = false,
  canRedo = false,
}) => {
  const [showTree, setShowTree] = useState(false)

  const treeData = useMemo(() => buildTreeData(fields), [fields])

  const canvasWidth = scene === 'mobile' ? 375 : '100%'

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDropOnContainer = (e: React.DragEvent, parentId: string) => {
    e.preventDefault()
    e.stopPropagation()
    const raw = e.dataTransfer.getData('designer-drag')
    if (!raw) return

    try {
      const data = JSON.parse(raw)
      if (data.source === 'palette') {
        const newField = createFieldFromPalette(
          { type: data.fieldType, label: data.label, defaultProps: data.defaultProps } as PaletteItem,
        )
        dispatch({ type: 'ADD_FIELD', field: newField, index: 0, parentId })
      } else if (data.source === 'canvas') {
        if (data.fieldId === parentId) return
        dispatch({
          type: 'MOVE_FIELD',
          fromIndex: data.index,
          toIndex: 0,
          fromParentId: data.fromParentId,
          toParentId: parentId,
        })
      }
    } catch {
      // ignore
    }
  }

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    e.stopPropagation()
    const raw = e.dataTransfer.getData('designer-drag')
    if (!raw) return

    try {
      const data = JSON.parse(raw)
      if (data.source === 'palette') {
        const newField = createFieldFromPalette(
          { type: data.fieldType, label: data.label, defaultProps: data.defaultProps } as PaletteItem,
        )
        dispatch({ type: 'ADD_FIELD', field: newField, index: targetIndex })
      } else if (data.source === 'canvas') {
        dispatch({ type: 'MOVE_FIELD', fromIndex: data.index, toIndex: targetIndex, fromParentId: data.fromParentId })
      }
    } catch (e) {
      console.warn('[Canvas] drop error:', e)
    }
  }

  const handleDragStart = (e: React.DragEvent, index: number, field: FormFieldSchema) => {
    e.dataTransfer.setData('designer-drag', JSON.stringify({
      source: 'canvas',
      index,
      fieldId: field.id,
    }))
  }

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,
      position: 'relative',
      height: '100%',
      overflow: 'hidden',
    }}>
      <CanvasToolbar
        scene={scene}
        onSceneChange={onSceneChange}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={() => dispatch({ type: 'UNDO' })}
        onRedo={() => dispatch({ type: 'REDO' })}
        onTreeClick={() => setShowTree(!showTree)}
        showTree={showTree}
      />

      {showTree && (
        <ComponentTree
          items={treeData}
          selectedId={selectedFieldId}
          onSelect={(id) => onSelectField(id)}
          onClose={() => setShowTree(false)}
        />
      )}

      <div
        style={{
          flex: 1,
          padding: 16,
          display: 'flex',
          justifyContent: scene === 'mobile' ? 'center' : 'flex-start',
          alignItems: 'flex-start',
          background: '#f5f5f5',
          minHeight: 0,
          overflow: 'auto',
        }}
        onDragOver={handleDragOver}
        onDrop={(e) => { e.stopPropagation(); handleDrop(e, fields.length) }}
      >
        <div
          onClick={() => onSelectField(null)}
          style={{
            width: canvasWidth,
            maxWidth: '100%',
            background: '#fff',
            borderRadius: 8,
            padding: 16,
            boxShadow: scene === 'mobile' ? '0 2px 12px rgba(0,0,0,0.08)' : 'none',
            minHeight: 300,
          }}
        >
          {fields.length === 0 && (
            <div style={{ color: '#999', fontSize: 12, padding: 24, textAlign: 'center', border: '1px dashed #ddd', borderRadius: 4 }}>
              从左侧拖拽控件到此处
            </div>
          )}

          {renderRootFields(fields, selectedFieldId, dispatch, onSelectField, handleDragStart, handleDrop, handleDropOnContainer, scene)}
        </div>
      </div>
    </div>
  )
}
