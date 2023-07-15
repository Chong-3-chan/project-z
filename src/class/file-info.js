
const pool = {};
function FileInfo(packageKey, fileName, type, data) {
    console.log("new FileInfo", arguments)
    if (typeof packageKey == 'string') {
        let newInfo = {
            packageKey: packageKey,
            fileName: fileName,
            type: type,//etc. "image/png" "image/*"
            data: data
        };
        for (let i in newInfo) {
            this[i] = newInfo[i]
        };
        if (!pool[packageKey]) pool[packageKey] = {};
        pool[packageKey][fileName] = this;
    }
    else if (arguments.length == 1 && typeof arguments[0] == 'object') {
        const newInfo = arguments[0];
        for (let i in newInfo) {
            this[i] = newInfo[i]
        };
        if (!pool[newInfo.packageKey]) pool[newInfo.packageKey] = {};
        pool[newInfo.packageKey][newInfo.fileName] = this;
    }
}
FileInfo.prototype.getSrc = function () {
    return this.data;
};
// FileInfo.__proto__.getDataFromPool = function ({ packageKey, fileName }) {
//     try {
//         return pool[packageKey][fileName].getSrc();
//     }
//     catch (err) {
//         return undefined;
//     }
// };
// FileInfo.__proto__.getFilePool = function () {
//     console.log("FileInfo pool1")
//     return pool;
// }
export const FilePool = {
    getDataFromPool: function ({ packageKey, fileName }) {
        try {
            return pool[packageKey][fileName].getSrc();
        }
        catch (err) {
            return undefined;
        }
    },
    getFilePool: function () {
        console.log("FileInfo pool1")
        return pool;
    }
}

export default FileInfo;