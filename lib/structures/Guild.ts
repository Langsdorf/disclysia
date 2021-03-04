import { Client } from "../Disclysia"
import Channel from "./Channel"
import Member from "./Member"
import Overwrite from "./Overwrite"
import Role from "./Role"

export default class Guild {

    id!: string
    channels: Map<string, Channel> = new Map<string, Channel>()
    member_count!: number
    roles: Map<string, Role> = new Map<string, Role>()
    name!: string
    ownerID!: string
    members: Map<string, Member> = new Map<string, Member>()
    client: Client


    constructor(client: Client) {
        this.client = client
    }

    getChannel(channel_id: string): Channel | undefined {
        return this.channels.get(channel_id)
    }

    getRole(role_id: string): Role | undefined {
        return this.roles.get(role_id)
    }

    getMember(member_id: string): Member | undefined {

        return this.members.get(member_id)
    }

    _configureFromPacket(data: any) {
        this.id = data.id
        this.member_count = data.member_count
        this.name = data.name
        this.ownerID = data.owner_id

        data.channels.forEach((rawCH: any) => {
            let permission_overwrites: Array<Overwrite> = []
            
            rawCH.permission_overwrites.forEach((ow: any) => {
                permission_overwrites.push(new Overwrite(ow.allow, ow.deny, ow.type, ow.id))
            })

            this.channels.set(rawCH.id, new Channel(this.client, rawCH.id, rawCH.name, rawCH.parent_id, permission_overwrites, rawCH.type))
            this.client.guild_channel.set(rawCH.id, this)
        })

        data.roles.forEach((rawRole: any) => {
            this.roles.set(rawRole.id, new Role(rawRole.id, rawRole.name, rawRole.permission, this.client))
        })

        data.members.forEach((rawMember: any) => {
            this.members.set(rawMember.user.id, new Member(this.client, rawMember.nick, rawMember.user.id, rawMember.roles, this.id))
        })

        this.client.guilds.set(this.id, this)
    }
}