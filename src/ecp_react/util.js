import {loadjs, loadcss, getAbsolutePos, getPopPos}  from "./gaf/utils.js"
export {loadjs, loadcss, getAbsolutePos, getPopPos}


const hasOwn = {}.hasOwnProperty;
/** 
 * 生成Class 
 *  Util.className(arg1, arg1, ...)
 * 三种用法：
 * arg 是string，直接复制到结果class中
 * arg 数组，展开数组的元素复制到class中。
 * arg 对象，格式为：{ cls1: bool, cls2:bool, ...} 把clsN的为true的复制到class中
 */
export function classNames () {
	var classes = [];

	for (var i = 0; i < arguments.length; i++) {
		var arg = arguments[i];
		if (!arg) continue;

		var argType = typeof arg;

		if (argType === 'string' || argType === 'number') {
			classes.push(arg);
		} else if (Array.isArray(arg)) {
			classes.push(classNames.apply(null, arg));
		} else if (argType === 'object') {
			for (var key in arg) {
				if (hasOwn.call(arg, key) && arg[key]) {
					classes.push(key);
				}
			}
		}
	}
	return classes.join(' ');
}

const exp={loadjs, loadcss, getAbsolutePos, getPopPos, classNames}
export default exp
