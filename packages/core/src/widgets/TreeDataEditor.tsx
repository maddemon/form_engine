import React, { useCallback, useRef, useState } from 'react'
import { useStyle } from '../styles'
import { useLocale } from '../locale'
import type { OptionItem } from '../types/schema'
import { WidgetButton } from './Button'
import { WidgetModal } from './Modal'
import { Space } from './Space'
import { Text } from './Text'
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

function getDepthSummary(options: OptionItem[]): number {
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
  return maxDepth
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
  const { locale } = useLocale()
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
    <WidgetModal open={open} title={locale.widget.treeDataEditor.title} width="sm" onCancel={onCancel} onConfirm={handleConfirm}>
      <Text type="tertiary" style={{ marginBottom: token('spacingSm') }}>
        {locale.widget.treeDataEditor.instructions.split('>')[0]}<code style={{ background: 'var(--fe-bg-tertiary)', padding: '0 2px' }}>&gt;</code>{locale.widget.treeDataEditor.instructions.split('>')[1]}
        <div style={{ marginTop: token('spacingXs'), lineHeight: 1.6 }}>
          广东 &gt; 广州 &gt; 天河区<br />
          广东 &gt; 广州 &gt; 越秀区<br />
          广东 &gt; 深圳 &gt; 南山区
        </div>
      </Text>
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
  const { locale } = useLocale()
  const [batchOpen, setBatchOpen] = useState(false)
  const options = value ?? []
  const totalNodes = countTreeNodes(options)
  const depth = getDepthSummary(options)
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
        <Text type="secondary" style={{ marginBottom: token('spacingXs'), lineHeight: 1.5 }}>
          <div>{summary}</div>
          <Text type="tertiary">
            {locale.widget.treeDataEditor.nodeCount.replace('{n}', String(totalNodes))}
            {depth > 0 ? ` / ${locale.widget.treeDataEditor.layers.replace('{n}', String(depth))}` : ''}
          </Text>
        </Text>
      ) : (
        <Text type="tertiary" style={{ marginBottom: token('spacingXs') }}>
          {locale.widget.treeDataEditor.empty}
        </Text>
      )}

      <Space gap="xs">
        <WidgetButton
          type="dashed"
          size="sm"
          color="primary"
          onClick={() => setBatchOpen(true)}
          disabled={disabled}
          style={{
            flex: 1,
            textAlign: 'center',
          }}
        >
          {locale.widget.treeDataEditor.batchEdit}
        </WidgetButton>
      </Space>

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
