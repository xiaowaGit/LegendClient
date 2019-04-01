import { Point, get_l, ResFloorInfo } from "../utils/tool";
import ResConfig from "./ResConfig";
import { GameUtils } from "../utils/GameUtils";
import Hero from "../hero/Hero";

const {ccclass, property} = cc._decorator;

/*
    地面物品对象
*/
@ccclass
export default class ResFloor extends cc.Component {

    @property(cc.Sprite)
    res: cc.Sprite = null;

    @property(cc.SpriteAtlas)
    icon_atlas:cc.SpriteAtlas = null;

    @property(cc.SpriteAtlas)
    iconx1_atlas:cc.SpriteAtlas = null;

    private _res_data:ResFloorInfo = null;
    private _init:boolean = false;
    private pinus: Pomelo;
    private _onDeleteRes: any;
    
    // onLoad () {}

    start () {
        let pinus = GameUtils.getInstance().pinus;
        this.pinus = pinus;
        this._onDeleteRes = this.onDeleteRes.bind(this)
        this.pinus.on("onDeleteRes",this._onDeleteRes);
        this.res.node.on(cc.Node.EventType.TOUCH_END,this.pickup,this);
    }

    public init(res_data:ResFloorInfo) {
        this._res_data = res_data;
        let config:{spr:string,atlas:string} = ResConfig[res_data.name];
        if (config) {
            if (config.atlas == 'icon_atlas') {
                this.res.spriteFrame = this.icon_atlas.getSpriteFrame(config.spr);
            }else if (config.atlas == 'iconx1_atlas') {
                this.res.spriteFrame = this.iconx1_atlas.getSpriteFrame(config.spr);
            }
            let size:cc.Size = this.res.spriteFrame.getOriginalSize();
            this.res.node.width = size.width;
            this.res.node.height = size.height;
            let pot:{x:number,y:number} = {x:res_data.point.x,y:res_data.point.y};
            pot.x = pot.x*GameUtils.map_scale;
            pot.y = pot.y*GameUtils.map_scale;
            this.node.x = pot.x;
            this.node.y = pot.y;
        }else{
            console.error("ERROR:物品<"+res_data.name+">没有可用的显示资源。");
        }
        this._init = true;
    }

    public pickup(event:cc.Event.EventTouch) {
        if (this._init) {
            let player:Hero = GameUtils.self_player;
            let player_pot:Point = player.get_pot();
            if(get_l(player_pot,this._res_data.point) >= 5) {
                player.goto(this._res_data.point);
                return;
            }
            let route = "scene.sceneHandler.pickup";
            this.pinus.request(route, {
                pot: this._res_data.point
            }, function(data) {
                if(data.error) {
                    console.log("xiaowa ========= move_to fail");
                    return;
                }else{
                    cc.log("拾取物品->",data);
                }
            });
            console.log("拾取物品");
        }
        event.stopPropagation();
    }

    public onDeleteRes(res_data:ResFloorInfo) {
        if(this._init && res_data.index == this._res_data.index) {
            this.pinus.off('onDeleteRes',this._onDeleteRes);
            this.node.removeFromParent();
        }
    }
    
    // update (dt) {}
}
