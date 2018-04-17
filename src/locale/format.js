import { hasOwn } from 'element-ui/src/utils/util';
// %{} | {}
const RE_NARGS = /(%|)\{([0-9a-zA-Z_]+)\}/g;
/**
 *  String format template
 *  - Inspired:
 *    https://github.com/Matt-Esch/string-template/index.js
 */
// 为了匹配如下例子
// e.g. t('el.transfer.noCheckedFormat',{total:12}) : '共 {total} 项' --> '共 12 项'
//      t('el.transfer.hasCheckedFormat',[1,12]) : '已选 {checked}/{total} 项'-->'已选 1/12 项'
export default function(Vue) {

  /**
     * template
     *
     * @param {String} string
     * @param {Array} ...args
     * @return {String}
     */

  function template(string, ...args) {
    if (args.length === 1 && typeof args[0] === 'object') {
      args = args[0];
    }

    if (!args || !args.hasOwnProperty) {
      args = {};
    }
    // p1:% p2:val ,若匹配不上静默返回原内容
    return string.replace(RE_NARGS, (match, prefix, i, index) => {
      let result;
      // {{val}}不进行替换,直接返回p2
      if (string[index - 1] === '{' &&
                string[index + match.length] === '}') {
        return i;
      } else {
        // 在传入格外内容中寻找key对象的value
        result = hasOwn(args, i) ? args[i] : null;
        if (result === null || result === undefined) {
          return '';
        }
        return result;
      }
    });
  }

  return template;
}
