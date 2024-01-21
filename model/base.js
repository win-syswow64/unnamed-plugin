import path from 'path';

export default class Base {
    constructor(e = {}) {
        const { user_id: userId } = e;
        this.e = e;
        this.userId = userId;
        this.model = 'unnamed-plugin';
        this._path = process.cwd().replace(/\\/g, '/');
    }

    get prefix() {
        return `Yz:unnamed-plugin:${this.model}:`;
    }

    /**
     * 截图默认数据
     * @param {string} saveId - HTML 保存 ID
     * @param {string} tplFile - 模板 HTML 路径
     * @param {string} pluResPath - 插件资源路径
     */
    get screenData() {
        const resourcePath = path.join(this._path, 'plugins', 'unnamed-plugin', 'resource');
        return {
            saveId: this.userId,
            tplFile: path.join(resourcePath, 'html', this.model, `${this.model}.html`),
            pluResPath: resourcePath
        };
    }
}
