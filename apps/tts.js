import config from "../model/index.js";
import TtsMain from '../model/ttsMain.js'
import puppeteer from "../../../lib/puppeteer/puppeteer.js";

const _path = process.cwd();

export class TtsPlugin extends plugin {
    constructor() {
        super({
            name: 'tts语音生成',
            dsc: 'tts语音生成',
            event: 'message',
            priority: 1,
            rule: [
                {
                    reg: /^(#|\/)?(.*)语速设置\d+$/,
                    fnc: 'speedSet'
                },
                {
                    reg: /^(#|\/)?(.*)感情设置\d+$/,
                    fnc: 'emotionSet'
                },
                {
                    reg: /^(#|\/)?(.*)发音时长设置\d+$/,
                    fnc: 'noiseScaleWSet'
                },
                {
                    reg: /^(#|\/)?(.*)混合比设置\d+$/,
                    fnc: 'sdp_ratioSet'
                },
                {
                    reg: /^(#|\/)(.*)说(.*)$/,
                    fnc: 'voiceSend'
                },
                {
                    reg: /^(#|\/)?(.*)恢复默认$/,
                    fnc: 'voiceReset'
                },
                {
                    reg: /^(#|\/)?语音接口切换$/,
                    fnc: 'voiceApi'
                },
                {
                    reg: /^(#|\/)?支持角色列表$/,
                    fnc: 'voiceSpeaker'
                }
            ]
        });
    }

    async speedSet(e) {
        const regex = /^#([^\d]+)语音语速设置(\d+)$/;
        const inputString = e.msg;
        const match = inputString.match(regex);

        if (!match) {
            e.reply('信息提取错误，请确保指令正确！');
            return false;
        }

        const [, name, lengthScalenumStr] = match; // 使用解构赋值
        const lengthScalenum = Number(lengthScalenumStr);

        if (!await isOK(name)) {
            e.reply('该角色暂不支持');
            return false;
        }

        const defaultSettings = {
            noiseScale: 0.2,
            noiseScaleW: 0.2,
            lengthScale: lengthScalenum,
            sdp_ratio: 0.2
        };

        if (!saveData(e, 'lengthScale', name, lengthScalenum, defaultSettings)) {
            return false;
        }

        e.reply(`${name}语音语速已成功设置`);
    }

    async emotionSet(e) {
        const regex = /^#([^\d]+)语音感情设置(\d+)$/;
        const inputString = e.msg;
        const match = inputString.match(regex);

        if (!match) {
            e.reply('信息提取错误，请确保指令正确！');
            return false;
        }

        const [, name, noiseScalenumStr] = match; // 使用解构赋值
        const noiseScalenum = Number(noiseScalenumStr);

        if (!await isOK(name)) {
            e.reply('该角色暂不支持');
            return false;
        }

        const defaultSettings = {
            noiseScale: noiseScalenum,
            noiseScaleW: 0.2,
            lengthScale: 1,
            sdp_ratio: 0.2
        };

        if (!saveData(e, 'noiseScale', name, noiseScalenum, defaultSettings)) {
            return false;
        }

        e.reply(`${name}语音感情已成功设置`);
    }

    async noiseScaleWSet(e) {
        const regex = /^#([^\d]+)语音发音时长设置(\d+)$/;
        const inputString = e.msg;
        const match = inputString.match(regex);

        if (!match) {
            e.reply('信息提取错误，请确保指令正确！');
            return false;
        }

        const [, name, noiseScaleWnumStr] = match; // 使用解构赋值
        const noiseScaleWnum = Number(noiseScaleWnumStr);

        if (!await isOK(name)) {
            e.reply('该角色暂不支持');
            return false;
        }

        const defaultSettings = {
            noiseScale: 0.2,
            noiseScaleW: noiseScaleWnum,
            lengthScale: 1,
            sdp_ratio: 0.2
        };

        if (!saveData(e, 'noiseScaleW', name, noiseScaleWnum, defaultSettings)) {
            return false;
        }

        e.reply(`${name}语音发音时长已成功设置`);
    }

    async sdp_ratioSet(e) {
        const regex = /^#([^\d]+)语音混合比设置(\d+)$/;
        const inputString = e.msg;
        const match = inputString.match(regex);

        if (!match) {
            e.reply('信息提取错误，请确保指令正确！');
            return false;
        }

        const [, name, sdp_rationumStr] = match; // 使用解构赋值
        const sdp_rationum = Number(sdp_rationumStr);
        logger.info(name)

        if (!await isOK(name)) {
            e.reply('该角色暂不支持');
            return false;
        }

        const defaultSettings = {
            noiseScale: 0.2,
            noiseScaleW: 0.2,
            lengthScale: 1,
            sdp_ratio: sdp_rationum
        };

        if (!saveData(e, 'sdp_ratio', name, sdp_rationum, defaultSettings)) {
            return false;
        }

        e.reply(`${name}语音混合比已成功设置`);
    }

    async voiceSend(e) {
        let data = e.msg.split("#").slice(-1)[0].split("说")
        while (data.length > 2) {
            data[1] = data[1].concat("说").concat(data[2])
            data.splice(2, 1)
        }
        let language = 'ZH'
        if (data[0].includes("中文")) {
            language = "ZH";
            data[0] = data[0].replace("中文", ""); // 删除已识别的语言标识
        } else if (data[0].includes("英文")) {
            language = "EN";
            data[0] = data[0].replace("英文", ""); // 删除已识别的语言标识
        } else if (data[0].includes("日语")) {
            language = "JP";
            data[0] = data[0].replace("日语", ""); // 删除已识别的语言标识
        }
        let speaker = data[0];
        let text = data[1];

        await TtsMain.ttsVoice(e, speaker, language, text);
    }

    async voiceReset(e) {
        let name = e.msg.replace('恢复默认', '').replace('#', '');

        if (!await isOK(name)) {
            e.reply('该角色暂不支持');
            return false;
        }

        const defaultSettings = {
            noiseScale: 0.2,
            noiseScaleW: 0.2,
            lengthScale: 1,
            sdp_ratio: 0.2
        };

        if (!saveData(e, 'reset', name, 0, defaultSettings)) {
            return false;
        }
        e.reply(`${name}已恢复默认设置`);
    }

    async voiceApi(e) {
        let apiConfig = config.getConfig("config");
        if (!apiConfig) {
            apiConfig = {};
        }
        if (!apiConfig['voiceApi']) {
            apiConfig['voiceApi'] = 'api1';
            e.reply("接口已切换为：接口1")
        } else if (apiConfig['voiceApi'] === 'api1') {
            apiConfig['voiceApi'] = 'api2';
            e.reply("接口已切换为：接口2")
        } else {
            apiConfig['voiceApi'] = 'api1';
            e.reply("接口已切换为：接口1")
        }
        config.saveSet('config', apiConfig);
    }

    async voiceSpeaker(e) {
        let img = await puppeteer.screenshot("cs", {
            tplFile: `${_path}/plugins/unnamed-Plugin/resource/html/speakerlist/speakerlist.html`,
            imgtype: 'png',
            a: `${_path}/plugins/unnamed-Plugin/resource/html/speakerlist/speakerlist.css`,
        });
        e.reply(img)
    }
}

function saveData(e, operate, name, number, defaultSettings) {
    let speakerConfig = config.getConfig("config");
    if (!speakerConfig) {
        // 如果 speakerConfig 为 null 或 undefined，创建一个新的配置对象
        speakerConfig = {};
    }
    if (operate === 'reset') {
        if (!speakerConfig[name]) {
            speakerConfig[name] = {};
        }

        Object.assign(speakerConfig[name], defaultSettings);
    } else {
        if (!isValidRange(operate, number, e)) {
            return false;
        }

        if (!speakerConfig[name]) {
            speakerConfig[name] = {};
            Object.assign(speakerConfig[name], defaultSettings);
        } else {
            speakerConfig[name][operate] = number;
        }
    }
    config.saveSet('config', speakerConfig);
}

function isValidRange(operate, number, e) {
    let range;

    switch (operate) {
        case 'noiseScale':
        case 'noiseScaleW':
            range = { min: 0, max: 1.5 };
            break;
        case 'lengthScale':
            range = { min: 0, max: 2 };
            break;
        default:
            range = { min: 0, max: 1 };
    }

    if (isNaN(number) || number < range.min || number > range.max) {
        e.reply(`请输入正确的数字，范围为${range.min}到${range.max}`);
        return false;
    }

    return true;
}

async function isOK(name) {
    let list = await TtsMain.ttsList();
    if (list.includes(name)) {
        return true;
    }
    return false;
}