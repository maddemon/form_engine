import React, { useRef, useState } from 'react'
import { useLocale } from '../../locale'
import type { OptionItem } from '../../types/schema'
import { WidgetModal } from '../Modal'
import { Text } from '../Text'
import { WidgetTextArea } from '../TextArea'
import { toFlatLines, fromFlatLines } from './utils'

interface BatchEditModalProps {
  open: boolean
  options: OptionItem[]
  onConfirm: (v: OptionItem[]) => void
  onCancel: () => void
}

export function BatchEditModal({ open, options, onConfirm, onCancel }: BatchEditModalProps) {
  const { locale } = useLocale()
  const [text, setText] = useState('')
  const prevOpenRef = useRef(false)

  React.useEffect(() => {
    if (open && !prevOpenRef.current) {
      setText(options.length > 0 ? toFlatLines(options) : '')
    }
    prevOpenRef.current = open
  }, [open, options])

  const handleConfirm = () => {
    onConfirm(fromFlatLines(text))
  }

  return (
    <WidgetModal open={open} title={locale.widget.dataSourceEditor.batchEdit} width="sm" onCancel={onCancel} onConfirm={handleConfirm}>
      <Text type="tertiary" style={{ marginBottom: '8px' }}>
        {locale.widget.dataSourceEditor.batchInstructions}
        <div style={{ marginTop: '4px', lineHeight: 1.6 }}>
          选项1 1<br />
          选项2 2
        </div>
      </Text>
      <WidgetTextArea value={text} onChange={setText} rows={12} />
    </WidgetModal>
  )
}