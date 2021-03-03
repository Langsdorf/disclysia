export const DISCLYSIA_VERSION: string = "1.0.2"

export const GATEWAY_VERSION: number = 8
export const ENCODING: string = "etf"
export const COMPRESS_MODE: boolean = true
export const ZLIB_CHUNK_SIZE: number = 128 * 1024

export const Presence = {
    ONLINE: 'online',
    OFFLINE: 'offline',
    INVISIBLE: 'invisible',
    DND: 'dnd',
    IDLE: 'idle'
}

export const GATEWAY_INTENTS_ALL = [
    1 << 0,
    1 << 1,
    1 << 2,
    1 << 3,
    1 << 8,
    1 << 9,
    1 << 10,
    1 << 11,
    1 << 12,
    1 << 13,
    1 << 14,
].reduce((x, total) => total | x)

export const OPCodes = {
    DISPATCH: 0,
    HEARTBEAT: 1,
    IDENTIFY: 2,
    PRESENCE_UPDATE: 3,
    RESUME: 6,
    RECONNECT: 7,
    REQUEST_GUILD_MEMBERS: 8,
    INVALID_SESSION: 9,
    HELLO: 10,
    HEARTBEAT_ACK: 11,
    SYNC_GUILD: 12,
    GUILD_SUBSCRIPTIONS: 14,
}

export const BASE_URL = "/api/v8"
export const CHANNEL_MESSAGES = (channelID: string) => `/channels/${channelID}/messages`