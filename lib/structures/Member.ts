import { Disclysia } from "../Disclysia"

export default class Member {

    client: Disclysia
    nickname: string
    id: string
    roles: Array<string>
    guild_id: string

    constructor(client: Disclysia, nickname: string, id: string, roles: Array<string>, guild_id: string) {
        this.client = client
        this.nickname = nickname
        this.id = id
        this.roles = roles
        this.guild_id = guild_id
    }

    addRole(role_id): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client.addRole(this.guild_id, this.id, role_id).then(resolve).catch(reject)
        })
    }

    removeRole(role_id): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client.removeRole(this.guild_id, this.id, role_id).then(resolve).catch(reject)
        })
    }

    setNickname(nick?) {
        return new Promise((resolve, reject) => {
            this.client.editMember(this.guild_id, this.id, nick).then(resolve).catch(reject)
        })
    }
}