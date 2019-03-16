import { GameUtils } from "../utils/GameUtils";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.EditBox)
    edit_name: cc.EditBox = null;

    @property(cc.Button)
    btn_login: cc.Button = null;

    onLoad () {
        let self = this;
        this.btn_login.node.on(cc.Node.EventType.TOUCH_END,function () {
            self.login();
        },this);
    }

    login() {

        GameUtils.getInstance().init();
        var pinus = GameUtils.getInstance().pinus;
        var host = "127.0.0.1";
        var username:string = this.edit_name.string;

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
						return;
					}else{
                        cc.log(data);
                        GameUtils.player_info = data;
                        cc.director.loadScene("GameScene");
                    }
				});
			});
        });
        
    }

    start ( ) {

    }

    // update (dt) {}
}
