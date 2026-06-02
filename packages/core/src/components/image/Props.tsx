import { FieldItem } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'

export default function ImagePropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <FieldItem label="图片地址">
        <w.Input value={(values.src as string) ?? ''} onChange={(v) => onChange('src', v)} placeholder="https://example.com/image.png" />
      </FieldItem>
      <FieldItem label="替代文本">
        <w.Input value={(values.alt as string) ?? ''} onChange={(v) => onChange('alt', v)} placeholder="图片加载失败时显示" />
      </FieldItem>
      <FieldItem label="宽度">
        <w.Input value={values.width != null ? String(values.width) : ''} onChange={(v) => onChange('width', v ? Number(v) : undefined)} placeholder="如：200 或 50%" />
      </FieldItem>
      <FieldItem label="高度">
        <w.Input value={values.height != null ? String(values.height) : ''} onChange={(v) => onChange('height', v ? Number(v) : undefined)} placeholder="如：200 或 50%" />
      </FieldItem>
      <FieldItem label="可预览">
        <w.Switch checked={values.preview !== false} onChange={(v) => onChange('preview', v)} />
      </FieldItem>
      <FieldItem label="圆角">
        <w.NumberInput value={(values.borderRadius as number) ?? 0} onChange={(v) => onChange('borderRadius', v)} min={0} max={50} />
      </FieldItem>
    </>
  )
}
