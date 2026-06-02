import { FieldGroup, RowField } from '../../propRenders/shared'
import type { PropsRenderProps } from '../../propRenders/types'

export default function TabsPropsRender({ widgets: w, values, onChange }: PropsRenderProps) {
  return (
    <>
      <FieldGroup label="样式类型">
        <w.ButtonGroup
          value={(values.type as string) ?? 'line'}
          onChange={(v) => onChange('type', v)}
          options={[
            { label: '线框', value: 'line' },
            { label: '卡片', value: 'card' },
            { label: '可编辑卡片', value: 'editable-card' },
          ]}
        />
      </FieldGroup>
      <FieldGroup label="尺寸">
        <w.ButtonGroup
          value={(values.size as string) ?? 'middle'}
          onChange={(v) => onChange('size', v)}
          options={[
            { label: '大', value: 'large' },
            { label: '中', value: 'middle' },
            { label: '小', value: 'small' },
          ]}
        />
      </FieldGroup>
      <FieldGroup label="标签位置">
        <w.ButtonGroup
          value={(values.tabPosition as string) ?? 'top'}
          onChange={(v) => onChange('tabPosition', v)}
          options={[
            { label: '顶部', value: 'top' },
            { label: '右侧', value: 'right' },
            { label: '底部', value: 'bottom' },
            { label: '左侧', value: 'left' },
          ]}
        />
      </FieldGroup>
      <RowField label="居中展示">
        <w.Switch checked={!!values.centered} onChange={(v) => onChange('centered', v)} />
      </RowField>
    </>
  )
}
