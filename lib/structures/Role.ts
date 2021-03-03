import { Client } from "../Disclysia"

export default class Role {
    
    id: string
    name: string
    permissions: string
    client: Client

    constructor(id: string, name: string, permissions: string, client: Client) {
        this.id = id
        this.name = name
        this.permissions = permissions
        this.client = client
    }
}