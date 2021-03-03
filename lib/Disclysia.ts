import EventEmitter from "eventemitter3";
import Gateway from "./connection/Gateway";
import Guild from "./structures/Guild";
import Message from "./structures/Message";
import RequestHandler from "./utils/rest/RequestHandler";
import * as Constants from "./utils/Constants"

//todo
export class Client extends EventEmitter {

    guilds: Map<string, Guild> = new Map<string, Guild>();
    guild_channel: Map<string, Guild> = new Map<string, Guild>();

    gateway: Gateway

    token: string

    requestHandler: RequestHandler

    constructor(token: string) {
        super();

        this.token = token
        this.requestHandler = new RequestHandler(this)

        this.gateway = new Gateway(token, this)

    }

    sendMessage(channel_id: string, content: any) {

        return new Promise((resolve, reject) => {
            if (typeof content != "object") {
                content = {
                    content: "" + content
                };
            } else if (content.content && typeof content.content != "string") {
                content.content = "" + content.content;
            }

            return this.requestHandler.request(Constants.CHANNEL_MESSAGES(channel_id), content, "POST").then((message) => { resolve(this._parseMessage(message)) }).catch(e => { reject(e) });
        })
    }

    getGateway(): Gateway {
        return this.gateway
    }

    _parseMessage(message) {
        return new Message(this.guild_channel.get(message.channel_id).id, message.attachments, { bot: message.author.bot, username: message.author.username, id: message.author.id }, message.channel_id, message.content, message.id, message.mention_roles, message.mentions, [], this)
    }

}