export interface CollapseProps {
  activeKey?: string | string[]
  defaultActiveKey?: string | string[]
  onChange?: (key: string | string[]) => void
  accordion?: boolean
  ghost?: boolean
  style?: React.CSSProperties
  className?: string
  id?: string
  children?: React.ReactNode
}
