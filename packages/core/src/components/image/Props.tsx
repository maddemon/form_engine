import { FieldGroup, InlineField } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'

export default function ImagePropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <FieldGroup label="图片地址">
        <w.Input value={(values.src as string) ?? ''} onChange={(v) => onChange('src', v)} placeholder="https://example.com/image.png" />
      </FieldGroup>
      <FieldGroup label="替代文本">
        <w.Input value={(values.alt as string) ?? ''} onChange={(v) => onChange('alt', v)} placeholder="图片加载失败时显示" />
      </FieldGroup>
      <FieldGroup label="宽度">
        <w.Input value={values.width != null ? String(values.width) : ''} onChange={(v) => onChange('width', v ? Number(v) : undefined)} placeholder="如：200 或 50%" />
      </FieldGroup>
      <FieldGroup label="高度">
        <w.Input value={values.height != null ? String(values.height) : ''} onChange={(v) => onChange('height', v ? Number(v) : undefined)} placeholder="如：200 或 50%" />
      </FieldGroup>
      <InlineField label="可预览">
        <w.Checkbox checked={values.preview !== false} onChange={(v) => onChange('preview', v)} />
      </InlineField>
      <FieldGroup label="圆角">
        <w.NumberInput value={(values.borderRadius as number) ?? 0} onChange={(v) => onChange('borderRadius', v)} min={0} max={50} />
      </FieldGroup>
    </>
  )
}
