import { useDroppable, type UniqueIdentifier } from '@dnd-kit/core'
import React, { useMemo, useState } from 'react'
import type { DeviceScene } from '../registry/componentRegistry'
import { useStyle } from '../styles'
import type { FormFieldSchema } from '../types/schema'
import { CanvasToolbar } from './CanvasToolbar'
import { ComponentTree } from './ComponentTree'
import { useDesignerContext } from './DesignerContext'
import { RootFields } from './RootFields'

export const CANVAS_ROOT_ID = 'canvas-root'
export const CANVAS_ROOT_HEAD_ID = 'canvas-root-head'

const CanvasDroppable: React.FC<{ children: React.ReactNode; onClick: () => void; style: React.CSSProperties }> = ({ children, onClick, style }) => {
  const { setNodeRef, isOver } = useDroppable({ id: CANVAS_ROOT_ID })
  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      style={{
        ...style,
        background: isOver ? 'var(--fe-canvas-dnd-highlight)' : style.background,
      }}
    >
      {children}
    </div>
  )
}

const CanvasRootHead: React.FC = () => {
  const { setNodeRef } = useDroppable({ id: CANVAS_ROOT_HEAD_ID })
  return <div ref={setNodeRef} style={{ overflow: 'hidden', width: '100%' }} />
}

interface CanvasProps {
  fields: FormFieldSchema[]
  activeId?: UniqueIdentifier | null
  onSceneChange?: (scene: DeviceScene) => void
  canUndo?: boolean
  canRedo?: boolean
}

function buildTreeData(fields: FormFieldSchema[]): { id: string; label: string; type: string; children?: any[] }[] {
  return fields.map((f) => ({
    id: f.id!,
    label: f.label || f.type,
    type: f.type,
    ...(f.children?.length ? { children: buildTreeData(f.children) } : {}),
  }))
}

export const Canvas: React.FC<CanvasProps> = ({ fields, activeId, onSceneChange, canUndo = false, canRedo = false }) => {
  const { dispatch, selectedFieldId, onSelectField, scene } = useDesignerContext()
  const [showTree, setShowTree] = useState(false)

  const treeData = useMemo(() => buildTreeData(fields), [fields])
  const canvasWidth = scene === 'mobile' ? 375 : '100%'

  const { token } = useStyle()

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        position: 'relative',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <CanvasToolbar scene={scene} onSceneChange={onSceneChange} canUndo={canUndo} canRedo={canRedo} onUndo={() => dispatch({ type: 'UNDO' })} onRedo={() => dispatch({ type: 'REDO' })} onTreeClick={() => setShowTree(!showTree)} showTree={showTree} />

      {showTree && <ComponentTree items={treeData} selectedId={selectedFieldId} onSelect={(id) => onSelectField(id)} onClose={() => setShowTree(false)} />}

      <div
        style={{
          flex: 1,
          padding: token('spacingMd'),
          display: 'flex',
          justifyContent: scene === 'mobile' ? 'center' : 'stretch',
          alignItems: 'stretch',
          background: 'var(--fe-bg-secondary)',
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        <CanvasDroppable
          onClick={() => onSelectField(null)}
          style={{
            width: canvasWidth,
            maxWidth: '100%',
            background: 'var(--fe-bg-primary)',
            borderRadius: 'var(--fe-border-radius-md)',
            padding: token('spacingMd'),
            boxShadow: scene === 'mobile' ? 'var(--fe-shadow-sm)' : 'none',
            overflow: 'auto',
          }}
        >
          {fields.length === 0 && !activeId && (
            <div
              style={{
                color: token('textTertiary'),
                fontSize: token('fontSizeSm'),
                padding: token('spacingXl'),
                textAlign: 'center',
                border: '1px dashed var(--fe-border-light)',
                borderRadius: 'var(--fe-border-radius-sm)',
              }}
            >
              从左侧拖拽控件到此处
            </div>
          )}

          <CanvasRootHead />
          <RootFields fields={fields} />
        </CanvasDroppable>
      </div>
    </div>
  )
}
