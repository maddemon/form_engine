import { useStyle } from '../../styles'

export const DefaultIcon: React.FC = () => {
  const { token } = useStyle()
  return <span style={{ fontSize: token('fontSizeSm'), color: 'var(--fe-text-muted)' }}>⬜</span>
}
