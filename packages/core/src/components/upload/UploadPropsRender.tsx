import { useLocale } from '../../locale'
import { FieldItem, PropsRenderProps } from '../../propRenders'

export default function UploadPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  const { locale } = useLocale()

  const isCard = (values.listType as string) === 'picture-card'

  return (
    <>
      <FieldItem label={locale.component.upload.action}>
        <w.Input value={(values.action as string) ?? ''} onChange={(v) => onChange('action', v)} placeholder={locale.component.upload.actionPlaceholder} />
      </FieldItem>
      <FieldItem label={locale.component.upload.defaultValue}>
        <w.Input value={(values.defaultValue as string) ?? ''} onChange={(v) => onChange('defaultValue', v)} />
      </FieldItem>
      <FieldItem label={locale.component.upload.accept}>
        <w.Input value={(values.accept as string) ?? ''} onChange={(v) => onChange('accept', v)} />
      </FieldItem>
      <FieldItem label={locale.component.upload.maxCount}>
        <w.NumberInput value={(values.maxCount as number) ?? 1} onChange={(v) => onChange('maxCount', v)} min={1} />
      </FieldItem>
      <FieldItem label={locale.component.upload.listType}>
        <w.ButtonGroup
          value={(values.listType as string) ?? 'text'}
          onChange={(v) => onChange('listType', v)}
          options={[
            { label: locale.component.upload.list, value: 'text' },
            { label: locale.component.upload.card, value: 'picture-card' },
          ]}
        />
      </FieldItem>
      {!isCard && (
        <FieldItem label={locale.component.upload.showUploadList}>
          <w.Switch checked={values.showUploadList !== false} onChange={(v) => onChange('showUploadList', v)} />
        </FieldItem>
      )}
    </>
  )
}
