import { Point, dir_to_p } from "../utils/tool";
import { GameUtils } from "../utils/GameUtils";

const {ccclass, property} = cc._decorator;


let skill_dic = {
    "onPursueSun":"e_025",

    "onCure_Add":"e_1204",
    "onCallPet":"e_1110",
    "onFierceWind":"e_1025",

    "onHailstorm":"e_007",
    "onMeteorSwarm":"e_041",

    "onHemophagy":"e_065",
    "onSkyFire":"e_1202",
}

let skill_offset = {
    "onPursueSun":{x:0,y:50},

    "onCure_Add":{x:0,y:0},
    "onCallPet":{x:0,y:30},
    "onFierceWind":{x:0,y:0},

    "onHailstorm":{x:0,y:45},
    "onMeteorSwarm":{x:0,y:20},

    "onHemophagy":{x:0,y:0},
    "onSkyFire":{x:0,y:70},
}
/***
 * 效果对象，界面上表现效果
 */
@ccclass
export default class Effect extends cc.Component {

    @property(cc.Animation)
    effect:cc.Animation = null;

    private on_load:boolean = false; //加载完成否
    private on_init:boolean = false; //初始化完成否

    private effect_name:string = null;
    private dir:number = null;

    // onLoad () {}

    start () {
        this.on_load = true;
        this.show();
    }

    init (effect_name:string,s_pot:Point,parent:cc.Node,dir?:number) {
        this.effect_name = effect_name;
        this.dir = dir;
        this.node.x = s_pot.x * GameUtils.map_scale;
        this.node.y = s_pot.y * GameUtils.map_scale;
        this.node.parent = parent;
        let offset:Point = skill_offset[effect_name];
        this.effect.node.x = offset.x;
        this.effect.node.y = offset.y;
        this.on_init = true;
        this.show();
    }

    show () {
        if (this.on_load && this.on_init) { // 加载初始化都完成就显示了
            this.effect.play(skill_dic[this.effect_name]);
            this.effect.on('stop', this.onAnimStop, this);
            if (this.effect_name == "onPursueSun" && this.dir) {
                let a:Point = dir_to_p(this.dir);
                a.x *= GameUtils.map_scale*4;
                a.y *= GameUtils.map_scale*4;
                this.node.runAction(cc.moveBy(1,a.x,a.y));
            }
        }
    }

    onAnimStop(event:cc.Event.EventCustom) {
        this.node.removeFromParent();
    }
    // update (dt) {}
}
