let db, openDB_callbackList = [];
const DBname = "weimu-helper";
const stores = [
    ['data', [["key", true]]],
    ['b', [["key", true]]],
    ['s', [["path", true]]],
    ["chara", [["id", true]]],
    ["package", [["resourcePath", true]]],
    ["file", [["path", true], ["packageKey", false]]],
    ["maps", [["key", true]]],
    ["tips", [["key", true]]],
],
    storeNameList = stores.map(([n]) => n);

// let g = indexedDB.databases();
// g.then(e => alert(JSON.stringify(e)));
function openDB(arr) {
    let re = indexedDB.open(DBname);
    function openDB_callback() { openDB_callbackList.forEach(e => e()); openDB_callbackList = []; };
    re.onupgradeneeded = function (event) {
        console.log("upgradeneeded");
        let db = event.target.result;
        arr.forEach(([base, [...key_unique]]) => {
            if (!db.objectStoreNames.contains(base)) {
                let objectStore = db.createObjectStore(base, { keyPath: key_unique[0][0] });
                // debugger;
                key_unique.forEach(([key, unique]) => {
                    objectStore.createIndex(key, key, { unique: unique });
                })
            }
            else {
                console.log("已经创建过", [base, [...key_unique]])
            }
        })
    };
    re.onsuccess = (e) => {
        db = e.target.result;
        console.log('success', db);
        openDB_callback();
    }
    re.onerror = (e) => console.log('error', e);
}
openDB(stores);

// function getObjectStore(storeNameList, mode) {
//     return db.transaction(storeNameList, mode).objectStore(storeNameList);
// }

// function read(storeName) {
//     const objectStore = getObjectStore(storeName, "readonly");
//     const request = objectStore.getAll();
//     request.onerror = function (event) {
//         console.log("事务失败");
//     };
//     request.onsuccess = function (event) {
//         console.log("读取数据成功");
//         const result = event.target.result;
//         console.log(result);
//     };
// }


async function readAllDB(storeNameList) {
    const promises = storeNameList.map((storeName) => {
        const objectStore = db.transaction([storeName], "readonly").objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = objectStore.getAll();
            request.onerror = function (event) {
                reject("事务失败");
            };
            request.onsuccess = function (event) {
                resolve([storeName, Object.fromEntries(event.target.result.map(e => [e[objectStore.keyPath], e]))]);
            };
        });
    });
    return Promise.all(promises);
}
async function putAllDB(storeMap) {
    const promises = Object.entries(storeMap).map(([storeName, lineMap]) => {
        const objectStore = db.transaction([storeName], "readwrite").objectStore(storeName);
        return DBclear(storeName).then(() => Promise.all(Object.entries(lineMap).map(([, line]) => DBput(storeName, line))))
    });
    return Promise.all(promises);
}
function downloadJsonFile(name, text) {
    var file = new Blob([text], { type: "text/plain" });
    let a = document.createElement("a");
    a.href = URL.createObjectURL(file);
    a.download = name + ".json";
    a.style.position = "fixed";
    a.style.left = "100%";
    a.style.pointerEvents = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
export function downloadData(name = "object_name", storeNameList = ['tips', 'data', 'b', 's', 'chara', 'package', 'maps', "tips"]) {
    return readAllDB(storeNameList)
        .then(e => JSON.stringify(Object.fromEntries(e)))
        .then(text => downloadJsonFile(name, text));
}
export function uploadData(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            let data;
            try {
                data = JSON.parse(reader.result);
            }
            catch (e) {
                alert("文件内容有误");
                reject();
                return;
            }
            if (!confirm("是否确认覆盖当前内容？")) return;
            resolve(putAllDB(data).then(() => location.reload()));
        }
        reader.readAsText(file);
    })
}


import { reject } from "lodash";
import { file_map, chara_map, package_map, s, b, co, tips_group, bookIds, homeResource_map, information_map } from "../data/extra-test-data";
export function readWriteAll() {
    return Promise.allSettled([
        DBcount("chara").then((count) => {
            if (count == 0) {
                return Promise.allSettled(Object.keys(chara_map).map(id => DBput("chara", chara_map[id])));
            }
            else {
                const read_chara = {};
                return DBtraversal("chara", ({ key, value }) => read_chara[key] = value).then(() => {
                    co(chara_map, read_chara);
                })
            }
        }),
        DBcount("b").then((count) => {
            if (count == 0) {
                return Promise.allSettled(Object.keys(b).map(bookId => DBput("b", { key: bookId, value: b[bookId] })));
            }
            else {
                const read_b = {};
                return DBtraversal("b", ({ key, value }) => read_b[key] = value.value).then(() => {
                    co(b, read_b);
                    bookIds.splice(0);
                    Object.keys(b).forEach(e=>bookIds.push(e));
                })
            }
        }),
        DBcount("s").then((count) => {
            if (count == 0) {
                // return Promise.allSettled(Object.keys(s).map(bookId => DBput("s", { key: bookId, value: s[bookId] })));
                return Promise.allSettled(Object.keys(s).map(bookId =>
                    Promise.allSettled(Object.keys(s[bookId]).map(storyId =>
                        DBput("s", { path: `${bookId}/${storyId}`, value: s[bookId][storyId] })
                    ))
                ));
            }
            else {
                const read_s = {};
                return DBtraversal("s", ({ key: path, value }) => {
                    // debugger;
                    const [bookId, storyId] = path.split('/');
                    read_s[bookId] ?? (read_s[bookId] = {});
                    read_s[bookId][storyId] = value.value;
                }).then(() => {
                    co(s, read_s);
                })
            }
        }),
        DBcount("maps").then((count) => {
            if (count == 0) {
                return putMaps();
            }
            else {
                const read_maps = {};
                return DBtraversal("maps", ({ key, value }) => read_maps[key] = value.value).then(() => {
                    co(file_map, read_maps.file_map);
                    co(package_map, read_maps.package_map);
                    co(information_map,read_maps.information_map);
                    co(homeResource_map,read_maps.homeResource_map);
                })
            }
        }),
        DBcount("tips").then((count) => {
            if (count == 0) {
                return Promise.allSettled(Object.keys(tips_group).map(key => DBput("tips", { ...tips_group[key], key })));
            }
            else {
                const read_maps = {};
                return DBtraversal("tips", ({ key, value }) => read_maps[key] = Array.from({ ...value, length: Object.keys(value).length - 1 })).then(() => {
                    co(tips_group, read_maps);
                })
            }
        }),
    ])
}
export function readAll() {
    return Promise.allSettled([
        DBcount("chara").then((count) => {
            const read_chara = {};
            return DBtraversal("chara", ({ key, value }) => read_chara[key] = value).then(() => {
                co(chara_map, read_chara);
            })
        }),
        DBcount("b").then((count) => {
            const read_b = {};
            return DBtraversal("b", ({ key, value }) => read_b[key] = value.value).then(() => {
                co(b, read_b);
                bookIds.splice(0);
                Object.keys(b).forEach(e=>bookIds.push(e));
            })
        }),
        DBcount("s").then((count) => {
            const read_s = {};
            return DBtraversal("s", ({ key: path, value }) => {
                const [bookId, storyId] = path.split('/');
                read_s[bookId] ?? (read_s[bookId] = {});
                read_s[bookId][storyId] = value.value;
            }).then(() => {
                co(s, read_s);
            })
        }),
        DBcount("maps").then((count) => {
            const read_maps = {};
            return DBtraversal("maps", ({ key, value }) => read_maps[key] = value.value).then(() => {
                co(file_map, read_maps.file_map);
                co(package_map, read_maps.package_map);
                co(homeResource_map,read_maps.homeResource_map);
            })
        }),
        DBcount("tips").then((count) => {
            const read_maps = {};
            return DBtraversal("tips", ({ key, value }) => read_maps[key] = Array.from({ ...value, length: Object.keys(value).length })).then(() => {
                co(tips_group, read_maps);
            })
        }),
    ])
}
export function writeAll() {
    return Promise.allSettled([
        DBclear("chara").then(() => {
            return Promise.allSettled(Object.keys(chara_map).map(id => DBput("chara", chara_map[id])));
        }),
        DBclear("b").then(() => {
            return Promise.allSettled(Object.keys(b).map(bookId => DBput("b", { key: bookId, value: b[bookId] })));
        }),
        DBclear("s").then(() => {
            return Promise.allSettled(Object.keys(s).map(bookId =>
                Promise.allSettled(Object.keys(s[bookId]).map(storyId =>
                    DBput("s", { path: `${bookId}/${storyId}`, value: s[bookId][storyId] })
                ))
            ));
        }),
        DBclear("maps").then(() => {
            return putMaps();
        }),
        DBcount("tips").then((count) => {
            return Promise.allSettled(Object.keys(tips_group).map(key => DBput("tips", { ...tips_group[key], key })));
        }),
    ])
}
export function putMaps(){
    return Promise.allSettled([
        DBput("maps", { key: "package_map", value: package_map }),
        DBput("maps", { key: "file_map", value: file_map }),
        DBput("maps",{key:"homeResource_map",value:homeResource_map}),
        DBput("maps",{key:"information_map",value:information_map})
    ])
}
export function DBremove(base, key) {
    function remove(resolve, reject) {
        const request = db.transaction([base], 'readwrite')
            .objectStore(base)
            .delete(key);
        request.onsuccess = function (event) {
            console.log('数据删除成功', base, key, event);
            resolve(key);
        };
        request.onerror = function (event) {
            console.log('数据删除失败', base, key, event);
            reject(event);
        };
    }
    return new Promise((resolve, reject) => {
        if (!db) openDB_callbackList.push(() => remove(resolve, reject));
        else {
            remove(resolve, reject);
        }
    })
}
export function DBput(base, line) {
    function put(resolve, reject) {
        let request = db.transaction([base], 'readwrite')
            .objectStore(base)
            .put(line);
        request.onsuccess = function (event) {
            console.log('数据写入成功', line, event);
            resolve(line);
        };
        request.onerror = function (event) {
            console.log('数据写入失败');
            reject(event);
        }
    }
    return new Promise((resolve, reject) => {
        if (!db) openDB_callbackList.push(() => put(resolve, reject));
        else {
            put(resolve, reject);
        }
    })
}
export function DBget(base, primaryKeyValue) {
    function get(resolve, reject) {
        let request = db.transaction([base])
            .objectStore(base)
            .get(primaryKeyValue);
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
export function DBget_index(base, indexName, keyValue) {
    function get(resolve, reject) {
        let request = db.transaction([base])
            .objectStore(base)
            .index(indexName)
            .getAll(keyValue);
        request.onerror = function (event) {

            // debugger;
            console.log('数据读取失败');
            reject(event);
        };
        request.onsuccess = function (event) {
            // debugger;
            if (request.result) {
                console.log('数据读取成功-', request.result)
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

export function DBtraversal(base, fun) {
    function traversal(resolve, reject) {
        let objectStore = db.transaction([base], 'readwrite')
            .objectStore(base),
            count = 0,
            cursor = objectStore.openCursor();
        cursor.onsuccess = function (event) {
            let line = event.target.result;
            console.log('数据遍历:',line);
            if (line) {
                fun instanceof Function && fun(line);
                count++;
                line.continue();
            }
            else {
                resolve(count);
            }
        };
        cursor.onerror = function (event) {
            console.log('数据遍历时错误');
            reject(event);
        };
    }
    return new Promise((resolve, reject) => {
        if (!db) openDB_callbackList.push(() => traversal(resolve, reject));
        else {
            traversal(resolve, reject);
        }
    })
}
export function DBcount(base) {
    function count(resolve, reject) {
        let request = db.transaction([base])
            .objectStore(base)
            .count();
        request.onerror = function (event) {
            console.log('数据读取失败');
            reject(event);
        };
        request.onsuccess = function (event) {
            // debugger;
            if (request.result) {
                console.log('数据读取成功-', base, request.result)
            } else {
                console.log('未获得数据记录');
            }
            resolve(request.result);
        };
    }
    return new Promise((resolve, reject) => {
        if (!db)
            openDB_callbackList.push(() => count(resolve, reject));
        else {
            count(resolve, reject);
        }
    })
}
export function DBclear(base) {
    function clear(resolve, reject) {
        let request = db.transaction([base], 'readwrite')
            .objectStore(base)
            .clear();
        request.onerror = function (event) {
            console.log('数据清空失败');
            reject(event);
        };
        request.onsuccess = function (event) {
            console.log('数据清空成功', base, request.result)
            resolve(request.result);
        };
    }
    return new Promise((resolve, reject) => {
        if (!db)
            openDB_callbackList.push(() => clear(resolve, reject));
        else {
            clear(resolve, reject);
        }
    })
}
export function removeDB() {
    return new Promise((resolve,reject)=>{
        db && db.close();
        const request = indexedDB.deleteDatabase(DBname);
        setTimeout(()=>{request;debugger;},500)
        request.onsuccess = () => {
            console.log("删除了数据库",DBname);
            resolve();
        };
        request.onerror = () => {
            console.error("Error deleting database!");
            reject();
        };
    })
}