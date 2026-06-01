import React, { useMemo, useState } from 'react'
import type { FormFieldSchema } from '../types/schema'
import type { SelectedFieldId, DesignerAction, PaletteItem } from '../types/designer'
import { createFieldFromPalette } from './FieldList'
import type { DeviceScene } from '../registry/componentRegistry'
import { CanvasToolbar } from './CanvasToolbar'
import { ComponentTree } from './ComponentTree'
import { useDesignerContext } from './DesignerContext'
import { RootFields } from './RootFields'
import { readDragData, isPaletteDrag, isCanvasDrag, toPaletteItem, writeDragData } from '../types/designer-drag'

interface CanvasProps {
  fields: FormFieldSchema[]
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

export const Canvas: React.FC<CanvasProps> = ({
  fields,
  onSceneChange,
  canUndo = false,
  canRedo = false,
}) => {
  const { dispatch, selectedFieldId, onSelectField, scene } = useDesignerContext()
  const [showTree, setShowTree] = useState(false)

  const treeData = useMemo(() => buildTreeData(fields), [fields])

  const canvasWidth = scene === 'mobile' ? 375 : '100%'

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    e.stopPropagation()
    const data = readDragData(e)
    if (!data) return

    if (isPaletteDrag(data)) {
      const newField = createFieldFromPalette(toPaletteItem(data))
      dispatch({ type: 'ADD_FIELD', field: newField, index: targetIndex })
    } else if (isCanvasDrag(data)) {
      dispatch({ type: 'MOVE_FIELD', fromIndex: data.index, toIndex: targetIndex, fromParentId: data.fromParentId })
    }
  }

  const handleDragStart = (e: React.DragEvent, index: number, field: FormFieldSchema) => {
    writeDragData(e, { source: 'canvas', index, fieldId: field.id })
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

          <RootFields
            fields={fields}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
          />
        </div>
      </div>
    </div>
  )
}
