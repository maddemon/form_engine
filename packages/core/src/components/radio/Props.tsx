import { FieldItem, OptionRender, PropsRenderProps } from '../../propRenders'

export default function RadioPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <FieldItem label="选项">
        <OptionRender value={values.options as any[]} onChange={(v) => onChange('options', v)} />
      </FieldItem>
      <FieldItem label="选项类型">
        <w.ButtonGroup
          value={(values.optionType as string) ?? 'default'}
          onChange={(v) => onChange('optionType', v)}
          options={[
            { label: '默认', value: 'default' },
            { label: '按钮', value: 'button' },
          ]}
        />
      </FieldItem>
      {values.optionType === 'button' && (
        <FieldItem label="按钮样式">
          <w.ButtonGroup
            value={(values.buttonStyle as string) ?? 'outline'}
            onChange={(v) => onChange('buttonStyle', v)}
            options={[
              { label: '边框', value: 'outline' },
              { label: '实心', value: 'solid' },
            ]}
          />
        </FieldItem>
      )}
      <FieldItem label="排列方向">
        <w.ButtonGroup
          value={(values.direction as string) ?? 'horizontal'}
          onChange={(v) => onChange('direction', v)}
          options={[
            { label: '横向', value: 'horizontal' },
            { label: '竖向', value: 'vertical' },
          ]}
        />
      </FieldItem>
    </>
  )
}
