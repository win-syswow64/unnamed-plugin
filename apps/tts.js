import { getConfig, saveSet } from "../model/index.js";
import TtsMain from '../model/ttsMain.js';

export class TtsPlugin extends plugin {
    constructor() {
        super({
            name: 'tts语音生成',
            dsc: 'tts语音生成',
            event: 'message',
            priority: 999,
            rule: [
                {
                    reg: /^#?语音语速设置\d+$/,
                    fnc: 'speedSet'
                },
                {
                    reg: /^#?语音感情设置\d+$/,
                    fnc: 'emotionSet'
                },
                {
                    reg: /^#?语音发音时长设置\d+$/,
                    fnc: 'noiseScaleWSet'
                },
                {
                    reg: /^#?语音混合比设置\d+$/,
                    fnc: 'sdp_ratioSet'
                },
                {
                    reg: /^#?(.*)说?(.*)$/,
                    fnc: 'voiceSend'
                },
                {
                    reg: /^#?(.*)恢复默认$/,
                    fnc: 'voiceReset'
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

        const defaultSettings = {
            noiseScale: 0.2,
            noiseScaleW: 0.2,
            lengthScale: lengthScalenum,
            sdp_ratio: 0.2
        };

        await saveData(e, 'noiseScaleW', name, lengthScalenum, defaultSettings);

        e.reply(`${name}语音混合比已成功设置`);
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

        const defaultSettings = {
            noiseScale: noiseScalenum,
            noiseScaleW: 0.2,
            lengthScale: 1,
            sdp_ratio: 0.2
        };

        await saveData(e, 'noiseScaleW', name, noiseScalenum, defaultSettings);

        e.reply(`${name}语音混合比已成功设置`);
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

        const defaultSettings = {
            noiseScale: 0.2,
            noiseScaleW: noiseScaleWnum,
            lengthScale: 1,
            sdp_ratio: 0.2
        };

        await saveData(e, 'noiseScaleW', name, noiseScaleWnum, defaultSettings);

        e.reply(`${name}语音混合比已成功设置`);
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

        const defaultSettings = {
            noiseScale: 0.2,
            noiseScaleW: 0.2,
            lengthScale: 1,
            sdp_ratio: sdp_rationum
        };

        await saveData(e, 'sdp_ratio', name, sdp_rationum, defaultSettings);

        e.reply(`${name}语音混合比已成功设置`);
    }

    async voiceReset(e) {
        let name = e.msg.replace('恢复默认', '').replace('#', '');
        let list = await TtsMain.ttsList();

        if (!list.includes(name)) {
            e.reply('该角色暂不支持');
            return false;
        }

        const defaultSettings = {
            noiseScale: 0.2,
            noiseScaleW: 0.2,
            lengthScale: 1,
            sdp_ratio: 0.2
        };

        await saveData(e, 'reset', name, 0, defaultSettings);
        e.reply(`${name}已恢复默认设置`);
    }
}

async function saveData(e, operate, name, number, defaultSettings) {
    let speakerConfig = getConfig("config");
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
    saveSet('config', speakerConfig);
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
