import type { LocalePack } from '../types'

export const adapter: LocalePack['adapter'] = {
  common: {
    placeholder: {
      input: '请填写',
      select: '请选择',
      date: '请选择日期',
      time: '请选择时间',
      number: '请输入数值',
      search: '搜索...',
    },
  },
  antd: {
    subForm: {
      empty: '暂无数据',
      operation: '操作',
      delete: '删除',
      addRow: '+ 添加行',
    },
    upload: {
      button: '上传文件',
    },
  },
  mobile: {
    confirm: '确定',
    cancel: '取消',
    dateRangeStart: '开始',
    dateRangeEnd: '结束',
    subForm: {
      empty: '暂无数据',
      delete: '删除',
      addRow: '+ 添加行',
    },
    image: {
      empty: '无图片',
    },
  },
}