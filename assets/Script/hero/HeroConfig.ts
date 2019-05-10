import { ClothesConfig, ArmsConfig } from "../utils/tool";


/**
 * 根据武器获得武器动画
 * @param arms 
 * @returns {string}
 */
export function get_arms(arms:ArmsConfig):string {
    let ret = null;
    if (arms && arms.name == '龙麟') ret = '001';
    else if (arms && arms.name == '青玉镇邪杖') ret = '002';
    return ret;
}


/**
 * 根据衣服获得身体动画
 * @param clothes 
 * @returns {string}
 */
export function get_body(clothes:ClothesConfig):string {
    let body = '001';
    if (clothes && clothes.name == '守护之铠') body = '002';
    return body;
}