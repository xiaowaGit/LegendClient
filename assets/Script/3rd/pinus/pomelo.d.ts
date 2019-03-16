
//注意最外层的声明要用declare不能用export
declare let EventEmitter: Emitter;
declare let pinus:Pomelo = Window.pomelo;
declare class Emitter {
    on(event: string, fn: Function): Emitter;
    once(event: string, fn: Function): Emitter;
    addEventListener(event: string, fn: Function): Emitter;
    off(event: string, fn: Function): Emitter;
    removeListener(event: string): Emitter;
    removeAllListeners(): Emitter;
    removeEventListener(event: string, fn: Function): Emitter;
    emit(event: string): Emitter;
    listeners(event: string): Function[];
    hasListeners(event: string): boolean;
}
declare class Pomelo extends Emitter {
    data: Object;
    init(params: {}, cb: Function): void;
    disconnect(): void;
    notify(route: string, msg: {}): void;
    request(route: string, msg: {}, cb: Function): void;
}

declare class PomeloClient {
    JS_WS_CLIENT_TYPE: string;
    JS_WS_CLIENT_VERSION: string;
    RES_OK: number;
    RES_FAIL: number;
    RES_OLD_CLIENT: number;
    root: any;
    pomelo: Pomelo;
    socket: any;
    reqId: number;
    callbacks: {};
    handlers: {};
    routeMap: {};
    heartbeatInterval: number;
    heartbeatTimeout: number;
    extHeartbeatTimeout: number;
    gapThreshold: number;
    heartbeatId: number;
    heartbeatTimeoutId: number;
    handshakeCallback: Function;
    decode: Function;
    encode: Function;
    useCrypto: boolean;
    handshakeBuffer: {};
    initCallback: Function;
}