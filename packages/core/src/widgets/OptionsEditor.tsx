import { closestCenter, DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useStyle } from '../styles'
import { WidgetButton } from './Button'
import { WidgetModal } from './Modal'
import { WidgetTextArea } from './TextArea'
import { arrayMove, SortableRow, DragHandleIcon, InlineDeleteButton, getInputBaseStyle, getLabelStyle, getSortableRowContentStyle } from './sortableListShared'

const SORTABLE_PREFIX = '__opteditor_'

/** 自增 id 生成器，为每个选项提供稳定 key */
let _nextId = 1
function newId(): string {
  return `opt_${_nextId++}`
}

interface OptionItem {
  label: string
  value: string
  /** 内部稳定 id，用于 React key 和 dnd-kit sortable id */
  _id: string
}

function toInternal(items: { label: string; value: string }[]): OptionItem[] {
  return items.map((o) => ({ ...o, _id: newId() }))
}

function fromInternal(items: OptionItem[]): { label: string; value: string }[] {
  return items.map(({ label, value }) => ({ label, value }))
}

/** 批量编辑弹窗 */
function BatchEditModal({ open, options, onConfirm, onCancel }: { open: boolean; options: { label: string; value: string }[]; onConfirm: (v: { label: string; value: string }[]) => void; onCancel: () => void }) {
  const { token } = useStyle()
  const [text, setText] = useState('')
  const prevOpenRef = useRef(false)

  // 计算"自动生成 value"：与 handleConfirm 中生成逻辑保持一致
  const autoValue = (label: string, index: number) =>
    label.replace(/\s+/g, '_').toLowerCase() || `option_${index + 1}`

  React.useEffect(() => {
    if (open && !prevOpenRef.current) {
      setText(
        options
          .map((o, i) => (o.value === autoValue(o.label, i) ? o.label : `${o.label} ${o.value}`))
          .join('\n'),
      )
    }
    prevOpenRef.current = open
  }, [open, options])

  const handleConfirm = () => {
    const lines = text.split('\n').filter((l) => l.trim())
    const usedValues = new Set<string>()
    const result = lines.map((line, i) => {
      const match = line.trim().match(/^(\S+)(?:\s+(.+))?$/)
      const label = match ? match[1] : line.trim()
      const explicitValue = match?.[2]
      let val = explicitValue ?? (label.replace(/\s+/g, '_').toLowerCase() || `option_${i + 1}`)
      if (usedValues.has(val)) {
        let suffix = 2
        while (usedValues.has(`${val}_${suffix}`)) suffix++
        val = `${val}_${suffix}`
      }
      usedValues.add(val)
      return { label, value: val }
    })
    onConfirm(result)
  }

  return (
    <WidgetModal open={open} title="批量编辑选项" width="sm" onCancel={onCancel} onConfirm={handleConfirm}>
      <div style={{ fontSize: token('fontSizeXs'), color: 'var(--fe-text-tertiary)', marginBottom: token('spacingSm') }}>每行一个选项，格式：`label value`，不写 value 时与 label 相同</div>
      <WidgetTextArea value={text} onChange={setText} rows={10} />
    </WidgetModal>
  )
}

function WidgetOptionsEditorInner({ value, onChange, disabled, style }: { value?: { label: string; value: string }[]; onChange?: (v: { label: string; value: string }[]) => void; disabled?: boolean; style?: React.CSSProperties }) {
  const { token } = useStyle()
  const [batchOpen, setBatchOpen] = useState(false)

  // 维护带 _id 的内部列表
  const [internal, setInternal] = useState<OptionItem[]>(() => toInternal(value || []))
  const prevValueRef = useRef(value)

  // 外部 value 变化时同步（非编辑期间）
  React.useEffect(() => {
    if (value !== prevValueRef.current) {
      setInternal(toInternal(value || []))
    }
    prevValueRef.current = value
  }, [value])

  const options = internal

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const internalRef = useRef(internal)
  internalRef.current = internal

  const update = useCallback(
    (idx: number, patch: Partial<{ label: string; value: string }>) => {
      const prev = internalRef.current
      const next = prev.map((o, i) => (i === idx ? { ...o, ...patch } : o))
      setInternal(next)
      internalRef.current = next
      onChange?.(fromInternal(next))
    },
    [onChange],
  )

  const add = useCallback(() => {
    const prev = internalRef.current
    const next = [...prev, { label: `选项${prev.length + 1}`, value: `option_${prev.length + 1}`, _id: newId() }]
    setInternal(next)
    internalRef.current = next
    onChange?.(fromInternal(next))
  }, [onChange])

  const remove = useCallback(
    (idx: number) => {
      const prev = internalRef.current
      const next = prev.filter((_, i) => i !== idx)
      setInternal(next)
      internalRef.current = next
      onChange?.(fromInternal(next))
    },
    [onChange],
  )

  const handleSortEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return
      const prev = internalRef.current
      const oldIndex = prev.findIndex((o) => `${SORTABLE_PREFIX}${o._id}` === String(active.id))
      const newIndex = prev.findIndex((o) => `${SORTABLE_PREFIX}${o._id}` === String(over.id))
      if (oldIndex !== -1 && newIndex !== -1) {
        const next = arrayMove(prev, oldIndex, newIndex)
        setInternal(next)
        internalRef.current = next
        onChange?.(fromInternal(next))
      }
    },
    [onChange],
  )

  const handleBatchConfirm = useCallback(
    (newOptions: { label: string; value: string }[]) => {
      setInternal(toInternal(newOptions))
      onChange?.(newOptions)
      setBatchOpen(false)
    },
    [onChange],
  )

  const sortableIds = useMemo(() => options.map((o) => `${SORTABLE_PREFIX}${o._id}`), [options])

  const inputBaseStyle = getInputBaseStyle(token, disabled)
  const labelStyle = getLabelStyle(token)

  return (
    <div style={{ ...style }}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSortEnd}>
        <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
          {options.map((opt, idx) => (
            <SortableRow key={opt._id} id={`${SORTABLE_PREFIX}${opt._id}`} dragHandle={<DragHandleIcon />}>
              <div style={getSortableRowContentStyle(token, { flex: 1 })}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={labelStyle}>标签</div>
                  <input type="text" value={opt.label} placeholder="标签" onChange={(e) => update(idx, { label: e.target.value })} disabled={disabled} style={inputBaseStyle} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={labelStyle}>值</div>
                  <input type="text" value={opt.value} placeholder="值" onChange={(e) => update(idx, { value: e.target.value })} disabled={disabled} style={inputBaseStyle} />
                </div>
                <InlineDeleteButton
                  disabled={disabled}
                  onClick={(e) => { e.stopPropagation(); remove(idx) }}
                />
              </div>
            </SortableRow>
          ))}
        </SortableContext>
      </DndContext>

      {/* 底部按钮组 */}
      <div style={{ display: 'flex', gap: token('spacingXs') }}>
        <WidgetButton
          type="dashed"
          size="sm"
          onClick={add}
          disabled={disabled}
          style={{ flex: 1, textAlign: 'center' as const, color: 'var(--fe-primary)', borderColor: 'var(--fe-primary)' }}
        >
          + 添加选项
        </WidgetButton>
        <WidgetButton
          type="dashed"
          size="sm"
          onClick={() => setBatchOpen(true)}
          disabled={disabled}
          style={{ flex: 1, textAlign: 'center' as const, color: 'var(--fe-text-secondary)', borderColor: 'var(--fe-border-primary)' }}
        >
          批量编辑
        </WidgetButton>
      </div>

      <BatchEditModal open={batchOpen} options={fromInternal(options)} onConfirm={handleBatchConfirm} onCancel={() => setBatchOpen(false)} />
    </div>
  )
}

export const WidgetOptionsEditor = React.memo(WidgetOptionsEditorInner) as typeof WidgetOptionsEditorInner
