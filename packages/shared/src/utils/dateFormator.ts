/**
 * @file
 */
/**
 * 日期格式化
 * @author ksky521 <ksky521@gmail.com>
 * @function dateFormat
 * @param {Date} d - date 对象
 * @param {string} [pattern = 'yyyy-MM-dd'] - 字符串
 * @return {string} 处理后的字符串
 * @example
 *    var d = new Date();
 *  dateFormat(d," yyyy年M月d日\n yyyy-MM-dd\n MM-dd-yy\n yyyy-MM-dd hh:mm:ss")
 *  //2018年11月10日\n 2018-01-01\n 01-01-18\n 2018-11-12 12:01:02
 * @todo 参数按照变化程度从左到右排列，利于柯里化
 */
export function toLocaleDatetime(d: Date, pattern = 'yyyy-MM-dd') {
    if (!(d instanceof Date)) {
        // eslint-disable-next-line
        throw TypeError('toLocaleDatetime can only handle Date');
    }

    let y = d.getFullYear().toString();
    let o: Record<string, any> = {
        M: d.getMonth() + 1, // month
        d: d.getDate(), // day
        h: d.getHours(), // hour
        m: d.getMinutes(), // minute
        s: d.getSeconds() // second
    };
    // eslint-disable-next-line
    pattern = pattern.replace(/(y+)/gi, (a, b) => y.substr(4 - Math.min(4, b.length)));
    Object.keys(o).forEach(i => {
        // eslint-disable-next-line
        pattern = pattern.replace(
            new RegExp('(' + i + '+)', 'g'),
            // eslint-disable-next-line
            (a, b) => (o[i] < 10 && b.length > 1 ? '0' + o[i] : o[i])
        );
    });
    return pattern;
}
