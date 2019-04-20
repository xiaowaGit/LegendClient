import Hero from "../hero/Hero";
import { GameInfo, ResInfo } from "./tool";
import ResInfoUI from "../ui/ResInfoUI";

export class GameUtils {

    private static _instance:GameUtils = null;
    public windowTool:any = window;
    public pinus:Pomelo = null;

    public static player_info:GameInfo = null;
    public static player_ress:ResInfo[] = null;
    public static map_scale:number = 20; //方块大小
    public static selete_target:Hero = null;
    public static attack_target:Hero = null;
    public static self_player:Hero = null;
    public static res_info_ui:ResInfoUI = null;
    public static ui_camera: cc.Camera = null;

    ///格子
    public static down_fast_grids:cc.Sprite[] = null;
    public static right_fast_grids:cc.Sprite[] = null;
    public static bag_grids:cc.Sprite[] = null;
    public static grid_arms:cc.Sprite = null;//武器
    public static grid_helmet:cc.Sprite = null;//头盔
    public static grid_clothes:cc.Sprite = null;//衣服
    public static grid_shoes:cc.Sprite = null;//鞋子
    public static grid_jewelry:cc.Sprite = null;//首饰
    public static grid_necklace:cc.Sprite = null;//项链

    public static goto_gap:number = 250;//两次行走的操作的最短间隔
    

    public static getInstance():GameUtils {
        if (!GameUtils._instance) {
            GameUtils._instance = new GameUtils();
        }
        return GameUtils._instance;
    }

    init() {
        this.pinus = this.windowTool.pomelo;
    }
}
