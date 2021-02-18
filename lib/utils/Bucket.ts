//https://discord.com/developers/docs/topics/gateway#rate-limiting

export default class Bucket {

    maxGatewayCommands: number = 120
    interval: number = 60000
    timeoutRef: any | null = null

    queue: Array<any> = []

    lastReset: number = 0
    lastSend: number = 0
    gatewayCommands: number = 0


    constructor() {
        this.do()
    }

    addToQueue(func: Function, priority: boolean = false) {
        if (priority)
            this.queue.unshift([func, priority])
        else
            this.queue.push([func, priority])
    }

    do() {
        if (this.timeoutRef || this.queue.length == 0) return
        
        if(this.lastReset + this.interval  < Date.now()) { //1 m ago
            this.lastReset = Date.now()

            //reset
            this.gatewayCommands = Math.max(0, (this.gatewayCommands - this.maxGatewayCommands))
        }

        while (this.queue.length > 0 && this.gatewayCommands < this.maxGatewayCommands) {
            this.gatewayCommands++

            console.log("amount of gateway commands sent until now " + this.gatewayCommands)

            this.queue.shift()[0]()
            this.lastSend = Date.now()

        }

        if(this.queue.length > 0 && !this.timeoutRef) {
            let lastSendDelay = Date.now() - this.lastSend

            if (this.lastSend == 0){
                lastSendDelay = this.interval
            }

            this.timeoutRef = setTimeout(() => {
                this.timeoutRef = null
                this.do()
            }, lastSendDelay + this.interval)

        }
    }
}