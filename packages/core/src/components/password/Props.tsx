import { FieldGroup, InlineField } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'

export default function PasswordPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <FieldGroup label="默认值">
        <w.Input value={(values.defaultValue as string) ?? ''} onChange={(v) => onChange('defaultValue', v)} />
      </FieldGroup>
      <FieldGroup label="占位文本">
        <w.Input value={(values.placeholder as string) ?? ''} onChange={(v) => onChange('placeholder', v)} placeholder="请输入密码" />
      </FieldGroup>
      <FieldGroup label="最大长度">
        <w.NumberInput value={(values.maxLength as number) ?? 0} onChange={(v) => onChange('maxLength', v)} min={0} />
      </FieldGroup>
      <InlineField label="显示字数">
        <w.Checkbox checked={!!values.showCount} onChange={(v) => onChange('showCount', v)} />
      </InlineField>
      <InlineField label="允许清除">
        <w.Checkbox checked={!!values.allowClear} onChange={(v) => onChange('allowClear', v)} />
      </InlineField>
      <InlineField label="显示密码切换">
        <w.Checkbox checked={!!values.visibilityToggle} onChange={(v) => onChange('visibilityToggle', v)} />
      </InlineField>
      <FieldGroup label="前缀">
        <w.Input value={(values.prefix as string) ?? ''} onChange={(v) => onChange('prefix', v)} />
      </FieldGroup>
    </>
  )
}