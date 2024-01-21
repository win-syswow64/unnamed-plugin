import fs from 'node:fs';
import _ from 'lodash';
import YAML from 'yaml';
import chokidar from 'chokidar';
import path from 'path';

class RConfig {
    constructor() {
        // 配置文件目录
        this.configDir = './plugins/unnamed-plugin/configs/'
        this.config = {};
        // 监听文件
        this.watcher = {};
    }

    /**
     * 获取配置文件
     * @param {string} name - 配置文件名
     * @returns {any}
     */
    getConfig(name) {
        const ignore = [];

        if (ignore.includes(name)) {
            return this.getYaml(name);
        }

        return this.getYaml(name);
    }

    /**
     * 获取配置yaml
     * @param {string} name - 文件名
     * @returns {any}
     */
    getYaml(name) {
        // 获取文件路径
        const file = this.getFilePath(name);
        // 解析yaml
        const yaml = YAML.parse(fs.readFileSync(file, 'utf8'));
        // 监听文件
        this.watch(file, name);
        return yaml;
    }

    /**
     * 获取文件路径
     * @param {string} name - 文件名
     * @returns {string} - 文件路径
     */
    getFilePath(name) {
        return path.join(this.configDir, `${name}.yaml`);
    }

    /**
     * 监听配置文件
     * @param {string} file - 文件路径
     * @param {string} name - 文件名
     */
    watch(file, name) {
        const watcher = chokidar.watch(file);

        watcher.on('change', (path) => {
            try {
                logger.mark(`[修改配置文件][${path.basename(file)}]`);
            } catch (error) {
                logger.error(`Error logging: ${error.message}`);
            }
        });
        // 存储watcher对象，以便稍后可以取消监听
        this.watcher[name] = watcher;
    }

    /**
     * 保存配置
     * @param {string} name - 文件名
     * @param {any} data - 要保存的数据
     */
    async saveSet(name, data) {
        const file = this.getFilePath(name);

        try {
            if (_.isEmpty(data)) {
                if (await fs.promises.access(file).then(() => true).catch(() => false)) {
                    await fs.promises.unlink(file);
                }
            } else {
                const yaml = YAML.stringify(data);
                await fs.promises.writeFile(file, yaml, 'utf8');
            }
        } catch (error) {
            logger.error(`Error saving configuration: ${error.message}`);
        }
    }
}

export default new RConfig();
