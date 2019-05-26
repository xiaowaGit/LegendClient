import { GameUtils } from "../utils/GameUtils";
import { get_l, Player, ClothesConfig, ArmsConfig, Point, GameInfo } from "../utils/tool";
import { get_body, get_arms, get_monster_body } from "./HeroConfig";
import Effect from "../effect/Effect";

const {ccclass, property} = cc._decorator;

/// 角色Y轴偏移常量
let OFFSET_Y:{} = {'人':30,'骷髅':40,'麒麟':60,'哮天犬':30};

/// 身体常量
let EMPTY_BODY:string = '001';//空的身体

/// 动作常量
let STAND_ACTION:string = '4';//站立
let SPELL_ACTION:string = '6';// spell施法
let WALK_ACTION:string = '3';//行走
let DIE_ACTION:string = '2';//死亡
let ATTACK_ACTION:string = '0';//攻击

/// 方向常量
let UP_DIR:string = '0';
let UP_AND_RIGHT_DIR:string = '1';
let RIGHT_DIR:string = '2';
let DOWN_AND_RIGHT_DIR:string = '3';
let DOWN_DIR:string = '4';
let DOWN_AND_LEFT_DIR:string = '5'; //需要反转
let LEFT_DIR:string = '6'; //需要反转
let UP_AND_LEFT_DIR:string = '7'; //需要反转

/// 帧率常量(一秒6帧)
let FRAME_RATE:number = 6;

/// 追踪时间片（秒）
let TRACE_SEC:number = 0.3;

@ccclass
export default class Hero extends cc.Component {

    @property(cc.Node)
    hero:cc.Node = null;

    @property(cc.Animation)
    select:cc.Animation = null;

    @property(cc.Animation)
    hero_main:cc.Animation = null;

    @property(cc.Animation)
    hero_arms:cc.Animation = null;

    @property(cc.Animation)
    spr_skill:cc.Animation = null;

    @property(cc.Prefab)
    effect_pre:cc.Prefab = null;

    private pinus:Pomelo = null;
    private hero_name:string = null;
    private player:Player = null;
    private main_camere:cc.Camera = null;
    private is_init:boolean = false;

    private hero_type:string = 'p_';
    private hero_body:string = EMPTY_BODY;
    private hero_a:string = null;
    private hero_action:string = STAND_ACTION;
    private hero_dir:string = DOWN_DIR;

    private last_animation_name:string = null;
    private config_name:string = null;

    private trace_c_sec:number = 0;// 追踪当前秒数
    public tarce_pot:{x:number,y:number} = null;// 当前追踪坐标

    private attack_over_time:number = Date.now();//攻击CD记时
    private attack_cd:number = 1.1;//攻击CD秒
    
    _onMove: any;
    _onAttack: any;
    _onRagingFire: any;
    _onPursueSun: any;
    _onUpdate: any;
    _onCure_Add: any;
    _onCallPet: any;
    _onFierceWind: any;
    _onHailstorm: any;
    _onMeteorSwarm: any;
    _onHemophagy: any;
    _onSkyFire: any;
    _onDelete: any;
    _onDie: any;



    onLoad () {
        let pinus = GameUtils.getInstance().pinus;
        this.pinus = pinus;

        this._onMove = this.onMove.bind(this);
        this._onAttack = this.onAttack.bind(this);
        this._onRagingFire = this.onRagingFire.bind(this);
        this._onPursueSun = this.onPursueSun.bind(this);
        this._onUpdate = this.onUpdate.bind(this);
        this._onCure_Add = this.onCure_Add.bind(this);
        this._onCallPet = this.onCallPet.bind(this);
        this._onFierceWind = this.onFierceWind.bind(this);
        this._onHailstorm = this.onHailstorm.bind(this);
        this._onMeteorSwarm = this.onMeteorSwarm.bind(this);
        this._onHemophagy = this.onHemophagy.bind(this);
        this._onSkyFire = this.onSkyFire.bind(this);
        this._onDelete = this.onDelete.bind(this);
        this._onDie = this.onDie.bind(this);

        this.pinus.on("onMove",this._onMove);
        this.pinus.on("onAttack",this._onAttack);
        this.pinus.on("onRagingFire",this._onRagingFire);
        this.pinus.on("onPursueSun",this._onPursueSun);
        this.pinus.on("onUpdate",this._onUpdate);
        //////主动
        this.pinus.on("onCure_Add",this._onCure_Add);
        this.pinus.on("onCallPet",this._onCallPet);
        this.pinus.on("onFierceWind",this._onFierceWind);
        ////// 主动和点
        this.pinus.on("onHailstorm",this._onHailstorm);
        this.pinus.on("onMeteorSwarm",this._onMeteorSwarm);
        ////// 主动和目标
        this.pinus.on("onHemophagy",this._onHemophagy);
        this.pinus.on("onSkyFire",this._onSkyFire);

        this.pinus.on("onDelete",this._onDelete);
        this.pinus.on("onDie",this._onDie);

        let self = this;
        this.node.on(cc.Node.EventType.TOUCH_END,function (event:cc.Event.EventTouch) {
            if (self.hero_name == GameUtils.player_info.player.player.name) return;
            if (GameUtils.selete_target == self) {
                GameUtils.attack_target = self;
            }else{
                GameUtils.selete_target = self;
                GameUtils.attack_target = null;
            }
            event.stopPropagation();
        },this)
        this.select.node.active = false; //默认不显示
    }

    private onUpdate(data:Player) {
        if (!this.is_init || data.player.name != this.hero_name) return;
        this.update_player(data);
    }

    public update_player(player:Player) {
        this.player = player;
        this.hero_body = get_body(player.clothes && <ClothesConfig>player.clothes.config);
        this.hero_a = get_arms(player.arms && <ArmsConfig>player.arms.config);
        /// 更新全局数据
        let other_players:Player[] = GameUtils.player_info.other_players;
        other_players.forEach((player,index,array) => {
            if (player.player.name == this.get_name()) array[index] = this.player;
        },this);
    }

    init(hero_name:string,player:any,main_camere:cc.Camera) {
        this.hero_name = hero_name;
        this.player = player;
        this.config_name = player.config_name;
        if (this.config_name != '人') {
            this.hero_type = 'm_';
            this.hero_body = get_monster_body(this.config_name);
        }
        this.main_camere = main_camere;
        this.play_animation(true);
        this.move_to();
        this.hero_main.node.y = OFFSET_Y[this.config_name];
        this.hero_arms.node.y = OFFSET_Y[this.config_name];
        this.is_init = true;
    }

    start () {

    }

    /// 服务器方向 转换为 本地 动画方向
    public static dir_transform(dir:number) {
        if (dir == 1) return DOWN_DIR;
        else if (dir == 2) return DOWN_AND_LEFT_DIR;
        else if (dir == 3) return LEFT_DIR;
        else if (dir == 4) return UP_AND_LEFT_DIR;
        else if (dir == 5) return UP_DIR;
        else if (dir == 6) return UP_AND_RIGHT_DIR;
        else if (dir == 7) return RIGHT_DIR;
        else if (dir == 8) return DOWN_AND_RIGHT_DIR;
    }

    private compute_dir(e_pot:{x:number,y:number},o_pot:{x:number,y:number}):string {
        let c_x:number = e_pot.x - o_pot.x;
        let c_y:number = e_pot.y - o_pot.y;
        if (c_x == 0 && c_y > 0) {
            return UP_DIR;
        }else if (c_x > 0 && c_y > 0) {
            return UP_AND_RIGHT_DIR;
        }else if (c_x > 0 && c_y == 0) {
            return RIGHT_DIR;
        }else if (c_x > 0 && c_y < 0) {
            return DOWN_AND_RIGHT_DIR;
        }else if (c_x == 0 && c_y < 0) {
            return DOWN_DIR;
        }else if (c_x < 0 && c_y < 0) {
            return DOWN_AND_LEFT_DIR;
        }else if (c_x < 0 && c_y == 0) {
            return LEFT_DIR;
        }else if (c_x < 0 && c_y > 0) {
            return UP_AND_LEFT_DIR;
        }else if (c_x == 0 && c_y == 0) {
            return LEFT_DIR;
        }
    }

    private compute_dir_by_self(e_pot:{x:number,y:number}):string {
        let o_pot:{x:number,y:number} = this.player.player.point;
        return this.compute_dir(e_pot,o_pot);
    }

    private set_o_pot(o_pot:{x:number,y:number}) { /////设置初始坐标
        this.player.player.point = o_pot;
        // let pot:{x:number,y:number} = {x:o_pot.x,y:o_pot.y};
        // pot.x = pot.x*GameUtils.map_scale + GameUtils.map_scale/2;
        // pot.y = pot.y*GameUtils.map_scale + GameUtils.map_scale/2;
        // this.node.x = pot.x;
        // this.node.y = pot.y;
    }

    private onMove(data) {
        if (!this.is_init || data.path.length == 0 || data.target != this.hero_name) return;
        console.log(data);
        this.set_o_pot(data.o_pot);
        this.node.stopAllActions();
        let action_arr:cc.FiniteTimeAction[] = [];
        let path:any[] = data.path;
        let over_dir:string = UP_DIR;
        for (let index = 0; index < path.length; index++) {
            const element:{x:number,y:number} = path[index];
            if (index == path.length - 1 && !data.over) break;
            let run_action:cc.FiniteTimeAction = cc.callFunc(function() {
                let current_dir:string = this.compute_dir_by_self(element);
                over_dir = current_dir;
                this.hero_action = WALK_ACTION;
                this.hero_dir = current_dir;
                this.play_animation(true);
            }, this);
            let run_end_action:cc.FiniteTimeAction = cc.callFunc(function () {
                this.player.player.point = element;
            },this);
            let pot:{x:number,y:number} = {x:element.x,y:element.y};
            pot.x = pot.x*GameUtils.map_scale + GameUtils.map_scale/2;
            pot.y = pot.y*GameUtils.map_scale + GameUtils.map_scale/2;
            let move_action:cc.FiniteTimeAction;
            if (index == 0)move_action = cc.moveTo(data.o_tick/60,new cc.Vec2(pot.x,pot.y));
            else move_action = cc.moveTo(data.speed/60,new cc.Vec2(pot.x,pot.y));
            let action:cc.FiniteTimeAction = cc.sequence(run_action,move_action,run_end_action);
            action_arr.push(action);
        }
        let finished:cc.FiniteTimeAction = cc.callFunc(function() {
            this.hero_action = STAND_ACTION;
            this.hero_dir = over_dir;
            this.play_animation(true);
        }, this);
        action_arr.push(finished);
        if (action_arr.length > 1)this.node.runAction(cc.sequence(action_arr));
        else this.node.runAction(finished);
    }

    ///播放动画
    private play_animation(loop:boolean) {
        let frame:number = 0;
        if (this.last_animation_name) {
            let state:cc.AnimationState = this.hero_main.getAnimationState(this.last_animation_name);
            let time:number = state.time;
            frame = time * FRAME_RATE;
        }
        /// 是否显示武器
        this.hero_arms.node.active = this.hero_a ? true : false;
        let dir:number = parseInt(this.hero_dir);
        if (dir <= 4) {
            let animation_name:string = this.hero_type+this.hero_body+'_'+this.hero_action+'_'+this.hero_dir;
            let state:cc.AnimationState = this.hero_main.play(animation_name);
            this.last_animation_name = animation_name;
            let animation_a_name:string;
            let state_a:cc.AnimationState;
            if (this.hero_a) animation_a_name = 'a_'+this.hero_a+'_'+this.hero_action+'_'+this.hero_dir;
            if (this.hero_a) state_a = this.hero_arms.play(animation_a_name);
            if (loop) {
                state.wrapMode = cc.WrapMode.Loop;
                state.repeatCount = Infinity;
                let duration:number = state.duration;
                let total_frame:number = duration * FRAME_RATE;
                let next_frame:number = frame % total_frame + 1;
                let new_time:number = next_frame / FRAME_RATE;
                state.time = new_time;
                if (state_a) {
                    state_a.wrapMode = cc.WrapMode.Loop;
                    state_a.repeatCount = Infinity;
                    state_a.time = new_time;
                }
            }
            this.hero.scaleX = 1;
        }else{
            let new_dir:number = dir - 4;
            new_dir = 4 - new_dir;
            let animation_name:string = this.hero_type+this.hero_body+'_'+this.hero_action+'_'+new_dir.toString();
            let state:cc.AnimationState = this.hero_main.play(animation_name);
            this.last_animation_name = animation_name;
            let animation_a_name:string;
            let state_a:cc.AnimationState;
            if (this.hero_a) animation_a_name = 'a_'+this.hero_a+'_'+this.hero_action+'_'+new_dir.toString();
            if (this.hero_a) state_a = this.hero_arms.play(animation_a_name);
            if (loop) {
                state.wrapMode = cc.WrapMode.Loop;
                state.repeatCount = Infinity;
                let duration:number = state.duration;
                let total_frame:number = duration * FRAME_RATE;
                let next_frame:number = frame % total_frame + 1;
                let new_time:number = next_frame / FRAME_RATE;
                state.time = new_time;
                if (state_a) {
                    state_a.wrapMode = cc.WrapMode.Loop;
                    state_a.repeatCount = Infinity;
                    state_a.time = new_time;
                }
            }
            this.hero.scaleX = -1;
        }
    }

    private move_camere() {
        if (this.main_camere) {
            let pot:{x:number,y:number} = {x:this.node.x,y:this.node.y};
            let camera_pot:{x:number,y:number} = {x:pot.x - 568,y:pot.y - 320};
            camera_pot.x = camera_pot.x < 0 ? 0 : camera_pot.x;
            camera_pot.y = camera_pot.y < 0 ? 0 : camera_pot.y;
            camera_pot.x = camera_pot.x > 13120-1136 ? 13120-1136 : camera_pot.x;
            camera_pot.y = camera_pot.y > 7041-640 ? 7041-640 : camera_pot.y;
            this.main_camere.node.x = camera_pot.x;
            this.main_camere.node.y = camera_pot.y;
        }
    }

    private move_to() {
        let pot:{x:number,y:number} = {x:this.player.player.point.x,y:this.player.player.point.y};
        pot.x = pot.x*GameUtils.map_scale + GameUtils.map_scale/2;
        pot.y = pot.y*GameUtils.map_scale + GameUtils.map_scale/2;
        this.node.x = pot.x;
        this.node.y = pot.y;
    }

    public get_pot():{x:number,y:number} {
        return {x:this.player.player.point.x,y:this.player.player.point.y};
    }

    public get_name():string {
        return this.hero_name;
    }

    private trace_target(dt:number) { //追踪目标
        if (!this.main_camere)return;
        if (!GameUtils.attack_target)return;
        this.trace_c_sec += dt;
        if (this.trace_c_sec >= TRACE_SEC || this.tarce_pot == null) {
            this.trace_c_sec = 0;
            if (this.tarce_pot == null) {
                this.tarce_pot = GameUtils.attack_target.get_pot();
                this.goto(this.tarce_pot);
            }else{
                let target_pot:{x:number,y:number} = GameUtils.attack_target.get_pot();
                if (this.tarce_pot.x != target_pot.x || this.tarce_pot.y != target_pot.y) {
                    this.tarce_pot = GameUtils.attack_target.get_pot();
                    this.goto(this.tarce_pot);
                    return;
                }else if (get_l(this.tarce_pot,this.get_pot()) < 2) {
                    if (this.attack_over_time > Date.now())return;
                    this.attack_over_time = Date.now() + this.attack_cd*1000;
                    this.attack(GameUtils.attack_target.get_name());
                }
            }
        }
    }

    update (dt:number) {
        this.move_camere();
        if (GameUtils.selete_target == this && this.select.node.active == false)this.select.node.active = true;
        else if (GameUtils.selete_target != this && this.select.node.active)this.select.node.active = false;
        this.trace_target(dt);
    }

    onAttack(data:any) {
        if (!this.is_init || data.active != this.hero_name) return;
        console.log(data);
        this.node.stopAllActions();
        let element:{x:number,y:number} = data.e_pot;
        let current_dir:string = this.compute_dir_by_self(element);
        let run_action:cc.FiniteTimeAction = cc.callFunc(function() {
            this.hero_action = ATTACK_ACTION;
            this.hero_dir = current_dir;
            this.play_animation(false);
        }, this);
        let gap_action:cc.FiniteTimeAction = cc.delayTime(this.attack_cd);
        let finished:cc.FiniteTimeAction = cc.callFunc(function() {
            this.hero_action = STAND_ACTION;
            this.hero_dir = current_dir;
            this.play_animation(true);
        }, this);
        this.node.runAction(cc.sequence(run_action,gap_action,finished));
    }
    /***
     * 烈火
     */
    onRagingFire(data:any) {
        if (!this.is_init || data.active != this.hero_name) return;
        console.log(data);
        this.node.stopAllActions();
        let element:{x:number,y:number} = data.e_pot;
        let current_dir:string = this.compute_dir_by_self(element);

        let run_action:cc.FiniteTimeAction = cc.callFunc(function() {
            this.hero_action = ATTACK_ACTION;
            this.hero_dir = current_dir;
            this.play_animation(false);
            ///播放烈火特效
            let animation_name:string = 'e_031_'+this.hero_dir;
            let state:cc.AnimationState = this.spr_skill.play(animation_name);
            this.spr_skill.node.active = true;
            if (parseInt(this.hero_dir) > 4) this.spr_skill.node.scaleX = -1;
            else this.spr_skill.node.scaleX = 1;
        }, this);
        let gap_action:cc.FiniteTimeAction = cc.delayTime(this.attack_cd);
        let finished:cc.FiniteTimeAction = cc.callFunc(function() {
            this.hero_action = STAND_ACTION;
            this.hero_dir = current_dir;
            this.play_animation(true);
            ///隐藏烈火
            this.spr_skill.node.active = false;
        }, this);
        this.node.runAction(cc.sequence(run_action,gap_action,finished));
        this.attack_over_time = Date.now() + this.attack_cd*1000;
    }
    /**
     * 逐日剑法
     * @param data 
     */
    onPursueSun(data:any) {
        if (!this.is_init || data.active != this.hero_name) return;
        console.log(data);
        this.node.stopAllActions();
        let dir:number = data.dir;
        let current_dir:string = Hero.dir_transform(dir);

        let run_action:cc.FiniteTimeAction = cc.callFunc(function() {
            this.hero_action = ATTACK_ACTION;
            this.hero_dir = current_dir;
            this.play_animation(false);
        }, this);
        let gap_action:cc.FiniteTimeAction = cc.delayTime(this.attack_cd);
        let finished:cc.FiniteTimeAction = cc.callFunc(function() {
            this.hero_action = STAND_ACTION;
            this.hero_dir = current_dir;
            this.play_animation(true);
        }, this);
        this.node.runAction(cc.sequence(run_action,gap_action,finished));
        /// 场景上表现效果
        let node = cc.instantiate(this.effect_pre);
        let effect:Effect = node.getComponent(Effect);
        effect.init("onPursueSun",this.get_pot(),GameUtils.game_scene.map.node,dir);
    }

    /**
     * 角色展示施法动作
     * @param e_pot 
     */
    private skill_action(e_pot?:Point) {
        this.node.stopAllActions();
        let current_dir:string;
        if(e_pot) current_dir = this.compute_dir_by_self(e_pot);
        else current_dir = this.hero_dir;
        let run_action:cc.FiniteTimeAction = cc.callFunc(function() {
            this.hero_action = SPELL_ACTION;
            this.hero_dir = current_dir;
            this.play_animation(false);
        }, this);
        let gap_action:cc.FiniteTimeAction = cc.delayTime(this.attack_cd);
        let finished:cc.FiniteTimeAction = cc.callFunc(function() {
            this.hero_action = STAND_ACTION;
            this.hero_dir = current_dir;
            this.play_animation(true);
        }, this);
        this.node.runAction(cc.sequence(run_action,gap_action,finished));
    }

    /**
     * 使用药品（自身法术）
     * @param data 
     */
    onCure_Add(data: any) {
        let {active,blood,magic} = data;
        if (!this.is_init || data.active != this.hero_name) return;
        ////表现效果
        let node = cc.instantiate(this.effect_pre);
        let effect:Effect = node.getComponent(Effect);
        effect.init("onCure_Add",{x:0,y:0},this.node);
        
        //// 飘字
        let node_blood:cc.Node = new cc.Node();
        node_blood.addComponent(cc.Label);
        let lbl_blood:cc.Label = node_blood.getComponent(cc.Label);
        lbl_blood.fontSize = 20;
        lbl_blood.node.color = cc.color(255,0,0,255);
        this.node.addChild(lbl_blood.node);
        lbl_blood.string = "气血增加:"+blood;
        lbl_blood.node.position = new cc.Vec2(0,0);
        
        let node_magic:cc.Node = new cc.Node();
        node_magic.addComponent(cc.Label);
        let lbl_magic:cc.Label = node_magic.getComponent(cc.Label);
        lbl_magic.fontSize = 20;
        lbl_magic.node.color = cc.color(0,0,255,255);
        this.node.addChild(lbl_magic.node);
        lbl_magic.string = "魔法增加:"+magic;
        lbl_magic.node.position = new cc.Vec2(0,0);

        function build_action(node:cc.Node,out_time?:number):cc.FiniteTimeAction {
            let run_action:cc.FiniteTimeAction = cc.moveTo(2,0,100);
            let finished:cc.FiniteTimeAction = cc.callFunc(function() {
                node.parent = null;
            });
            if (!out_time) {
                return cc.sequence(run_action,finished);
            }else{
                let gap_action:cc.FiniteTimeAction = cc.delayTime(out_time);
                return cc.sequence(gap_action,run_action,finished);
            }
        }
        node_blood.runAction(build_action(node_blood));
        node_magic.runAction(build_action(node_magic,1));
        
        if (parseInt(this.hero_dir) > 4) {
            node_blood.scaleX = -1;
            node_magic.scaleX = -1;
        }
    }
    /**
     * 召唤宠物（自身法术）
     * @param data 
     */
    onCallPet(data: any) {
        let {active} = data;
        if (!this.is_init || data.active != this.hero_name) return;
        ////表现效果
        let node = cc.instantiate(this.effect_pre);
        let effect:Effect = node.getComponent(Effect);
        effect.init("onCallPet",{x:0,y:0},this.node);
        this.skill_action();
    }
    /**
     * 使用狂风斩（自身法术）
     * @param data 
     */
    onFierceWind(data: any) {
        let {active} = data;
        if (!this.is_init || data.active != this.hero_name) return;
        ////表现效果
        let node = cc.instantiate(this.effect_pre);
        let effect:Effect = node.getComponent(Effect);
        effect.init("onFierceWind",{x:0,y:0},this.node);
        this.skill_action();
    }


    /**
     * 冰咆哮（范围法术）
     * @param data 
     */
    onHailstorm(data: any) {
        let {active,pot} = data;
        if (!this.is_init || data.active != this.hero_name) return;
        ////表现效果
        let node = cc.instantiate(this.effect_pre);
        let effect:Effect = node.getComponent(Effect);
        effect.init("onHailstorm",pot,GameUtils.game_scene.map.node);
        this.skill_action(pot);
    }
    /**
     * 流星火雨（范围法术）
     * @param data 
     */
    onMeteorSwarm(data: any) {
        let {active,pot} = data;
        if (!this.is_init || data.active != this.hero_name) return;
        ////表现效果
        let node = cc.instantiate(this.effect_pre);
        let effect:Effect = node.getComponent(Effect);
        effect.init("onMeteorSwarm",pot,GameUtils.game_scene.map.node);
        this.skill_action(pot);
    }


    /**
     * 嗜血术(单秒法术)
     * @param data 
     */
    onHemophagy(data: any) {
        let {active,target} = data;
        if (!this.is_init || (active != this.hero_name && target != this.hero_name)) return;
        ////表现效果
        if (active == this.hero_name) {
            this.skill_action();
        }else if (target == this.hero_name) {
            let node = cc.instantiate(this.effect_pre);
            let effect:Effect = node.getComponent(Effect);
            effect.init("onHemophagy",{x:0,y:0},this.node);
        }
    }
    /**
     * 灭天火(单秒法术)
     * @param data 
     */
    onSkyFire(data: any) {
        let {active,target} = data;
        if (!this.is_init || (active != this.hero_name && target != this.hero_name)) return;
        ////表现效果
        if (active == this.hero_name) {
            this.skill_action();
        }else if (target == this.hero_name) {
            let node = cc.instantiate(this.effect_pre);
            let effect:Effect = node.getComponent(Effect);
            effect.init("onSkyFire",{x:0,y:0},this.node);
        }
    }

    
    /**
     * 删除角色
     * @param data 
     */
    onDelete(data:Player) {
        if (!this.is_init || (data.player.name != this.hero_name)) return;
        let player:GameInfo = GameUtils.player_info;
        let other_players:Player[] = player.other_players;
        let new_players:Player[] = [];
        other_players.forEach(element => {
            if (element.player.name != data.player.name) new_players.push(element);
        });
        player.other_players = new_players;

        let other_heros:Hero[] = GameUtils.game_scene.other_heros;
        let new_heros:Hero[] = [];
        other_heros.forEach(element => {
            if (element.get_name() != data.player.name) new_heros.push(element);
        });
        GameUtils.game_scene.other_heros = new_heros;

        this.pinus.off("onMove",this._onMove);
        this.pinus.off("onAttack",this._onAttack);
        this.pinus.off("onRagingFire",this._onRagingFire);
        this.pinus.off("onPursueSun",this._onPursueSun);
        this.pinus.off("onUpdate",this._onUpdate);
        //////主动
        this.pinus.off("onCure_Add",this._onCure_Add);
        this.pinus.off("onCallPet",this._onCallPet);
        this.pinus.off("onFierceWind",this._onFierceWind);
        ////// 主动和点
        this.pinus.off("onHailstorm",this._onHailstorm);
        this.pinus.off("onMeteorSwarm",this._onMeteorSwarm);
        ////// 主动和目标
        this.pinus.off("onHemophagy",this._onHemophagy);
        this.pinus.off("onSkyFire",this._onSkyFire);

        this.pinus.off("onDelete",this._onDelete);
        this.pinus.off("onDie",this._onDie);

        this.node.removeFromParent();
    }
    
    /**
     * 角色死亡
     * @param data 
     */
    onDie(data:Player) {
        if (!this.is_init || (data.player.name != this.hero_name)) return;
        this.node.stopAllActions();
        this.hero_action = DIE_ACTION;
        this.play_animation(false);
    }
    ///////////////////////////////操作接口////////////////////////////////////
    
    public goto(pot:{x:number,y:number}) {
        if (!this.is_init) return;
        var route = "scene.sceneHandler.move_to";
        this.pinus.request(route, {
            pot: pot,
            target: this.hero_name
        }, function(data) {
            if(data.error) {
                console.log("xiaowa ========= move_to fail");
                return;
            }else{
                cc.log(data);
            }
        });
    }

    public attack(target: string) {
        if (!this.is_init) return;
        var route = "scene.sceneHandler.attack";
        this.pinus.request(route, {
            target: target
        }, function(data) {
            if(data.error) {
                console.log("xiaowa ========= attack fail");
                return;
            }else{
                cc.log(data);
            }
        });
    }
}
