import { Point, get_l, ResInfo } from "../utils/tool";
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
    private _init:boolean = false;
    private self_copy:Res = null;
    private is_copy:boolean = false;

    // onLoad () {}

    start () {
        let pinus = GameUtils.getInstance().pinus;
        this.pinus = pinus;
        this.res.node.on(cc.Node.EventType.TOUCH_START,this.touch_start,this);
        this.res.node.on(cc.Node.EventType.TOUCH_END,this.touch_end,this);
    }

    public init(res_data:ResInfo,is_copy:boolean = false) {
        this._res_data = res_data;
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

    public touch_start(event:cc.Event.EventTouch) {
        if (this._init) {

        }
        event.stopPropagation();
    }

    public touch_end(event:cc.Event.EventTouch) {
        if (this._init) {
            if (this.is_copy == false) { // 显示详情面板

            }
        }
        event.stopPropagation();
    }

    private Destructor() {
        if (!this.is_copy && this.self_copy)this.self_copy.Destructor();
        this.self_copy = null;
        this.node.parent = null;
    }
    // update (dt) {}
}
