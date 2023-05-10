let db, openDB_callbackList = [];
const DBname = "game0";
export function openDB(arr) {
    let re = indexedDB.open(DBname);
    function openDB_callback() { openDB_callbackList.forEach(e => e()); openDB_callbackList = []; };
    re.onupgradeneeded = function (event) {
        console.log("upgradeneeded");
        let db = event.target.result;
        arr.forEach(([base, key, unique]) => {
            if (!db.objectStoreNames.contains(base)) {
                let objectStore = db.createObjectStore(base, { keyPath: key });
                objectStore.createIndex(key, key, { unique: unique });
            }
            else {
                console.log("已经创建过", [base, key, unique])
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
openDB([
    ["package", "resourcePath", true],
    ["save", "id", true],
    ["global","key",true]
]);
export function DBput(base, line) {
    if (!db) openDB_callbackList.push(() => DBput(line));
    else {
        let request = db.transaction([base], 'readwrite')
            .objectStore(base)
            .put(line);
        request.onsuccess = function (event) {
            console.log('数据写入成功', line);
        };
        request.onerror = function (event) {
            console.log('数据写入失败');
        }
    }
}
export function DBget(base, key) {
    function get(resolve, reject) {
        let request = db.transaction([base])
            .objectStore(base)
            .get(key);
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

export function removeDB() {
    return new Promise((resolve,reject)=>{
        db && db.close();
        const request = indexedDB.deleteDatabase(DBname);
        // debugger;
        // setTimeout(()=>{request;debugger;},500)
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

export function DBgetAll(base) {
    function getAll(resolve, reject) {
        let request = db.transaction([base])
            .objectStore(base)
            .getAll();
        request.onerror = function (event) {
            console.log('数据读取失败');
            reject(event);
        };
        request.onsuccess = function (event) {
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
            openDB_callbackList.push(() => getAll(resolve, reject));
        else {
            getAll(resolve, reject);
        }
    })
}
