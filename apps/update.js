import cfg from '../../../lib/config/config.js';
import { Restart } from '../../other/restart.js';
import { createRequire } from 'module';
import lodash from 'lodash';
import { execSync } from 'child_process';

const require = createRequire(import.meta.url);
const { exec } = require('child_process');

let updateflag = false;

export class update extends plugin {
    constructor(e) {
        super({
            name: "无名插件更新",
            dsc: "无名插件更新",
            event: "message",
            priority: 500,
            rule: [
                {
                    reg: "^(/|#)?无名(强制)?更新$",
                    fnc: this.update
                },
                {
                    reg: "^(/|#)?无名更新日志$",
                    fnc: this.updateLog
                }
            ],
        });
    }

    async update(e) {
        if (!cfg.masterQQ.includes(e.user_id)) {
            return false;
        }

        if (updateflag) {
            e.reply('正在更新中，请勿重复操作');
            return false;
        }

        if (!(await checkGit())) {
            e.reply('请先安装git');
            return;
        }

        const isForce = e.msg.includes('强制');

        let isUP = false;
        let oldCommitId = false;
        isUP = await runUpdate(e, isForce, isUP, oldCommitId);

        /** 是否需要重启 */
        if (isUP) {
            e.reply('即将执行重启');
            setTimeout(() => new Restart(e).restart(), 2000);
        }
    }

}

async function checkGit() {
    try {
        const ret = await executeCommandSync('git --version');
        if (!ret || !ret.stdout.includes('git version')) {
            return false;
        } else {
            return true;
        }
    } catch (error) {
        logger.error('Error checking Git:', error);
        return false;
    }
}

async function runUpdate(e, isForce, isUP, oldCommitId) {
    let command = 'git -C ./plugins/unnamed-plugin/ pull --no-rebase';
    if (isForce) {
        command = `git -C ./plugins/unnamed-plugin/ checkout . && ${command}`;
        e.reply('正在执行强制更新操作，请稍等.');
    } else {
        e.reply('正在执行更新操作，请稍等.');
    }
    /** 获取上次提交的commitId，用于获取日志时判断新增的更新日志 */
    oldCommitId = getcommitId('unnamed-plugin');
    updateflag = true;
    try {
        const ret = await executeCommandSync(command);
        if (ret.error) {
            console.error(`${e.logFnc} 更新失败：unnamed-plugin.`);
            gitErr(e, ret.error, ret.stdout);
            return false;
        }

        /** 获取插件提交的最新时间 */
        const time = getTime('unnamed-plugin');

        if (/(Already up[ -]to[ -]date|已经是最新的)/.test(ret.stdout)) {
            e.reply(`unnamed-plugin已经是最新版本\n最后更新时间：${time}.`);
        } else {
            e.reply(`unnamed-plugin\n最后更新时间：${time}.`);
            isUP = true;
            /** 获取vits-plugin的更新日志 */
            const log = getLog(e, 'unnamed-plugin', oldCommitId);
            e.reply(log);
        }

        logger.log(`${e.logFnc} 最后更新时间：${time}.`);
        return true;
    } catch (error) {
        logger.error('Error running update:', error);
        return false;
    } finally {
        updateflag = false;
    }
}

async function executeCommandSync(cmd) {
    return new Promise((resolve, reject) => {
        exec(cmd, { windowsHide: true }, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve({ stdout, stderr });
            }
        });
    });
}

function getcommitId(plugin = '') {
    const command = `git -C ./plugins/${plugin}/ rev-parse --short HEAD`;

    let commitId = execSync(command, { encoding: 'utf-8' });
    commitId = lodash.trim(commitId);

    return commitId;
}

function gitErr(e, err, stdout) {
    const msg = '更新失败！';
    const errMsg = err.toString();
    stdout = stdout.toString();
    if (errMsg.includes('Timed out')) {
        const remote = errMsg.match(/'(.+?)'/g)[0].replace(/'/g, '');
        e.reply(msg + `\n连接超时：${remote}.`);
        return false;
    }

    if (/Failed to connect|unable to access/g.test(errMsg)) {
        const remote = errMsg.match(/'(.+?)'/g)[0].replace(/'/g, '');
        e.reply(msg + `\n连接失败：${remote}.`);
        return false;
    }

    if (errMsg.includes('be overwritten by merge')) {
        e.reply(msg +
            `存在冲突：\n${errMsg}\n` +
            '请解决冲突后再更新，或者执行#无名强制更新，放弃本地修改.'
        );
        return false;
    }

    if (stdout.includes('CONFLICT')) {
        e.reply([
            msg + '存在冲突\n',
            errMsg,
            stdout,
            '\n请解决冲突后再更新，或者执行#无名强制更新，放弃本地修改'
        ]);
        return false;
    }

    e.reply([errMsg, stdout]);
}

function getTime(plugin = '') {
    const command = `cd ./plugins/${plugin}/ && git log -1 --oneline --pretty=format:"%cd" --date=format:"%m-%d %H:%M"`;

    let time = '';
    try {
        time = execSync(command, { encoding: 'utf-8' });
        time = lodash.trim(time);
    } catch (error) {
        logger.error(error.toString());
        time = '获取时间失败';
    }
    return time;
}

function getLog(e, plugin = '', oldCommitId) {
    const command = `cd ./plugins/${plugin}/ && git log  -20 --oneline --pretty=format:"%h||[%cd]  %s" --date=format:"%m-%d %H:%M"`;

    let logAll = '';
    try {
        logAll = execSync(command, { encoding: 'utf-8' });
    } catch (error) {
        logger.error(error.toString());
        e.reply(error.toString());
    }

    if (!logAll) {
        return false;
    }

    logAll = logAll.split('\n');

    let log = [];
    for (let str of logAll) {
        str = str.split('||');
        if (str[0] == oldCommitId) {
            break;
        }
        if (str[1].includes('Merge branch')) {
            continue;
        }
        log.push(str[1]);
    }
    const line = log.length;
    log = log.join('\n\n');

    if (log.length <= 0) {
        return '';
    }

    log = makeForwardMsg(e, `vits-plugin更新日志，共${line}条`, log);

    return log;
}

function makeForwardMsg(e, title, msg) {
    let nickname = (e.bot ?? Bot).nickname;
    if (e.isGroup) {
        let info = (e.bot ?? Bot).getGroupMemberInfo(e.group_id, (e.bot ?? Bot).uin);
        nickname = info.card || info.nickname;
    }
    let userInfo = {
        user_id: (e.bot ?? Bot).uin,
        nickname
    };

    let forwardMsg = [
        {
            ...userInfo,
            message: title
        },
        {
            ...userInfo,
            message: msg
        }
    ];

    /** 制作转发内容 */
    if (e.group?.makeForwardMsg) {
        forwardMsg = e.group.makeForwardMsg(forwardMsg);
    } else if (e?.friend?.makeForwardMsg) {
        forwardMsg = e.friend.makeForwardMsg(forwardMsg);
    } else {
        return msg.join('\n');
    }

    let dec = 'vits-plugin 更新日志'
    /** 处理描述 */
    if (typeof (forwardMsg.data) === 'object') {
        let detail = forwardMsg.data?.meta?.detail;
        if (detail) {
            detail.news = [{ text: dec }];
        }
    } else {
        forwardMsg.data = forwardMsg.data
            .replace(/\n/g, '')
            .replace(/<title color="#777777" size="26">(.+?)<\/title>/g, '___')
            .replace(/___+/, `<title color="#777777" size="26">${dec}</title>`);
    }

    return forwardMsg;
}

function execSync(cmd) {
    return new Promise((resolve, reject) => {
        exec(cmd, { windowsHide: true }, (error, stdout, stderr) => {
            resolve({ error, stdout, stderr });
        })
    })
}
