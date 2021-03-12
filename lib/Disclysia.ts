import EventEmitter from "eventemitter3"
import Gateway from "./connection/Gateway"
import Guild from "./structures/Guild"
import Message from "./structures/Message"
import RequestHandler from "./utils/rest/RequestHandler"
import * as Constants from "./utils/Constants"
import Member from "./structures/Member"

//todo
export class Client extends EventEmitter {

    guilds: Map<string, Guild> = new Map<string, Guild>()
    guild_channel: Map<string, Guild> = new Map<string, Guild>()

    private_channels: Map<string, string> = new Map<string, string>()

    gateway: Gateway

    token: string

    requestHandler: RequestHandler

    constructor(token: string) {
        super()

        this.token = token
        this.requestHandler = new RequestHandler(this)

        this.gateway = new Gateway(token, this)

    }

    sendMessage(channel_id: string, content: any) {
        return new Promise((resolve, reject) => {
            if (typeof content != "object") {
                content = {
                    content: "" + content
                }
            } else if (content.content && typeof content.content != "string") {
                content.content = "" + content.content
            }

            return this.requestHandler.request(Constants.CHANNEL_MESSAGES(channel_id), content, "POST").then((message) => { resolve(this._parseMessage(message)) }).catch(e => { reject(e) })
        })
    }

    addRole(guild_id, member_id, role_id): Promise<void> {
        return new Promise((resolve, reject) => {
            return this.requestHandler.request(Constants.MEMBER_ROLE(guild_id, member_id, role_id), {}, "PUT").then(() => { resolve() }).catch(e => { reject(e) })
        })
    }

    removeRole(guild_id, member_id, role_id): Promise<void> {
        return new Promise((resolve, reject) => {
            return this.requestHandler.request(Constants.MEMBER_ROLE(guild_id, member_id, role_id), {}, "DELETE").then(() => { resolve() }).catch(e => { reject(e) })
        })
    }

    editMember(guild_id, member_id, nick?): Promise<void> {
        return new Promise((resolve, reject) => {
            return this.requestHandler.request(Constants.MEMBER_EDIT(guild_id, member_id), {
                nick: nick
            }, "PATCH").then((res: any) => {
                if (res.user) resolve()
                else reject(res.message)
            }).catch(e => { reject(e) })
        })
    }

    getDMChannel(member_id) {
        if (this.private_channels.has(member_id)) return this.private_channels.get(member_id)

        return new Promise((resolve, reject) => {
            return this.requestHandler.request(Constants.USER_CHANNEL("@me"), {
                recipients: [member_id],
                type: 1
            }, "POST").then((channel) => {
                //@ts-ignore
                this.private_channels.set(member_id, channel.id);
                //@ts-ignore
                resolve(channel.id);
            }).catch(e => { reject(e) })
        })
    }

    getGuilds() {
        return this.guilds
    }

    getMember(guild_id, member_id): Member {
        return this.guilds.get(guild_id).getMember(member_id)
    }

    getGateway(): Gateway {
        return this.gateway
    }

    _parseMessage(message) {
        return new Message(this.guild_channel.get(message.channel_id) ? this.guild_channel.get(message.channel_id).id : "", message.attachments, { bot: message.author.bot, username: message.author.username, id: message.author.id }, message.channel_id, message.content, message.id, message.mention_roles, message.mentions, [], this)
    }

}