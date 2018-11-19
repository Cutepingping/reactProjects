//调用接口配置文件
import { request } from 'config/request'
// 定义接口
export async function getMember(params) {
    return request({
        url: 'yundt/mgmt/item/list-by-page',
        method: 'GET',
        data: params
    });
};