import { Disclysia } from "../Disclysia"

export default class Role {
    
    id: string
    name: string
    permissions: string
    client: Disclysia

    constructor(id: string, name: string, permissions: string, client: Disclysia) {
        this.id = id
        this.name = name
        this.permissions = permissions
        this.client = client
    }
}