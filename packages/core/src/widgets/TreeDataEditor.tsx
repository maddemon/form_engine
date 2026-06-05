import React, { useCallback, useRef, useState } from 'react'
import { useStyle } from '../styles'
import type { OptionItem } from '../types/schema'
import { WidgetButton } from './Button'
import { WidgetModal } from './Modal'
import { WidgetTextArea } from './TextArea'

function toTreeLines(options: OptionItem[]): string {
  const lines: string[] = []
  const walk = (nodes: OptionItem[], prefix: string[]) => {
    for (const node of nodes) {
      const path = [...prefix, node.label]
      if (node.children?.length) {
        walk(node.children, path)
      } else {
        lines.push(path.join(' > '))
      }
    }
  }
  walk(options, [])
  return lines.join('\n')
}

function fromTreeLines(text: string): OptionItem[] {
  const lines = text.split('\n').filter((l) => l.trim())
  const root: OptionItem[] = []
  const usedValues = new Set<string>()

  for (const line of lines) {
    const parts = line.split(' > ').map((s) => s.trim())
    let siblings = root
    for (let i = 0; i < parts.length; i++) {
      const label = parts[i]
      let node = siblings.find((n) => n.label === label)
      if (!node) {
        node = { label, value: '' }
        siblings.push(node)
      }
      if (i < parts.length - 1) {
        if (!node.children) node.children = []
        siblings = node.children
      }
    }
  }

  let idx = 0
  const assignValues = (nodes: OptionItem[]) => {
    for (const node of nodes) {
      let val = node.label.replace(/\s+/g, '_').toLowerCase() || `option_${idx + 1}`
      if (usedValues.has(val)) {
        let suffix = 2
        while (usedValues.has(`${val}_${suffix}`)) suffix++
        val = `${val}_${suffix}`
      }
      usedValues.add(val)
      node.value = val
      idx++
      if (node.children) assignValues(node.children)
    }
  }
  assignValues(root)

  return root
}

function countTreeNodes(options: OptionItem[]): number {
  let count = 0
  const walk = (nodes: OptionItem[]) => {
    for (const node of nodes) {
      count++
      if (node.children) walk(node.children)
    }
  }
  walk(options)
  return count
}

function getDepthSummary(options: OptionItem[]): string {
  let maxDepth = 0
  const walk = (nodes: OptionItem[], depth: number) => {
    for (const node of nodes) {
      const d = depth + 1
      if (node.children?.length) {
        walk(node.children, d)
      } else if (d > maxDepth) {
        maxDepth = d
      }
    }
  }
  walk(options, 0)
  return maxDepth > 0 ? `${maxDepth} 层` : ''
}

function getTopLevelSummary(options: OptionItem[]): string {
  if (options.length === 0) return ''
  if (options.length <= 3) {
    return options.map((o) => o.label).join('、')
  }
  return `${options.slice(0, 3).map((o) => o.label).join('、')}…`
}

function BatchEditModal({
  open,
  options,
  onConfirm,
  onCancel,
}: {
  open: boolean
  options: OptionItem[]
  onConfirm: (v: OptionItem[]) => void
  onCancel: () => void
}) {
  const { token } = useStyle()
  const [text, setText] = useState('')
  const prevOpenRef = useRef(false)

  React.useEffect(() => {
    if (open && !prevOpenRef.current) {
      setText(options.length > 0 ? toTreeLines(options) : '')
    }
    prevOpenRef.current = open
  }, [open, options])

  const handleConfirm = () => {
    onConfirm(fromTreeLines(text))
  }

  return (
    <WidgetModal open={open} title="编辑树形数据" width="sm" onCancel={onCancel} onConfirm={handleConfirm}>
      <div
        style={{
          fontSize: token('fontSizeXs'),
          color: 'var(--fe-text-tertiary)',
          marginBottom: token('spacingSm'),
        }}
      >
        每行一个叶子路径，层级用 <code style={{ background: 'var(--fe-bg-tertiary)', padding: '0 2px' }}>&gt;</code> 分隔：
        <div style={{ marginTop: token('spacingXs'), lineHeight: 1.6 }}>
          广东 &gt; 广州 &gt; 天河区<br />
          广东 &gt; 广州 &gt; 越秀区<br />
          广东 &gt; 深圳 &gt; 南山区
        </div>
      </div>
      <WidgetTextArea value={text} onChange={setText} rows={12} />
    </WidgetModal>
  )
}

function WidgetTreeDataEditorInner({
  value,
  onChange,
  disabled,
  style,
}: {
  value?: OptionItem[]
  onChange?: (v: OptionItem[]) => void
  disabled?: boolean
  style?: React.CSSProperties
}) {
  const { token } = useStyle()
  const [batchOpen, setBatchOpen] = useState(false)
  const options = value ?? []
  const totalNodes = countTreeNodes(options)
  const depthInfo = getDepthSummary(options)
  const summary = getTopLevelSummary(options)

  const handleBatchConfirm = useCallback(
    (newOptions: OptionItem[]) => {
      onChange?.(newOptions)
      setBatchOpen(false)
    },
    [onChange],
  )

  return (
    <div style={{ ...style }}>
      {totalNodes > 0 ? (
        <div
          style={{
            fontSize: token('fontSizeXs'),
            color: 'var(--fe-text-secondary)',
            marginBottom: token('spacingXs'),
            lineHeight: 1.5,
          }}
        >
          <div>{summary}</div>
          <div style={{ color: 'var(--fe-text-tertiary)' }}>
            共 {totalNodes} 个节点
            {depthInfo ? ` / ${depthInfo}` : ''}
          </div>
        </div>
      ) : (
        <div
          style={{
            fontSize: token('fontSizeXs'),
            color: 'var(--fe-text-tertiary)',
            marginBottom: token('spacingXs'),
          }}
        >
          暂无数据
        </div>
      )}

      <div style={{ display: 'flex', gap: token('spacingXs') }}>
        <WidgetButton
          type="dashed"
          size="sm"
          onClick={() => setBatchOpen(true)}
          disabled={disabled}
          style={{
            flex: 1,
            textAlign: 'center',
            color: 'var(--fe-text-secondary)',
            borderColor: 'var(--fe-border-primary)',
          }}
        >
          批量编辑
        </WidgetButton>
      </div>

      <BatchEditModal
        open={batchOpen}
        options={options}
        onConfirm={handleBatchConfirm}
        onCancel={() => setBatchOpen(false)}
      />
    </div>
  )
}

export const WidgetTreeDataEditor = React.memo(WidgetTreeDataEditorInner) as typeof WidgetTreeDataEditorInner
