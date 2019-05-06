import { Point, get_l, ResInfo, sleep, EffectConfig, PP, SkillBookConfig } from "../utils/tool";
import ResConfig from "./ResConfig";
import { GameUtils } from "../utils/GameUtils";
import SkillConfig from "./SkillConfig";

const {ccclass, property} = cc._decorator;

/*
    物品对象(背包及快捷栏 对象)
*/
@ccclass
export default class Res extends cc.Component {

    @property(cc.Sprite)
    res: cc.Sprite = null;

    @property(cc.Label)
    lbl_cd: cc.Label = null;

    @property(cc.SpriteAtlas)
    icon_atlas:cc.SpriteAtlas = null;

    @property(cc.SpriteAtlas)
    iconx1_atlas:cc.SpriteAtlas = null;

    @property(cc.Prefab)
    res_pre:cc.Prefab = null;
    
    @property(cc.SpriteAtlas)
    skill_atlas:cc.SpriteAtlas = null;

    @property(cc.SpriteAtlas)
    skillx1_atlas:cc.SpriteAtlas = null;

    private pinus: Pomelo;
    private type:'equipment'|'drug'|'skill_book' = null;
    private _res_data:ResInfo = null;
    private _index:number = null;
    private _init:boolean = false;
    private self_copy:Res = null;
    private is_copy:boolean = false;
    private pot_start:Point = null;
    private pot_end:Point = null;
    private cd_time:number = 0; // cd 倒计时
    private pot_origin:cc.Vec2 = null;

    private pp:PP = null;

    // onLoad () {}

    start () {
        let pinus = GameUtils.getInstance().pinus;
        this.pinus = pinus;
        this.res.node.on(cc.Node.EventType.TOUCH_START,this.touch_start,this);
        this.res.node.on(cc.Node.EventType.TOUCH_MOVE,this.touch_move,this);
        this.res.node.on(cc.Node.EventType.TOUCH_END,this.touch_end,this);
        // this.res.node.on(cc.Node.EventType.TOUCH_CANCEL,this.touch_cancel,this);
    }

    public init(res_data:ResInfo,index:number,is_copy:boolean = false) {
        this._res_data = res_data;
        this._index = index;
        this.type = res_data.type;
        this.is_copy = is_copy;
        this.cd_time = 0;
        this.lbl_cd.node.active = false;
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
        if (this.is_copy && this.type == 'skill_book') {
            let config:{spr:string,atlas:string} = SkillConfig[res_data.name];
            if (config.atlas == 'skill_atlas') {
                this.res.spriteFrame = this.skill_atlas.getSpriteFrame(config.spr);
            }else if (config.atlas == 'skillx1_atlas') {
                this.res.spriteFrame = this.skillx1_atlas.getSpriteFrame(config.spr);
            }
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
            this.pp = null;
        }
        event.stopPropagation();
    }

    public touch_move(event:cc.Event.EventTouch) {
        if (this._init && this.pot_origin) {
            let pot:cc.Vec2 = event.getLocation();
            if (!this.is_copy || (this.is_copy && get_l(this.pot_start,pot) < 50)) {
                if (this.is_copy && this.type == 'skill_book') {
                    // console.log("get_l:",get_l(this.pot_start,pot));
                    // 实时显示向量、距离信息
                    this.compute_a(this.pot_start,pot);
                    let config:any = this._res_data.config;
                    let effect_info:EffectConfig = config.effect_config;
                    if (this.pp) GameUtils.game_scene.draw_skill_range(this.pp,effect_info);
                }
                let c_pot:Point = {x:pot.x - this.pot_origin.x,y:pot.y - this.pot_origin.y};
                this.node.x += c_pot.x;
                this.node.y += c_pot.y;
            }else if (this.is_copy) {
                this.touch_cancel(event);
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
                this.node.x = 0;
                this.node.y = 0;
            }else if (this.is_copy == false && get_l(this.pot_start,this.pot_end) >= 20 && this._index != -1) { //装备物品或者设置快捷方式
                let out:cc.Vec2 = new cc.Vec2();
                pot = GameUtils.ui_camera.getCameraToWorldPoint(pot,out);
                let hurt_info = this.hurt(out);
                if (hurt_info.type == 'equipment') this.use_res();
                else if (hurt_info.type == 'quick') this.use_quick(hurt_info.spr);
                else if (hurt_info.type == 'grid') this.use_grid(hurt_info.index);
                this.node.x = 0;
                this.node.y = 0;
            }else if (this.is_copy) { //这就要使用技能了(物品只在这里使用，技能也可能在这里使用)
                this.node.x = 0;
                this.node.y = 0;
                GameUtils.game_scene.draw_clear();
                if (this.type == 'skill_book' && this.cd_time == 0) {
                    let config:SkillBookConfig = <SkillBookConfig>this._res_data.config;
                    let effect_info:EffectConfig = config.effect_config;
                    if (effect_info && (effect_info.name == "逐日剑法" || effect_info.name == "冰咆哮" || effect_info.name == "流星火雨")) {
                        if (this.pp) {
                            let {r_t_l,s_l,s_p,s_r,r_l,r_p_p,r_g_p} = this.pp;
                            let player_pot:Point = GameUtils.player_info.player.player.point;
                            let pot:Point = {x:player_pot.x + r_g_p.x,y:player_pot.y + r_g_p.y};
                            this.uuse_res('',pot);
                            this.tick_cd(config.cd);
                        }
                    }else if (effect_info && (effect_info.name == "烈火" || effect_info.name == "灭天火" || effect_info.name == "噬血术")) {
                        if (GameUtils.selete_target) {
                            this.uuse_res(GameUtils.selete_target.get_name(),null);
                            this.tick_cd(config.cd);
                        }
                    }else if (effect_info && (effect_info.name == "狂风斩" || effect_info.name == "治愈术" || effect_info.name == "骷髅" || effect_info.name == "麒麟" || effect_info.name == "哮天犬")) {
                        this.uuse_res('',null);
                        this.tick_cd(config.cd);
                    }
                }else if (this.type == 'drug') {
                    this.use_res();
                }
            }
        }
        event.stopPropagation();
    }

    public touch_cancel(event:cc.Event.EventTouch) {
        this.node.x = 0;
        this.node.y = 0;
        if (this.is_copy) { //这就要使用技能了(只有 逐日剑法、冰咆哮、流星火雨 才使用，其他技能按取消操作处理);物品也按取消操作处理
            GameUtils.game_scene.draw_clear();
            if (this.type == 'skill_book' && this.cd_time == 0) {
                let config:SkillBookConfig = <SkillBookConfig>this._res_data.config;
                let effect_info:EffectConfig = config.effect_config;
                if (effect_info && (effect_info.name == "逐日剑法" || effect_info.name == "冰咆哮" || effect_info.name == "流星火雨")) {
                    let {r_t_l,s_l,s_p,s_r,r_l,r_p_p,r_g_p} = this.pp;
                    let player_pot:Point = GameUtils.player_info.player.player.point;
                    let pot:Point = {x:player_pot.x + r_g_p.x,y:player_pot.y + r_g_p.y};
                    this.uuse_res('',pot);
                    this.tick_cd(config.cd);
                }
            }
        }
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

    /**
     * cd_time 倒计时
     */
    private tick_cd(cd:number) {
        this.cd_time = cd;
        this.lbl_cd.string = ""+cd;
        this.lbl_cd.node.active = true;
        let action_arr:cc.FiniteTimeAction[] = [];
        for (let index = 0; index < cd; index++) {
            let action_cd:cc.FiniteTimeAction = cc.delayTime(1);
            let action_lbl:cc.FiniteTimeAction = cc.callFunc(function() {
                this.cd_time--;
                this.lbl_cd.string = ""+this.cd_time;
            },this);
            let action:cc.FiniteTimeAction = cc.sequence(action_cd,action_lbl);
            action_arr.push(action);
        }
        let action_end:cc.FiniteTimeAction = cc.callFunc(function() {
            this.cd_time = 0;
            this.lbl_cd.node.active = false;
        },this);
        action_arr.push(action_end);
        this.node.runAction(cc.sequence(action_arr));
    }

    private use_res() { // 使用物品
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
    
    private uuse_res(target:string,pot:Point) { // 使用技能
        if (!this._init) return;
        var route = "scene.sceneHandler.uuse_res";
        this.pinus.request(route, {
            res_index: this._index,
            target,
            pot,
        }, function(data) {
            if(data.error) {
                console.log("xiaowa ========= uuse_res fail");
                return;
            }else{
                cc.log(data);
            }
        });
    }

    private use_quick(spr:cc.Sprite) { //物品放入快捷栏
        if (this.type == 'skill_book' || this.type == 'drug') {
            if (!this.self_copy) {
                spr.node.removeAllChildren();
                let node = cc.instantiate(this.res_pre);
                let res:Res = node.getComponent(Res);
                res.init(this._res_data,this._index,true);
                res.node.parent = spr.node;
                this.self_copy = res;
            }else{
                this.self_copy.node.parent = spr.node;
            }
        }
    }

    private use_grid(index:number) { // 移动物品到其他格子
        if (!this._init) return;
        if (this.self_copy) this.self_copy.Destructor();
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
        this.node.stopAllActions();
        this.self_copy = null;
        this.node.parent = null;
    }

    ///////////////////// 计算向量
    private compute_a(o_pot:Point,e_pot:Point) {
        let config:any = this._res_data.config;
        if (config && config.effect_config) {
            let effect_config:EffectConfig = config.effect_config;
            let r_t_l:number = effect_config.attack_l;/// 技能实际攻击最长距离
            let s_l:number = get_l(o_pot,e_pot);
            let s_p:Point = {x:(e_pot.x - o_pot.x)/s_l,y:(e_pot.y - o_pot.y)/s_l}; /// 向量
            let s_r:number = s_l / 50; /// 距离比例 ratio
            let r_l:number = r_t_l * s_r;
            let r_p_p:Point = {x:r_l*s_p.x,y:r_l*s_p.y}; // 精确格子向量(不是单位向量)用来换算成像素
            let r_g_p:Point = {x:Math.floor(r_p_p.x),y:Math.floor(r_p_p.y)} // 目标点格子向量(不是单位向量)就是实际攻击的坐标
            this.pp = {r_t_l,s_l,s_p,s_r,r_l,r_p_p,r_g_p};
        }else{
            this.pp = null;
        }
    }
    // update (dt) {}
}
