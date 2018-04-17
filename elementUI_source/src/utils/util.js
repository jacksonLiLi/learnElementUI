const hasOwnProperty = Object.prototype.hasOwnProperty;
// 空函数
export function noop() {};
// 当前对象自有属性
export function hasOwn(obj, key) {
    return hasOwnProperty.call(obj, key);
};
// 合并两对象
function extend(to, _from) {
    for (let key in _from) {
        to[key] = _from[key];
    }
    return to;
};
// 数组转空对象
export function toObject(arr) {
    var res = {};
    for (let i = 0; i < arr.length; i++) {
        if (arr[i]) {
            extend(res, arr[i]);
        }
    }
    return res;
};
// 根据给定属性名查找对象属性值如：getValueByPath(obj,a.b.c) 返回 obj.a.b.c的值。
export const getValueByPath = function(object, prop) {
    prop = prop || '';
    const paths = prop.split('.');
    let current = object;
    let result = null;
    for (let i = 0, j = paths.length; i < j; i++) {
        const path = paths[i];
        if (!current) break;

        if (i === j - 1) {
            result = current[path];
            break;
        }
        current = current[path];
    }
    return result;
};
// 根据给定属性名返回对应属性值，键值，对象。根据配置静默不存在属性还是抛出异常。
export function getPropByPath(obj, path, strict) {
    let tempObj = obj;
    // 每个单词添加.
    path = path.replace(/\[(\w+)\]/g, '.$1');
    path = path.replace(/^\./, '');

    let keyArr = path.split('.');
    let i = 0;
    for (let len = keyArr.length; i < len - 1; ++i) {
        if (!tempObj && !strict) break;
        let key = keyArr[i];
        if (key in tempObj) {
            tempObj = tempObj[key];
        } else {
            if (strict) {
                throw new Error('please transfer a valid prop path to form item!');
            }
            break;
        }
    }
    return {
        o: tempObj,
        k: keyArr[i],
        v: tempObj ? tempObj[keyArr[i]] : null
    };
};
// 生成随机数，用于组成domId
export const generateId = function() {
    return Math.floor(Math.random() * 10000);
};
// 判断两数组是否值相同。
export const valueEquals = (a, b) => {
    // see: https://stackoverflow.com/questions/3115982/how-to-check-if-two-arrays-are-equal-with-javascript
    if (a === b) return true;
    if (!(a instanceof Array)) return false;
    if (!(b instanceof Array)) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i !== a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
};