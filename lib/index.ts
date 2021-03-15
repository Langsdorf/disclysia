import { Disclysia } from "./Disclysia"


function Client(token: string) {
    return new Disclysia(token)
}

export default Client