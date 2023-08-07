import { objCopy, packageSampleUsing } from "../data/extra-test-data";
import { DBput, DBget } from "../tools/IndexedDB-controller";
import { message_getPackage } from "../tools/message-helper";
// import FileInfo from "./file-info";
const ppool = new Map();

function PackageInfo(prop) {
    if (typeof prop == "string") {
        console.log("piob", prop)
        const path = prop;
        if (ppool.has(path)) {
            for (let i in ppool.get(path)) {
                this[i] = ppool.get(path)[i]
            };
            return;
        }
        const newPackageInfo = {
            resourcePath: path,
            key: path.slice(path.lastIndexOf('/') + 1, path.lastIndexOf('.')),
            state: "waiting",
            data: {}
        };
        for (let i in newPackageInfo) {
            this[i] = newPackageInfo[i]
        };
        ppool.set(path, this);
    }
    else if (typeof prop == "object") {
        console.log("piob", prop)
        const newPackageInfo = prop;
        for (let i in newPackageInfo) {
            this[i] = newPackageInfo[i]
        };
        ppool.set(newPackageInfo.resourcePath, this);
    }
}
PackageInfo.prototype.load = function (doSthWithMessage) {
    return new Promise(async (resolve, reject) => {
        if (this.state != "waiting") {
            resolve("hit");
            return;
        }
        const fromHelper = (packageSampleUsing || window === window.parent) ? undefined : (await new Promise((resolve, reject) => message_getPackage({ packageKey: this.key }, e => resolve(Object.keys(e?.data).length ? e : undefined))));
        const fromDB = await DBget("package", this.resourcePath);
        // debugger;
        console.log("dt", objCopy(fromHelper), objCopy(fromDB), ppool)
        const from = fromHelper ?? fromDB;
        if (from) {
            for (let i in from) {
                this[i] = from[i];
            };
            doSthWithMessage({
                state: "done",
                total: Object.keys(from.data).length,
                data: Object.fromEntries(Object.entries(from.data).map(([i, e]) => [i, { type: e.type, data: e.data }]))
            });
            resolve("hit DB");
            return;
        }
        let worker = new Worker(new URL('./../worker/worker-getZip.js', import.meta.url));
        worker.postMessage({ path: this.resourcePath });
        worker.onmessage = (e) => {
            const msg = e.data;
            for (let key in msg) this[key] = msg[key];
            doSthWithMessage(msg);
            if (this.state == "done") {
                DBput("package", this);
                resolve("get");
            }
            else if (this.state == "error") {
                resolve("failed", e.error);
            }
        };
    })
}
export function createPackageInfoList(key_path_map) {
    const P = {};
    console.log(key_path_map, 'km');
    Object.entries(key_path_map).forEach(([i, e]) => {
        P[i] = new PackageInfo(e);
    });
    return P;
}
export function getPackagePool() {
    console.log("package pool1")
    return ppool;
}
export default PackageInfo;