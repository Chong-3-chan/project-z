export const operation_list = [], cz_list = [];
export const dataAssign = { file_map: {}, chara_map: {}, package_map: {}, b: {}, s: {}, tips_group: {}, information_map: {}, homeResource_map: {} };
let dataAssign_old;
import _ from "lodash";
import { file_map, chara_map, package_map, s, b, tips_group, objCopy, allData, information_map } from "../data/extra-test-data";
import { DBclear, DBcount, DBput, DBremove, writeAll } from "./IndexedDB-controller";
// const allData = { file_map, chara_map, package_map, b, s, tips_group };
let allData_old;
function deepAssign(sourceObj, ...appendObj) {
    // 存在key且value === undefined 时删除
    let nowAppendObj, re = _.isPlainObject(sourceObj) ? sourceObj : {};
    for (let i = 0; i < appendObj.length; i++) {
        if (!_.isPlainObject(nowAppendObj = appendObj[i])) continue;
        Object.keys(nowAppendObj).forEach((key) => {
            if (_.isPlainObject(nowAppendObj[key])) {
                re[key] = deepAssign(re[key], nowAppendObj[key])
            } else if (nowAppendObj[key] !== undefined) {
                re[key] = nowAppendObj[key];
            }
            else delete re[key];
        })
    }
    return re;
}
function writeWithPath(path, value) {
    let p = dataAssign, effectiveDepth;
    const oldValue = {};
    for (effectiveDepth = 0; effectiveDepth < path.length - 1; effectiveDepth++) {
        if (p[path[effectiveDepth]] === undefined) break;
        else p = p[path[effectiveDepth]];
    }
    oldValue.path = path.slice(0, effectiveDepth);
    oldValue.value = objCopy(p);
    p[path[effectiveDepth]] = {};
    for (let i = effectiveDepth; i < path.length - 1; i++) {
        p = (p[path[i]] ?? (p[path[i]] = {}));
    }
    p[path[path.length - 1]] = value ? value : null;
    return oldValue;
}
console.log(allData, "alldata");
// let lastData;
const operation_map = {
    "write": {
        "check": function ({ path }) {
            return path.length && (Object.keys(dataAssign).indexOf(path[0]) != -1);
        },
        "do_preview": function ({ path, value }) {
            const oldValue = writeWithPath(path, value);
            return ({ key: "write", path, value, oldValue });
        },
        "cancel": function ({ path, value, oldValue }) {
            const { opath, ovalue } = oldValue;
            writeWithPath(opath, ovalue);
            return ({ key: "write", path, value });
        },
        // "do": function ({ }) {

        // },
    }
};
export function dataControl(...arr) {
    console.log(allData, dataAssign, arr);
    arr.forEach(([key, propsObj]) => {
        if (operation_map[key].check(propsObj)) {
            operation_list.push(operation_map[key].do_preview(propsObj));
        }
    })
    return DBput("data", { key: "operation_list", value: operation_list });
}
function cz() {
    if (operation_list.length == 0) throw "不能撤销：操作列表为空";
    let lastOperation = operation_list.pop();
    cz_list.push(operation_map[lastOperation.key].cancel(lastOperation));

    return Promise.allSettled([
        DBput("data", { key: "operation_list", value: operation_list }),
        DBput("data", { key: "cz_list", value: cz_list })
    ])
};
function cy() {
    if (cz_list.length == 0) throw "不能重做：撤销列表为空";
    let lastCz = cz_list.pop();
    operation_list.push(operation_map[lastCz.key].do_preview(lastCz));

    return Promise.allSettled([
        DBput("data", { key: "operation_list", value: operation_list }),
        DBput("data", { key: "cz_list", value: cz_list })
    ])
};
export async function runAll() {
    allData_old = objCopy(allData);
    await DBput("data", { key: 'dataAssign_old', value: dataAssign_old });
    dataAssign_old = objCopy(dataAssign);
    await DBput("data", { key: 'allData_old', value: allData_old });

    await Promise.allSettled(Object.entries(dataAssign.file_map).filter(([k, v]) => (!v) && file_map[k]).map(([k]) => DBremove("file", `${file_map[k].packageKey}/${file_map[k].fileName}`)));
    deepAssign(allData, dataAssign);
    // console.log(allData_old.information_map,allData.information_map,information_map,dataAssign);
    // debugger;
    Object.keys(allData).forEach(e => Object.keys(allData[e]).forEach(ee => { if (allData[e][ee] === null) delete allData[e][ee]; }));
    Object.keys(s).forEach(bookId => Object.keys(s[bookId]).forEach(storyId => { if (s[bookId][storyId] === null) delete s[bookId][storyId]; }))

    dataAssign.file_map = {};
    dataAssign.chara_map = {};
    dataAssign.package_map = {};
    dataAssign.b = {};
    dataAssign.s = {};
    dataAssign.tips_group = {};
    dataAssign.information_map = {};
    dataAssign.homeResource_map = {};

    return writeAll();
};