export default class Permission {

    allow: string
    deny: string
    type: number
    id: string

    constructor(allow: string, deny: string, type: number, id: string) {
        this.allow = allow
        this.deny = deny
        this.type = type
        this.id = id
    }

}