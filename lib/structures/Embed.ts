//https://discord.com/developers/docs/resources/channel#embed-object
export default interface Embed {
    title?: string
    description?: string
    color?: string
    footer?: EmbedFooter
    image?: EmbedImage
    thumbnail?: EmbedThumbnail
    video?: EmbedVideo
}

export interface EmbedFooter {

}

export interface EmbedImage {

}

export interface EmbedThumbnail {

}

export interface EmbedVideo {

}