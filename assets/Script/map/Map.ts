import { Point, get_l } from "../utils/tool";
import { GameUtils } from "../utils/GameUtils";

const {ccclass, property} = cc._decorator;

let LOAD_MAP_L:number = 1000; // 加载地图检测距离
let UNLOAD_MAP_L:number = 2000; // 加载地图检测距离

let B_MAP_W:number = 13120;
let B_MAP_H:number = 7041;

let MAP_SUM:number = 112; // 图块总数
let MAP_START_INDEX:number = 1; //图块起始编号

/**
 * 获得图块尺寸
 * @param map_index 
 */
function get_map_size(map_index) {
    let w,h;
    if (map_index % 14 == 0)w = 640;
    else w = 960;
    if (map_index / 14 > 7)h = 321;
    else h = 960;
    return {weight:w,height:h};
}

/**
 * 获得图块的中心点坐标
 * @param map_index 
 */
function get_map_centre(map_index) {
    let x,y;
    let size = get_map_size(map_index);
    x = size.weight/2;
    y = size.height/2;
    let mod = map_index % 14;
    if (mod == 0) x += 13 * 960;
    else x += (mod-1) * 960;
    let dis = map_index / 14;
    if (dis > 7) y += 7 * 960;
    else y += (Math.ceil(dis) - 1)* 960;
    y = B_MAP_H - y;
    return {x,y};
}

@ccclass
export default class Map extends cc.Component {

    @property
    map_type:'floor'|'mask' = 'floor';

    private is_load:boolean = false;
    private load_c_map:number = null; /// 正在加载的图块
    private load_e_dic:{} = {}; /// 已经加载完成的图块
    private load_maps:number[] = []; /// 待加载地图图块的顺序数组
    private map_s:string = '';
    private map_e:string = '';
    private on_load:boolean = false;
    private _tick:number = 0;

    // onLoad () {}

    start () {
        if (this.map_type == 'floor') {
            this.map_s = 'map_cell/images/biqi_';
            this.map_e = '.jpg';
        }
        else if (this.map_type == 'mask') {
            this.map_s = 'mask_cell/images/biqi_mask_';
            this.map_e = '.png';
        }
        this.map_e = "";
        this.on_load = true;
    }

    del_map(map:number) {
        for (let i = 0; i < this.load_maps.length; i++) {
            const element = this.load_maps[i];
            if (element == map) {
                this.load_maps.splice(i,1);
                return;
            }
        }
    }

    /***
     *  检查图块是否已经处理或者正在处理或者已加入处理列表
     */
    check_map(map:number) {
        if (map == this.load_c_map) return true;
        if (this.load_e_dic[map]) return true;
        for (let i = 0; i < this.load_maps.length; i++) {
            const element = this.load_maps[i];
            if (element == map) return true;
        }
        return false;
    }

    get_load_maps() {
        let pot:Point = GameUtils.self_player.get_pot();
        let p_pot:Point = {x:pot.x*GameUtils.map_scale,y:pot.y*GameUtils.map_scale};
        for (let index = MAP_START_INDEX; index <= MAP_SUM; index++) {
            let map_pot:Point = get_map_centre(index);
            if (get_l(p_pot,map_pot) < LOAD_MAP_L) {
                if(this.check_map(index) == false)this.load_maps.push(index);
            }
        }
    }

    get_map_name() {
        let index = this.load_c_map;
        if (index < 10) return this.map_s + '0' +index + this.map_e;
        else return this.map_s + index + this.map_e;
    }

    /**
     * 开始加载地图
     */
    start_load_c_map(c_index:number) {
        if (this.is_load) return;
        this.load_c_map = c_index;
        let name:string = this.get_map_name();
        console.log("xiaowa ==== start load :",name);
        let map_pot:Point = get_map_centre(this.load_c_map);
        let map_size:{weight:number,height:number} = get_map_size(this.load_c_map);
        cc.loader.loadRes(name,cc.SpriteFrame,function(err,spriteFrame){
            if (err) {
                cc.error(err.message || err);
                return;
            }
            let node:cc.Node = new cc.Node();
            node.addComponent(cc.Sprite);
            let spr:cc.Sprite = node.getComponent(cc.Sprite);
            spr.spriteFrame = spriteFrame;
            spr.trim = false;
            spr.sizeMode = cc.Sprite.SizeMode.RAW;
            spr.node.setAnchorPoint(0.5,0.5);
            spr.node.setPosition(map_pot.x,map_pot.y);
            // console.log("xiaowa ==== index:",this.load_c_map,"map_pot:",map_pot.x,map_pot.y)
            spr.node.parent = this.node;
            this.load_e_dic[this.load_c_map] = {name,spr};
            this.del_map(this.load_c_map);
            this.load_c_map = null;
            this.is_load = false;
        }.bind(this));
        this.is_load = true;
    }

    load_map() {
        let pot:Point = GameUtils.self_player.get_pot();
        let p_pot:Point = {x:pot.x*GameUtils.map_scale,y:pot.y*GameUtils.map_scale};
        let c_index:number,c_l:number;
        this.load_maps.forEach(index => {
            let map_pot:Point = get_map_centre(index);
            let l:number = get_l(p_pot,map_pot);
            if (!c_index || c_l > l) {
                c_index = index;
                c_l = l;
            }
        });
        if (c_index) {
            this.start_load_c_map(c_index);
        }
        // let d_index:number,d_l:number;
        for (const index in this.load_e_dic) {
            if (this.load_e_dic.hasOwnProperty(index)) {
                const obj:{name:string,spr:cc.Sprite} = this.load_e_dic[index];
                let map_pot:Point = get_map_centre(~~index);
                let l:number = get_l(p_pot,map_pot);
                if (l > UNLOAD_MAP_L) {
                    obj.spr.node.removeFromParent();
                    cc.loader.releaseRes(obj.name, cc.SpriteFrame);
                    cc.loader.releaseRes(obj.name, cc.Texture2D);
                    delete this.load_e_dic[index];
                }
            }
        }
    }

    update (dt) {
        this._tick ++;
        if (this._tick >= 60) {
            this._tick = 0;
            this.get_load_maps();
            if (this.load_c_map == null)this.load_map();
        }
    }
}
