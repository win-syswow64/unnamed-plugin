import Base from './base.js';

export default class Version extends Base {
    constructor(e) {
        super(e);
        this.model = 'version';
    }

    /** 生成版本信息图片 */
    async getData(versionData = []) {
        const version = versionData.length > 0 ? versionData[0].version : '1.0.0';
        const data = {
            ...this.screenData,
            versionId: version,
            quality: 100,
            saveId: version,
            versionData
        };
        return data;
    }
}
