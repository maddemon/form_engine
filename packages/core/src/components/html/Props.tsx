import { useMemo } from 'react'
import { resolveSlot } from '../../registry/propertySlotRegistry'
import { useLocale } from '../../locale'
import { FieldItem } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'

export default function HtmlPropsRender({ widgets: w, slots, values, onChange }: PropsRenderProps) {
  const { locale } = useLocale()
  const CodeEditor = useMemo(() => resolveSlot('codeEditor', slots, w), [slots, w])
  return (
    <FieldItem label={locale.component.html.content}>
      <CodeEditor
        value={(values.content as string) ?? ''}
        onChange={(v) => onChange('content', v)}
        placeholder={locale.component.html.contentPlaceholder}
        context={{ language: 'html' }}
      />
    </FieldItem>
  )
}
