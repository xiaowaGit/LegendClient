import Hero from "../hero/Hero";
import { GameUtils } from "../utils/GameUtils";
import { ResFloorInfo, PP, Point, EffectConfig, dir_to_p, compute_dir, p_to_pots } from "../utils/tool";
import ResFloor from "../res/ResFloor";
import MainUI from "../ui/MainUI";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameScene extends cc.Component {

    @property(cc.Prefab)
    hero_pre:cc.Prefab = null;

    @property(cc.Prefab)
    res_floor_pre:cc.Prefab = null;

    @property(cc.Sprite)
    map:cc.Sprite = null;

    @property(cc.Node)
    res_map:cc.Node = null;

    @property(cc.Graphics)
    draw_layer:cc.Graphics = null;

    @property(cc.Camera)
    main_camera:cc.Camera = null;

    @property(cc.Camera)
    ui_camera:cc.Camera = null;
    
    @property(MainUI)
    main_ui:MainUI = null;

    private hero:Hero = null;
    private other_heros:Hero[] = [];
    private ress:ResFloor[] = [];
    private pinus:Pomelo = null;
    private goto_time:number = 0;
    private goto_out:cc.Vec2 = null;

    onLoad () {
        GameUtils.ui_camera = this.ui_camera;
        GameUtils.game_scene = this;
        let pinus = GameUtils.getInstance().pinus;
        this.pinus = pinus;
        this.pinus.on("onCreate",this.onCreate.bind(this));
        this.pinus.on("onCreateRes",this.onCreateRes.bind(this));
    }

    start () {
        let player:any = GameUtils.player_info;
        let node = cc.instantiate(this.hero_pre);
        let hero:Hero = node.getComponent(Hero);
        hero.init(player.player.player.name,player.player,this.main_camera);
        this.hero = hero;
        GameUtils.self_player = hero;
        hero.node.parent = this.map.node;
        let self = this;
        this.map.node.on(cc.Node.EventType.TOUCH_END,function (event:cc.Event.EventTouch) {
            let pot:cc.Vec2 = event.getLocation();
            let out:cc.Vec2 = new cc.Vec2();
            pot = self.main_camera.getCameraToWorldPoint(pot,out);
            self.goto_out = out;
            GameUtils.res_info_ui.close();
        },this);
        this.create_other_man(player.other_players);
        this.create_ress(player.ress);
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
        if (is_init)player.other_players.push(data);
        let node = cc.instantiate(this.hero_pre);
        let hero:Hero = node.getComponent(Hero);
        hero.init(data.player.name,data,null);
        this.other_heros.push(hero);
        hero.node.parent = this.map.node;
    }

    create_ress(ress:ResFloorInfo[]) {
        for (let index = 0; index < ress.length; index++) {
            const element = ress[index];
            this.onCreateRes(element,false);
        }
    }

    onCreateRes(data:ResFloorInfo,is_init:boolean = true) {
        let player:any = GameUtils.player_info;
        if (is_init)player.ress.push(data);
        let node = cc.instantiate(this.res_floor_pre);
        let res:ResFloor = node.getComponent(ResFloor);
        res.init(data);
        this.ress.push(res);
        res.node.parent = this.res_map;
    }

    update (dt) {
        let now:number = Date.now();
        let self = this;
        function gogogo(out:cc.Vec2) {
            self.goto(out);
            self.goto_time = Date.now();
            GameUtils.attack_target = null;
            self.hero.tarce_pot = null;
        }
        if (now - this.goto_time > GameUtils.goto_gap) {
            if (this.goto_out){
                gogogo(this.goto_out);
                this.goto_out = null;
            }
        }
    }

    // 绘制技能攻击范围
    draw_skill_range(pp:PP,effect_info:EffectConfig) {
        if (!effect_info) return;
        this.draw_layer.clear();
        let r_t_l:number = pp.r_t_l;/// 技能实际攻击最长距离
        let s_l:number = pp.s_l;
        let s_p:Point = pp.s_p; /// 向量
        let s_r:number = pp.s_r; /// 距离比例 ratio
        let r_l:number = pp.r_l;
        let r_p_p:Point = pp.r_p_p; // 精确格子向量(不是单位向量)用来换算成像素
        let r_g_p:Point = pp.r_g_p; // 目标点格子向量(不是单位向量)就是实际攻击的坐标
        let grid_w:number = GameUtils.map_scale;
        let player_pot:Point = this.hero.get_pot();
        let player_p_pot:Point = {x:player_pot.x*grid_w,y:player_pot.y*grid_w};
        if (effect_info.name == "狂风斩") {
            let ctx:cc.Graphics = this.draw_layer;
            ctx.circle(player_p_pot.x,player_p_pot.y,r_t_l*grid_w);
            ctx.fillColor = cc.Color.GREEN;
            ctx.fill();
            ctx.node.opacity = 100;
        }else if (effect_info.name == "逐日剑法") {
            let o_pot:Point = player_pot;
            let e_pot:Point = {x:o_pot.x+r_g_p.x,y:o_pot.y+r_g_p.y};
            let p:Point = dir_to_p(compute_dir(e_pot,o_pot));
            let pots:Point[] = p_to_pots(o_pot,p,effect_info.attack_l);
            pots.forEach(element => {
                element.x *= grid_w;
                element.y *= grid_w;
            });
            let ctx:cc.Graphics = this.draw_layer;
            pots.forEach(element => {
                ctx.rect(element.x,element.y,grid_w,grid_w);
                ctx.fillColor = cc.Color.GREEN;
                ctx.fill();
            });
            ctx.node.opacity = 100;
        }else if (effect_info.name == "冰咆哮") {
            
        }
    }
}
