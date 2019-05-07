import { Point, ResInfo, Player } from "../utils/tool";
import { GameUtils } from "../utils/GameUtils";
import Res from "../res/Res";

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
        this.init_ui();
        let pinus = GameUtils.getInstance().pinus;
        this.pinus = pinus;

        let o_pot:cc.Vec2 = null;
        let self = this;
        this.sp_bag_bg.node.on(cc.Node.EventType.TOUCH_START,(event:cc.Event.EventTouch)=>{
            let pot:cc.Vec2 = event.getLocation();
            o_pot = pot;
            GameUtils.res_info_ui.close();
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

    init_ui() {
        GameUtils.bag_grids = this.grids;
        GameUtils.grid_arms = this.spr_arms;
        GameUtils.grid_clothes = this.spr_clothes;
        GameUtils.grid_helmet = this.spr_helmet;
        GameUtils.grid_jewelry = this.spr_jewelry;
        GameUtils.grid_necklace = this.spr_necklace;
        GameUtils.grid_shoes = this.spr_shoes;
    }
    // start () {}

    open () {
        let self = this;
        this.is_show = true;
        this.node.active = true;
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
                            GameUtils.self_player.update_player(data);
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
        for (let index = 0; index < 18; index++) {
            const element:ResInfo = GameUtils.player_ress[index];
            if (element) {
                let spr:cc.Sprite = this.grids[index];
                spr.node.removeAllChildren();
                let node = cc.instantiate(this.res_pre);
                let res:Res = node.getComponent(Res);
                res.init(element,index);
                res.node.parent = spr.node;
            }else{
                let spr:cc.Sprite = this.grids[index];
                spr.node.removeAllChildren();
            }
        }
        let self = this;
        function add(spr:cc.Sprite,res_info:ResInfo) {
            spr.node.removeAllChildren();
            let node = cc.instantiate(self.res_pre);
            let res:Res = node.getComponent(Res);
            res.init(res_info,-1);
            res.node.parent = spr.node;
        }
        let player:Player = GameUtils.player_info.player;
        if (player.arms) add(this.spr_arms,player.arms);
        if (player.clothes) add(this.spr_clothes,player.clothes);
        if (player.helmet) add(this.spr_helmet,player.helmet);
        if (player.jewelry) add(this.spr_jewelry,player.jewelry);
        if (player.necklace) add(this.spr_necklace,player.necklace);
        if (player.shoes) add(this.spr_shoes,player.shoes);
    }

    close () {
        this.is_show = false;
        this.node.active = false;
    }

    // update (dt) {}
}
