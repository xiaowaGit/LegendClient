import { Point, Player, PlayerInfo, ResInfo } from "../utils/tool";

const {ccclass, property} = cc._decorator;


let ARMS_LIST = {
    '龙麟':1,
    '工布':2,
    '七圣':3,
    '冷艳锯':4,
    '青龙偃月刀':5,
    '断魂血镰':6,
    '皇龙偃月刀':7,

    '青玉镇邪杖':8,
    '灵山炼气杖':9,
    '玄天破邪杖':10,

    '齐眉棍':11,
    '水火棍':12,
    '侠少棍':13,
    '四平棍':14,
    '普度棍':15,
    '鹤舞棍':16,
    '分水棍':17,
    '潜龙棍':18,
    '紫金梁':19,
    '打狗棒':20,
    '紧那罗棒':21,
    '天蛇棍':22,
    '青龙棍':23,
};

let CLOTHES_LIST = {
    '守护之铠':0,
    '镜芒铠':1,
    '圣痕之铠':2,
    '奇迹庇佑':3,
    '龙麟铠甲':4,
    '祭祀血袍':5,
    '暗血冥袍':6,
    '魔导之魂':7,
    '和谐之舞':8,
    '真理圣袍':9,
};


@ccclass
export default class PropertyUI extends cc.Component {

    @property([cc.Sprite])
    show_back_list: cc.Sprite[] = [];

    @property([cc.Sprite])
    show_arms_list: cc.Sprite[] = [];

    @property(cc.Label)
    lbl_name: cc.Label = null;

    @property(cc.Label)
    lbl_blood: cc.Label = null;

    @property(cc.Label)
    lbl_blood_limit: cc.Label = null;

    @property(cc.Label)
    lbl_magic: cc.Label = null;

    @property(cc.Label)
    lbl_magic_limit: cc.Label = null;

    @property(cc.Label)
    lbl_physics_attack: cc.Label = null;

    @property(cc.Label)
    lbl_magic_attack: cc.Label = null;

    @property(cc.Label)
    lbl_physics_defense: cc.Label = null;

    @property(cc.Label)
    lbl_magic_defense: cc.Label = null;

    @property(cc.Label)
    lbl_point: cc.Label = null;

    @property(cc.Label)
    lbl_speed: cc.Label = null;

    @property(cc.Label)
    lbl_is_die: cc.Label = null;
    
    @property(cc.Sprite)
    sp_property_bg: cc.Sprite = null;

    onLoad () {
        let o_pot:cc.Vec2 = null;
        let self = this;
        this.sp_property_bg.node.on(cc.Node.EventType.TOUCH_START,(event:cc.Event.EventTouch)=>{
            let pot:cc.Vec2 = event.getLocation();
            o_pot = pot;
        },this);
        this.sp_property_bg.node.on(cc.Node.EventType.TOUCH_MOVE,(event:cc.Event.EventTouch)=>{
            let pot:cc.Vec2 = event.getLocation();
            if (o_pot) {
                let c_pot:Point = {x:pot.x - o_pot.x,y:pot.y - o_pot.y};
                self.node.x += c_pot.x;
                self.node.y += c_pot.y;
            }
            o_pot = pot;
        });
    }

    start () {
    }

    open (player:Player) {
        let info:PlayerInfo = player.player;
        this.show_property(info);
        this.show_arms(player.arms);
        this.show_clothes(player.clothes);
        this.node.active = true;
    }

    show_property(info:PlayerInfo) {
        this.lbl_name.string = "姓名："+info.name;
        this.lbl_blood.string = "气血："+info.blood;
        this.lbl_blood_limit.string = "气血上限："+info.blood_limit;
        this.lbl_magic.string = "魔法："+info.magic;
        this.lbl_magic_limit.string = "魔法上限："+info.magic_limit;
        this.lbl_physics_attack.string = "物理攻击："+info.physics_attack;
        this.lbl_magic_attack.string = "魔法攻击："+info.magic_attack;
        this.lbl_physics_defense.string = "物理防御："+info.physics_defense;
        this.lbl_magic_defense.string = "魔法防御："+info.magic_defense;
        this.lbl_speed.string = "速度："+info.speed;
        this.lbl_point.string = "位置："+'('+info.point.x+','+info.point.y+')';
        this.lbl_is_die.string = info.is_die ? '死亡' : '存活';
    }

    show_arms(res_info:ResInfo) {
        this.show_arms_list.forEach(element => {
            element.node.active = false;
        });
        if (res_info) {
            let spr_index:number = ARMS_LIST[res_info.name];
            if (spr_index && this.show_arms_list[spr_index]) {
                this.show_arms_list[spr_index].node.active = true;
            }
        }
    }

    show_clothes(res_info:ResInfo) {
        this.show_back_list.forEach(element => {
            element.node.active = false;
        });
        if (res_info) {
            let spr_index:number = CLOTHES_LIST[res_info.name];
            if (spr_index && this.show_back_list[spr_index]) {
                this.show_back_list[spr_index].node.active = true;
            }
        }
    }

    close() {
        this.node.active = false;
    }
    // update (dt) {}
}
