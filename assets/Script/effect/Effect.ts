
const {ccclass, property} = cc._decorator;

/***
 * 效果对象，界面上表现效果
 */
@ccclass
export default class Effect extends cc.Component {

    @property(cc.Animation)
    effect:cc.Animation = null;

    private on_load:boolean = false; //加载完成否
    private on_init:boolean = false; //初始化完成否

    // onLoad () {}

    start () {
        this.on_load = true;
        this.show();
    }

    init () {
        this.on_init = true;
        this.show();
    }

    show () {
        if (this.on_load && this.on_init) { // 加载初始化都完成就显示了
            
        }
    }
    // update (dt) {}
}
