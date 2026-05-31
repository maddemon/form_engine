import React, { useMemo, useState } from 'react'
import type { FormFieldSchema, FormSchema } from '../types/schema'
import type { SelectedFieldId, DesignerAction, PaletteItem } from '../types/designer'
import { createFieldFromPalette } from './FieldList'
import { FieldRenderer } from '../renderer/FieldRenderer'
import { FormRender } from '../renderer/FormRender'
import defaultAdapter from '../renderer/defaultAdapter'
import type { DeviceScene } from '../registry/componentRegistry'

interface CanvasProps {
  fields: FormFieldSchema[]
  selectedFieldId: SelectedFieldId
  dispatch: React.Dispatch<DesignerAction>
  onSelectField: (id: string | null) => void
  /** 完整表单 schema（预览模式需要） */
  schema?: FormSchema
  /** 当前场景 */
  scene?: DeviceScene
  /** 场景切换回调 */
  onSceneChange?: (scene: DeviceScene) => void
  /** 是否可以撤销 */
  canUndo?: boolean
  /** 是否可以重做 */
  canRedo?: boolean
  /** 当前模式：design 或 preview */
  mode?: 'design' | 'preview'
  /** 模式切换回调 */
  onModeChange?: (mode: 'design' | 'preview') => void
}

/**
 * 中间画布
 * - 支持拖拽排序
 * - 直接渲染字段组件（实时预览）
 * - 浮动工具栏在正中间（包含设计/预览切换）
 * - 自己有滚动条
 */
export const Canvas: React.FC<CanvasProps> = ({
  fields,
  selectedFieldId,
  dispatch,
  onSelectField,
  schema,
  scene = 'desktop',
  onSceneChange,
  canUndo = false,
  canRedo = false,
  mode = 'design',
  onModeChange,
}) => {
  // ========== 浮动工具栏状态 ==========
  const [showTree, setShowTree] = useState(false)

  // ========== 组件树数据 ==========
  const treeData = useMemo(() =>
    fields.map(f => ({ id: f.id, label: f.label || f.type, type: f.type }))
  , [fields])

  const handleTreeClick = () => {
    setShowTree(!showTree)
  }

  const handleUndo = () => {
    dispatch({ type: 'UNDO' })
  }
  const handleRedo = () => {
    dispatch({ type: 'REDO' })
  }

  // 当前画布宽度（模拟 device）
  const canvasWidth = scene === 'mobile' ? 375 : '100%'

  // ========== 拖拽逻辑 ==========
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
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
        dispatch({ type: 'MOVE_FIELD', fromIndex: data.index, toIndex: targetIndex })
      }
    } catch {
      // ignore
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
      overflow: 'hidden',  // 改为 hidden，让内部元素自己控制滚动
    }}>
      
      {/* ====== 浮动工具栏（正中间） ====== */}
      <div
        style={{
          position: 'sticky',  // 粘性定位，滚动时保持可见
          top: 8,
          zIndex: 100,
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none',  // 允许点击穿透
          marginBottom: -32,  // 负边距，不占空间
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 8px',
            background: '#fff',
            border: '1px solid #eee',
            borderRadius: 6,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            pointerEvents: 'auto',  // 恢复鼠标事件
            fontSize: 12,
          }}
        >
          {/* 左侧：组件树 + 撤销/重做 */}
          <button
            title="组件树"
            onClick={handleTreeClick}
            style={{
              border: showTree ? '1px solid #1677ff' : '1px solid #d9d9d9',
              background: showTree ? '#e6f4ff' : '#fff',
              borderRadius: 4,
              padding: '2px 6px',
              cursor: 'pointer',
              fontSize: 11,
            }}
          >
            ☰
          </button>

          <button
            title="撤销"
            onClick={handleUndo}
            disabled={!canUndo}
            style={{ border: '1px solid #d9d9d9', background: '#fff', borderRadius: 4, padding: '2px 6px', cursor: 'pointer', fontSize: 11, opacity: !canUndo ? 0.4 : 1 }}
          >↩</button>
          <button
            title="重做"
            onClick={handleRedo}
            disabled={!canRedo}
            style={{ border: '1px solid #d9d9d9', background: '#fff', borderRadius: 4, padding: '2px 6px', cursor: 'pointer', fontSize: 11, opacity: !canRedo ? 0.4 : 1 }}
          >↪</button>

          {/* 分隔线 */}
          <div style={{ width: 1, height: 16, background: '#eee', margin: '0 4px' }} />

          {/* 中间：设计/预览切换 */}
          {[
            { key: 'design' as const, label: '设计' },
            { key: 'preview' as const, label: '预览' },
          ].map(item => (
            <button
              key={item.key}
              title={item.label}
              onClick={() => onModeChange?.(item.key)}
              style={{
                border: mode === item.key ? '1px solid #1677ff' : '1px solid #d9d9d9',
                background: mode === item.key ? '#e6f4ff' : '#fff',
                borderRadius: 4,
                padding: '2px 8px',
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: mode === item.key ? 500 : 400,
              }}
            >
              {item.label}
            </button>
          ))}

          {/* 分隔线 */}
          <div style={{ width: 1, height: 16, background: '#eee', margin: '0 4px' }} />

          {/* 右侧：场景切换 */}
          {(
            [
              { key: 'desktop' as const, label: '🖥' },
              { key: 'mobile' as const, label: '📱' },
            ] as { key: DeviceScene; label: string }[]
          ).map(item => (
            <button
              key={item.key}
              title={item.label}
              onClick={() => onSceneChange?.(item.key)}
              style={{
                border: scene === item.key ? '1px solid #1677ff' : '1px solid #d9d9d9',
                background: scene === item.key ? '#e6f4ff' : '#fff',
                borderRadius: 4,
                padding: '2px 6px',
                cursor: 'pointer',
                fontSize: 11,
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* ====== 组件树浮层 ====== */}
      {showTree && (
        <>
          {/* 遮罩 */}
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 999 }}
            onClick={() => setShowTree(false)}
          />
          {/* 组件树内容 */}
          <div
            style={{
              position: 'absolute',
              top: 44,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000,
              background: '#fff',
              border: '1px solid #eee',
              borderRadius: 6,
              padding: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
              minWidth: 180,
              maxHeight: 260,
              overflow: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 6 }}>组件树</div>
            {treeData.length === 0 && <div style={{ color: '#999', padding: '4px 0', fontSize: 11 }}>暂无组件</div>}
            {treeData.map(node => (
              <div
                key={node.id}
                onClick={(e) => { e.stopPropagation(); onSelectField(node.id!); setShowTree(false) }}
                style={{
                  padding: '4px 8px',
                  cursor: 'pointer',
                  color: selectedFieldId === node.id ? '#1677ff' : '#333',
                  background: selectedFieldId === node.id ? '#e6f4ff' : 'transparent',
                  borderRadius: 4,
                  marginBottom: 2,
                  fontSize: 11,
                }}
              >
                ▸ {node.label} <span style={{ color: '#999' }}>[{node.type}]</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ====== 画布主体（可滚动） ====== */}
      <div
        style={{
          flex: 1,
          padding: 16,
          display: 'flex',
          justifyContent: scene === 'mobile' ? 'center' : 'flex-start',
          background: '#f5f5f5',
          minHeight: 0,
          overflow: 'auto',  // 只有这个区域可以滚动
        }}
        onDragOver={mode === 'design' ? handleDragOver : undefined}
        onDrop={mode === 'design' ? (e) => { e.stopPropagation(); handleDrop(e, fields.length) } : undefined}
      >
        <div
          style={{
            width: canvasWidth,
            maxWidth: '100%',
            background: '#fff',
            borderRadius: 8,
            padding: 16,
            boxShadow: scene === 'mobile' ? '0 2px 12px rgba(0,0,0,0.08)' : 'none',
            minHeight: 300,
            height: 'auto',
          }}
        >
          {fields.length === 0 && mode === 'design' && (
            <div style={{ color: '#999', fontSize: 12, padding: 24, textAlign: 'center', border: '1px dashed #ddd', borderRadius: 4 }}>
              从左侧拖拽控件到此处
            </div>
          )}

          {/* 预览模式：使用 FormRender 渲染完整表单 */}
          {mode === 'preview' && fields.length > 0 && schema && (
            <FormRender
              schema={schema}
              onSubmit={(values) => console.log('预览提交:', values)}
              onChange={(values) => console.log('预览变化:', values)}
              adapter={defaultAdapter}
            />
          )}

          {/* 设计模式：渲染字段组件 */}
          {mode === 'design' && fields.map((field, index) => {
            const isSelected = selectedFieldId === field.id
            return (
              <div
                key={field.id}
                draggable={mode === 'design'}
                onDragStart={mode === 'design' ? (e => handleDragStart(e, index, field)) : undefined}
                onDragOver={mode === 'design' ? (e => e.preventDefault()) : undefined}
                onDrop={mode === 'design' ? (e => handleDrop(e, index)) : undefined}
                onClick={() => mode === 'design' && onSelectField(field.id || null)}
                style={{
                  position: 'relative',
                  padding: '8px 12px',
                  marginBottom: 4,
                  border: `1px solid ${isSelected ? '#1677ff' : 'transparent'}`,
                  borderRadius: 4,
                  cursor: 'grab',
                  background: isSelected ? '#e6f4ff' : 'transparent',
                  transition: 'border-color 0.2s',
                }}
              >
                {/* 设计模式：选中遮罩 */}
                {isSelected && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      zIndex: 10,
                      cursor: 'grab',
                      background: 'rgba(22,119,255,0.03)',
                      borderRadius: 4,
                    }}
                    onClick={e => { e.stopPropagation(); onSelectField(field.id || null) }}
                  />
                )}

                {/* 字段标签 */}
                <div style={{ fontSize: 12, color: '#666', marginBottom: 2 }}>
                  {field.label || <span style={{ color: '#ccc' }}>未命名</span>}
                  <span style={{ color: '#999', fontSize: 11, marginLeft: 6 }}>{field.type}</span>
                </div>

                {/* 组件渲染 */}
                <div style={{ pointerEvents: isSelected ? 'none' : 'auto' }}>
                  <FieldRenderer
                    field={field}
                    value={undefined}
                    onChange={() => {}}
                    options={[]}
                    disabled={false}
                    adapter={defaultAdapter}
                  />
                </div>

                {/* 设计模式：删除按钮 */}
                <span
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 8,
                    color: '#ff4d4f',
                    cursor: 'pointer',
                    fontSize: 14,
                    zIndex: 20,
                  }}
                  onClick={e => {
                    e.stopPropagation()
                    dispatch({ type: 'REMOVE_FIELD', fieldId: field.id! })
                  }}
                >
                  ×
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
