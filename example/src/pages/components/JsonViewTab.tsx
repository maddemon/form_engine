import { PropertyPanelTabContentProps } from '@form-engine/core'
import { Card, Typography } from 'antd'

// ---------- 自定义属性面板 Tab：JSON 查看 ----------
const JsonViewTab: React.FC<PropertyPanelTabContentProps> = ({ field }) => {
  if (!field)
    return (
      <div style={{ padding: 16 }}>
        <Typography.Text type="secondary">Select a field</Typography.Text>
      </div>
    )
  return (
    <div style={{ padding: 8 }}>
      <Card title="Field Schema (JSON)" size="small">
        <pre style={{ maxHeight: 200, overflow: 'auto', fontSize: 12, lineHeight: 1.4 }}>
          {JSON.stringify(field, null, 2)}
        </pre>
      </Card>
    </div>
  )
}
export default JsonViewTab
