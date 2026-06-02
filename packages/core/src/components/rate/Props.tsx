import { FieldItem, PropsRenderProps } from '../../propRenders'

export default function RatePropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <FieldItem label="默认值">
        <w.NumberInput value={(values.defaultValue as number) ?? undefined} onChange={(v) => onChange('defaultValue', v)} />
      </FieldItem>
      <FieldItem label="星数">
        <w.NumberInput value={(values.count as number) ?? 5} onChange={(v) => onChange('count', v)} min={1} max={10} />
      </FieldItem>
      <FieldItem label="自定义字符">
        <w.Input value={(values.character as string) ?? ''} onChange={(v) => onChange('character', v)} placeholder="如：A（留空用星号）" />
      </FieldItem>
      <FieldItem label="提示文字">
        <w.Input value={((values.tooltips as string[]) ?? []).join(',')} onChange={(v) => onChange('tooltips', v ? (v as string).split(',').map((s) => s.trim()) : undefined)} placeholder="逗号分隔，如: 很差,一般,满意" />
      </FieldItem>
    </>
  )
}
