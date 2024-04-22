import Help from "../model/help.js"
import puppeteer from "../../../lib/puppeteer/puppeteer.js"
import md5 from "md5"
import config from "../model/index.js"
// import Version from "../model/version.js"

export class help extends plugin {
    constructor(e) {
        super({
            name: "无名插件帮助",
            dsc: "无名插件帮助",
            event: "message",
            priority: 500,
            rule: [
                {
                    reg: "^(/|#)?无名帮助$",
                    fnc: "help",
                }
            ],
        });
        this.versionData = config.getConfig("version")
    }

    async help() {
        let data = await Help.get(this.e)
        if (!data) {
            return false
        }
        let img = await this.cache(data)
        await this.reply(img)
        return true
    }

    async cache(data) {
        let tmp = md5(JSON.stringify(data))
        if (help.helpData.md5 === tmp) {
            return help.helpData.img
        }

        help.helpData.img = await puppeteer.screenshot("help", data)
        help.helpData.md5 = tmp

        return help.helpData.img
    }

    static helpData = {
        md5: "",
        img: "",
    }
}