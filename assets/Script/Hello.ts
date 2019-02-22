// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property
    text: string = 'hello';

    // LIFE-CYCLE CALLBACKS:

    onLoad () { 
        var pinus = window.pinus;
        var host = "127.0.0.1"; 
        var port = "3010"; 
        var username:string = 'xiaowa';

        // query connector
        function queryEntry(uid, callback) {
            var route = 'gate.gateHandler.queryEntry';
            pinus.init({
                host: host,
                port: "3014",
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
		queryEntry(username, function(host, port) {
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
                    }
				});
			});
        });
        
        // pinus.init({ 
        //     host: host, 
        //     port: port, 
        //     log: true 
        // }, function () { 
        //     pinus.request("connector.entryHandler.entry", "hello pinus", function (data) { 
        //         cc.log(data.msg); 
        //     }); 
        // }); 
    }

    start () {

    }

    // update (dt) {}
}
