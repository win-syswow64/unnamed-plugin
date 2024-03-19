import cfg from '../../../lib/config/config.js';
import common from '../../../lib/common/common.js';
import config from "../model/index.js";
import TtsMain from '../model/ttsMain.js'
import moment from "moment";

const _path = process.cwd()

export class Poke extends plugin {
    constructor() {
        super({
            name: '戳一戳',
            dsc: '戳一戳',
            event: 'notice.group.poke',
            priority: 5000,
            rule: [
                {
                    fnc: 'unnamed_poke'
                }
            ]
        }
        )
    }
    async unnamed_poke(e) {
        let pokeconfig = config.getConfig("config");
        let poketext = config.getConfig("poketext");

        if (!pokeconfig) {
            pokeconfig = {};
        }

        if (!poketext) {
            poketext = {};
        }

        if (!pokeconfig['pokemaster']) {
            pokeconfig['pokemaster'] = true;
            config.saveSet('config', pokeconfig);
        }

        if (!pokeconfig['poke']) {
            pokeconfig['poke'] = true;
            config.saveSet('config', pokeconfig);
        }

        if (!pokeconfig['pokejpgnumber']) {
            pokeconfig['pokejpgnumber'] = 0;
            config.saveSet('config', pokeconfig);
        }

        if (!pokeconfig['pokegifnumber']) {
            pokeconfig['pokegifnumber'] = 0;
            config.saveSet('config', pokeconfig);
        }

        if (!pokeconfig['poketext']) {
            pokeconfig['poketext'] = 0.4;
            config.saveSet('config', pokeconfig);
        }

        if (!pokeconfig['pokeimg']) {
            pokeconfig['pokeimg'] = 0.15;
            config.saveSet('config', pokeconfig);
        }

        if (!pokeconfig['pokevoice']) {
            pokeconfig['pokevoice'] = 0.15;
            config.saveSet('config', pokeconfig);
        }

        if (!pokeconfig['pokemute']) {
            pokeconfig['pokemute'] = 0.15;
            config.saveSet('config', pokeconfig);
        }

        if (!pokeconfig['pokeexample']) {
            pokeconfig['pokeexample'] = 0.07;
            config.saveSet('config', pokeconfig);
        }

        if (!pokeconfig['pokespeaker']) {
            pokeconfig['pokespeaker'] = '纳西妲';
            config.saveSet('config', pokeconfig);
        }

        if (!pokeconfig['pokemutenumber']) {
            pokeconfig['pokemutenumber'] = 1;
            config.saveSet('config', pokeconfig);
        }

        if (!pokeconfig['maxpoke']) {
            pokeconfig['maxpoke'] = 36;
            config.saveSet('config', pokeconfig);
        }

        if (!pokeconfig['pokemutemaster']) {
            pokeconfig['pokemutemaster'] = true;
            config.saveSet('config', pokeconfig);
        }

        if (pokeconfig['pokemaster']) {
            if (cfg.masterQQ.includes(e.target_id)) {

                logger.info('[戳主人生效]');

                if (cfg.masterQQ.includes(e.operator_id) || e.self_id == e.operator_id) {
                    return false;
                }

                if (!poketext['pokemastertext']) {
                    poketext['pokemastertext'] = [];
                    poketext['pokemastertext'].push('你几把谁啊, 竟敢戳我亲爱滴主人, 胆子好大啊你');
                    config.saveSet('config', poketext);
                }

                e.reply([
                    segment.at(e.operator_id),
                    `${poketext['pokemastertext'][Math.round(Math.random() * (poketext['pokemastertext'].length - 1))]}`,
                    segment.image(_path + `/plugins/unnamed-plugin/resources/poke/生气.gif`)
                ], true);

                await common.sleep(1000);
                e.group.pokeMember(e.operator_id);
                return true;
            }
        }

        let mutenumber = pokeconfig['pokemutenumber'];

        if (mutenumber == 0) {
            let count = await redis.get(`Yz:pokecount${e.operator_id}:`);

            if (!count) {
                await redis.set(`Yz:pokecount${e.operator_id}:`, 1 * 1, { EX: exTime });
            } else {
                await redis.set(`Yz:pokecount${e.operator_id}:`, ++count, { EX: exTime });
            }

            if (count >= pokeconfig['maxpoke']) {
                return false;
            }
            mutenumber = count;
        }

        if (pokeconfig['poke']) {
            if (e.self_id == e.target_id) {
                logger.info('[戳一戳生效]');

                let tomenow = moment(Date.now()).add(1, 'days').format('YYYY-MM-DD 00:00:00');
                let exTime = Math.round((new Date(tomenow).getTime() - new Date().getTime()) / 1000);

                if (Math.ceil(Math.random() * 100) <= 20 && count >= 10) {
                    logger.info('[回复被戳次数生效]')

                    let conf = cfg.getGroup(e.group_id);
                    let count = await redis.get(`Yz:pokecount${e.group_id}:`);

                    if (!count) {
                        await redis.set(`Yz:pokecount${e.group_id}:`, 1 * 1, { EX: exTime });
                    } else {
                        await redis.set(`Yz:pokecount${e.group_id}:`, ++count, { EX: exTime });
                    }

                    e.reply([
                        `${poketext['pokecount'][Math.round(Math.random() * (poketext['pokecount'].length - 1))]}`
                            .replace("_name_", conf.botAlias[0])
                            .replace("_num_", count),
                    ]);
                    return true;
                }

                let random_type = Math.random();
                let reply_text = poketext['poketext'];
                let reply_img = poketext['pokeimg'];
                let reply_voice = poketext['pokevoice'];
                let mutepick = poketext['pokemute'];
                let example = poketext['pokeexample'];

                if (reply_text + reply_img + reply_voice + mutepick + example > 1) {
                    reply_text = 0.4
                    reply_img = 0.15
                    reply_voice = 0.15
                    mutepick = 0.15
                    example = 0.07
                    poketext['reply_text'] = 0.4
                    poketext['reply_img'] = 0.15
                    poketext['reply_voice'] = 0.15
                    poketext['mutepick'] = 0.15
                    poketext['example'] = 0.7
                    config.saveSet('config', pokeconfig);
                    e.reply(`数据设置有误，已恢复默认。`)
                }

                if (random_type < reply_text) {
                    logger.info('[回复随机文字生效]')

                    let text_number = Math.ceil(Math.random() * poketext['poketext'].length)
                    let conf = cfg.getGroup(e.group_id);

                    e.reply(poketext['poketext'][text_number - 1].replace("_name_", conf.botAlias[0]))

                    return true;
                }

                else if (random_type < (reply_text + reply_img)) {
                    logger.info('[回复随机图片生效]');
                    fetch("http://api.115832958.xyz/API/pokePhoto.php").then(Response => Response.json()).then(data => {
                        if (data) {
                            if (data.status == 200) {
                                try {
                                    e.reply([segment.image(data.link)])
                                }
                                catch (err) {
                                    e.reply('图片获取失败，请检查网络链接或联系开发者。');
                                }
                            }
                            else {
                                e.reply(`获取图链失败，错误码：${data.status}`);
                            }
                        }
                        else {
                            e.reply('图片api异常。');
                        }
                    })
                }

                else if (random_type < (reply_text + reply_img + reply_voice)) {
                    logger.info('[回复随机语音生效]');

                    let Text = poketext['poketext'][Math.floor(Math.random() * poketext['poketext'].length)].replace("_name_", conf.botAlias[0]);
                    logger.info(`合成文本：${Text}`);

                    await TtsMain.ttsVoice(e, pokeconfig['pokespeaker'], 'ZH', Text);
                }

                else if (random_type < (reply_text + reply_img + reply_voice + mutepick)) {
                    logger.info('[禁言生效]');

                    if (pokeconfig['pokemutemaster']) {
                        logger.info('[主人不禁言已开启]');
                        let Text = poketext['poketext'][Math.floor(Math.random() * poketext['poketext'].length)].replace("_name_", conf.botAlias[0]);
                        logger.info(`合成文本：${Text}`);

                        await TtsMain.ttsVoice(e, pokeconfig['pokespeaker'], 'ZH', Text);
                    }

                    logger.info(e.operator_id + `将要被禁言${usercount}分钟`)

                    let mutetype = Math.ceil(Math.random() * 3)

                    if (mutetype == 1) {
                        e.reply('我生气了！砸挖撸多!木大！木大木大！');
                        await common.sleep(1000);
                        e.group.muteMember(e.operator_id, 60 * mutenumber);
                    }

                    if (mutetype == 2) {
                        e.reply('不！！');
                        await common.sleep(1000);
                        e.reply('准！！');
                        await common.sleep(1000);
                        e.reply('戳！！');
                        await common.sleep(1000);
                        e.group.muteMember(e.operator_id, 60 * mutenumber);
                        await common.sleep(1000);
                        return;
                    }

                    if (mutetype == 3) {
                        e.reply('哼，我可是会还手的哦')
                        await common.sleep(1000)
                        e.group.pokeMember(e.operator_id)
                        await common.sleep(1000)
                        e.group.muteMember(e.operator_id, 60 * (usercount + 1))
                        return
                    }
                }

                else if (random_type < (reply_text + reply_img + reply_voice + mutepick + example)) {
                    e.reply(await segment.image(`http://ovooa.com/API/face_pat/?QQ=${e.operator_id}`));
                }

                else {
                    logger.info('[反击生效]');

                    let mutetype = Math.round(Math.random() * 3);

                    if (mutetype == 1) {
                        e.reply('吃我一拳喵！');
                        await common.sleep(1000);
                        e.group.pokeMember(e.operator_id);
                    }
                    else if (mutetype == 2) {
                        e.reply('你刚刚是不是戳我了，你是坏蛋！我要戳回去，哼！！！');
                        await common.sleep(1000);
                        e.group.pokeMember(e.operator_id);
                    }
                    else if (mutetype == 3) {
                        e.reply('是不是要本萝莉揍你一顿才开心啊！！！');
                        await common.sleep(1000);
                        e.group.pokeMember(e.operator_id);
                    }
                }
            }
        }
    }
}