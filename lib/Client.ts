import EventEmitter from "eventemitter3";
import Gateway from "./connection/Gateway";
import Guild from "./structures/Guild";

//todo
export default class Client extends EventEmitter {

    guilds: Map<string, Guild> = new Map<string, Guild>();

    gateway: Gateway

    constructor(token: string) {
        super();

        this.gateway = new Gateway(token, this)
    }

    sendMessage(channel_id: string, content: string) {
        
    }

}