// import pinyin from 'pinyin';

/**
 * 过滤掉字符串中的emoji表情(如果数据库编码为utf8，最多能存储3个字节，需设置为utf8mb4，否则前端需过滤掉 ))
 * @param {*} str 字符串
 * @returns 过滤后的字符串
 */
export function emoji2Str(str) {
  return unescape(escape(str).replace(/%uD.{3}/g, ''));
}

// url中特殊字符编码
export function encodeStr(str) {
  return str;
}
// url中特殊字符解码
export function decodeStr(str) {
  return str;
}

/**
 * @description  转义htm标签
 * @param {*} str 字符串
 * @returns 转以后的字符串
 */
export function escapeHTML(str) {
  if (str.length === 0) return '';
  return `${str}`
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/ /g, '&nbsp;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;');
}

/**
 * @description  反转义htm标签
 * @param {*} str 字符串
 * @returns 转以后的字符串
 */
export function unescapeHTML(str) {
  if (str.length === 0) return '';
  return `${str}`
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');
}

/**
 * 获取文本拼音的第一个字母并大写
 * @param word
 */
export const getFirstCapitalizedLetter = (word) => {
  if (word) {
    return word.slice(0, 1);
    // return pinyin(word, { style: pinyin.STYLE_NORMAL, heteronym: false })?.[0][0].slice(0, 1).toLocaleUpperCase();
  }
  return null;
};
