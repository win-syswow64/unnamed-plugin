import fetch from "node-fetch";
import config from "./index.js";

export class TtsMain {
    async ttsList() {
        const speakerData = config.getConfig('speaker');
        const listSet = new Set([...speakerData.cnmodel, ...speakerData.jpmodel, ...speakerData.enmodel, ...speakerData.api2model]);
        const list = Array.from(listSet);
        return list;
    }

    async ttsVoice(e, speaker, language, text) {
        let apiData = config.getConfig('config');
        const speakerData = config.getConfig('speaker');

        if (!apiData) {
            // 如果 speakerConfig 为 null 或 undefined，创建一个新的配置对象
            apiData = {};
        }

        if (!apiData['voiceApi']) {
            apiData['voiceApi'] = 'api1';
            config.saveSet('config', apiData);
        }
        if (apiData['voiceApi'] === 'api1') {
            if (language === 'ZH') {
                if (!speakerData.cnmodel.includes(speaker)) {
                    e.reply(`该角色暂不支持, 当前角色语言为：${language}`);
                    return false;
                }
            }
            if (language === 'EN') {
                if (!speakerData.enmodel.includes(speaker)) {
                    e.reply(`该角色暂不支持, 当前角色语言为：${language}`);
                    return false;
                }
            }
            if (language === 'JP') {
                if (!speakerData.jpmodel.includes(speaker)) {
                    e.reply(`该角色暂不支持, 当前角色语言为：${language}`);
                    return false;
                }
            }
        } else if (apiData['voiceApi'] === 'api2') {
            if (language != 'ZH') {
                e.reply(`当前接口不支持: ${language},请切换接口。`);
                return false;
            }
            if (!speakerData.api2model.includes(speaker)) {
                e.reply('该角色暂不支持');
                return false;
            }
        }

        const defaultSettings = {
            noiseScale: 0.2,
            noiseScaleW: 0.2,
            lengthScale: 1,
            sdp_ratio: 0.2
        };

        if (!apiData[speaker]) {
            apiData[speaker] = {};
            Object.assign(apiData[speaker], defaultSettings);
            config.saveSet('config', apiData);
        }

        logger.info(text)
        logger.info(speaker)

        let audiourl = ""
        let ttsapi = "https://v2.genshinvoice.top/run/predict"
        let api1url = 'https://api.lolimi.cn/API/yyhc/y.php'
        let sdp_ratio = apiData[speaker]?.sdp_ratio;
        let noiseScale = apiData[speaker]?.noiseScale;
        let noiseScaleW = apiData[speaker]?.noiseScaleW;
        let lengthScale = apiData[speaker]?.lengthScale;

        if (apiData.voiceApi === 'api1') {
            if (speaker != '夏彦' || speaker != '左然' || speaker != '莫奕' || speaker != '陆景和') {
                speaker = `${speaker}_${language}`
            }
            logger.info(speaker)
            let data = JSON.stringify({
                "data": [`${text}`, `${speaker}`, sdp_ratio, noiseScale, noiseScaleW, lengthScale, `${language}`, null, "Happy", "Text prompt", "", 0.7],
                "event_data": null,
                "fn_index": 0,
                "session_hash": "v141oxnc02o"
            })
            let responsel = await fetch(ttsapi
                , {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'method': 'POST',
                    'headers': {
                        'Content-Type': 'application/json',
                        'Content-Length': data.length
                    },
                    'body': data
                }
            )
            responsel = await responsel.json()
            audiourl = `https://v2.genshinvoice.top/file=${responsel.data[1].name}`
        } else {
            let audioLink = `${api1url}?msg=${text}&speaker=${speaker}&Length=${lengthScale}&noisew=${noiseScaleW}&sdp=${sdp_ratio}&noise=${noiseScale}`
            let responsel = await fetch(audioLink)
            responsel = await responsel.json()
            audiourl = responsel.music
        }
        e.reply(segment.record(audiourl))
    }
}
export default new TtsMain()
