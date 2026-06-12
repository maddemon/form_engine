import type { LocalePack } from '../types'

export const validation: LocalePack['validation'] = {
  required: '必填',
  typeError: {
    string: '类型错误：期望 string',
    number: '类型错误：期望 number',
    boolean: '类型错误：期望 boolean',
  },
  email: '邮箱格式错误',
  url: 'URL 格式错误',
  phone: '手机号格式错误',
  pattern: '格式不匹配',
}