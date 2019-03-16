import Hero from "../hero/Hero";
import { GameUtils } from "../utils/GameUtils";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameScene extends cc.Component {

    @property(cc.Prefab)
    hero_pre:cc.Prefab = null;

    @property(cc.Sprite)
    map:cc.Sprite = null;

    @property(cc.Camera)
    main_camera:cc.Camera = null;

    private hero:Hero = null;
    private other_heros:Hero[] = [];
    private pinus:Pomelo = null;

    onLoad () {

        let pinus = GameUtils.getInstance().pinus;
        this.pinus = pinus;
        this.pinus.on("onCreate",this.onCreate.bind(this));
    }

    start () {
        let player:any = GameUtils.player_info;
        let node = cc.instantiate(this.hero_pre);
        let hero:Hero = node.getComponent(Hero);
        hero.init(player.player.player.name,player.player,this.main_camera);
        this.hero = hero;
        hero.node.parent = this.map.node;
        let self = this;
        this.map.node.on(cc.Node.EventType.TOUCH_END,function (event:cc.Event.EventTouch) {
            let pot:cc.Vec2 = event.getLocation();
            let out:cc.Vec2 = new cc.Vec2();
            pot = self.main_camera.getCameraToWorldPoint(pot,out);
            self.goto(out);
        },this);
        this.create_other_man(player.other_players);
    }

    goto(local_pot:cc.Vec2) {
        console.log("local_pot:",local_pot);
        let pot:{x:number,y:number} = {x:local_pot.x,y:local_pot.y};
        pot.x = Math.floor(pot.x / GameUtils.map_scale);
        pot.y = Math.floor(pot.y / GameUtils.map_scale);
        console.log("pot:",pot);
        this.hero.goto(pot);
    }

    create_other_man(other_players:any[]) {
        for (let index = 0; index < other_players.length; index++) {
            const element = other_players[index];
            this.onCreate(element,false);
        }
    }

    onCreate(data:any,is_init:boolean = true) {
        let player:any = GameUtils.player_info;
        if (is_init)
        player.other_players.push(data);
        let node = cc.instantiate(this.hero_pre);
        let hero:Hero = node.getComponent(Hero);
        hero.init(data.player.name,data,null);
        this.other_heros.push(hero);
        hero.node.parent = this.map.node;
    }
    // update (dt) {}
}
