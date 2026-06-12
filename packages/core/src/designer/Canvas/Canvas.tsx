import { useDroppable, type UniqueIdentifier } from '@dnd-kit/core'
import React, { useCallback, useMemo, useState } from 'react'
import type { DeviceScene } from '../../types/adapter-field'
import { useStyle } from '../../styles'
import { useLocale } from '../../locale'
import type { FormFieldSchema } from '../../types/schema'
import { CanvasToolbar } from './CanvasToolbar'
import { ComponentTree, type TreeItem } from './ComponentTree'
import { useDesignerDispatch, useDesignerSelection, useDesignerScene, useDesignerFormConfig, useDesignerAdapters } from '../DesignerContext'
import type { DragOverState } from '../Dnd/useDndHandlers'
import { RootFields } from '../RootFields'
import { EmptyContainerPlaceholder } from '../ContainerPreview/EmptyContainerPlaceholder'

export const CANVAS_ROOT_ID = 'canvas-root'
export const CANVAS_ROOT_HEAD_ID = 'canvas-root-head'

interface CanvasDroppableProps {
  children: React.ReactNode
  onClick: () => void
  style: React.CSSProperties
}

const CanvasDroppable: React.FC<CanvasDroppableProps> = ({ children, onClick, style }) => {
  const { setNodeRef } = useDroppable({ id: CANVAS_ROOT_ID })
  return (
    <div ref={setNodeRef} onClick={onClick} style={style}>
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
  dragOverState?: DragOverState | null
}

function buildTreeData(fields: FormFieldSchema[]): TreeItem[] {
  return fields.map((f) => ({
    id: f.id,
    label: f.label || f.type,
    type: f.type,
    children: f.children.length ? buildTreeData(f.children) : [],
  }))
}

export const Canvas: React.FC<CanvasProps> = ({ fields, activeId, onSceneChange, canUndo = false, canRedo = false, dragOverState }) => {
  const dispatch = useDesignerDispatch()
  const { selectedFieldId, onSelectField } = useDesignerSelection()
  const scene = useDesignerScene()
  const formConfig = useDesignerFormConfig()
  const { adapter } = useDesignerAdapters()
  const { t } = useLocale()

  const FormWrapper = adapter?.FormWrapper
  const [showTree, setShowTree] = useState(false)

  const treeData = useMemo(() => (showTree ? buildTreeData(fields) : []), [showTree, fields])
  const canvasWidth = scene === 'mobile' ? 375 : '100%'

  // Page background: from formConfig, default to white
  const defaultBg = 'var(--fe-bg-primary)'
  const pageBg = (scene === 'mobile'
    ? formConfig.mobile.pageBackground
    : formConfig.desktop.pageBackground) ?? defaultBg

  const { token } = useStyle()
  const handleUndo = useCallback(() => dispatch({ type: 'UNDO' }), [dispatch])
  const handleRedo = useCallback(() => dispatch({ type: 'REDO' }), [dispatch])
  const handleTreeClick = useCallback(() => setShowTree((prev) => !prev), [])
  const handleSelectField = useCallback((id: string | null) => onSelectField(id), [onSelectField])
  const handleCloseTree = useCallback(() => setShowTree(false), [])

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
      <CanvasToolbar scene={scene} onSceneChange={onSceneChange} canUndo={canUndo} canRedo={canRedo} onUndo={handleUndo} onRedo={handleRedo} onTreeClick={handleTreeClick} showTree={showTree} />

      {showTree && <ComponentTree items={treeData} selectedId={selectedFieldId} onSelect={handleSelectField} onClose={handleCloseTree} />}

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
            background: pageBg,
            borderRadius: 'var(--fe-border-radius-md)',
            padding: token('spacingMd'),
            border: scene === 'mobile' ? '2px solid var(--fe-border-primary)' : 'none',
            boxShadow: scene === 'mobile' ? 'var(--fe-shadow-sm)' : 'none',
            overflow: 'auto',
          }}
        >
          {fields.length === 0 && !activeId && (
            <EmptyContainerPlaceholder containerId={CANVAS_ROOT_ID} variant="dashed" text={t('designer.canvasEmptyHint') ?? 'Drag components here'} />
          )}

          <CanvasRootHead />
          {FormWrapper ? (
            <FormWrapper formConfig={formConfig} scene={scene} onSubmit={() => {}}>
              <RootFields fields={fields} dragOverState={dragOverState} />
            </FormWrapper>
          ) : (
            <RootFields fields={fields} dragOverState={dragOverState} />
          )}
        </CanvasDroppable>
      </div>
    </div>
  )
}
