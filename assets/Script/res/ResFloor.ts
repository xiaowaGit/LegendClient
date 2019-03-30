import { Point } from "../utils/tool";

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

    private _res_data:{name:string,point:Point} = null;

    onLoad () {
        this.init({name:'cccc',point:{x:1,y:1}});
    }

    start () {

    }

    public init(res_data) {
        this._res_data = res_data;
        this.res.spriteFrame = this.icon_atlas.getSpriteFrame('b0001');
    }

    // update (dt) {}
}
