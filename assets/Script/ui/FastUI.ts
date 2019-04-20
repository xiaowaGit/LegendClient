import { GameUtils } from "../utils/GameUtils";

const {ccclass, property} = cc._decorator;

@ccclass
export default class FastUI extends cc.Component {

    @property([cc.Sprite])
    grids: cc.Sprite[] = [];

    @property
    type:string = '';

    onLoad () {
        GameUtils[this.type+"_fast_grids"] = this.grids;
    }

    // start () {}

    // update (dt) {}
}
