import { ResInfo, PetConfig, EffectConfig, Point } from "../utils/tool";
import { GameUtils } from "../utils/GameUtils";

const {ccclass, property} = cc._decorator;

let TYPE_NAME = {'equipment':'装备','drug':'药品','skill_book':'技能书'};
let ARMS_NAME = {'knife':"刀",'staff':"法杖",'stick':"棍"};
let EFFECT_NAME = {'attack':"攻击",'assist':"辅助",'hinder':"障碍"};

@ccclass
export default class ResInfoUI extends cc.Component {

    @property(cc.Button)
    btn_discard: cc.Button = null;

    @property(cc.Sprite)
    spr_bg: cc.Sprite = null;

    private cell:cc.Node = null;

    private _index:number = null;

    // onLoad () {}

    start () {
        let self = this;
        this.btn_discard.node.on("click",function () {
            self.discard();
        },this);
    }

    discard() {
        var pinus = GameUtils.getInstance().pinus;
        var route = "scene.sceneHandler.discard";
        pinus.request(route,{
            index:this._index
        }, function(data) {
            cc.log(data);
        });
        this.close();
    }

    show(data:ResInfo,pot:cc.Vec2,index:number = null) {
        if (this.cell) {
            this.cell.removeFromParent();
            this.cell = null;
        }
        let cell:cc.Node = new cc.Node();

        let node_name:cc.Node = new cc.Node();
        node_name.addComponent(cc.Label);
        let name:cc.Label = node_name.getComponent(cc.Label);
        name.fontSize = 20;
        cell.addChild(name.node);
        name.string = data.name;
        name.node.position = new cc.Vec2(0,0);
        let node_type:cc.Node = new cc.Node();
        node_type.addComponent(cc.Label);
        let type:cc.Label = node_type.getComponent(cc.Label);
        type.fontSize = 20;
        let config:any = data.config;
        if (config.arms_type) type.string = ARMS_NAME[config.arms_type];
        else type.string = TYPE_NAME[data.type];
        cell.addChild(type.node);
        type.node.position = new cc.Vec2(0,-30);
        let off_y:number = -60;
        let add_y:number = -30;
        
        off_y = this.add("physics_attack",config,cell,off_y,add_y,"物理攻击增加:");
        off_y = this.add("magic_attack",config,cell,off_y,add_y,"魔法攻击增加:");
        off_y = this.add("has_blood",config,cell,off_y,add_y,"需要气血量:");
        off_y = this.add("has_magic",config,cell,off_y,add_y,"需要魔法量:");
        off_y = this.add("blood_limit",config,cell,off_y,add_y,"气血增量:");
        off_y = this.add("magic_limit",config,cell,off_y,add_y,"魔法增量:");
        off_y = this.add("physics_defense",config,cell,off_y,add_y,"物理防御:");
        off_y = this.add("magic_defense",config,cell,off_y,add_y,"魔法防御:");
        off_y = this.add("has_physics_attack",config,cell,off_y,add_y,"需要物理攻击:");
        off_y = this.add("has_magic_attack",config,cell,off_y,add_y,"需要魔法攻击:");
        off_y = this.add("speed",config,cell,off_y,add_y,"速度增加:");

        off_y = this.add("blood",config,cell,off_y,add_y,"气血增加:");
        off_y = this.add("magic",config,cell,off_y,add_y,"魔法增加:");
        // off_y = this.add("effect_name",config,cell,off_y,add_y,"效果:");
        off_y = this.add("explain",config,cell,off_y,add_y,":");
        off_y = this.add("consume_magic",config,cell,off_y,add_y,"消耗魔法:");
        off_y = this.add("cd",config,cell,off_y,add_y,"冷却:");

        if (config.arms_limit) {
            let node_info:cc.Node = new cc.Node();
            node_info.addComponent(cc.Label);
            let info:cc.Label = node_info.getComponent(cc.Label);
            info.fontSize = 20;
            info.string = "需要武器:"+ARMS_NAME[config.arms_limit];
            cell.addChild(info.node);
            info.node.position = new cc.Vec2(0,off_y);
            off_y += add_y;
        }
        if (config.pet_config) {
            let pet_c:PetConfig = config.pet_config;
            off_y = this.add("name",pet_c,cell,off_y,add_y,"召唤兽:");
            off_y = this.add("blood",pet_c,cell,off_y,add_y,"气血量:");
            off_y = this.add("magic",pet_c,cell,off_y,add_y,"魔法量:");
            off_y = this.add("blood_limit",pet_c,cell,off_y,add_y,"气血上限:");
            off_y = this.add("magic_limit",pet_c,cell,off_y,add_y,"魔法上限:");
            off_y = this.add("physics_attack",pet_c,cell,off_y,add_y,"物理攻击:");
            off_y = this.add("magic_attack",pet_c,cell,off_y,add_y,"魔法攻击:");
            off_y = this.add("physics_defense",pet_c,cell,off_y,add_y,"物理防御:");
            off_y = this.add("magic_defense",pet_c,cell,off_y,add_y,"魔法防御:");
            off_y = this.add("life_time",pet_c,cell,off_y,add_y,"存活秒数:");
            off_y = this.add("cd_time",pet_c,cell,off_y,add_y,"冷却:");
        }
        if (config.effect_config) {
            let eff_c:EffectConfig = config.effect_config;
            off_y = this.add("name",eff_c,cell,off_y,add_y,"技能:");
            off_y = this.add("hurt_one_blood",eff_c,cell,off_y,add_y,"单次气血伤害:");
            off_y = this.add("hurt_one_magic",eff_c,cell,off_y,add_y,"单次魔法伤害:");
            off_y = this.add("add_one_blood",eff_c,cell,off_y,add_y,"单次气血增加:");
            off_y = this.add("add_one_magic",eff_c,cell,off_y,add_y,"单次魔法增加:");
            off_y = this.add("hurt_continue_blood",eff_c,cell,off_y,add_y,"持续气血伤害:");
            off_y = this.add("hurt_continue_magic",eff_c,cell,off_y,add_y,"持续魔法伤害:");
            off_y = this.add("add_continue_blood",eff_c,cell,off_y,add_y,"持续气血增加:");
            off_y = this.add("add_continue_magic",eff_c,cell,off_y,add_y,"持续魔法增加:");
            off_y = this.add("continue_time",eff_c,cell,off_y,add_y,"持续时间:");
            off_y = this.add("add_one_physics_attack",eff_c,cell,off_y,add_y,"单次物理攻击增加:");
            off_y = this.add("add_one_magic_attack",eff_c,cell,off_y,add_y,"单次魔法攻击增加:");
            off_y = this.add("add_one_physics_defense",eff_c,cell,off_y,add_y,"单次物理防御增加:");
            off_y = this.add("add_one_magic_defense",eff_c,cell,off_y,add_y,"单次魔法防御增加:");
            off_y = this.add("minus_one_physics_attack",eff_c,cell,off_y,add_y,"单次物理攻击减少:");
            off_y = this.add("minus_one_magic_attack",eff_c,cell,off_y,add_y,"单次魔法攻击减少:");
            off_y = this.add("minus_one_physics_defense",eff_c,cell,off_y,add_y,"单次物理防御减少:");
            off_y = this.add("minus_one_magic_defense",eff_c,cell,off_y,add_y,"单次魔法防御减少:");
            off_y = this.add("attack_l",eff_c,cell,off_y,add_y,"攻击距离:");
            
            if (eff_c.type) {
                let node_info:cc.Node = new cc.Node();
                node_info.addComponent(cc.Label);
                let info:cc.Label = node_info.getComponent(cc.Label);
                info.fontSize = 20;
                info.string = "技能类型:"+EFFECT_NAME[eff_c.type];
                cell.addChild(info.node);
                info.node.position = new cc.Vec2(0,off_y);
                off_y += add_y;
            }
        }
        this.spr_bg.node.setContentSize(250,Math.abs(off_y));
        cell.y = Math.abs(off_y) / 2 - 50/2;
        this.node.active = true;
        this.node.addChild(cell);
        this.cell = cell;
        this.move(pot,250,Math.abs(off_y));
        this._index = index;
        if (index == null) {
            this.btn_discard.enabled = false;
            this.btn_discard.interactable = false;
            this.btn_discard.node.active = false;
        }else{
            this.btn_discard.enabled = true;
            this.btn_discard.interactable = true;
            this.btn_discard.node.active = true;
        }
    }

    add (key:string,config:any,cell:cc.Node,off_y:number,add_y:number,str:string):number {
        if (config[key] != null && config[key] != "" || config[key] === 0) {
            let node_info:cc.Node = new cc.Node();
            node_info.addComponent(cc.Label);
            let info:cc.Label = node_info.getComponent(cc.Label);
            info.fontSize = 20;
            info.string = str+config[key];
            cell.addChild(info.node);
            info.node.position = new cc.Vec2(0,off_y);
            off_y += add_y;
        }
        return off_y;
    }

    close () {
        this.node.active = false;
    }

    move(pot:cc.Vec2,weight:number,height:number) {
        weight += 130;
        // console.log("xiaowa == world_pot:",pot);
        let p_pot:cc.Vec2 = this.node.parent.convertToNodeSpace(pot);
        // console.log("xiaowa == local_pot:",p_pot);
        let off_x = weight / 2;
        let off_y = height / 2;
        let left_pot:Point = {x:p_pot.x - off_x,y:p_pot.y};
        let right_pot:Point = {x:p_pot.x + off_x,y:p_pot.y};
        let out_pot:Point = null;
        if (left_pot.x - off_x < -1136/2)out_pot = right_pot;
        else out_pot = left_pot;
        if (out_pot.y + off_y > 320) out_pot.y = 320 - off_y;
        if (out_pot.y - off_y < -320) out_pot.y = -320 + off_y;
        this.node.position = new cc.Vec2(out_pot.x,out_pot.y);
    }

    // update (dt) {}
}
