// import { objCopy } from "../data/extra-test-data";
// import { openDB, DBput, DBget } from "./IndexedDB-controller";
// // import FileInfo from "./file-info";
// const ppool = new Map();
// openDB([
//     ["package", "resourcePath", true],
//     // ["test", "test", true]
// ]);

// function PackageInfo(prop) {
//     if (typeof prop == "string") {
//         console.log("piob", prop)
//         const path = prop;
//         if (ppool.has(path)) {
//             for (let i in ppool.get(path)) {
//                 this[i] = ppool.get(path)[i]
//             };
//             return;
//         }
//         const newPackageInfo = {
//             resourcePath: path,
//             state: "waiting",
//             data: {}
//         };
//         for (let i in newPackageInfo) {
//             this[i] = newPackageInfo[i]
//         };
//         ppool.set(path, this);
//     }
//     else if (typeof prop == "object") {
//         console.log("piob", prop)
//         const newPackageInfo = prop;
//         for (let i in newPackageInfo) {
//             this[i] = newPackageInfo[i]
//         };
//         ppool.set(newPackageInfo.resourcePath, this);
//     }
// }
// PackageInfo.prototype.load = function (doSthWithMessage) {
//     return new Promise(async (resolve, reject) => {
//         if (this.state != "waiting") {
//             resolve("hit");
//             return;
//         }
//         const fromDB = await DBget("package",this.resourcePath);
//         console.log("dt", objCopy(fromDB), ppool)
//         if (fromDB) {
//             for (let i in fromDB) {
//                 this[i] = fromDB[i];
//             };
//             doSthWithMessage({
//                 state: "done",
//                 total: Object.keys(fromDB.data).length,
//                 data: Object.fromEntries(Object.entries(fromDB.data).map(([i, e]) => [i, {type:e.type,data:e.data}]))
//             });
//             resolve("hit DB");
//             return;
//         }
//         let worker = new Worker(new URL('./../worker/worker-getZip.js', import.meta.url));
//         worker.postMessage(this.resourcePath);
//         worker.onmessage = (e) => {
//             const msg = e.data;
//             for (let key in msg) this[key] = msg[key];
//             doSthWithMessage(msg);
//             if (this.state == "done") {
//                 DBput("package",this);
//                 resolve("get");
//             }
//             else if (this.state == "error") {
//                 resolve("failed", e.error);
//             }
//         };
//     })
// }
// PackageInfo.__proto__.createPackageInfoList = function (key_path_map) {
//     const P = {};
//     console.log(key_path_map, 'km');
//     Object.entries(key_path_map).forEach(([i, e]) => {
//         P[i] = new PackageInfo(e);
//     });
//     return P;
// }
// PackageInfo.__proto__.getPackagePool = function () {
//     console.log("package pool1")
//     return ppool;
// }
// export default PackageInfo;