/**
 * Created by jiang.weixing on 2018/1/3.
 * 字符串转base64
 */

export default function (data) {
  if(!data){return;}
  var toBase64Table = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  var base64Pad = '=';
  var result = '';
  var length = data.length;
  var i;

  for (i = 0; i < (length - 2); i += 3) {
    result += toBase64Table[data.charCodeAt(i) >> 2];
    result += toBase64Table[((data.charCodeAt(i) & 0x03) << 4) + (data.charCodeAt(i + 1) >> 4)];
    result += toBase64Table[((data.charCodeAt(i + 1) & 0x0f) << 2) + (data.charCodeAt(i + 2) >> 6)];
    result += toBase64Table[data.charCodeAt(i + 2) & 0x3f];
  }

  // Convert the remaining 1 or 2 bytes, pad out to 4 characters.

  if (length % 3) {
    i = length - (length % 3);
    result += toBase64Table[data.charCodeAt(i) >> 2];
    if ((length % 3) == 2) {
      result += toBase64Table[((data.charCodeAt(i) & 0x03) << 4) + (data.charCodeAt(i + 1) >> 4)];
      result += toBase64Table[(data.charCodeAt(i + 1) & 0x0f) << 2];
      result += base64Pad;
    } else {
      result += toBase64Table[(data.charCodeAt(i) & 0x03) << 4];
      result += base64Pad + base64Pad;
    }
  }
  return result;
}
