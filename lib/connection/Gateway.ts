import * as Constants from "../utils/Constants"
import ZlibSync from "zlib-sync"
import Erlpack from "erlpack"
import WebSocket from "./WebSocket"
import EventEmitter from "eventemitter3"
import Bucket from "../utils/Bucket"
import Client from "../Client"
import Guild from "../structures/Guild"
import Message from "../structures/Message"


export default class Gateway extends EventEmitter {


    zlib: ZlibSync.Inflate
    token: string
    ws: WebSocket | null = null
    bucket: Bucket
    client: Client

    sequence: undefined | number = 0
    sessionID: any | null = null
    trace: Array<any> = []

    reconnectInterval: number = 1000
    reconnectMax: number = 5
    reconnects: number = 0

    ready: boolean = false
    killed: boolean = false


    heartbeat: {
        ack: boolean
        lastAck: null | number
        lastSent: null | number
        interval: null | any
    } = {
            ack: false,
            lastAck: null,
            lastSent: null,
            interval: null
        }

    presence: {
        afk: boolean
        since: string | null
        status: string
    } = {
            afk: false,
            since: null,
            status: Constants.Presence.ONLINE
        }

    constructor(token: string, client: Client) {
        super()

        this.token = token
        this.client = client
        this.zlib = new ZlibSync.Inflate({ chunkSize: Constants.ZLIB_CHUNK_SIZE })
        this.bucket = new Bucket()

    }

    connect() {

        if (this.killed || (this.ws && this.ws.connected)) {
            this.emit("error", new Error("Already connected or was killed"))
            return
        }

        this.ws = new WebSocket()

        this.ws.on("open", this.handleConnection.bind(this, this.ws))

        this.ws.on("close", this.handleClose.bind(this, this.ws))

        this.ws.on(
            "message",
            this.handleMessage.bind(this, this.ws)
        )

        this.ws.on("error", this.handleError.bind(this, this.ws))
    }

    handleError(socket: WebSocket, error: Error) {
        if (error != undefined) { this.emit("error", error)}

        if (this.ws !== socket) socket.close(4805)
    }

    disconnect(code?: number) {
        if (this.ws) {
            this.ws.close(code || 1000)
            this.ws = null

            this.reset()
        }
    }

    handleConnection(socket: WebSocket) {
        this.emit("open", socket)

        if (this.ws !== socket) socket.close(4805)
    }

    handleClose(socket: WebSocket) {
        if (!this.ws && !this.killed) {
            if (this.reconnects < this.reconnectMax) {
                setTimeout(() => {
                    this.connect()
                    this.reconnects++
                }, this.reconnectInterval)
            } else {
                this.killed = true
                this.disconnect(4901)

                this.emit("killed", new Error(`Reconnect failed after ${this.reconnects} attempts`))
                this.removeAllListeners()
            }
        }
    }

    handleMessage(socket: WebSocket, data: any) {
        if (this.ws !== socket) return socket.close(4805)

        const packet: Packet = this.decode(data)

        if (!packet) return

        if (packet.s !== null) this.sequence = packet.s

        switch (packet.op) {
            case Constants.OPCodes.DISPATCH: {
                this.handleDispatch(packet.t || "unkn", packet.d)
                break
            }
            case Constants.OPCodes.HEARTBEAT: {
                this._heartbeat()
                break
            }
            case Constants.OPCodes.HEARTBEAT_ACK: {
                this.heartbeat.ack = true
                this.heartbeat.lastAck = Date.now()
                break
            }
            case Constants.OPCodes.HELLO: {
                this.setHeartbeat(packet.d)

                if (this.sessionID) {
                    this.resume()
                } else {
                    this.identify()
                }

                break
            }
            case Constants.OPCodes.INVALID_SESSION: {
                const packet_data = packet.d

                setTimeout(() => {
                    if (packet_data) {
                        this.resume()
                    } else {
                        this.sequence = 0
                        this.sessionID = null

                        this.identify()
                    }
                }, 1000)

                break
            }
            case Constants.OPCodes.RECONNECT: {

                this.disconnect(1000)
                this.connect()

                break
            }
        }

        setImmediate(() => {
            if (this.listeners("rawPacket").length && this.listeners("rawPacket").length > 0)
                this.emit("rawPacket", packet)
        })
    }

    handleDispatch(name: string, data: any): void {
        switch (name) {
            case "RESUMED":
            case "READY":
                {
                    this.reconnects = 0
                    this.trace = data["_trace"]
                    this.sessionID = data["session_id"]
                    this.ready = true

                    this.emit("ready")

                    break
                }
            case "GUILD_CREATE": {

                let guild = new Guild(this.client)

                guild._configureFromPacket(data)

                this.client.guilds.set(data.id, guild)
            }

            case "PRESENCE_UPDATE": {
                break
            }

            case "MESSAGE_CREATE": {

                let author = {
                    bot: data.author.bot,
                    id: data.author.id,
                    username: data.author.username
                }

                this.emit("message", new Message(data.guild_id, data.attachments, author, data.channel_id, data.content, data.id, data.mention_roles, data.mentions, data.mention_channels, this.client))
                break
            }
            //....
        }
    }

    _heartbeat(self: boolean = false) {
        if (self && !this.heartbeat.ack) {
            this.disconnect()
            this.connect()
        } else {
            this.heartbeat.ack = false
            this.heartbeat.lastSent = Date.now()

            this.send(Constants.OPCodes.HEARTBEAT, this.sequence, true)
        }
    }

    setHeartbeat(data: any) {
        if (data) {
            this._heartbeat()

            this.heartbeat.ack = true
            this.heartbeat.lastAck = Date.now()
            this.heartbeat.interval = data["heartbeat_interval"]

            setInterval(() => {
                this._heartbeat(true)
            }, this.heartbeat.interval)

            this.trace = data._trace
        }
    }

    resume() {
        const data = {
            seq: this.sequence || null,
            session_id: this.sessionID,
            token: this.token,
        }

        this.send(Constants.OPCodes.RESUME, data, true)
    }

    identify() {
        this.send(Constants.OPCodes.IDENTIFY, this.identity, true)
    }

    send(code: number, data: any, priority: boolean = false) {
        if (this.ws && this.ws.connected) {

            const func = () => {
                const _data = Erlpack.pack({op: code, d: data})

                //@ts-ignore
                this.ws.send(_data)
            }

            this.bucket.addToQueue(func, priority)
            this.bucket.do()
        }
    }

    decode(data: any) {
        try {

            if (data instanceof ArrayBuffer) {
                data = Buffer.from(data)
            } else if (Array.isArray(data)) {
                data = Buffer.concat(data)
            }

            if (data.length >= 4 && data.readUInt32BE(data.length - 4) === 0xFFFF) {
                this.zlib.push(data, ZlibSync.Z_SYNC_FLUSH)

                if (this.zlib.err) {
                    this.emit("error", new Error(this.zlib.msg + ""))
                    return false
                }

                //@ts-ignore
                data = Buffer.from(this.zlib.result)

                return Erlpack.unpack(data)
            } else {
                return Erlpack.unpack(data)
            }
        } catch (error) {
            this.emit("error", error)
        }
    }

    reset() {
        this.sequence = 0
        this.sessionID = null
        this.trace = []
        this.reconnects = 0
        this.ready = false

        this.bucket = new Bucket()

        if (this.ws) {
            this.ws.close(1000)
            this.ws = null
        }

        this.heartbeat = {
            ack: false,
            lastAck: null,
            lastSent: null,
            interval: null
        }
    }

    get identity() {
        //https://discord.com/developers/docs/topics/gateway#identify
        return {
            token: this.token,
            properties: {
                "os": process.platform,
                "browser": "Disclysia",
                "device": "Disclysia"
            },
            compress: true,
            large_threshold: 250,
            presence: this.presence,
            guild_subscriptions: false,
            intents: Constants.GATEWAY_INTENTS_ALL
        }
    }
}

export interface Packet {
    d?: unknown
    op: number
    s?: number
    t?: string
} 