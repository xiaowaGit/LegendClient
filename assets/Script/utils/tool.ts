
/*
    常用工具函数
*/

export interface Point {
    x:number;
    y:number;
}

export interface EffectConfig {
    name:string;
    hurt_one_blood?:boolean;///单次气血伤害(伤害值由effect决定)
    hurt_one_magic?:boolean;///单次魔法伤害(伤害值由effect决定)
    add_one_blood?:number;///单次气血增加
    add_one_magic?:number;///单次魔法增加
    hurt_continue_blood?:boolean;///持续气血伤害(每秒)(伤害值由effect决定)
    hurt_continue_magic?:boolean;///持续魔法伤害(每秒)(伤害值由effect决定)
    add_continue_blood?:number;///持续气血增加(每秒)
    add_continue_magic?:number;///持续魔法增加(每秒)
    continue_time?:number;////持续时间(秒)
    add_one_physics_attack?:number;///单次物理攻击增加
    add_one_magic_attack?:number;///单次魔法攻击增加
    add_one_physics_defense?:number;////单次物理防御增加
    add_one_magic_defense?:number;/////单次魔法防御增加
    minus_one_physics_attack?:number;///单次物理攻击减少
    minus_one_magic_attack?:number;///单次魔法攻击减少
    minus_one_physics_defense?:number;////单次物理防御减少
    minus_one_magic_defense?:number;/////单次魔法防御减少
    attack_l:number;////效果攻击距离
    range_l:number;////效果攻击范围
    type:'attack'|'assist'|'hinder';//效果类型（攻击、辅助、障碍）
}

export interface PetConfig {
    name:string;
    blood:number;//气血量
    magic:number;//魔法量
    blood_limit:number;//气血上限
    magic_limit:number;//魔法上限
    physics_attack:number;//物理攻击
    magic_attack:number;//魔法攻击
    physics_defense:number;//物理防御
    magic_defense:number;//魔法防御
    life_time:number;//存活秒数
    cd_time:number;//攻击CD时间
}

export interface ArmsConfig {
    name:string;
    physics_attack:number;//物理攻击增量
    magic_attack:number;//魔法攻击增量
    has_blood:number;//需要气血量
    has_magic:number;//需要魔法量
    arms_type:'knife'|'staff'|'stick';//武器类别(刀，法杖，棍)
}

export interface ClothesConfig {
    name:string;
    blood_limit:number;//气血增量
    magic_limit:number;//魔法增量
    physics_defense:number;//物理防御
    magic_defense:number;//魔法防御
    has_physics_attack:number;//需要物理攻击
    has_magic_attack:number;//需要魔法攻击
}

export interface HelmetConfig {
    name:string;
    blood_limit:number;//气血增量
    magic_limit:number;//魔法增量
    physics_defense:number;//物理防御
    magic_defense:number;//魔法防御
    has_physics_attack:number;//需要物理攻击
    has_magic_attack:number;//需要魔法攻击
}

export interface JewelryConfig {
    name:string;
    blood_limit:number;//气血增量
    magic_limit:number;//魔法增量
    physics_attack:number;//物理攻击增加
    magic_attack:number;//魔法攻击增加
    physics_defense:number;//物理防御
    magic_defense:number;//魔法防御
    speed:number;//速度增加
    has_physics_attack:number;//需要物理攻击
    has_magic_attack:number;//需要魔法攻击
}

export interface NecklaceConfig {
    name:string;
    blood_limit:number;//气血增量
    magic_limit:number;//魔法增量
    physics_attack:number;//物理攻击增加
    magic_attack:number;//魔法攻击增加
    physics_defense:number;//物理防御
    magic_defense:number;//魔法防御
    speed:number;//速度增加
    has_physics_attack:number;//需要物理攻击
    has_magic_attack:number;//需要魔法攻击
}

export interface ShoesConfig {
    name:string;
    blood_limit:number;//气血增量
    magic_limit:number;//魔法增量
    speed:number;//速度增量
    physics_defense:number;//物理防御
    magic_defense:number;//魔法防御
    has_physics_attack:number;//需要物理攻击
    has_magic_attack:number;//需要魔法攻击
}

export interface ResInfo {
    name:string;
    index:number;
    type:'equipment'|'drug'|'skill_book';
    config:{};
}

export interface DrugConfig {
    name:string;
    blood:number;///气血增加
    magic:number;///魔法增加
    effect_name:string;////产生effect的名字，没有为空串
    explain:string;////effect说明，没有就是空串
    pet_config?:PetConfig;////如果是召唤宠物有此配置
    effect_config?:EffectConfig;////effect的配置
}

export interface SkillBookConfig {
    name:string;
    blood:number;///气血增加
    magic:number;///魔法增加
    consume_magic:number;///消耗魔法
    cd:number;//CD秒数
    effect_name:string;////产生effect的名字，没有为空串
    explain:string;////effect说明，没有就是空串
    arms_limit:'knife'|'staff'|'stick';////释放效果的武器类型限制
    pet_config?:PetConfig;////如果是召唤宠物有此配置
    effect_config?:EffectConfig;////effect的配置
}

export interface ResFloorInfo {
    name:string;
    point:Point;
    index:number;
}

export interface PlayerInfo {
    name:string;
    blood:number;
    blood_limit:number;
    magic:number;
    magic_limit:number;
    physics_attack:number;
    magic_attack:number;
    physics_defense:number;
    magic_defense:number;
    point:Point;
    speed:number;
    is_die:boolean;
}

export interface Player {
    arms:ResInfo; //武器
    helmet:ResInfo; //头盔
    clothes:ResInfo; //衣服
    shoes:ResInfo; //鞋子
    jewelry:ResInfo; //首饰
    necklace:ResInfo; //项链
    player:PlayerInfo;
    config_name:string;
}

export function get_l(pot1:Point,pot2:Point):number {
    let x0:number = pot1.x;
    let y0:number = pot1.y;
    let x1:number = pot2.x;
    let y1:number = pot2.y;
    return Math.sqrt((x0 - x1)*(x0 - x1) + (y0 - y1)*(y0 - y1));
}

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export interface GameInfo {
    player:Player;
    other_players:Player[];
    ress:ResFloorInfo[];
}

export interface PP {
    r_t_l:number,/// 技能实际攻击最长距离
    s_l:number,/// small 指尖像素距离
    s_p:Point,/// small 指尖单位向量
    s_r:number,/// 距离比例 ratio
    r_l:number,/// 精确攻击格子距离
    r_p_p:Point,// 精确格子向量(不是单位向量)用来换算成像素
    r_g_p:Point,// 目标点格子向量(不是单位向量)就是实际攻击的坐标
}


/*
    4  5  6
    3 dir 7
    2  1  8
*/
export function compute_dir(e_pot:Point,o_pot:Point):number {
    let x:number = e_pot.x - o_pot.x;
    let y:number = e_pot.y - o_pot.y;
    let l:number = Math.sqrt(x*x + y*y);
    let dir:number;
    function change (r:number){
        return r/Math.PI*180;
    }
    if (x >= 0 && y >= 0) {
        let a:number = Math.acos(x/l);
        a = change(a);
        if (a <= 15) dir = 7;
        else if (a > 22.5 && a < 67.5) dir = 6;
        else dir = 5;
    }else if (x <= 0 && y >= 0) {
        let a:number = Math.acos(-x/l);
        a = change(a);
        if (a <= 15) dir = 3;
        else if (a > 22.5 && a < 67.5) dir = 4;
        else dir = 5;
    }else if (x <= 0 && y <= 0) {
        let a:number = Math.acos(-x/l);
        a = change(a);
        if (a <= 15) dir = 3;
        else if (a > 22.5 && a < 67.5) dir = 2;
        else dir = 1;
    }else if (x >= 0 && y <= 0) {
        let a:number = Math.acos(x/l);
        a = change(a);
        if (a <= 15) dir = 7;
        else if (a > 22.5 && a < 67.5) dir = 8;
        else dir = 1;
    }
    return dir;
}


/*
    4  5  6
    3 dir 7
    2  1  8
    方向转换到向量
*/
export function dir_to_p(dir:number):Point {
    if (dir == 1) return {x:0,y:-1};
    else if (dir == 2) return {x:-1,y:-1};
    else if (dir == 3) return {x:-1,y:0};
    else if (dir == 4) return {x:-1,y:1};
    else if (dir == 5) return {x:0,y:1};
    else if (dir == 6) return {x:1,y:1};
    else if (dir == 7) return {x:1,y:0};
    else if (dir == 8) return {x:1,y:-1};
}

/*
    沿向量方向的点列表
*/
export function p_to_pots(o_pot:Point,p:Point,l:number):Point[] {
    let pots:Point[] = [];
    let c_pot:Point = {x:o_pot.x,y:o_pot.y};
    for (let i = 0; i < l; i++) {
        c_pot.x += p.x;
        c_pot.y += p.y;
        pots.push({x:c_pot.x,y:c_pot.y});
    }
    return pots;
}