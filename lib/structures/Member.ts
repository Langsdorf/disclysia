import { Client } from "../Disclysia";

export default class Member {

    client: Client
    nickname: string
    id: string
    roles: Array<string>

    constructor(client: Client, nickname: string, id: string, roles: Array<string>) {
        this.client = client;
        this.nickname = nickname;
        this.id = id;
        this.roles = roles
    }
    
}