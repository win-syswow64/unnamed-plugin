import fetch from "node-fetch";
import config from "./index.js";
import WebSocket from "ws";

export class TtsMain {
    async ttsList() {
        const speakerData = config.getConfig('speaker');
        const listSet = new Set([...speakerData.cnmodel, ...speakerData.jpmodel, ...speakerData.enmodel, ...speakerData.api2model]);
        const list = Array.from(listSet);
        return list;
    }

    async getrandom(e, redom_data, reference_audio, session_hash, text, speaker, ttsapi) {
        if (redom_data == '' && reference_audio == '') {
            let ws = new WebSocket('wss://fs.firefly.matce.cn/queue/join');

            ws.on('message', (data) => {
                data = JSON.parse(data);
                if (data.msg == "send_hash") {
                    ws.send(JSON.stringify({
                        "fn_index": 1,
                        "session_hash": `${session_hash}`
                    }));
                }
                if (data.msg == "send_data") {
                    ws.send(JSON.stringify({
                        "data": [`${speaker}`],
                        "event_data": null,
                        "fn_index": 1,
                        "session_hash": `${session_hash}`
                    }));
                }

                if (data.msg == "process_completed") {
                    redom_data = data.output.data;
                }
            });

            ws.on('close', () => {
                this.getreference(e, redom_data, reference_audio, session_hash, text, speaker, ttsapi);
            });
        }
    }

    async getreference(e, redom_data, reference_audio, session_hash, text, speaker, ttsapi) {
        if (redom_data != '' && reference_audio == '') {
            let ws = new WebSocket('wss://fs.firefly.matce.cn/queue/join');

            ws.on('message', (data) => {
                data = JSON.parse(data);
                if (data.msg == "send_hash") {
                    ws.send(JSON.stringify({
                        "fn_index": 2,
                        "session_hash": `${session_hash}`
                    }));
                }
                if (data.msg == "send_data") {
                    ws.send(JSON.stringify({
                        "data": [`${redom_data[0]}`],
                        "event_data": null,
                        "fn_index": 2,
                        "session_hash": `${session_hash}`
                    }));
                }
                if (data.msg == "process_completed") {
                    reference_audio = data.output.data;
                    reference_audio[0].data = `${ttsapi}${reference_audio[0].name}`;
                }
            });

            ws.on('close', () => {
                this.getaudio(e, redom_data, reference_audio, text, speaker, session_hash, ttsapi);
            });
        }
    }

    async getaudio(e, redom_data, reference_audio, text, speaker, session_hash, ttsapi) {
        if (redom_data != '' && reference_audio != '') {
            let ws = new WebSocket('wss://fs.firefly.matce.cn/queue/join');
            let audiourl = '';

            ws.on('message', (data) => {
                data = JSON.parse(data);
                if (data.msg == "send_hash") {
                    ws.send(JSON.stringify({
                        "fn_index": 4,
                        "session_hash": `${session_hash}`
                    }));
                }
                if (data.msg == "send_data") {
                    ws.send(JSON.stringify({
                        "data": [
                            `${text}`,
                            true,
                            reference_audio[0],
                            `${redom_data[1]}`,
                            0,
                            48,
                            0.7,
                            1.5,
                            0.7,
                            `${speaker}`
                        ],
                        "event_data": null,
                        "fn_index": 4,
                        "session_hash": `${session_hash}`
                    }));
                }
                if (data.msg == "process_completed") {
                    audiourl = `${ttsapi}${data.output.data[0].name}`;
                }
            });

            ws.on('close', () => {
                if (audiourl != '') {
                    logger.info(audiourl);
                    e.reply(segment.record(audiourl));
                } else {
                    e.reply('生成失败');
                }
            });
        }
    }

    async ttsVoice(e, speaker, language, text) {
        let apiData = config.getConfig('config');
        const speakerData = config.getConfig('speaker');

        if (!apiData) {
            apiData = {};
        }

        if (!apiData['voiceApi']) {
            apiData['voiceApi'] = 'api1';
            config.saveSet('config', apiData);
        }

        if (apiData['voiceApi'] === 'api1') {
            if (language === 'ZH' && !speakerData.cnmodel.includes(speaker)) {
                e.reply(`该角色暂不支持, 当前角色语言为：${language}`);
                return false;
            }
            if (language === 'EN' && !speakerData.enmodel.includes(speaker)) {
                e.reply(`该角色暂不支持, 当前角色语言为：${language}`);
                return false;
            }
            if (language === 'JP' && !speakerData.jpmodel.includes(speaker)) {
                e.reply(`该角色暂不支持, 当前角色语言为：${language}`);
                return false;
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

        logger.info(text);
        logger.info(speaker);

        let audiourl = "";
        let ttsapi = "https://fs.firefly.matce.cn/file=";
        let api1url = 'https://api.lolimi.cn/API/yyhc/y.php';
        let sdp_ratio = apiData[speaker]?.sdp_ratio;
        let noiseScale = apiData[speaker]?.noiseScale;
        let noiseScaleW = apiData[speaker]?.noiseScaleW;
        let lengthScale = apiData[speaker]?.lengthScale;
        const session_hash = Math.random().toString(36).substring(2);
        let redom_data = '';
        let reference_audio = '';

        if (apiData.voiceApi === 'api1') {
            if (!['夏彦', '左然', '莫奕', '陆景和'].includes(speaker)) {
                speaker = `${speaker}_${language}`;
            }
            logger.info(speaker);

            this.getrandom(e, redom_data, reference_audio, session_hash, text, speaker, ttsapi);
            return true;
        } else {
            let audioLink = `${api1url}?msg=${text}&speaker=${speaker}&Length=${lengthScale}&noisew=${noiseScaleW}&sdp=${sdp_ratio}&noise=${noiseScale}`;
            let response = await fetch(audioLink);
            if (!response.ok) {
                e.reply('接口请求失败,请切换接口或稍后重试。');
                logger.error(`接口请求失败，错误码：${response}`);
                return false;
            }
            try {
                response = await response.json();
            } catch (error) {
                e.reply('接口请求失败,请切换接口或稍后重试。');
                logger.error(error);
                return false;
            }
            audiourl = response.music;
        }
        try {
            e.reply(segment.record(audiourl));
        } catch (error) {
            e.reply('音频发送失败，请查看日志获取详细信息。');
            logger.error(error);
            return false;
        }
    }
}
export default new TtsMain();
