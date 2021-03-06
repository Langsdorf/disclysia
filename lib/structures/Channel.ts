//https://discord.com/developers/docs/resources/channel#channel-object-channel-types

import { Disclysia } from "../Disclysia"
import Overwrite from "./Overwrite"

export default class Channel {

    client: Disclysia
    id: string
    name: string
    parent_id: string
    permission_overwrites: Array<Overwrite>
    type: number

    constructor(client: Disclysia, id: string, name: string, parent_id: string, permission_overwrites: Array<Overwrite>, type: number) {
        this.client = client
        this.id = id
        this.name = name
        this.parent_id = parent_id
        this.permission_overwrites = permission_overwrites
        this.type = type
    }


}