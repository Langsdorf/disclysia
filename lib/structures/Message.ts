import { Disclysia } from "../Disclysia"
import Embed from "./Embed"

export default class Message {
    guild_id: string
    attachments: Array<any>
    author: {
        id: string
        bot: boolean
        username: string
    }
    channel_id: string
    content: string
    //embeds: Array<Embed>
    id: string
    mention_roles: Array<string>
    mention_users: Array<any>
    mention_channels: Array<string>

    client: Disclysia

    constructor(guild_id: string, attachments: Array<any>, author: {bot: boolean, username: string, id: string}, channel_id: string, content: string, id: string, mention_roles: Array<string>, mention_users: Array<any>, mention_channels: Array<string>, client: Disclysia) {
        this.guild_id = guild_id
        this.attachments = attachments
        this.author = {
            bot: author.bot || false,
            id: author.id,
            username: author.username
        }
        this.channel_id = channel_id
        this.content = content
        this.id = id
        this.mention_roles = mention_roles
        this.mention_channels = mention_channels
        this.mention_users = mention_users

        this.client = client
    }
}