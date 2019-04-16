import PropertyUI from "./PropertyUI";
import { GameUtils } from "../utils/GameUtils";

const {ccclass, property} = cc._decorator;

@ccclass
export default class MainUI extends cc.Component {

    @property(cc.Button)
    btn_bag: cc.Button = null;

    @property(cc.Button)
    btn_property: cc.Button = null;

    @property(PropertyUI)
    node_property: PropertyUI = null;

    private is_open_property = false;

    onLoad () {
        this.node_property.close();
        let self = this;
        this.btn_property.node.on("click",function () {
            if (self.is_open_property == false) {
                self.node_property.open(GameUtils.player_info.player);
                self.is_open_property = true;
            } else {
                self.node_property.close();
                self.is_open_property = false;
            }
        },this);
        this.node.active = true;
    }

    // update (dt) {}
}
