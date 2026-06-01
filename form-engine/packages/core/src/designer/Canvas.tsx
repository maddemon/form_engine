import React, { useMemo, useState } from 'react'
import type { FormFieldSchema, FormSchema } from '../types/schema'
import type { SelectedFieldId, DesignerAction, PaletteItem } from '../types/designer'
import { createFieldFromPalette } from './FieldList'
import { FieldRenderer } from '../renderer/FieldRenderer'
import { FormRender } from '../renderer/FormRender'
import defaultAdapter from '../renderer/defaultAdapter'
import type { DeviceScene } from '../registry/componentRegistry'
import { CanvasToolbar } from './CanvasToolbar'
import { ComponentTree } from './ComponentTree'

interface CanvasProps {
  fields: FormFieldSchema[]
  selectedFieldId: SelectedFieldId
  dispatch: React.Dispatch<DesignerAction>
  onSelectField: (id: string | null) => void
  schema?: FormSchema
  scene?: DeviceScene
  onSceneChange?: (scene: DeviceScene) => void
  canUndo?: boolean
  canRedo?: boolean
  mode?: 'design' | 'preview'
  onModeChange?: (mode: 'design' | 'preview') => void
}

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
  const [showTree, setShowTree] = useState(false)

  const treeData = useMemo(() =>
    fields.map(f => ({ id: f.id!, label: f.label || f.type, type: f.type }))
  , [fields])

  const canvasWidth = scene === 'mobile' ? 375 : '100%'

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
      overflow: 'hidden',
    }}>
      <CanvasToolbar
        scene={scene}
        onSceneChange={onSceneChange}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={() => dispatch({ type: 'UNDO' })}
        onRedo={() => dispatch({ type: 'REDO' })}
        mode={mode}
        onModeChange={onModeChange}
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
          background: '#f5f5f5',
          minHeight: 0,
          overflow: 'auto',
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

          {mode === 'preview' && fields.length > 0 && schema && (
            <FormRender
              schema={schema}
              onSubmit={(values) => console.log('预览提交:', values)}
              onChange={(values) => console.log('预览变化:', values)}
              adapter={defaultAdapter}
            />
          )}

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

                <div style={{ fontSize: 12, color: '#666', marginBottom: 2 }}>
                  {field.label || <span style={{ color: '#ccc' }}>未命名</span>}
                  <span style={{ color: '#999', fontSize: 11, marginLeft: 6 }}>{field.type}</span>
                </div>

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
