import FileInfo from '../class/file-info.js';
import PackageInfo from '../class/package-info.js'
import { chara_map, file_map, package_map, packageSampleUsing, BOOK, STORY, write, b, s, writeRe, bookIds, tips_group } from '../data/extra-test-data'
import { removeDB } from './IndexedDB-controller.js';
function isFromWeimu({ data: { from, ...other } }) {
    if (!from?.startsWith("weimu")) return false;
    console.log("child get msg", { from, ...other });
    return true;
}
const messageResponseMap = {};
let messageResponseCount = 0;
function messageResponseMap_add({ check, todo }) {
    messageResponseMap[messageResponseCount] = { check, todo };
    return messageResponseCount++;
}
function messageResponseMap_remove(key) {
    delete messageResponseMap[key];
}

function doSthWithMessage(obj) {
    if (isFromWeimu(obj)) {
        Object.values(messageResponseMap).forEach(e => e.check(obj) && e.todo(obj));
    }
}
addEventListener("message", doSthWithMessage);

export function message_readyReload(props, callback, remove) {
    const [check, todo] = [
        function _readyReload({ data: { key, ...other } }) {
            return key == "reload";
        },
        function readyReload(obj) {
            return new Promise((resolve, reject) => {
                const { data: { reload } } = obj;
                if (reload) {
                    location.reload();
                }
                resolve();
                remove && messageResponseMap_remove(mrid);
            }).then((re) => {
                callback && callback(re);
            });
        }]
    const mrid = messageResponseMap_add({ check, todo });
}
export function message_readyResetDB(props, callback, remove) {
    const [check, todo] = [
        function _readyResetDB({ data: { key, ...other } }) {
            return key == "resetDB";
        },
        function readyResetDB(obj) {
            return new Promise((resolve, reject) => {
                const { data: { reset } } = obj;
                if (reset) {
                    removeDB().then(() => resolve());
                }
                // resolve();
                remove && messageResponseMap_remove(mrid);
            }).then((re) => {
                callback && callback(re);
            });
        }]
    const mrid = messageResponseMap_add({ check, todo });
}
export function message_getData(props, callback, remove) {
    const [check, todo] = [
        function _getData({ data: { key, ...other } }) {
            return key == "data";
        },
        function getData(obj) {
            return new Promise((resolve, reject) => {
                const { data: { data } } = obj;
                resolve(data);
                remove && messageResponseMap_remove(mrid);
            }).then((re) => {
                callback && callback(re);
            })
        }]
    const mrid = messageResponseMap_add({ check, todo });
    parent.postMessage({ from: "weimu", key: "getData", data: {} }, "*");
}
export function message_getFile(props, callback, remove) {
    const [check, todo] = [
        function _getFile({ data: { key, ...other } }) {
            return key == "file";
        },
        function getFile(obj) {
            return new Promise((resolve, reject) => {
                const { data: { ...other } } = obj;
                remove && messageResponseMap_remove(mrid);
            }).then((re) => {
                callback && callback(re);
            })
        }]
    const mrid = messageResponseMap_add({ check, todo });
    parent.postMessage({ from: "weimu", key: "getFile", data: { props } }, "*");
}
export function message_getPackage({ packageKey }, callback, remove) {
    const [check, todo] = [
        function _getPackage({ data: { key, ...other } }) {
            return key == "package";
        },
        function getPackage(obj) {
            return new Promise((resolve, reject) => {
                const { data: { data, ...other } } = obj;
                if (packageKey == data.key) {
                    resolve(data);
                    remove && messageResponseMap_remove(mrid);
                };
            }).then((re) => {
                callback && callback(re);
            })
        }]
    const mrid = messageResponseMap_add({ check, todo });
    parent.postMessage({ from: "weimu", key: "getPackage", data: { props: { packageKey } } }, "*");
}
export function message_readySetNext(props, callback, remove) {
    const [check, todo] = [
        function _setNext({ data: { key, ...other } }) {
            return key == "setNext";
        },
        function setNext(obj) {
            return new Promise((resolve, reject) => {
                const { data: { data, ...other } } = obj;
                resolve(data);
                remove && messageResponseMap_remove(mrid);
            }).then((re) => {
                callback && callback(re);
            })
        }]
    const mrid = messageResponseMap_add({ check, todo });
    parent.postMessage({ from: "weimu", key: "readySetNext", data: { props: {} } }, "*");
}