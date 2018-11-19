
//数字格式化
export function numberFormat(number, precision = 2, needPrefix = false, prefix = '￥') {
  // 是否需要币种标识
  let displayPrefix = needPrefix ? prefix : '';
  // 去除特殊字符
  number = String(number).replace(/(^\s*)|(\s*$)/g, "");
  if(isNaN(number) || !number){
    return displayPrefix + parseFloat(0).toFixed(precision);
  } else {
    number = parseFloat(number).toFixed(precision)
  }
  // 转换为字符串格式，方便下步操作
  number = number + '';
  if (number) {
    // 数据截取，分割成整数、小数
    let nums = number.split('.');
    let integer = nums[0], decimals = nums[1], isDecimals = false;
    // 判断是否为负数，并做额外处理（获取不包含负数的数位、并设置负数开关）
    if (integer.indexOf('-') > -1) {
      integer = integer.slice(integer.indexOf('-') + 1);
      isDecimals = true;
    }
    // 获取当前整数中，为3的倍数的数位 --- 如：1234 -> 234
    let num = integer.slice(integer.length % 3);
    // 获取当前整数中，不为3的倍数的数位 --- 如：1234 -> 1
    let numBegin = integer.slice(0, integer.length % 3);
    // 格式处理
    number = (isDecimals ? '-' : '') + numBegin + ((numBegin && num) ? ',' : '') + (num ? num.match(/\d{3}/g).join(',') : '') + (decimals ? '.' + decimals : '');
  }
  return displayPrefix + number;
}
