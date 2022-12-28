// export function objCopy(obj) {
//     if (obj == null) { return null }
//     var result = Array.isArray(obj) ? [] : {};
//     for (let key in obj) {
//         if (obj.hasOwnProperty(key)) {
//             if (typeof obj[key] === 'object') {
//                 result[key] = objCopy(obj[key]);
//             } else {
//                 result[key] = obj[key];
//             }
//         }
//     }
//     return result;
// }
export function objCopy(target) {
    const map = new WeakMap()

    function isObject(target) {
        return (typeof target === 'object' && target) || typeof target === 'function'
    }

    function clone(data) {
        if (!isObject(data)) {
            return data
        }
        if ([Date, RegExp].includes(data.constructor)) {
            return new data.constructor(data)
        }
        if (typeof data === 'function') {
            return new Function('return ' + data.toString())()
        }
        const exist = map.get(data)
        if (exist) {
            return exist
        }
        if (data instanceof Map) {
            const result = new Map()
            map.set(data, result)
            data.forEach((val, key) => {
                if (isObject(val)) {
                    result.set(key, clone(val))
                } else {
                    result.set(key, val)
                }
            })
            return result
        }
        if (data instanceof Set) {
            const result = new Set()
            map.set(data, result)
            data.forEach(val => {
                if (isObject(val)) {
                    result.add(clone(val))
                } else {
                    result.add(val)
                }
            })
            return result
        }
        const keys = Reflect.ownKeys(data)
        const allDesc = Object.getOwnPropertyDescriptors(data)
        const result = Object.create(Object.getPrototypeOf(data), allDesc)
        map.set(data, result)
        keys.forEach(key => {
            const val = data[key]
            if (isObject(val)) {
                result[key] = clone(val)
            } else {
                result[key] = val
            }
        })
        return result
    }

    return clone(target)
}
// export const resource_base_path = "http://projecta-resource.com/extra_test_active/";
// export const resource_base_path = "http://pixiv.miunachan.top/extra_test_active/";
export const resource_base_path = "https://chong-chan.cn/resource/extra_test_active/";
export const DEFAULT_PAGESTATE = {

};
export const packageSampleUsing = false;
export const package_map = !packageSampleUsing ? {} : {
    "HBG": "package/HBG.zip",
    "P35_37": "package/P35_37.zip",
    "CG01_04": "package/CG01_04.zip",
    "C12": "package/C12.zip",
    "C04": "package/C04.zip",
}
export function getPackagePath(key) {
    return resource_base_path + package_map[key];
}

export const file_map = !packageSampleUsing ? {} : {
    _H_BG_0: { packageKey: 'HBG', fileName: 'bg_0.png' },
    _H_BG_1: { packageKey: 'HBG', fileName: 'bg_1.png' },

    _P_OUTDOOR_1: { packageKey: 'P35_37', fileName: 'bg_3721.png' },
    _P_OUTDOOR_2: { packageKey: 'P35_37', fileName: 'bg_3722.png' },
    _P_INDOOR_1: { packageKey: 'P35_37', fileName: 'bg_3571.png' },
    _P_INDOOR_2: { packageKey: 'P35_37', fileName: 'bg_3572.png' },
    _P_INDOOR_3: { packageKey: 'P35_37', fileName: 'bg_3573.png' },
    _P_INDOOR_4: { packageKey: 'P35_37', fileName: 'bg_3574.png' },
    _P_INDOOR_5: { packageKey: 'P35_37', fileName: 'bg_3575.png' },
    _P_INDOOR_6: { packageKey: 'P35_37', fileName: 'bg_3576.png' },
    _P_INDOOR_7: { packageKey: 'P35_37', fileName: 'bg_3577.png' },

    _CG_01_01: { packageKey: 'CG01_04', fileName: 'eve_010601.png' },
    _CG_01_02: { packageKey: 'CG01_04', fileName: 'eve_010602.png' },
    _CG_04_01: { packageKey: 'CG01_04', fileName: 'eve_040201.png' },
    _CG_04_02: { packageKey: 'CG01_04', fileName: 'eve_040202.png' },

    _C_12_01: { packageKey: 'C12', fileName: 'tati_120101.png' },
    _C_12_01Y: { packageKey: 'C12', fileName: 'tati_120101y.png' },
    _C_12_02: { packageKey: 'C12', fileName: 'tati_120102.png' },
    _C_12_02Y: { packageKey: 'C12', fileName: 'tati_120102y.png' },
    _C_12_03: { packageKey: 'C12', fileName: 'tati_120103.png' },
    _C_12_03Y: { packageKey: 'C12', fileName: 'tati_120103y.png' },
    _C_12_04: { packageKey: 'C12', fileName: 'tati_120104.png' },
    _C_12_04Y: { packageKey: 'C12', fileName: 'tati_120104y.png' },
    _C_12_05: { packageKey: 'C12', fileName: 'tati_120105.png' },
    _C_12_05Y: { packageKey: 'C12', fileName: 'tati_120105y.png' },
    _C_12_06: { packageKey: 'C12', fileName: 'tati_120106.png' },
    _C_12_07: { packageKey: 'C12', fileName: 'tati_120107.png' },
    _C_12_07Y: { packageKey: 'C12', fileName: 'tati_120107y.png' },
    _C_12_08: { packageKey: 'C12', fileName: 'tati_120108.png' },
    _C_12_11: { packageKey: 'C12', fileName: 'tati_120111.png' },
    _C_12_11Y: { packageKey: 'C12', fileName: 'tati_120111y.png' },
    _C_12_12: { packageKey: 'C12', fileName: 'tati_120112.png' },
    _C_12_13: { packageKey: 'C12', fileName: 'tati_120113.png' },
    _C_12_13Y: { packageKey: 'C12', fileName: 'tati_120113y.png' },
    _C_12_21: { packageKey: 'C12', fileName: 'tati_120121.png' },
    _C_12_21Y: { packageKey: 'C12', fileName: 'tati_120121y.png' },
    _C_12_22: { packageKey: 'C12', fileName: 'tati_120122.png' },
    _C_12_23: { packageKey: 'C12', fileName: 'tati_120123.png' },
    _C_12_23Y: { packageKey: 'C12', fileName: 'tati_120123y.png' },
    _C_12_24: { packageKey: 'C12', fileName: 'tati_120124.png' },
    _C_12_25: { packageKey: 'C12', fileName: 'tati_120125.png' },
    _C_12_25Y: { packageKey: 'C12', fileName: 'tati_120125y.png' },
    _C_12_26: { packageKey: 'C12', fileName: 'tati_120126.png' },
    _C_12_27: { packageKey: 'C12', fileName: 'tati_120127.png' },
    _C_12_27Y: { packageKey: 'C12', fileName: 'tati_120127y.png' },
    _C_12_28: { packageKey: 'C12', fileName: 'tati_120128.png' },
    _C_12_31: { packageKey: 'C12', fileName: 'tati_120131.png' },
    _C_12_32: { packageKey: 'C12', fileName: 'tati_120132.png' },

    _C_04_02: { packageKey: 'C04', fileName: 'tati_040402.png' },
    _C_04_03: { packageKey: 'C04', fileName: 'tati_040403.png' },
    _C_04_04: { packageKey: 'C04', fileName: 'tati_040404.png' },
    _C_04_05: { packageKey: 'C04', fileName: 'tati_040405.png' },
    _C_04_06: { packageKey: 'C04', fileName: 'tati_040406.png' },
    _C_04_07: { packageKey: 'C04', fileName: 'tati_040407.png' },
    _C_04_12: { packageKey: 'C04', fileName: 'tati_040412.png' },
    _C_04_13: { packageKey: 'C04', fileName: 'tati_040413.png' },
    _C_04_21: { packageKey: 'C04', fileName: 'tati_040421.png' },
    _C_04_22: { packageKey: 'C04', fileName: 'tati_040422.png' },
    _C_04_23: { packageKey: 'C04', fileName: 'tati_040423.png' },
    _C_04_25: { packageKey: 'C04', fileName: 'tati_040425.png' },
    _C_04_27: { packageKey: 'C04', fileName: 'tati_040427.png' },
    _C_04_31: { packageKey: 'C04', fileName: 'tati_040431.png' },
    _C_04_32: { packageKey: 'C04', fileName: 'tati_040432.png' },
    _C_04_33: { packageKey: 'C04', fileName: 'tati_040433.png' },
    _C_04_41: { packageKey: 'C04', fileName: 'tati_040441.png' },
    _C_04_42: { packageKey: 'C04', fileName: 'tati_040442.png' },
    _C_04_43: { packageKey: 'C04', fileName: 'tati_040443.png' },
    _C_04_44: { packageKey: 'C04', fileName: 'tati_040444.png' },
    _C_04_45: { packageKey: 'C04', fileName: 'tati_040445.png' },
    _C_04_50: { packageKey: 'C04', fileName: 'tati_040450.png' },
    _C_04_54: { packageKey: 'C04', fileName: 'tati_040454.png' },
    _C_04_55: { packageKey: 'C04', fileName: 'tati_040455.png' },
    _C_04_56: { packageKey: 'C04', fileName: 'tati_040456.png' },
}
// export const file_map = {
//     _H_BG_0: 'home/bg_0.png',
//     _H_BG_1: 'home/bg_1.png',

//     _P_OUTDOOR_1: 'place/bg_3721.png',
//     _P_OUTDOOR_2: 'place/bg_3722.png',

//     _P_INDOOR_1: 'place/bg_3571.png',
//     _P_INDOOR_2: 'place/bg_3572.png',
//     _P_INDOOR_3: 'place/bg_3573.png',
//     _P_INDOOR_4: 'place/bg_3574.png',
//     _P_INDOOR_5: 'place/bg_3575.png',
//     _P_INDOOR_6: 'place/bg_3576.png',
//     _P_INDOOR_7: 'place/bg_3577.png',

//     _CG_01_01: 'cg/eve_010601.png',
//     _CG_01_02: 'cg/eve_010602.png',
//     _CG_04_01: 'cg/eve_040201.png',
//     _CG_04_02: 'cg/eve_040202.png',

//     _C_12_01: 'chara/tati_120101.png',
//     _C_12_01Y: 'chara/tati_120101y.png',
//     _C_12_02: 'chara/tati_120102.png',
//     _C_12_02Y: 'chara/tati_120102y.png',
//     _C_12_03: 'chara/tati_120103.png',
//     _C_12_03Y: 'chara/tati_120103y.png',
//     _C_12_04: 'chara/tati_120104.png',
//     _C_12_04Y: 'chara/tati_120104y.png',
//     _C_12_05: 'chara/tati_120105.png',
//     _C_12_05Y: 'chara/tati_120105y.png',
//     _C_12_06: 'chara/tati_120106.png',
//     _C_12_07: 'chara/tati_120107.png',
//     _C_12_07Y: 'chara/tati_120107y.png',
//     _C_12_08: 'chara/tati_120108.png',
//     _C_12_11: 'chara/tati_120111.png',
//     _C_12_11Y: 'chara/tati_120111y.png',
//     _C_12_12: 'chara/tati_120112.png',
//     _C_12_13: 'chara/tati_120113.png',
//     _C_12_13Y: 'chara/tati_120113y.png',
//     _C_12_21: 'chara/tati_120121.png',
//     _C_12_21Y: 'chara/tati_120121y.png',
//     _C_12_22: 'chara/tati_120122.png',
//     _C_12_23: 'chara/tati_120123.png',
//     _C_12_23Y: 'chara/tati_120123y.png',
//     _C_12_24: 'chara/tati_120124.png',
//     _C_12_25: 'chara/tati_120125.png',
//     _C_12_25Y: 'chara/tati_120125y.png',
//     _C_12_26: 'chara/tati_120126.png',
//     _C_12_27: 'chara/tati_120127.png',
//     _C_12_27Y: 'chara/tati_120127y.png',
//     _C_12_28: 'chara/tati_120128.png',
//     _C_12_31: 'chara/tati_120131.png',
//     _C_12_32: 'chara/tati_120132.png',

//     _C_04_02: 'chara/tati_040402.png',
//     _C_04_03: 'chara/tati_040403.png',
//     _C_04_04: 'chara/tati_040404.png',
//     _C_04_05: 'chara/tati_040405.png',
//     _C_04_06: 'chara/tati_040406.png',
//     _C_04_07: 'chara/tati_040407.png',
//     _C_04_12: 'chara/tati_040412.png',
//     _C_04_13: 'chara/tati_040413.png',
//     _C_04_21: 'chara/tati_040421.png',
//     _C_04_22: 'chara/tati_040422.png',
//     _C_04_23: 'chara/tati_040423.png',
//     _C_04_25: 'chara/tati_040425.png',
//     _C_04_27: 'chara/tati_040427.png',
//     _C_04_31: 'chara/tati_040431.png',
//     _C_04_32: 'chara/tati_040432.png',
//     _C_04_33: 'chara/tati_040433.png',
//     _C_04_41: 'chara/tati_040441.png',
//     _C_04_42: 'chara/tati_040442.png',
//     _C_04_43: 'chara/tati_040443.png',
//     _C_04_44: 'chara/tati_040444.png',
//     _C_04_45: 'chara/tati_040445.png',
//     _C_04_50: 'chara/tati_040450.png',
//     _C_04_54: 'chara/tati_040454.png',
//     _C_04_55: 'chara/tati_040455.png',
//     _C_04_56: 'chara/tati_040456.png',
// }
export const chara_map = !packageSampleUsing ? {} : {
    "00": {
        id: "00",
        name: "康姆",
        pic: {}
    },
    "12": {
        id: "12",
        name: "梅尔斯",
        pic: {
            '01': '_C_12_01',
            '01Y': '_C_12_01Y',
            '02': '_C_12_02',
            '02Y': '_C_12_02Y',
            '03': '_C_12_03',
            '03Y': '_C_12_03Y',
            '04': '_C_12_04',
            '04Y': '_C_12_04Y',
            '05': '_C_12_05',
            '05Y': '_C_12_05Y',
            '06': '_C_12_06',
            '07': '_C_12_07',
            '07Y': '_C_12_07Y',
            '08': '_C_12_08',
            '11': '_C_12_11',
            '11Y': '_C_12_11Y',
            '12': '_C_12_12',
            '13': '_C_12_13',
            '13Y': '_C_12_13Y',
            '21': '_C_12_21',
            '21Y': '_C_12_21Y',
            '22': '_C_12_22',
            '23': '_C_12_23',
            '23Y': '_C_12_23Y',
            '24': '_C_12_24',
            '25': '_C_12_25',
            '25Y': '_C_12_25Y',
            '26': '_C_12_26',
            '27': '_C_12_27',
            '27Y': '_C_12_27Y',
            '28': '_C_12_28',
            '31': '_C_12_31',
            '32': '_C_12_32',
        }
    },
    "04": {
        id: "04",
        name: "莉西娅",
        pic: {
            '02': '_C_04_02',
            '03': '_C_04_03',
            '04': '_C_04_04',
            '05': '_C_04_05',
            '06': '_C_04_06',
            '07': '_C_04_07',
            '12': '_C_04_12',
            '13': '_C_04_13',
            '21': '_C_04_21',
            '22': '_C_04_22',
            '23': '_C_04_23',
            '25': '_C_04_25',
            '27': '_C_04_27',
            '31': '_C_04_31',
            '32': '_C_04_32',
            '33': '_C_04_33',
            '41': '_C_04_41',
            '42': '_C_04_42',
            '43': '_C_04_43',
            '44': '_C_04_44',
            '45': '_C_04_45',
            '50': '_C_04_50',
            '54': '_C_04_54',
            '55': '_C_04_55',
            '56': '_C_04_56'
        }
    }
}

function getCharaNameById(id) {
    return chara_map[id].name;
}
export const preload_group = {
    _H: { name: "首页资源", data: ['_H_BG_0', '_H_BG_1'] },
    _P_INDOOR: { name: "INDOOR场景", data: ['_P_INDOOR_1', '_P_INDOOR_2', '_P_INDOOR_3', '_P_INDOOR_4', '_P_INDOOR_5', '_P_INDOOR_6', '_P_INDOOR_7'] },
    _P_OUTDOOR: { name: "OUTDOOR场景", data: ['_P_OUTDOOR_1', '_P_OUTDOOR_2'] },
    _CG_01: { name: "01CG", data: ['_CG_01_01', '_CG_01_02'] },
    _CG_04: { name: "04CG", data: ['_CG_04_01', '_CG_04_02'] },
    _C_04: { name: "04人物立绘", data: ['_C_04_02', '_C_04_03', '_C_04_04', '_C_04_05', '_C_04_06', '_C_04_07', '_C_04_12', '_C_04_13', '_C_04_21', '_C_04_22', '_C_04_23', '_C_04_25', '_C_04_27', '_C_04_31', '_C_04_32', '_C_04_33', '_C_04_41', '_C_04_42', '_C_04_43', '_C_04_44', '_C_04_45', '_C_04_50', '_C_04_54', '_C_04_55', '_C_04_56'] },
    _C_12: { name: "12人物立绘", data: ['_C_12_01', '_C_12_01Y', '_C_12_02', '_C_12_02Y', '_C_12_03', '_C_12_03Y', '_C_12_04', '_C_12_04Y', '_C_12_05', '_C_12_05Y', '_C_12_06', '_C_12_07', '_C_12_07Y', '_C_12_08', '_C_12_11', '_C_12_11Y', '_C_12_12', '_C_12_13', '_C_12_13Y', '_C_12_21', '_C_12_21Y', '_C_12_22', '_C_12_23', '_C_12_23Y', '_C_12_24', '_C_12_25', '_C_12_25Y', '_C_12_26', '_C_12_27', '_C_12_27Y', '_C_12_28', '_C_12_31', '_C_12_32'] }
}, PL_G = preload_group;
import FileInfo from "../class/file-info";
import PackageInfo from "../class/package-info";
export function getFileSrc(file_map_KEY) {
    // if (file_map_KEY in file_map) return resource_base_path + file_map[file_map_KEY];
    console.log('pool', FileInfo.getFilePool());
    if (file_map_KEY in file_map) return FileInfo.getDataFromPool(file_map[file_map_KEY]);
    return "";
}
export function getCharaPicSrc(charaName, style) {
    return getFileSrc(chara_map[charaName].pic[style.toString()]);
}
function createPreloadList(...keys) {
    return keys.map(key => preload_group[key]);
}

export const tips_group = {
    "home": [
        {
            title: "这是什么？",
            text: "这是测试！"
        },
        {
            title: "测试什么？",
            text: "测试「这」噢！"
        }
    ],
    "mes": [
        {
            title: "梅尔斯的手艺",
            text: "哇~~敲好吃的！"
        },
        {
            title: "梅尔斯的年龄",
            text: "也许...可以当你的妈妈了？（？）"
        }
    ],
    "lxy": [
        {
            title: "莉西娅有几套被子？",
            text: "好多好多！能晒满一整个城堡的阳台。"
        },
        {
            title: "莉西娅的私服",
            text: "是她自己做的哦。"
        }
    ]
};
// const SENTENCE = {
//     // 0_0
//     ...{
//         "0000001": {
//             id: "0000001",
//             charaName: '?',
//             text: '「Hello world」',
//             place: null,
//             CG: null,
//             CG_transform: null,
//             sound: null,
//             charas_change: false,
//             charas: {
//                 // "a_test": {
//                 //     //chara-state
//                 //     style: "1",
//                 //     position: "a_1",
//                 //     out: null,
//                 //     in: "default",
//                 //     move: null,
//                 // }
//             },
//         },
//         "0000002": {
//             id: "0000002",
//             // charaName: undefined,
//             text: '睁开了眼。',
//             place: '_P_INDOOR_5',
//             CG: null,
//             CG_transform: null,
//             sound: null,
//             charas_change: false,
//             charas: {
//             },
//         },
//         "0000003": {
//             id: "0000003",
//             // charaName: '',
//             text: '闭上了眼。',
//             place: null,
//             CG: null,
//             CG_transform: null,
//             sound: null,
//             charas_change: false,
//             charas: {
//             },
//         },
//     },

//     // 1_0
//     ...{
//         "0010001": { "text": "还未睁开双眼，已经闻到一股食物的香气。" },
//         "0010002": { "text": "...哎呀，好像睡过了。", "place": "_P_INDOOR_6" },
//         "0010003": { "text": "转过头来看，发现梅尔斯正在做早餐。", "place": "_P_INDOOR_6" },
//         "0010004": {
//             "charaName": "梅尔斯", "text": "...", "place": "_P_INDOOR_6",
//             charas_change: true,
//             charas: { "12": { "style": "22", "position": "a_1", "in": "default" } }
//         },
//         "0010005": {
//             "charaName": "梅尔斯", "text": "嗯哼，醒了吗？", "place": "_P_INDOOR_6",
//             charas_change: true,
//             charas: {
//                 "12": {
//                     "style": "08", "position": "a_1",
//                     "change": "default",
//                 }
//             }
//         },
//         "0010006": {
//             "charaName": "康姆", "text": "啊啊。", "place": "_P_INDOOR_6",
//             charas_change: false,
//             charas: { "12": { "style": "08", "position": "a_1" } }
//         },
//         "0010007": {
//             "charaName": "梅尔斯", "text": "早餐也马上准备好了哟。", "place": "_P_INDOOR_6",
//             charas_change: true,
//             charas: {
//                 "12": {
//                     "style": "13", "position": "a_1",
//                     "change": "default"
//                 }
//             }
//         },
//         "0010008": {
//             "charaName": "莉西娅", "text": "康姆先生，你醒了！", "place": "_P_INDOOR_6",
//             charas_change: true,
//             charas: {
//                 "12": { "style": "13", "position": "a_1" },
//                 "04": { "style": "12", "position": "a_3", "in": "default" }
//             }
//         },
//         "0010009": {
//             "text": "省略",
//             charas_change: true,
//             charas: {
//                 "12": { "style": "13", "position": "a_1" },
//                 "04": { "style": "12", "position": "a_3" }
//             }
//         },
//         "0010010": {
//             "text": "下一步要干嘛？", options: [
//                 {
//                     text: "和梅尔斯一起出去走走",
//                     to: "1_2",
//                     jump: "0020001",
//                 },
//                 {
//                     text: "和莉西娅一起出去走走",
//                     to: "1_3",
//                     jump: "0030001",
//                 },
//                 {
//                     text: "宅宅",
//                     to: "1_1",
//                     jump: "0040001",
//                 },
//             ]
//             , "place": "_P_INDOOR_6",
//             charas_change: true,
//             charas: {
//                 "12": {
//                     "style": "01", "position": "a_1",
//                     "change": "default"
//                 },
//                 "04": {
//                     "style": "02", "position": "a_3",
//                     "change": "default"
//                 }
//             }
//         },

//         "0020001": {
//             "charaName": "康姆", "text": "梅尔斯，一起出去走走？", "place": "_P_INDOOR_6",
//             charas_change: false,
//             charas: {
//                 "12": {
//                     "style": "01", "position": "a_1",
//                 },
//                 "04": {
//                     "style": "02", "position": "a_3",
//                 }
//             }
//         },
//         "0020002": {
//             "charaName": "梅尔斯", "text": "好。", "place": "_P_INDOOR_6",
//             charas_change: true,
//             charas: {
//                 "12": {
//                     "style": "13", "position": "a_2",
//                     "out": "default", "in": "default", "move": "default"
//                 },
//                 "04": {
//                     "style": "02", "position": "a_3",
//                 }
//             }
//         },

//         "0030001": {
//             "charaName": "康姆", "text": "莉西娅，一起出去走走吧。", "place": "_P_INDOOR_6",
//             charas_change: false,
//             charas: {
//                 "12": {
//                     "style": "01", "position": "a_1",
//                 },
//                 "04": {
//                     "style": "02", "position": "a_3",
//                 }
//             }
//         },
//         "0030002": {
//             "charaName": "莉西娅", "text": "好呀！", "place": "_P_INDOOR_6",
//             charas_change: true,
//             charas: {
//                 "12": {
//                     "style": "01", "position": "a_1",
//                 },
//                 "04": {
//                     "style": "32", "position": "a_2",
//                     "out": "default", "in": "default", "move": "default"
//                 }
//             }
//         },

//         "0040001": {
//             "text": "今天就当阿宅吧。", "place": "_P_INDOOR_6"
//         },
//     },
// }

// const STORY = {
//     "0_0": {
//         id: "0_0",
//         title: "序章-0",
//         start: "0000001",
//         end: ["0000003"],
//         preload: createPreloadList('_P_INDOOR'),
//         tips: [tips_group.home],
//         to: {
//             default: "1_0", able: ["1_0"]
//         },
//         data: {
//             // Sentence...
//             "0000001": SENTENCE["0000001"],
//             "0000002": SENTENCE["0000002"],
//             "0000003": SENTENCE["0000003"]
//         }
//     },
//     "1_0": {
//         id: "1_0",
//         title: "测试故事-0",
//         start: "0010001",
//         end: ["0020002", "0030002", "0040001"],
//         preload: createPreloadList('_P_OUTDOOR', '_C_04', '_C_12'),
//         style: "style-04",
//         tips: [tips_group.home],
//         to: {
//             default: "1_1", able: ["1_1", "1_2", "1_3"]
//         },
//         data: {
//             // Sentence...
//             "0010001": SENTENCE["0010001"],
//             "0010002": SENTENCE["0010002"],
//             "0010003": SENTENCE["0010003"],
//             "0010004": SENTENCE["0010004"],
//             "0010005": SENTENCE["0010005"],
//             "0010006": SENTENCE["0010006"],
//             "0010007": SENTENCE["0010007"],
//             "0010008": SENTENCE["0010008"],
//             "0010009": SENTENCE["0010009"],
//             "0010010": SENTENCE["0010010"],
//             "0020001": SENTENCE["0020001"],
//             "0020002": SENTENCE["0020002"],
//             "0030001": SENTENCE["0030001"],
//             "0030002": SENTENCE["0030002"],
//             "0040001": SENTENCE["0040001"]
//         }
//     },
// }
export const bookIds = !packageSampleUsing ? [] : ["sample"]
export const b = !packageSampleUsing ? {} : {
    "sample": (`=BOOK:sample
>data_key=0_0,1_0,1_1,1_2,1_3
>start=0_0
>end=[1_1,在1_1结束],[1_2,在1_2结束],[1_3,在1_3结束]
>default_style=style-00`)
};
export const s = !packageSampleUsing ? {} : {
    "sample": [
        `=STORY:0_0
>title=0_0的标题
>to=1_0
>end=0
>tips=home
~0:
@?##「Hello world」
@##睁开了眼。##setPlace[_P_INDOOR_4]
@##闭上了眼。##setPlace[null]
~0 end`,
        `=STORY:1_0
>title=1_0的标题标题标题
>to=1_1
>end=1,2,3
~0:
@##还未睁开双眼，已经闻到一股食物的香气。
@##...哎呀，好像睡过了。##setPlace[_P_INDOOR_6]
@##转过头来看，发现梅尔斯正在做早餐。
@12##...##chara[12,22,a_1]##chara[04,12,a_3]
@12##嗯哼，醒了吗？##chara[12,08,a_1]
@00##啊啊。
@12##康姆居然也有睡过点的时候，真是少见。##chara[12,13,a_1]
@04##康姆先生，你醒了！##chara[04,12,a_3]
@##省略##charaOut[default,12,04]
@##下一步要干嘛？##choice[[和梅尔斯一起出去走走,1,1_1],[和莉西娅一起出去走走,2,1_2],[宅宅,3,1_3]]
~0 end
~1:
@00##梅尔斯，一起出去走走？
@12##好。##chara[12,01,a_2]##charaMove[default,12]
~1 end
~2:
@00##莉西娅，一起出去走走吧。
@04##好呀！##chara[04,32,a_2]##charaMove[default,04]
~2 end
~3:
@##今天就当阿宅吧。
~3 end`,
        `=STORY:1_1
>end=0
>style=style-12
~0:
@##街上。##setPlace[_P_OUTDOOR_1]
@12##省略。##chara[12,21,a_2]
@##省略.##charaOut[default,12]
@00##省略。##CG[_CG_01_01]
@00##省略。##CG[_CG_01_02]
@##省略。##CGOut[]##setPlace[_P_OUTDOOR_2]
@##省略。##setPlace[_P_INDOOR_2]
@##省略。##setPlace[_P_INDOOR_3]
~0 end`,
        `=STORY:1_2
>end=0
>style=style-04
~0:
@##街上。##setPlace[_P_OUTDOOR_1]
@04##省略。##chara[04,42,a_2]
@##省略.##charaOut[default,04]
@00##省略。##CG[_CG_04_01]
@00##省略。##CG[_CG_04_02]
@##省略。##CGOut[]##setPlace[_P_OUTDOOR_2]
@##省略。##setPlace[_P_INDOOR_2]
@##省略。##setPlace[_P_INDOOR_3]
~0 end`,
        `=STORY:1_3
>end=0
~0:
@##省略##setPlace[_P_INDOOR_4]
~0 end`,
    ]
};
// const s_ = s.map(e => e.split('\n'))

function String_id(str) {
    this.length = str.length;
    this.num = parseInt(str);
    this.str = str;
}
String_id.prototype = {
    toString: function () { return this.str },
    increase: function () {
        console.log("increase", objCopy(this));
        this.str = (++this.num).toString().padStart(this.length, "0")
    },
    toZero: function () { this.str = (this.num = 0).toString().padStart(this.length, "0") }
}

function getBook() {
    const STORY = {}, SENTENCE = {};
    const nextSentenceId = { pid: new String_id("000"), sid: new String_id("0000") };
    console.log("getBook!", objCopy(nextSentenceId));
    let sentenceCount = 0;
    const dataLineType = { '=': "name", '>': "setAttr", '@': "sentence", '~': "paragraph" }
    const attrSetters = {
        "BOOK": {
            "data_key": function (keys) {
                for (let i = 0; i < keys.length; i++) {
                    this.data[keys[i]] = STORY[keys[i]];
                }
            },
            "start": function (arr) {
                this["start"] = arr[0];
            },
            "end": function (arrs) {
                for (let i = 0; i < arrs.length; i++) {
                    this.end[arrs[i][0]] = arrs[i][1];
                }
            },
            "default_style": function (arr) {
                this["default_style"] = arr[0];
            },
        },

        "STORY": {
            "end": function (arr) {
                this["end"] = arr;
            },
            "title": function (arr) {
                this["title"] = arr[0];
            },
            "to": function (arr) {
                this["to"].default = arr[0];
                this["to"].able.add(arr[0]);
            },
            // "to_able": function (arr) {
            //     this["to"].able = arr;
            // },
            "style": function (arr) {
                this["style"] = arr[0];
            },
            "tips": function (arr) {
                // this["tips"] = arr.map(e => tips_group[e]);
                this["tips"] = arr;
            }
        },
    }
    const END_OF_ARR = Symbol("END_OF_ARR");
    function argsStr_to_arr(argsStr) {
        const arr = [];
        let i = 0;
        // console.log(argsStr);
        function getNextArg() {
            if (argsStr[i] == ',') i++;
            if (argsStr.length <= i) return END_OF_ARR;
            if (argsStr[i] == '[') {
                i++;
                const nextArg_arr = [];
                let newArg;
                while ((newArg = getNextArg()) != END_OF_ARR) nextArg_arr.push(newArg);
                return nextArg_arr;
            }
            else if (argsStr[i] == ']') {
                i++;
                return END_OF_ARR;
            }
            else {
                let nextArg_str = "";
                while (argsStr.length > i) {
                    if (argsStr[i] == ',') {
                        i++;
                        return nextArg_str;
                    }
                    if (argsStr[i] == ']') {
                        return nextArg_str;
                    }
                    else nextArg_str += argsStr[i++];
                }
                return nextArg_str;
            }
        }
        let newArg;
        while ((newArg = getNextArg()) != END_OF_ARR) arr.push(newArg);
        return arr;
    }
    function setAttr(type, key, argsStr) {
        const args = argsStr_to_arr(argsStr);
        // console.log(key)
        attrSetters[type][key].call(this, args)
        return args;
    }
    const getNextSentenceId = () => (nextSentenceId.pid + nextSentenceId.sid);
    const toNextParagraph = () => { nextSentenceId.sid.toZero(); return nextSentenceId.pid.increase(); }
    function getJumpSetter() {
        let optionList = [];
        let paragraph;
        return [() => {
            for (let i = 0; i < optionList.length; i++) {
                optionList[i].jump && paragraph[optionList[i].jump] && (optionList[i].jump = paragraph[optionList[i].jump].start);
            }
            optionList = [];
        }, (e) => optionList.push(e), (para) => paragraph = para]
    }
    const [doSetJump, addJump, paragraphBind] = getJumpSetter();
    const [addPreload, preloadBind] = (function () {
        let nowPreload;
        return [(key, e) => nowPreload[key].add(e),
        (pl) => nowPreload = pl]
    })();
    const sentenceAction = {
        // id: "0000002",
        //     // charaName: undefined,
        //     text: '睁开了眼。',
        //     place: '_P_INDOOR_5',
        //     CG: null,
        //     CG_transform: null,
        //     sound: null,
        //     charas_change: false,
        //     charas: {"12": {
        //     "style": "01", "position": "a_1",
        // },
        // "04": {
        //     "style": "32", "position": "a_2",
        //     "out": "default", "in": "default", "move": "default"
        // }},
        stateMemory: {
            place: null,
            CG: null,
            CG_transform: null,
            charas_change: false,
            charas: {}
        },
        tempMemories: {},
        cleanMemory: function () {
            sentenceAction.stateMemory = {
                place: null,
                CG: null,
                CG_transform: null,
                charas_change: false,
                charas: {}
            };
            sentenceAction.tempMemories = {};
        },
        saveMemory: function (pid) {
            sentenceAction.tempMemories[pid] = sentenceAction.stateMemory;
        },
        loadMemory: function (pid) {
            console.log('load', sentenceAction.tempMemories[pid])
            sentenceAction.tempMemories[pid] ? (sentenceAction.stateMemory = objCopy(sentenceAction.tempMemories[pid])) : (() => { throw ("load fail") })();
        },
        getMemory: function () {
            console.log('get', objCopy(sentenceAction.stateMemory))
            return objCopy(sentenceAction.stateMemory);
        },
        "setPlace": function (arr) {
            this.place = sentenceAction.stateMemory.place = (arr[0] != "null" ? arr[0] : null);
            this.place && addPreload("place", this.place)
        },
        "charaOut": function (arr) {
            this.charas_change = true;
            const [outStyle, ...charaIdList] = arr;
            charaIdList.forEach((e) => {
                const memory = sentenceAction.stateMemory, basePart = memory.charas[e], actionPart = {};
                actionPart.out = outStyle;
                this.charas[e] = { ...this.charas[e], ...(basePart), ...actionPart };
                delete memory.charas[e];
            })

        },
        "chara": function (arr) {
            this.charas_change = true;
            const basePart = { "style": arr[1], "position": arr[2] }, actionPart = {}, memory = sentenceAction.stateMemory;
            // debugger;
            chara_map[arr[0]]?.pic[arr[1]] && addPreload("chara_pic", chara_map[arr[0]]?.pic[arr[1]])
            if (memory.charas[arr[0]]) {
                if (memory.charas[arr[0]]["position"] == basePart["position"])
                    actionPart.change = arr[3] ?? "default";
                else actionPart.in = "default", actionPart.out = "default";
            }
            else {
                actionPart.in = arr[3] ?? "default";
            }
            this.charas[arr[0]] = { ...this.charas[arr[0]], ...(memory.charas[arr[0]] = basePart), ...actionPart };
        },
        "charaMove": function (arr) {
            this.charas_change = true;
            const [moveStyle, ...charaIdList] = arr;
            charaIdList.forEach((e) => {
                const memory = sentenceAction.stateMemory, basePart = memory.charas[e], actionPart = {};
                actionPart.move = moveStyle;
                this.charas[e] = { ...this.charas[e], ...(basePart), ...actionPart };
            })
        },
        "choice": function (arr, para, pid, nowStory) {
            this.options = arr.map(e => {
                let newOption = {
                    text: e[0],
                    jump: e[1],
                    to: e[2],
                };
                nowStory.to.able.add(e[2]);
                addJump(newOption);
                para[e[1]] = { from: pid };
                return newOption;
            });
            console.log(this.options)
        },
        "CG": function (arr) {
            this.CG = sentenceAction.stateMemory.CG = arr[0];
            this.CG && addPreload("CG", this.CG)
            arr[1] && (this.CG_transform = sentenceAction.stateMemory.CG_transform = arr[1]);
        },
        "CGOut": function (arr) {
            this.CG = sentenceAction.stateMemory.CG = null;
        },
    }
    function Story(id,line) {
        const readId = line[0].slice(line[0].indexOf(':') + 1)
        if(id!=readId){
            throw `Story:ID 验证有误！ 传入：${id} 读取：${readId}`
        }
        const newStory = {
            id: id,
            title: id,
            start: null,
            end: [],
            preload: { chara_pic: new Set(), CG: new Set(), place: new Set() },
            tips: ["home"],
            to: {
                default: null, able: new Set()
            },
            data: {}
        }
        preloadBind(newStory.preload);
        const paragraphIdList = [];
        const paragraph = {};
        paragraphBind(paragraph);
        let nowParagraphId = null;
        for (let i = 1; i < line.length; i++) {
            if (line[i].length == 0) continue;
            let nowLine = line[i].slice(1), lineFlag = line[i].charAt(0);
            switch (lineFlag) {
                case '@':
                    let newSentence = sentenceAction.getMemory();
                    let [charaName, text, ...actions] = nowLine.split("##");
                    newSentence.charaName = (Object.keys(chara_map).indexOf(charaName) != -1 ? charaName = chara_map[charaName].name : charaName)
                    newSentence.text = (text)
                    // console.log(actions)
                    for (let j in actions) {
                        const firstNotNull = actions[j].search(/\S/), argsStart = actions[j].indexOf('['), argsEnd = actions[j].lastIndexOf(']');
                        const actionName = actions[j].slice(firstNotNull, argsStart);
                        // console.log(actionName,actions[j].search(/\S/),actions[j].indexOf('['))
                        //...
                        if (sentenceAction[actionName]) {
                            const argsStr = actions[j].slice(argsStart + 1, argsEnd);
                            console.log("args:", argsStr_to_arr(argsStr));
                            // argsStr_to_arr()
                            sentenceAction[actionName].call(newSentence, argsStr_to_arr(argsStr), paragraph, nowParagraphId, newStory);
                        }
                    }
                    console.log({newSentence})
                    paragraph[nowParagraphId].data.push(newSentence);
                    break;
                case '>':
                    let ep = nowLine.indexOf('=');
                    // console.log(newStory, [nowLine.slice(0, ep), nowLine.slice(ep + 1)])
                    setAttr.apply(newStory, ["STORY", nowLine.slice(0, ep), nowLine.slice(ep + 1)]);
                    break;
                case '~':
                    if (nowParagraphId && nowLine.split(new RegExp(`${nowParagraphId}[ ]+end`)).length != 1) {
                        sentenceAction.saveMemory(nowParagraphId);
                        nowParagraphId = null;
                    }
                    else if (nowLine.lastIndexOf(':') != -1) {
                        const newParagraphId = nowLine.slice(0, nowLine.lastIndexOf(':'));
                        paragraphIdList.push(newParagraphId);
                        paragraph[newParagraphId]?.from && sentenceAction.loadMemory(paragraph[newParagraphId].from);
                        paragraph[nowParagraphId = newParagraphId] = { id: nowParagraphId, data: [], ...paragraph[newParagraphId] };
                    }
                    else throw (nowLine);
                    break;
                case '=':
                    break;
                default:
                    break;
            }
        }
        console.log(paragraph, paragraphIdList, "paragraphIdList");
        for (let pid = 0; pid < paragraphIdList.length; pid++) {
            const p = paragraphIdList[pid];
            paragraph[p].start = getNextSentenceId();
            for (let i = 0; i < paragraph[p].data.length; i++) {
                const _nextSentenceId = getNextSentenceId();
                newStory.data[_nextSentenceId] = SENTENCE[_nextSentenceId] = { id: _nextSentenceId, ...paragraph[p].data[i] };
                sentenceCount++;
                paragraph[p].data[i + 1] && nextSentenceId.sid.increase();
            }
            paragraph[p].end = getNextSentenceId();
            toNextParagraph();
        }
        doSetJump();
        newStory.start = paragraph[paragraphIdList[0]].start;
        newStory.end.forEach((e, i, arr) => {
            arr[i] = paragraph[e].end;
        })
        newStory.to.able = Array.from(newStory.to.able);
        newStory.preload = ((e) => {
            let newPreload = [];
            for (let name in e) {
                e[name].size &&
                    newPreload.push({
                        name: name,
                        data: Array.from(e[name])
                    })
            }
            return newPreload;
        })(newStory.preload);
        // debugger;
        return STORY[newStory.id] = newStory;
        // return newStory;
    }
    function Book(line) {
        const newBook = {
            start: null,
            name: line[0].slice(line[0].indexOf(':') + 1),
            end: {},
            default_style: null,
            data: {}
        };
        for (let i = 1; i < line.length; i++) {
            switch (line[i].charAt(0)) {
                case '>':
                    let ep = line[i].indexOf('=');
                    // console.log(newBook, [line[i].slice(1, ep), line[i].slice(ep + 1)])
                    setAttr.apply(newBook, ["BOOK", line[i].slice(1, ep), line[i].slice(ep + 1)]);
                    break;
                case '=':
                    // let [type,name] = line[i].slice(1).split(':');
                    // if(type=="BOOK")
                    break;
                default:
                    break;
            }
        }
        return newBook;
    }
    return function _Book(book_line, story_line) {
        // console.log("Book Output");
        Object.entries(story_line).map(([storyId,storyTextData]) => [storyId,storyTextData.split('\n')]).forEach(([storyId,story_line]) => Story(storyId,story_line,));
        return { Book: Book(book_line.split('\n')), STORY, SENTENCE }
    }
};
const textToBOOK = getBook();
// console.log(te(b, s_));
// export const writeBOOK = () => ();
export let writeRe = {};
export const write = (bookName) => {
    const re = textToBOOK(b[bookName], s[bookName]);
    return (writeRe[bookName] = {
        BOOK: re.Book,
        STORY: { data: re.STORY },
        SENTENCE: { data: re.SENTENCE }
    })
}
if (packageSampleUsing) write("sample");
export const BOOK = !packageSampleUsing ? {} : { "sample": writeRe.sample.BOOK };
export const STORY = !packageSampleUsing ? {} : { "sample": writeRe.sample.STORY };
// export const BOOK = {
//     data: {
//         Book1: {
//             start: "0_0",
//             name: "Book1",
//             end: {
//                 "1-2": "在1-2结束",
//                 "1-3": "在1-3结束"
//             },
//             default_style: "style-00",
//             data: {
//                 "0_0": STORY['0_0'],
//                 "1_0": STORY['1_0'],
//                 "1_1": STORY['1_1'],
//                 "1_2": STORY['1_2'],
//                 "1_3": STORY['1_3'],
//             }
//         }
//     }
// }
// console.log(BOOK,{data:{Book1:te(b, s_).Book}})

// console.log(
//     // Book(b),
//     STORY["1_0"],
//     Story(s),
//     // BOOK
// )

export const activePage_map = {
    home: {
        name: "home",
        preload: createPreloadList('_H'),
        ch: "首页",
        tips: ["home"]
    },
    main: {
        name: "main",
        preload: [],
        ch: "主页面",
        tips: []
    }
};

