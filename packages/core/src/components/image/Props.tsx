import { RowField } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'

export default function ImagePropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <RowField label="图片地址">
        <w.Input value={(values.src as string) ?? ''} onChange={(v) => onChange('src', v)} placeholder="https://example.com/image.png" />
      </RowField>
      <RowField label="替代文本">
        <w.Input value={(values.alt as string) ?? ''} onChange={(v) => onChange('alt', v)} placeholder="图片加载失败时显示" />
      </RowField>
      <RowField label="宽度">
        <w.Input value={values.width != null ? String(values.width) : ''} onChange={(v) => onChange('width', v ? Number(v) : undefined)} placeholder="如：200 或 50%" />
      </RowField>
      <RowField label="高度">
        <w.Input value={values.height != null ? String(values.height) : ''} onChange={(v) => onChange('height', v ? Number(v) : undefined)} placeholder="如：200 或 50%" />
      </RowField>
      <RowField label="可预览">
        <w.Switch checked={values.preview !== false} onChange={(v) => onChange('preview', v)} />
      </RowField>
      <RowField label="圆角">
        <w.NumberInput value={(values.borderRadius as number) ?? 0} onChange={(v) => onChange('borderRadius', v)} min={0} max={50} />
      </RowField>
    </>
  )
}
