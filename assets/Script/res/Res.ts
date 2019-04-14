import { Point, get_l, ResInfo } from "../utils/tool";
import ResConfig from "./ResConfig";
import { GameUtils } from "../utils/GameUtils";
import Hero from "../hero/Hero";

const {ccclass, property} = cc._decorator;

/*
    地面物品对象
*/
@ccclass
export default class Res extends cc.Component {

    @property(cc.Sprite)
    res: cc.Sprite = null;

    @property(cc.SpriteAtlas)
    icon_atlas:cc.SpriteAtlas = null;

    @property(cc.SpriteAtlas)
    iconx1_atlas:cc.SpriteAtlas = null;

    private _res_data:ResInfo = null;
    private _init:boolean = false;
    private pinus: Pomelo;
    private _onDeleteRes: any;
    
    // onLoad () {}

    start () {
        let pinus = GameUtils.getInstance().pinus;
        this.pinus = pinus;
        this.res.node.on(cc.Node.EventType.TOUCH_END,this.pickup,this);
    }

    public init(res_data:ResInfo) {
        this._res_data = res_data;
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

    public pickup(event:cc.Event.EventTouch) {
        if (this._init) {
        }
        event.stopPropagation();
    }

    // update (dt) {}
}
