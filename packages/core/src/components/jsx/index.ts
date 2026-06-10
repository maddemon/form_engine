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
 *
 * 形态约束（与 JsxRender 的求值逻辑保持一致）：
 * 1) 顶层必须声明 `function Component() {...}`，JsxRender 走 `fn(...)` 后取 `typeof Component` 路径
 * 2) 必须用 React.useState 维持状态（避免直接 return 元素 → DirectElementComponent 闭包捕获问题）
 * 3) AntCard / AntButton 通过 jsxScope 注入为 new Function 形参
 */
const DEFAULT_COMPILED_CODE = `function Component() {
  var _s = React.useState(0);
  var count = _s[0];
  var setCount = _s[1];
  return React.createElement('div', { style: { padding: 16 } },
    React.createElement('h1', null, 'Hello World'),
    React.createElement(AntCard, { title: 'State Demo' },
      React.createElement('p', null, 'Count: ', count),
      React.createElement(AntButton, { onClick: function () { setCount(count + 1); } }, 'Increment')
    ),
  );
}
return typeof Component === 'function' ? Component : null;`

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
