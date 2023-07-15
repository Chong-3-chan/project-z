
import { result } from 'lodash';
import { DBget, DBget_index, DBput } from '../class/IndexedDB-controller.js';
import { objCopy, chara_map, file_map, package_map, tips_group, getPackagePath, BOOKFromChild, STORYFromChild, b, s, bookIds, co, information_map, homeResource_map, allData } from '../data/extra-test-data.js'
function isFromWeimu({ data: { from, ...other } }) {
    if (!from?.startsWith("weimu")) return false;
    console.log("parent get msg", { from, ...other });
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
export function messageResponseMap_clear() {
    for (let i in messageResponseMap)
        delete messageResponseMap[i];
}

function doSthWithMessage(obj) {
    if (isFromWeimu(obj)) {
        Object.values(messageResponseMap).forEach(e => e.check(obj) && e.todo(obj));
    }
}
addEventListener("message", doSthWithMessage);


export function message_readyPutFile(props, callback, remove) {
    const [check, todo] = [
        function _readyPutFile({ data: { key, ...other } }) {
            return key == "getFile";
        },
        function readyPutFile(obj) {
            return new Promise((resolve, reject) => {
                const { chiidWindow } = props;
                const { data } = obj.data;
                const { path } = data.props;
                DBget("file", path).then(result => chiidWindow.postMessage(
                    { from: "weimu-helper", key: "file", data: ((re) => { const obj = {}; obj[re.path] = re; return obj; })(result) },
                    "*"));
                resolve();
            }).then((re) => {
                callback && callback(re);
                remove && messageResponseMap_remove(mrid);
            })
        }
    ]
    const mrid = messageResponseMap_add({ check, todo });
}
export function message_readyPutPackage(props, callback, remove) {
    const [check, todo] = [
        function _readyPutPackage({ data: { key, ...other } }) {
            return key == "getPackage";
        },
        function readyPutPackage(obj) {
            return new Promise((resolve, reject) => {
                const { chiidWindow } = props;
                const { data } = obj.data;
                const { packageKey } = data.props;
                DBget_index('file', "packageKey", packageKey).then(result => chiidWindow.postMessage(
                    {
                        from: "weimu-helper", key: "package", data: (re =>
                        ({
                            data: Object.fromEntries(re.map(e => [e.fileName, e])),
                            loaded: re.length,
                            percent: 100,
                            resourcePath: `helper://${packageKey}.zip`,
                            key: packageKey,
                            state: "done",
                            total: re.length
                        }))(result)
                    },
                    "*"))
                resolve();
            }).then((re) => {
                callback && callback(re);
                remove && messageResponseMap_remove(mrid);
            })
        }
    ]
    const mrid = messageResponseMap_add({ check, todo });
}
export function message_readyPutData(props, callback, remove) {
    const [check, todo] = [
        function _readyPutData({ data: { key, ...other } }) {
            return key == "getData";
        },
        function readyPutData(obj) {
            return new Promise((resolve, reject) => {
                const { chiidWindow, forceUpdate, getLastMsg, setLastMsg } = props;
                // messageResponseMap
                // debugger;
                chiidWindow.postMessage(
                    {
                        from: "weimu-helper", key: "data",
                        data: allData
                    },
                    "*");
                (getLastMsg() !== obj) && setLastMsg(obj);
                resolve(obj);
            }).then((re) => {
                callback && callback(re);
                remove && messageResponseMap_remove(mrid);
            })
        }
    ]
    const mrid = messageResponseMap_add({ check, todo });
}

export function message_readyGetReturnData(props, callback, remove) {
    const [check, todo] = [
        function _getReturnData({ data: { key, ...other } }) {
            return key == "returnData";
        },
        function getReturnData(obj) {
            return new Promise(async (resolve, reject) => {
                const { chiidWindow, forceUpdate, getLastMsg, setLastMsg } = props;
                const { data } = obj.data;
                co(BOOKFromChild, data.BOOK);
                co(STORYFromChild, data.STORY);
                // 写数据库-补全本地缺失的文件信息（源：服务器）
                console.log("get ms", data)
                data.pools &&
                    Promise.allSettled(Array.from(data.pools.package).map(([path, obj]) => {
                        return DBget("package", path).then(result => result ?? DBput("package", { resourcePath: path, key: obj.key }));
                    })).then(() => {
                        // console.log(Array.from(data.pools.package).map(([, { key, data }]) => {
                        //     return Object.entries(data).map(([fileName, fileInfo]) => ({ path: `${key}/${fileName}`, ...fileInfo }));
                        // }).flat(1),'eeeeee')
                        return Promise.allSettled(
                            Array.from(data.pools.package).map(([, { key, data }]) => {
                                return Object.entries(data).map(([fileName, fileInfo]) => ({ path: `${key}/${fileName}`, ...fileInfo }));
                            }).flat(1).map((fileInfo) => {
                                return DBget("file", fileInfo.path).then(result => result ?? DBput("file", fileInfo));
                            }));
                    });
                // 导出所有包
                // Promise.allSettled(
                //     Object.entries(data.pools.file).map(e => [e[0] + '.zip', Object.entries(e[1]).map(([name, data]) => {
                //         debugger;
                //         const bstr = atob(data.data);
                //         let n = bstr.length,
                //             u8arr = new Uint8Array(n);
                //         while (n--) {
                //             u8arr[n] = bstr.charCodeAt(n);
                //         }
                //         return (new File([u8arr], name))
                //     })])
                //         .map(e => getZipFile(...e).then(([blob, fileName]) => new File([blob], fileName, { type: blob.type })))
                // ).then(e => saveZipFile("allPackage.zip", e.map(_e => _e.value)))

                (getLastMsg() !== obj) && setLastMsg(obj);
                forceUpdate();
                resolve(obj);
            }).then((re) => {
                callback && callback(re);
                remove && messageResponseMap_remove(mrid);
            })
        }
    ]
    const mrid = messageResponseMap_add({ check, todo });
}
export function message_readyGetNow(props, callback, remove) {
    const [check, todo] = [
        function _readyGetNow({ data: { key, ...other } }) {
            return key == "getNow";
        },
        function readyGetNow(obj) {
            return new Promise((resolve, reject) => {
                const { data: { data, ...other } } = obj;
                resolve(data);
                remove && messageResponseMap_remove(mrid);
            }).then((re) => {
                callback && callback(re);
            })
        }]
    const mrid = messageResponseMap_add({ check, todo });
}