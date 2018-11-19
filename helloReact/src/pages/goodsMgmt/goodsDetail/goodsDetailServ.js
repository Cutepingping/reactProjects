// 调用接口配置文件
import { request } from 'config/request'
// 定义接口
export async function getGoods(params) {
    return request({
        url: '/api/goods',
        method: 'GET',
        data: params
    });
};