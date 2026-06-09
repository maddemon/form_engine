import type { BaseComponentProps, ComponentRegistration } from '../../types/component'

export interface JsxProps extends BaseComponentProps {
  code?: string
  compiledCode?: string
}

// 可从 props 解构出的稳定项：value、onChange、scene；
// 其余 scope 键（AntCard/AntButton/AntmCard/...）以及用户在 PropertyPanel 配置的 componentProps
// 也都会被平铺到 props 上，按需解构即可。
const DEFAULT_CODE = `function Component({ AntCard, AntButton }) {
  const [count, setCount] = React.useState(0);
  const [text, setText] = React.useState("");
  return (
    <div style={{ padding: 16 }}>
      <h1>Hello World</h1>
      <AntCard title="State Demo">
        <p>Count: {count}</p>
        <AntButton onClick={() => setCount(c => c + 1)}>
          Increment
        </AntButton>
      </AntCard>
    </div>
  );
}`

/**
 * 同步预编译默认 compiledCode：直接把 JSX 转写成 React.createElement 形式，
 * 拖入画布时即可直接 new Function 执行并渲染，无需 babel。
 */
const DEFAULT_COMPILED_CODE = `return React.createElement('div', { style: { padding: 16 } },
  React.createElement('h1', null, 'Hello World'),
  React.createElement(AntCard, { title: 'State Demo' },
    React.createElement('p', null, 'Count: 0'),
    React.createElement(AntButton, { onClick: function () { count = count + 1; } }, 'Increment')
  ),
);`

export const meta: ComponentRegistration = {
  label: 'component.jsx.label',
  category: 'display',
  icon: 'Code',
  defaultProps: () => ({
    componentProps: {
      code: DEFAULT_CODE,
      compiledCode: DEFAULT_COMPILED_CODE,
    },
  }),
  eventDeclarations: [],
}
