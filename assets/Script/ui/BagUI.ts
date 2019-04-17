import { Point, ResInfo, Player } from "../utils/tool";
import { GameUtils } from "../utils/GameUtils";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BagUI extends cc.Component {

    @property([cc.Sprite])
    grids: cc.Sprite[] = [];

    @property(cc.Sprite)
    spr_arms: cc.Sprite = null;
    
    @property(cc.Sprite)
    spr_helmet: cc.Sprite = null;

    @property(cc.Sprite)
    spr_clothes: cc.Sprite = null;
    
    @property(cc.Sprite)
    spr_shoes: cc.Sprite = null;
    
    @property(cc.Sprite)
    spr_jewelry: cc.Sprite = null;
    
    @property(cc.Sprite)
    spr_necklace: cc.Sprite = null;

    @property(cc.Sprite)
    sp_bag_bg: cc.Sprite = null;
    
    @property(cc.Prefab)
    res_pre:cc.Prefab = null;

    private is_show:boolean = false;
    private pinus:Pomelo = null;
    
    onLoad () {
        let pinus = GameUtils.getInstance().pinus;
        this.pinus = pinus;

        let o_pot:cc.Vec2 = null;
        let self = this;
        this.sp_bag_bg.node.on(cc.Node.EventType.TOUCH_START,(event:cc.Event.EventTouch)=>{
            let pot:cc.Vec2 = event.getLocation();
            o_pot = pot;
        },this);
        this.sp_bag_bg.node.on(cc.Node.EventType.TOUCH_MOVE,(event:cc.Event.EventTouch)=>{
            let pot:cc.Vec2 = event.getLocation();
            if (o_pot) {
                let c_pot:Point = {x:pot.x - o_pot.x,y:pot.y - o_pot.y};
                self.node.x += c_pot.x;
                self.node.y += c_pot.y;
            }
            o_pot = pot;
        });
    }

    // start () {}

    open () {
        let self = this;
        this.is_show = true;
        function get_bag(){
            var p = new Promise(function(resolve, reject){
                var route = "scene.sceneHandler.get_bag";
                self.pinus.request(route, {},
                    function(data:ResInfo[] | any) {
                        if(data.error) {
                            console.log("xiaowa ========= get_bag fail");
                            return reject();
                        }else{
                            GameUtils.player_ress = data;
                            return resolve();
                        }
                    }
                );
            });
            return p;
        }
        function get_info(){
            var p = new Promise(function(resolve, reject){
                var route = "scene.sceneHandler.get_info";
                self.pinus.request(route, {},
                    function(data:Player | any) {
                        if(data.error) {
                            console.log("xiaowa ========= get_info fail");
                            return reject();
                        }else{
                            GameUtils.player_info.player = data;
                            return resolve();
                        }
                    }
                );
            });
            return p;
        }
        get_bag().then(function () {
            return get_info();
        }).then(function () {
            if (self.is_show) {
                self.show();
            }
        });
    }

    show () {
        
    }

    close () {
        this.is_show = false;
        this.node.active = false;
    }

    // update (dt) {}
}
