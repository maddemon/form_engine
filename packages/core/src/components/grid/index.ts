import type { BaseLayoutComponentProps, ComponentRegistration } from '../../types/component';

export interface GridProps extends BaseLayoutComponentProps {
  colSpans?: Array<{ id: string; span: number }>
  gap?: number | [number, number]
  variant?: 'grid' | 'flex'
}

export { default as Props } from './Props';

export const meta: ComponentRegistration = {
  label: '栅格布局',
  category: 'container',
  icon: 'Columns',
  defaultProps: {
    componentProps: {
      colSpans: [
        { id: 'col_1', span: 12 },
        { id: 'col_2', span: 12 },
      ],
      gap: 16,
    },
  },
  eventDeclarations: [],
}
