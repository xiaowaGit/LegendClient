import { GameUtils } from "../utils/GameUtils";
import { GameInfo, Player } from "../utils/tool";

const {ccclass, property} = cc._decorator;

@ccclass
export default class LoginScene extends cc.Component {

    @property(cc.EditBox)
    edit_name: cc.EditBox = null;

    @property(cc.Button)
    btn_login: cc.Button = null;

    private _onCreate: any;
    private _onDelete: any;

    onLoad () {
        let self = this;
        this.btn_login.node.on("click",function () {
            self.login();
        },this);
        this._onCreate = this.onCreate.bind(this);
        this._onDelete = this.onDelete.bind(this);
    }

    login() {
        this.btn_login.enabled = false;//防止继续点击
        this.btn_login.interactable = false;
        GameUtils.getInstance().init();
        var pinus = GameUtils.getInstance().pinus;
        // var host = "47.99.218.131";
        var host = "127.0.0.1";
        var username:string = this.edit_name.string;

        let self = this;
        // query connector
        function queryEntry(uid, callback) {
            var route = 'gate.gateHandler.queryEntry';
            pinus.init({
                host: host,
                port: 3014,
                log: true
            }, function() {
                pinus.request(route, {
                    uid: uid
                }, function(data) {
                    pinus.disconnect();
                    if(data.code === 500) {
                        console.log("xiaowa ========= queryEntry fail");
                        self.btn_login.enabled = true;
                        self.btn_login.interactable = true;
                        return;
                    }
                    callback(data.host, data.port);
                });
            });
        };

        //query entry of connection
		queryEntry(username, function(host:string,port:string) {
			pinus.init({
				host: host,
				port: port,
				log: true
			}, function() {
				var route = "connector.entryHandler.entry";
				pinus.request(route, {
					username: username,
				}, function(data) {
					if(data.error) {
                        console.log("xiaowa ========= entry fail");
                        self.btn_login.enabled = true;
                        self.btn_login.interactable = true;
						return;
					}else{
                        cc.log(data);
                        GameUtils.player_info = data;
                        pinus.on("onCreate",self._onCreate);
                        pinus.on("onDelete",self._onDelete);
                        cc.director.loadScene("GameScene");
                    }
				});
			});
        });
        
    }

    onCreate(data:Player,is_init:boolean = true) {
        let player:GameInfo = GameUtils.player_info;
        if (is_init && data.player.name != player.player.player.name)player.other_players.push(data);
        console.log("xiaowa ============onCreate :",data.player.name);
    }
    
    onDelete(data:Player,is_init:boolean = true) {
        let player:GameInfo = GameUtils.player_info;
        let other_players:Player[] = player.other_players;
        let new_players:Player[] = [];
        other_players.forEach(element => {
            if (element.player.name != data.player.name) new_players.push(element);
        });
        player.other_players = new_players;
        console.log("xiaowa ============onDelete :",data.player.name);
    }

    onDestroy() {
        var pinus = GameUtils.getInstance().pinus;
        pinus.off("onCreate",this._onCreate);
        pinus.off("onDelete",this._onDelete);
        console.log("xiaowa =========== loginScene onDestroy");
    }

    start ( ) {

    }

    // update (dt) {}
}
