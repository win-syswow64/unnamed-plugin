import fetch from "node-fetch";
import config from "./index.js";

export class TtsMain {
    async ttsList() {
        const speakerData = config.getConfig('speaker');
        const listSet = new Set([...speakerData.cnmodel, ...speakerData.jpmodele, ...speakerData.enmodel, ...speakerData.api2model]);
        const list = Array.from(listSet);
        return list;
    }
}
