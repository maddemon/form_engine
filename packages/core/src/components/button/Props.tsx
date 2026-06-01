import { FieldGroup, InlineField } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'

export default function ButtonPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <FieldGroup label="按钮类型">
        <w.ButtonGroup
          value={(values.type as string) ?? 'default'}
          onChange={(v) => onChange('type', v)}
          options={[
            { label: '默认', value: 'default' },
            { label: '主要', value: 'primary' },
            { label: '虚线', value: 'dashed' },
            { label: '链接', value: 'link' },
            { label: '文本', value: 'text' },
          ]}
        />
      </FieldGroup>
      <FieldGroup label="HTML 类型">
        <w.ButtonGroup
          value={(values.htmlType as string) ?? 'button'}
          onChange={(v) => onChange('htmlType', v)}
          options={[
            { label: '按钮', value: 'button' },
            { label: '提交', value: 'submit' },
            { label: '重置', value: 'reset' },
          ]}
        />
      </FieldGroup>
      <FieldGroup label="图标">
        <w.Input value={(values.icon as string) ?? ''} onChange={(v) => onChange('icon', v)} placeholder="如: SearchOutlined" />
      </FieldGroup>
      <FieldGroup label="文字内容">
        <w.Input value={(values.children as string) ?? ''} onChange={(v) => onChange('children', v)} placeholder="按钮文字" />
      </FieldGroup>
      <InlineField label="宽度铺满">
        <w.Checkbox checked={!!values.block} onChange={(v) => onChange('block', v)} />
      </InlineField>
      <InlineField label="危险">
        <w.Checkbox checked={!!values.danger} onChange={(v) => onChange('danger', v)} />
      </InlineField>
      <InlineField label="加载中">
        <w.Checkbox checked={!!values.loading} onChange={(v) => onChange('loading', v)} />
      </InlineField>
    </>
  )
}
