import config from "../model/index.js";

export class PokeSet extends plugin {
    constructor() {
        super({
            name: '戳一戳设置',
            dsc: '戳一戳设置',
            event: 'message',
            priority: 1,
            rule: [
                {
                    reg: /^(#|\/)?戳一戳(.*)$/,
                    fnc: 'pokeSet'
                },
                {
                    reg: /^(#|\/)?戳主人(.*)$/,
                    fnc: 'pokemasterSet'
                },
                {
                    reg: /^(#|\/)?戳一戳(jpg|JPG)数量\d+$/,
                    fnc: 'noiseScaleWSet'
                },
                {
                    reg: /^(#|\/)?戳一戳(gif|GIF)数量\d+$/,
                    fnc: 'sdp_ratioSet'
                },
                {
                    reg: /^(#|\/)?戳一戳文本概率\d+$/,
                    fnc: 'voiceSend'
                },
                {
                    reg: /^(#|\/)?戳一戳图片概率\d+$/,
                    fnc: 'voiceReset'
                },
                {
                    reg: /^(#|\/)?戳一戳语音概率\d+$/,
                    fnc: 'voiceApi'
                },
                {
                    reg: /^(#|\/)?戳一戳禁言概率\d+$/,
                    fnc: 'voiceSpeaker'
                },
                {
                    reg: /^(#|\/)?戳一戳表情概率\d+$/,
                    fnc: 'voiceSpeaker'
                },
                {
                    reg: /^(#|\/)?戳一戳语音角色(.*)$/,
                    fnc: 'voiceSpeaker'
                },
                {
                    reg: /^(#|\/)?戳一戳禁言时间\d+$/,
                    fnc: 'voiceSpeaker'
                },
                {
                    reg: /^(#|\/)?戳一戳上限\d+$/,
                    fnc: 'voiceSpeaker'
                },
                {
                    reg: /^(#|\/)?戳一戳主人禁言(.*)$/,
                    fnc: 'voiceSpeaker'
                }
            ]
        });
    }
    async pokeSet(e) {
        openSet(e, 'poke');
        return;
    }
    async pokemasterSet(e) {
        openSet(e, 'pokemaster');
        return;
    }
    async voiceSpeaker(e) {
        openSet(e, 'pokemutemaster');
        return;
    }
}
async function openSet(e, data) {
    let pokeconfig = config.getConfig("config");

    if (!pokeconfig) {
        pokeconfig = {};
    }

    if (e.msg.include('开启')) {
        pokeconfig[data] = true;
    } else if (e.msg.include('关闭')) {
        pokeconfig[data] = false;
    } else {
        e.reply('输入的指令有误，操作已取消');
        return;
    }

    config.saveSet('config', pokeconfig);
}