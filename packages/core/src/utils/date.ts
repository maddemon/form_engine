/** 根据 format 字符串自动判断是否包含时间部分 */
export function isTimeFormat(fmt: string): boolean {
  return /\b(H{1,2}|m{1,2}|s{1,2})\b/.test(fmt)
}
