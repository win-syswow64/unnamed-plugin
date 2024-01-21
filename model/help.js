import base from './base.js';
import config from './index.js';
import cfg from '../../../lib/config/config.js';

export default class Help extends base {
    constructor(e) {
        super(e);
        this.model = 'help';
    }

    static async get(e) {
        const html = new Help(e);
        return await html.getData();
    }

    async getData() {
        const helpData = config.getConfig('help');
        const groupCfg = cfg.getGroup(this.group_id);

        if (groupCfg.disable && groupCfg.disable.length) {
            helpData.forEach((item) => {
                item.disable = groupCfg.disable.includes(item.group);
            });
        }

        const versionData = config.getConfig('version');
        const version = (versionData?.[0]?.version) || '1.0.0';

        return {
            ...this.screenData,
            saveId: 'help',
            version,
            helpData,
        };
    }
}
