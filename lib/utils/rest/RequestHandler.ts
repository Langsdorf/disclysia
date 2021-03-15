import zlib from "zlib"
import { Disclysia } from "../../Disclysia"
import * as Constants from "../Constants"
import HTTPS from "https"

export default class RequestHandler {
    client: Disclysia

    constructor(client: Disclysia) {
        this.client = client
    }

    request(_url: string, body: any, method: string) {
        let url = Constants.BASE_URL + _url
        let data: any

        const headers = {
            "User-Agent": `Disclysia (https://github.com/Langsdorf/disclysia, ${Constants.DISCLYSIA_VERSION})`,
            Authorization: "Bot " + this.client.token,
            "Accept-Encoding": "gzip,deflate",
            "X-RateLimit-Precision": "millisecond",
        }

        return new Promise((resolve, reject) => {
            if (body) {
                if (method === "GET" || method === "DELETE") {
                    let string = ""

                    Object.keys(body).forEach(function (key) {
                        if (body[key]) {
                            if (Array.isArray(body[key])) {
                                body[key].forEach(function (val) {
                                    string += `&${encodeURIComponent(key)}=${encodeURIComponent(
                                        val
                                    )}`
                                })
                            } else {
                                string += `&${encodeURIComponent(key)}=${encodeURIComponent(
                                    body[key]
                                )}`
                            }
                        }
                    })

                    url += "?" + string.substring(1)
                } else {
                    data = JSON.stringify(body)
                    headers["Content-Type"] = "application/json"
                }
            } else {
                return reject()
            }

            const req = HTTPS.request({
                method: method,
                host: "discord.com",
                path: url,
                headers: headers,
            })

            req.once("response", (resp) => {
                let response = ""

                let stream

                if (resp.headers["content-encoding"]) {
                    if (resp.headers["content-encoding"].includes("gzip")) {
                        stream = resp.pipe(zlib.createGunzip())
                    } else if (resp.headers["content-encoding"].includes("deflate")) {
                        stream = resp.pipe(zlib.createInflate())
                    }
                }

                if (stream) {
                    stream
                        .on("data", (str) => {
                            response += str
                        })
                        .on("error", (err) => {
                            reject(err)
                        })
                        .once("end", () => {
                            if (response.length > 0) {
                                if (resp.headers["content-type"] === "application/json") {
                                    try {
                                        resolve(JSON.parse(response))
                                    } catch (err) {
                                        return reject(err)
                                    }
                                }
                            } else {
                                reject()
                            }
                        })
                }
            })

            req.once("abort", () => {
                reject()
            }).once("error", (err) => {
                reject(err)
            })

            req.end(data)
        })
    }
}
