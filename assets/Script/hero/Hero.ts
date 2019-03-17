import { GameUtils } from "../utils/GameUtils";

const {ccclass, property} = cc._decorator;

/// 角色Y轴偏移常量
let OFFSET_Y:{} = {'人':30,'骷髅':40,'麒麟':50,'哮天犬':60};

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

    private pinus:Pomelo = null;
    private hero_name:string = null;
    private player:any = null;
    private main_camere:cc.Camera = null;
    private is_init:boolean = false;

    private hero_body:string = EMPTY_BODY;
    private hero_action:string = STAND_ACTION;
    private hero_dir:string = DOWN_DIR;

    private last_animation_name:string = null;
    private config_name:string = null;

    onLoad () {
        let pinus = GameUtils.getInstance().pinus;
        this.pinus = pinus;
        this.pinus.on("onMove",this.onMove.bind(this));

        let self = this;
        this.node.on(cc.Node.EventType.TOUCH_END,function (event:cc.Event.EventTouch) {
            if (self.hero_name == GameUtils.player_info.player.player.name) return;
            if (GameUtils.selete_target == self) {
                GameUtils.attack_target = self;
            }else{
                GameUtils.selete_target = self;
            }
            event.stopPropagation();
        },this)
        this.select.node.active = false; //默认不显示
    }

    init(hero_name:string,player:any,main_camere:cc.Camera) {
        this.hero_name = hero_name;
        this.player = player;
        this.config_name = player.config_name;
        this.main_camere = main_camere;
        this.play_animation(true);
        this.move_to();
        this.hero_main.node.y = OFFSET_Y[this.config_name];
        this.hero_arms.node.y = OFFSET_Y[this.config_name];
        this.is_init = true;
    }

    start () {

    }

    public compute_dir(e_pot:{x:number,y:number}):string {
        let o_pot:{x:number,y:number} = this.player.player.point;
        let c_x:number = e_pot.x - o_pot.x;
        let c_y:number = e_pot.y - o_pot.y;
        if (c_x == 0 && c_y == 1) {
            return UP_DIR;
        }else if (c_x == 1 && c_y == 1) {
            return UP_AND_RIGHT_DIR;
        }else if (c_x == 1 && c_y == 0) {
            return RIGHT_DIR;
        }else if (c_x == 1 && c_y == -1) {
            return DOWN_AND_RIGHT_DIR;
        }else if (c_x == 0 && c_y == -1) {
            return DOWN_DIR;
        }else if (c_x == -1 && c_y == -1) {
            return DOWN_AND_LEFT_DIR;
        }else if (c_x == -1 && c_y == 0) {
            return LEFT_DIR;
        }else if (c_x == -1 && c_y == 1) {
            return UP_AND_LEFT_DIR;
        }
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
                let current_dir:string = this.compute_dir(element);
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
        this.node.runAction(cc.sequence(action_arr));
    }

    ///播放动画
    private play_animation(loop:boolean) {
        let frame:number = 0;
        if (this.last_animation_name) {
            let state:cc.AnimationState = this.hero_main.getAnimationState(this.last_animation_name);
            let time:number = state.time;
            frame = time * FRAME_RATE;
        }
        let dir:number = parseInt(this.hero_dir);
        if (dir <= 4) {
            let animation_name:string = 'p_'+this.hero_body+'_'+this.hero_action+'_'+this.hero_dir;
            let state:cc.AnimationState = this.hero_main.play(animation_name);
            this.last_animation_name = animation_name;
            if (loop) {
                state.wrapMode = cc.WrapMode.Loop;
                state.repeatCount = Infinity;
                let duration:number = state.duration;
                let total_frame:number = duration * FRAME_RATE;
                let next_frame:number = frame % total_frame + 1;
                let new_time:number = next_frame / FRAME_RATE;
                state.time = new_time;
            }
            this.hero.scaleX = 1;
        }else{
            let new_dir:number = dir - 4;
            new_dir = 4 - new_dir;
            let animation_name:string = 'p_'+this.hero_body+'_'+this.hero_action+'_'+new_dir.toString();
            let state:cc.AnimationState = this.hero_main.play(animation_name);
            this.last_animation_name = animation_name;
            if (loop) {
                state.wrapMode = cc.WrapMode.Loop;
                state.repeatCount = Infinity;
                let duration:number = state.duration;
                let total_frame:number = duration * FRAME_RATE;
                let next_frame:number = frame % total_frame + 1;
                let new_time:number = next_frame / FRAME_RATE;
                state.time = new_time;
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
            camera_pot.x = camera_pot.x > 10000-1136 ? 10000-1136 : camera_pot.x;
            camera_pot.y = camera_pot.y > 10000-640 ? 10000-640 : camera_pot.y;
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

    update (dt) {
        this.move_camere();
        if (GameUtils.selete_target == this && this.select.node.active == false)this.select.node.active = true;
        else if (GameUtils.selete_target != this && this.select.node.active)this.select.node.active = false;
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
}
