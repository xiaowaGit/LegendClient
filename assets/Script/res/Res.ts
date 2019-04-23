import { Point, get_l, ResInfo, sleep } from "../utils/tool";
import ResConfig from "./ResConfig";
import { GameUtils } from "../utils/GameUtils";

const {ccclass, property} = cc._decorator;

/*
    物品对象(背包及快捷栏 对象)
*/
@ccclass
export default class Res extends cc.Component {

    @property(cc.Sprite)
    res: cc.Sprite = null;

    @property(cc.SpriteAtlas)
    icon_atlas:cc.SpriteAtlas = null;

    @property(cc.SpriteAtlas)
    iconx1_atlas:cc.SpriteAtlas = null;

    private pinus: Pomelo;
    private type:'equipment'|'drug'|'skill_book' = null;
    private _res_data:ResInfo = null;
    private _index:number = null;
    private _init:boolean = false;
    private self_copy:Res = null;
    private is_copy:boolean = false;
    private pot_start:Point = null;
    private pot_end:Point = null;
    private pot_origin:cc.Vec2 = null;

    // onLoad () {}

    start () {
        let pinus = GameUtils.getInstance().pinus;
        this.pinus = pinus;
        this.res.node.on(cc.Node.EventType.TOUCH_START,this.touch_start,this);
        this.res.node.on(cc.Node.EventType.TOUCH_MOVE,this.touch_move,this);
        this.res.node.on(cc.Node.EventType.TOUCH_END,this.touch_end,this);
    }

    public init(res_data:ResInfo,index:number,is_copy:boolean = false) {
        this._res_data = res_data;
        this._index = index;
        this.type = res_data.type;
        this.is_copy = is_copy;
        let config:{spr:string,atlas:string} = ResConfig[res_data.name];
        if (config) {
            if (config.atlas == 'icon_atlas') {
                this.res.spriteFrame = this.icon_atlas.getSpriteFrame(config.spr);
            }else if (config.atlas == 'iconx1_atlas') {
                this.res.spriteFrame = this.iconx1_atlas.getSpriteFrame(config.spr);
            }
        }else{
            console.error("ERROR:物品<"+res_data.name+">没有可用的显示资源。");
        }
        this._init = true;
    }

    private change_z() {
        let self = this;
        let grids = GameUtils.bag_grids;
        let find_grid:cc.Sprite = null;
        grids.forEach(element => {
            if (element.node == self.node.parent) find_grid = element;
        });
        if (find_grid) {
            find_grid.node.zIndex = 100;
            grids.forEach(element => {
                if (element != find_grid) element.node.zIndex = 1;
            });
        }
    }

    public touch_start(event:cc.Event.EventTouch) {
        if (this._init) {
            let pot:cc.Vec2 = event.getLocation();
            this.pot_start = {x:pot.x,y:pot.y};
            this.pot_origin = pot;
            this.change_z();
        }
        event.stopPropagation();
    }

    public touch_move(event:cc.Event.EventTouch) {
        if (this._init && this.pot_origin) {
            let pot:cc.Vec2 = event.getLocation();
            if (!this.is_copy || (this.is_copy && get_l(this.pot_origin,pot) < 50)) {
                let c_pot:Point = {x:pot.x - this.pot_origin.x,y:pot.y - this.pot_origin.y};
                this.node.x += c_pot.x;
                this.node.y += c_pot.y;
            }
            this.pot_origin = pot;
        }
        event.stopPropagation();
    }

    public touch_end(event:cc.Event.EventTouch) {
        if (this._init) {
            let pot:cc.Vec2 = event.getLocation();
            this.pot_end = {x:pot.x,y:pot.y};
            if (this.is_copy == false && get_l(this.pot_start,this.pot_end) < 20) { // 显示详情面板
                let out:cc.Vec2 = new cc.Vec2();
                pot = GameUtils.ui_camera.getCameraToWorldPoint(pot,out);
                GameUtils.res_info_ui.show(this._res_data,out);
            }else if (this.is_copy == false && get_l(this.pot_start,this.pot_end) >= 20 && this._index != -1) { //装备物品或者设置快捷方式
                let out:cc.Vec2 = new cc.Vec2();
                pot = GameUtils.ui_camera.getCameraToWorldPoint(pot,out);
                let hurt_info = this.hurt(out);
                if (hurt_info.type == 'equipment') this.use_res();
                else if (hurt_info.type == 'quick') this.use_quick(hurt_info.spr);
                else if (hurt_info.type == 'grid') this.use_grid(hurt_info.index);
                this.node.x = 0;
                this.node.y = 0;
            }else if (this.is_copy) { //这就要使用技能了

            }
        }
        event.stopPropagation();
    }

    private hurt(wrold_pot:cc.Vec2):{spr:cc.Sprite,type:'equipment'|'quick'|'grid'|null,index?:number} {
        function is_hurt(wrold_pot:cc.Vec2,spr:cc.Sprite,str:string):boolean {
            let local_pot:cc.Vec2 = spr.node.convertToNodeSpace(wrold_pot);
            // console.log("local_pot:",local_pot,"wrold_pot:",wrold_pot,"str:",str);
            let l:number = 58;
            if (local_pot.x > 0 && local_pot.x < l && local_pot.y > 0 && local_pot.y < l) {
                return true;
            }
            return false;
        }
        if (is_hurt(wrold_pot,GameUtils.grid_arms,"grid_arms")) return {spr:GameUtils.grid_arms,type:'equipment'};
        if (is_hurt(wrold_pot,GameUtils.grid_clothes,"grid_clothes")) return {spr:GameUtils.grid_clothes,type:'equipment'};
        if (is_hurt(wrold_pot,GameUtils.grid_helmet,"grid_helmet")) return {spr:GameUtils.grid_helmet,type:'equipment'};
        if (is_hurt(wrold_pot,GameUtils.grid_jewelry,"grid_jewelry")) return {spr:GameUtils.grid_jewelry,type:'equipment'};
        if (is_hurt(wrold_pot,GameUtils.grid_necklace,"grid_necklace")) return {spr:GameUtils.grid_necklace,type:'equipment'};
        if (is_hurt(wrold_pot,GameUtils.grid_shoes,"grid_shoes")) return {spr:GameUtils.grid_shoes,type:'equipment'};
        
        let bag_grids:cc.Sprite[] = GameUtils.bag_grids;
        for(let i=0; i < 18; i++) {
            let grid:cc.Sprite = bag_grids[i];
            if (grid && is_hurt(wrold_pot,grid,"grid_"+i))return {spr:grid,type:'grid',index:i};
        }
        let right_fast_grids:cc.Sprite[] = GameUtils.right_fast_grids;
        for(let i=0; i < 8; i++) {
            let grid:cc.Sprite = right_fast_grids[i];
            if (grid && is_hurt(wrold_pot,grid,"right_fast_grids_"+i))return {spr:grid,type:'quick',index:i};
        }
        let down_fast_grids:cc.Sprite[] = GameUtils.down_fast_grids;
        for(let i=0; i < 8; i++) {
            let grid:cc.Sprite = down_fast_grids[i];
            if (grid && is_hurt(wrold_pot,grid,"down_fast_grids_"+i))return {spr:grid,type:'quick',index:i};
        }
        return {spr:null,type:null};
    }

    private use_res() { // 使用物品
        console.log("xiaowa ========== 拖到装备栏了");
        if (!this._init) return;
        var route = "scene.sceneHandler.use_res";
        this.pinus.request(route, {
            res_index: this._index,
        }, function(data) {
            if(data.error) {
                console.log("xiaowa ========= use_res fail");
                return;
            }else{
                cc.log(data);
                sleep(500).then(()=>{
                    GameUtils.bag_ui.open();
                });
            }
        });
    }

    private use_quick(spr:cc.Sprite) { //物品放入快捷栏
        console.log("xiaowa ========== 拖到快捷栏了");
    }

    private use_grid(index:number) { // 移动物品到其他格子
        console.log("xiaowa ========== 拖到其他格子了");
        if (!this._init) return;
        var route = "scene.sceneHandler.exchange_res";
        this.pinus.request(route, {
            e_index:index,
            o_index: this._index,
        }, function(data) {
            if(data.error) {
                console.log("xiaowa ========= exchange_res fail");
                return;
            }else{
                cc.log(data);
                sleep(500).then(()=>{
                    GameUtils.bag_ui.open();
                });
            }
        });
    }

    private Destructor() {
        if (!this.is_copy && this.self_copy)this.self_copy.Destructor();
        this.self_copy = null;
        this.node.parent = null;
    }
    // update (dt) {}
}
