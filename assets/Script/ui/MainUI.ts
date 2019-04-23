import PropertyUI from "./PropertyUI";
import { GameUtils } from "../utils/GameUtils";
import BagUI from "./BagUI";
import ResInfoUI from "./ResInfoUI";

const {ccclass, property} = cc._decorator;

@ccclass
export default class MainUI extends cc.Component {

    @property(cc.Button)
    btn_bag: cc.Button = null;

    @property(cc.Button)
    btn_property: cc.Button = null;

    @property(PropertyUI)
    node_property: PropertyUI = null;
    
    @property(BagUI)
    node_bag: BagUI = null;

    @property(ResInfoUI)
    node_res_info: ResInfoUI = null;

    private is_open_property = false;
    private is_open_bag = false;
    onLoad () {
        this.node_property.close();
        this.node_bag.close();
        this.node_res_info.close();
        GameUtils.res_info_ui = this.node_res_info;
        GameUtils.bag_ui = this.node_bag;
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
        this.btn_bag.node.on("click",function () {
            if (self.is_open_bag == false) {
                self.node_bag.open();
                self.is_open_bag = true;
            } else {
                self.node_bag.close();
                self.is_open_bag = false;
            }
        },this);
        this.node.active = true;
    }

    // update (dt) {}
}
