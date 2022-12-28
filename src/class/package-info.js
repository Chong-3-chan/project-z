import { objCopy } from "../data/extra-test-data";
import FileInfo from "./file-info";
const ppool = new Map();
let db, openDB_callbackList = [];
function openDB() {
    let re = indexedDB.open("weimu-fileInfo");
    function openDB_callback() { openDB_callbackList.forEach(e => e()); openDB_callbackList = []; };
    re.onupgradeneeded = function (event) {
        let db = event.target.result;
        let objectStore = db.createObjectStore("package", { keyPath: "resourcePath" });
        objectStore.createIndex("resourcePath", "resourcePath", { unique: true });
    };
    re.onsuccess = (e) => {
        db = e.target.result
        console.log('success', db);
        openDB_callback();
    }
    re.onerror = (e) => console.log('error', e);
}
openDB();
function DBput(line) {
    if (!db) openDB_callbackList.push(() => DBput(line));
    else {
        let request = db.transaction(["package"], 'readwrite')
            .objectStore("package")
            .put(line);
        request.onsuccess = function (event) {
            console.log('数据写入成功', line);
        };
        request.onerror = function (event) {
            console.log('数据写入失败');
        }
    }
}
function DBget(path) {
    function get(resolve, reject) {
        let request = db.transaction(['package']).objectStore('package').get(path);
        request.onerror = function (event) {
            console.log('数据读取失败');
            reject(event);
        };
        request.onsuccess = function (event) {
            if (request.result) {
                console.log('数据读取成功', request.result)
            } else {
                console.log('未获得数据记录');
            }
            resolve(request.result);
        };
    }
    return new Promise((resolve, reject) => {
        if (!db)
            openDB_callbackList.push(() => get(resolve, reject));
        else {
            get(resolve, reject);
        }
    })
}
// const test_data = [{ resourcePath: "111", data: "123" }];
// setTimeout(() => {
//     {
//         let transaction = db.transaction(["package"], "readwrite");
//         // 在所有数据添加完毕后的处理
//         transaction.oncomplete = function (event) {
//             alert("All done!");
//         };
//         transaction.onerror = function (event) {
//             // 不要忘记错误处理！
//             console.log(event.target.result)
//             alert("error");
//         };

//         let objectStore = transaction.objectStore("package");
//         test_data.forEach(function (data) {
//             let request = objectStore.add(data);
//             request.onsuccess = function (event) {
//                 // event.target.result === customer.ssn;
//                 console.log(event.target.result, "eeeee")
//             };
//         });
//     }
// }, 100)
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
        const fromDB = await DBget(this.resourcePath);
        console.log("dt", objCopy(fromDB), ppool)
        if (fromDB) {
            for (let i in fromDB) {
                this[i] = fromDB[i];
            };
            doSthWithMessage({
                state: "done",
                total: Object.keys(fromDB.data).length,
                data: Object.fromEntries(Object.entries(fromDB.data).map(([i, e]) => [i, e.data]))
            });
            resolve("hit DB");
            return;
        }
        let worker = new Worker(new URL('./../worker/worker-getZip.js', import.meta.url));
        worker.postMessage(this.resourcePath);
        worker.onmessage = (e) => {
            const msg = e.data;
            for (let key in msg) this[key] = msg[key];
            doSthWithMessage(msg);
            if (this.state == "done") {
                DBput(this);
                resolve("get");
            }
            else if (this.state == "error") {
                resolve("failed", e.error);
            }
        };
    })
}
PackageInfo.__proto__.createPackageInfoList = function (key_path_map) {
    const P = {};
    console.log(key_path_map, 'km');
    Object.entries(key_path_map).forEach(([i, e]) => {
        P[i] = new PackageInfo(e);
    });
    return P;
}
PackageInfo.__proto__.getPackagePool = function () {
    console.log("package pool")
    return ppool;
}
export default PackageInfo;