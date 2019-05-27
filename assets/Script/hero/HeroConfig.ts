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
    else if (arms && arms.name == '齐眉棍') ret = '003';
    else if (arms && arms.name == '工布') ret = '004';
    else if (arms && arms.name == '灵山炼气杖') ret = '005';
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
    else if (clothes && clothes.name == '镜芒铠') body = '003';
    else if (clothes && clothes.name == '圣痕之铠') body = '004';
    else if (clothes && clothes.name == '奇迹庇佑') body = '005';
    return body;
}

export function get_monster_body(config_name:string):string {
    let body = '001';
    if (config_name == '麒麟')body = '002';
    else if (config_name == '哮天犬')body = '003';
    else if (config_name == '抓猫')body = '004';
    else if (config_name == '鸡')body = '005';
    else if (config_name == '稻草人')body = '006';
    else if (config_name == '钉耙猫')body = '007';
    else if (config_name == '绿野人')body = '008';
    else if (config_name == '刀骷髅')body = '009';
    return body;
}