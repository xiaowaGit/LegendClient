
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property([cc.Sprite])
    show_back_list: cc.Sprite[] = [];

    @property([cc.Sprite])
    show_arms_list: cc.Sprite[] = [];

    // onLoad () {}

    start () {

    }

    // update (dt) {}
}
