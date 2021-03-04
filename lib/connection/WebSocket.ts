import EventEmitter from "eventemitter3"
import * as Constants from "../utils/Constants"
import WS from "ws"

export default class WebSocket extends EventEmitter {
	url: string = `wss://gateway.discord.gg/?encoding=${Constants.ENCODING}&v=${Constants.GATEWAY_VERSION}&compress=${Constants.COMPRESS_MODE}`
	socket: WS

	constructor() {
		super()

		this.socket = new WS(this.url)

		this.socket.on("error", this.emit.bind(this, "error"))
		this.socket.on("open", this.emit.bind(this, "open"))
		this.socket.on("message", this.emit.bind(this, "message"))
		this.socket.on("close", this.onClose.bind(this))
	}

	get closed(): boolean {
		return this.socket.readyState === this.socket.CLOSED
	}

	get connected(): boolean {
		return this.socket.readyState === this.socket.OPEN
	}

	send(data: any): void {
		if (!this.connected) return

		this.socket.send(data, (err) => {
			this.emit("error", err)
		})
	}

	close(code: number, reason?: string) {
		if (this.connected) {
			this.socket.close(code, reason)
		}
	}

	onClose(code: number, reason: string): void {
		this.socket.removeAllListeners()

		this.emit("close", code, reason)

		this.removeAllListeners()
	}
}
