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
            return data;
            // return new Function('return ' + data.toString())()
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
export function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function (e) {
            resolve(e.target.result);
        };
        reader.readAsDataURL(file);
    })
}
export function debounce(fn, wait) {
    let timer = null;
    return function () {
        if (timer !== null) {
            clearTimeout(timer);
        }
        timer = setTimeout(fn, wait);
    }
}
export function co(oldobj, newobj) {
    for (let i in oldobj) delete oldobj[i];
    for (let i in newobj) oldobj[i] = newobj[i];
}
export const argsStr_to_arr = (function () {
    const END_OF_ARR = Symbol("END_OF_ARR");
    return function argsStr_to_arr(argsStr) {
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
})();
// export const resource_base_path = "http://projecta-resource.com/extra_test_active/";
// export const resource_base_path = "http://pixiv.miunachan.top/extra_test_active/";
export const resource_base_path = "https://chong-chan.cn/resource/sample3/";
export const DEFAULT_PAGESTATE = {

};
// "HBG": "package/HBG.zip",
// "P35_37": "package/P35_37.zip",
// "CG01_04": "package/CG01_04.zip",
// "C12": "package/C12.zip",
// "C04": "package/C04.zip",
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
export const display_style_list = ["style-00", "style-04", "style-12"]
// function getCharaNameById(id) {
//     return chara_map[id].name;
// }
// export const preload_group = {
//     _H: { name: "首页资源", data: ['_H_BG_0', '_H_BG_1'] },
//     _P_INDOOR: { name: "INDOOR场景", data: ['_P_INDOOR_1', '_P_INDOOR_2', '_P_INDOOR_3', '_P_INDOOR_4', '_P_INDOOR_5', '_P_INDOOR_6', '_P_INDOOR_7'] },
//     _P_OUTDOOR: { name: "OUTDOOR场景", data: ['_P_OUTDOOR_1', '_P_OUTDOOR_2'] },
//     _CG_01: { name: "01CG", data: ['_CG_01_01', '_CG_01_02'] },
//     _CG_04: { name: "04CG", data: ['_CG_04_01', '_CG_04_02'] },
//     _C_04: { name: "04人物立绘", data: ['_C_04_02', '_C_04_03', '_C_04_04', '_C_04_05', '_C_04_06', '_C_04_07', '_C_04_12', '_C_04_13', '_C_04_21', '_C_04_22', '_C_04_23', '_C_04_25', '_C_04_27', '_C_04_31', '_C_04_32', '_C_04_33', '_C_04_41', '_C_04_42', '_C_04_43', '_C_04_44', '_C_04_45', '_C_04_50', '_C_04_54', '_C_04_55', '_C_04_56'] },
//     _C_12: { name: "12人物立绘", data: ['_C_12_01', '_C_12_01Y', '_C_12_02', '_C_12_02Y', '_C_12_03', '_C_12_03Y', '_C_12_04', '_C_12_04Y', '_C_12_05', '_C_12_05Y', '_C_12_06', '_C_12_07', '_C_12_07Y', '_C_12_08', '_C_12_11', '_C_12_11Y', '_C_12_12', '_C_12_13', '_C_12_13Y', '_C_12_21', '_C_12_21Y', '_C_12_22', '_C_12_23', '_C_12_23Y', '_C_12_24', '_C_12_25', '_C_12_25Y', '_C_12_26', '_C_12_27', '_C_12_27Y', '_C_12_28', '_C_12_31', '_C_12_32'] }
// }, PL_G = preload_group;
import FileInfo, { FilePool } from "../class/file-info";

// function createPreloadList(...keys) {
//     return keys.map(key => preload_group[key]);
// }
export function getFileSrc(file_map_KEY) {
    // if (file_map_KEY in file_map) return resource_base_path + file_map[file_map_KEY];
    // console.log('pool', FilePool.getFilePool());
    if (file_map_KEY in file_map) return FilePool.getDataFromPool(file_map[file_map_KEY]);
    return "";
}
export function getCharaPicSrc(charaName, style) {
    return getFileSrc(chara_map[charaName].pic[style.toString()]);
}
export function getPackagePath(key) {
    return resource_base_path + package_map[key];
}

export const package_map = {
    'chara_SAMPLE': 'package/chara_SAMPLE.zip',
    'place_SAMPLE': 'package/place_SAMPLE.zip',
    'BGM_SAMPLE': 'package/BGM_SAMPLE.zip',
    'voice_SAMPLE': 'package/voice_SAMPLE.zip',
    'home_SAMPLE': 'package/home_SAMPLE.zip',
    'CG_SAMPLE': 'package/CG_SAMPLE.zip',
}
export const file_map =
// {
//     _P_INDOOR_5: { packageKey: 'place_SAMPLE', fileName: 'bg_3571.png' },
//     _P_INDOOR_4: { packageKey: 'place_SAMPLE', fileName: 'bg_3573.png' },
//     _C_12_01: { packageKey: 'chara_SAMPLE', fileName: 'tati_120101.png' },
//     _BGM_01: { packageKey: 'BGM_SAMPLE', fileName: 'bgm_0208_loop.ogg' },
//     _H_BG_0: { packageKey: 'home_SAMPLE', fileName: 'bg_0.png' },
//     _H_BG_1: { packageKey: 'home_SAMPLE', fileName: 'bg_1.png' },
// }
{
    "_P_INDOOR_5": { "packageKey": "place_SAMPLE", "fileName": "bg_3571.png" },
    "_P_INDOOR_4": { "packageKey": "place_SAMPLE", "fileName": "bg_3573.png" },
    "_C_12_01": { "packageKey": "chara_SAMPLE", "fileName": "tati_120101.png" },
    "_BGM_01": { "packageKey": "BGM_SAMPLE", "fileName": "bgm_0208_loop.ogg" },
    "_H_BG_0": { "packageKey": "home_SAMPLE", "fileName": "bg_0.png" },
    "_H_BG_1": { "packageKey": "home_SAMPLE", "fileName": "bg_1.png" },
    "_BGM_02": { "packageKey": "BGM_SAMPLE", "fileName": "bgm_0206_loop.ogg" },
    "CG_01": { "packageKey": "CG_SAMPLE", "fileName": "eve_011401.png" },
    "CG_02": { "packageKey": "CG_SAMPLE", "fileName": "eve_011402.png" },
    "_H_LOGO": { "packageKey": "home_SAMPLE", "fileName": "霂LOGO.png" },
    "_H_TITLE": { "packageKey": "home_SAMPLE", "fileName": "_h_title.png" }
}
export const chara_map = {
    "12": {
        id: "12",
        name: "梅尔斯",
        pic: {
            '01': '_C_12_01'
        }
    }
}
export const tips_group = {
    "home": [
        {
            title: "首页tips1",
            text: "11这是首页tips1"
        },
        {
            title: "首页tips2",
            text: "22这是首页tips2"
        }
    ],
    "test": [
        {
            title: "这是什么？",
            text: "这是test"
        },
        {
            title: "测试test什么？",
            text: "测试test"
        }
    ],
    "desk": [
        {
            title: "这是什么？",
            text: "这是desk"
        },
        {
            title: "desk什么？",
            text: "测试desk"
        }
    ]
};
export const b = {
    "书「一」": (`=BOOK:书「一」
>start=道可道
>default_style=style-00
>end=[非常道,GG],[名可名,GG]
>cover=_H_BG_1
>check=[],[]
`),
    "书「二」": (`=BOOK:书「二」
>start=非常名
>default_style=style-00
>end=[非常名,2GG]
>cover=_H_BG_0
>check=[],[书「一」/道可道]
`)
};
export const bookIds = Object.keys(b);
export const s = {
    "书「一」": {
        "道可道": `=STORY:道可道
>title=一 · 一 道可道
>end=1,2
>tips=test
>to=非常道
~0:
@##背景、音乐和人物的进入。##chara[12,01,a_2]##setPlace[_P_INDOOR_5]##BGM[_BGM_01]
@##背景、音乐和人物的切换。##setPlace[_P_INDOOR_4]##BGM[_BGM_02]##chara[12,01,a_1]
@12##人物动作。##charaMove[default,12]
@##CG进入。##CG[CG_01]
@##CG切换。##CG[CG_02]
@##CG、背景、音乐和人物的退出。##charaOut[default,12]##setPlace[null]##CGOut[]##BGM[]
@##分支选项##choice[[后半句,1,非常道],[下一句,2,名可名]]
~0 end
~1:
@##选择了后半句
~1 end
~2:
@##选择了下一句
~2 end`,
        "非常道": `=STORY:非常道
>title=一 · 二 非常道
>end=0
>tips=test
~0:
@12##非常道。##chara[12,01,b_2]##setPlace[_P_INDOOR_5]##BGM[_BGM_01]
~0 end`,
        "名可名": `=STORY:名可名
>title=二 · 一 名可名
>end=0
>tips=test
~0:
@12##名可名...##chara[12,01,b_3]##setPlace[_P_INDOOR_4]##BGM[_BGM_02]
~0 end`,
    },
    "书「二」": {
        "非常名": `=STORY:非常名
>title=二 · 二 非常名
>end=0
>tips=test
~0:
@12##非常名。##setPlace[_P_INDOOR_4]
@##将解锁：档案2，新的背景图片。##charaOut[default,12]##setPlace[null]
~0 end`
    }
};
export const homeResource_map = {
    BGM: "_H_BGM_0",
    backgroundImageList: [//优先选择最后一个通过check的图片
        { check: { read: [], ended: [] }, fileKey: "_H_BG_0" },
        { check: { read: [], ended: ["书「一」/道可道"] }, fileKey: "_H_BG_1" },
    ],
    backgroundImage: "_H_BG_0",
    booksCover: {},
    elements: {
        title: {
            text: "我不到啊",
            fileKey: "_H_TITLE"
        },
        logo: {
            fileKey: "_H_LOGO"
        }
    }
}
export const information_map =
{
    "info_1": {
        "id": "info_1",
        "title": "档案1：道",
        "check": {
            "read": [],
            "ended": [
                "书「一」/非常道"
            ]
        },
        "order": "100",
        "data": [
            {
                "type": "pic",
                "fileKey": "_H_BG_0"
            },
            {
                "type": "text",
                "text": "有一个段落。"
            },
            {
                "type": "text",
                "text": "还有一个段落。还有一个段落。还有一个段落。还有一个段落。还有一个段落。还有一个段落。还有一个段落。还有一个段落。还有一个段落。还有一个段落。还有一个段落。还有一个段落。还有一个段落。还有一个段落。还有一个段落。还有一个段落。还有一个段落。还有一个段落。还有一个段落。还有一个段落。还有一个段落。还有一个段落。还有一个段落。还有一个段落。\n还有一个段落。"
            }
        ]
    },
    "info_2": {
        "id": "info_2",
        "title": "档案2：名",
        "check": {
            "read": [],
            "ended": [
                "书「二」/非常名"
            ]
        },
        "order": "200",
        "data": [
            {
                "type": "pic",
                "fileKey": "_H_BG_1"
            },
            {
                "type": "text",
                "text": "有一个段落。"
            },
            {
                "type": "text",
                "text": "还有一个段落。"
            }
        ]
    },
    "info_0": {
        "id": "info_0",
        "title": "档案0：一开始就能阅读",
        "order": "0",
        "check": {
            "read": [],
            "ended": []
        },
        "data": [
            {
                "type": "text",
                "text": "一开始就能阅读的内容。"
            }
        ]
    }
}
export const allData = {
    package_map,
    file_map,
    chara_map,
    tips_group,
    b,
    bookIds,
    s,
    information_map,
    homeResource_map,
    resource_base_path
};
export const BOOKFromChild = {};
export const STORYFromChild = {};
// const s_ = s.map(e => e.split('\n'))
// function getBook() {
//     function String_id(str) {
//         this.length = str.length;
//         this.num = parseInt(str);
//         this.str = str;
//     }
//     String_id.prototype = {
//         toString: function () { return this.str },
//         increase: function () { this.str = (++this.num).toString().padStart(this.length, "0") },
//         toZero: function () { this.str = (this.num = 0).toString().padStart(this.length, "0") }
//     }
//     const STORY = {}, SENTENCE = {};
//     const nextSentenceId = { pid: new String_id("000"), sid: new String_id("0000") };
//     let sentenceCount = 0;
//     const dataLineType = { '=': "name", '>': "setAttr", '@': "sentence", '~': "paragraph" }
//     const attrSetters = {
//         "BOOK": {
//             "data_key": function (keys) {
//                 for (let i = 0; i < keys.length; i++) {
//                     this.data[keys[i]] = STORY[keys[i]];
//                 }
//             },
//             "start": function (arr) {
//                 this["start"] = arr[0];
//             },
//             "end": function (arrs) {
//                 for (let i = 0; i < arrs.length; i++) {
//                     this.end[arrs[i][0]] = arrs[i][1];
//                 }
//             },
//             "default_style": function (arr) {
//                 this["default_style"] = arr[0];
//             },
//         },

//         "STORY": {
//             "end": function (arr) {
//                 this["end"] = arr;
//             },
//             "title": function (arr) {
//                 this["title"] = arr[0];
//             },
//             "to": function (arr) {
//                 this["to"].default = arr[0];
//             },
//             "to_able": function (arr) {
//                 this["to"].able = arr;
//             },
//             "style": function (arr) {
//                 this["style"] = arr[0];
//             }
//         },
//     }
//     const END_OF_ARR = Symbol("END_OF_ARR");
//     function argsStr_to_arr(argsStr) {
//         const arr = [];
//         let i = 0;
//         // console.log(argsStr);
//         function getNextArg() {
//             if (argsStr[i] == ',') i++;
//             if (argsStr.length <= i) return END_OF_ARR;
//             if (argsStr[i] == '[') {
//                 i++;
//                 const nextArg_arr = [];
//                 let newArg;
//                 while ((newArg = getNextArg()) != END_OF_ARR) nextArg_arr.push(newArg);
//                 return nextArg_arr;
//             }
//             else if (argsStr[i] == ']') {
//                 i++;
//                 return END_OF_ARR;
//             }
//             else {
//                 let nextArg_str = "";
//                 while (argsStr.length > i) {
//                     if (argsStr[i] == ',') {
//                         i++;
//                         return nextArg_str;
//                     }
//                     if (argsStr[i] == ']') {
//                         return nextArg_str;
//                     }
//                     else nextArg_str += argsStr[i++];
//                 }
//                 return nextArg_str;
//             }
//         }
//         let newArg;
//         while ((newArg = getNextArg()) != END_OF_ARR) arr.push(newArg);
//         return arr;
//     }
//     function setAttr(type, key, argsStr) {
//         const args = argsStr_to_arr(argsStr);
//         // console.log(key)
//         attrSetters[type][key].call(this, args)
//         return args;
//     }
//     const getNextSentenceId = () => (nextSentenceId.pid + nextSentenceId.sid);
//     const toNextParagraph = () => { nextSentenceId.sid.toZero(); return nextSentenceId.pid.increase(); }
//     function getJumpSetter() {
//         let optionList = [];
//         let paragraph;
//         return [() => {
//             for (let i = 0; i < optionList.length; i++) {
//                 optionList[i].jump && paragraph[optionList[i].jump] && (optionList[i].jump = paragraph[optionList[i].jump].start);
//             }
//             optionList = [];
//         }, (e) => optionList.push(e), (para) => paragraph = para]
//     }
//     const [doSetJump, addJump, paragraphBind] = getJumpSetter();
//     const [addPreload, preloadBind] = (function () {
//         let nowPreload;
//         return [(key, e) => nowPreload[key].add(e),
//         (pl) => nowPreload = pl]
//     })();
//     const sentenceAction = {
//         // id: "0000002",
//         //     // charaName: undefined,
//         //     text: '睁开了眼。',
//         //     place: '_P_INDOOR_5',
//         //     CG: null,
//         //     CG_transform: null,
//         //     sound: null,
//         //     charas_change: false,
//         //     charas: {"12": {
//         //     "style": "01", "position": "a_1",
//         // },
//         // "04": {
//         //     "style": "32", "position": "a_2",
//         //     "out": "default", "in": "default", "move": "default"
//         // }},
//         stateMemory: {
//             place: null,
//             CG: null,
//             CG_transform: null,
//             charas_change: false,
//             charas: {}
//         },
//         tempMemories: {},
//         cleanMemory: function () {
//             sentenceAction.stateMemory = {
//                 place: null,
//                 CG: null,
//                 CG_transform: null,
//                 charas_change: false,
//                 charas: {}
//             };
//             sentenceAction.tempMemories = {};
//         },
//         saveMemory: function (pid) {
//             sentenceAction.tempMemories[pid] = sentenceAction.stateMemory;
//         },
//         loadMemory: function (pid) {
//             console.log('load', sentenceAction.tempMemories[pid])
//             sentenceAction.tempMemories[pid] ? (sentenceAction.stateMemory = objCopy(sentenceAction.tempMemories[pid])) : (() => { throw ("load fail") })();
//         },
//         getMemory: function () {
//             console.log('get', objCopy(sentenceAction.stateMemory))
//             return objCopy(sentenceAction.stateMemory);
//         },
//         "setPlace": function (arr) {
//             this.place = sentenceAction.stateMemory.place = (arr[0] != "null" ? arr[0] : null);
//             this.place && addPreload("place", this.place)
//         },
//         "charaOut": function (arr) {
//             this.charas_change = true;
//             const [outStyle, ...charaIdList] = arr;
//             charaIdList.forEach((e) => {
//                 const memory = sentenceAction.stateMemory, basePart = memory.charas[e], actionPart = {};
//                 actionPart.out = outStyle;
//                 this.charas[e] = { ...this.charas[e], ...(basePart), ...actionPart };
//                 delete memory.charas[e];
//             })

//         },
//         "chara": function (arr) {
//             this.charas_change = true;
//             const basePart = { "style": arr[1], "position": arr[2] }, actionPart = {}, memory = sentenceAction.stateMemory;
//             chara_map[arr[0]]?.pic[arr[1]] && addPreload("chara_pic", chara_map[arr[0]]?.pic[arr[1]])
//             if (memory.charas[arr[0]]) {
//                 if (memory.charas[arr[0]]["position"] == basePart["position"])
//                     actionPart.change = arr[3] ?? "default";
//                 else actionPart.in = "default", actionPart.out = "default";
//             }
//             else {
//                 actionPart.in = arr[3] ?? "default";
//             }
//             this.charas[arr[0]] = { ...this.charas[arr[0]], ...(memory.charas[arr[0]] = basePart), ...actionPart };
//         },
//         "charaMove": function (arr) {
//             this.charas_change = true;
//             const [moveStyle, ...charaIdList] = arr;
//             charaIdList.forEach((e) => {
//                 const memory = sentenceAction.stateMemory, basePart = memory.charas[e], actionPart = {};
//                 actionPart.move = moveStyle;
//                 this.charas[e] = { ...this.charas[e], ...(basePart), ...actionPart };
//             })
//         },
//         "choice": function (arr, para, pid) {
//             this.options = arr.map(e => {
//                 let newOption = {
//                     text: e[0],
//                     jump: e[1],
//                     to: e[2],
//                 };
//                 addJump(newOption);
//                 para[e[1]] = { from: pid };
//                 return newOption;
//             });
//             console.log(this.options)
//         },
//         "CG": function (arr) {
//             this.CG = sentenceAction.stateMemory.CG = arr[0];
//             this.CG && addPreload("CG", this.CG)
//             arr[1] && (this.CG_transform = sentenceAction.stateMemory.CG_transform = arr[1]);
//         },
//         "CGOut": function (arr) {
//             this.CG = sentenceAction.stateMemory.CG = null;
//         },
//     }
//     function Story(line) {
//         const newStory = {
//             id: line[0].slice(line[0].indexOf(':') + 1),
//             title: line[0].slice(line[0].indexOf(':') + 1),
//             start: null,
//             end: [],
//             preload: { chara_pic: new Set(), CG: new Set(), place: new Set() },
//             tips: [tips_group.home],
//             to: {
//                 default: null, able: []
//             },
//             data: {}
//         }
//         preloadBind(newStory.preload);
//         const paragraphIdList = [];
//         const paragraph = {};
//         paragraphBind(paragraph);
//         let nowParagraphId = null;
//         for (let i = 1; i < line.length; i++) {
//             if (line[i].length == 0) continue;
//             let nowLine = line[i].slice(1), lineFlag = line[i].charAt(0);
//             switch (lineFlag) {
//                 case '@':
//                     let newSentence = sentenceAction.getMemory();
//                     let [charaName, text, ...actions] = nowLine.split("##");
//                     newSentence.charaName = (Object.keys(chara_map).indexOf(charaName) != -1 ? charaName = chara_map[charaName].name : charaName)
//                     newSentence.text = (text)
//                     console.log(actions)
//                     for (let j in actions) {
//                         const firstNotNull = actions[j].search(/\S/), argsStart = actions[j].indexOf('['), argsEnd = actions[j].lastIndexOf(']');
//                         const actionName = actions[j].slice(firstNotNull, argsStart);
//                         // console.log(actionName,actions[j].search(/\S/),actions[j].indexOf('['))
//                         //...
//                         if (sentenceAction[actionName]) {
//                             const argsStr = actions[j].slice(argsStart + 1, argsEnd);
//                             console.log("args:", argsStr_to_arr(argsStr));
//                             // argsStr_to_arr()
//                             sentenceAction[actionName].call(newSentence, argsStr_to_arr(argsStr), paragraph, nowParagraphId);
//                         }
//                     }
//                     console.log(newSentence)
//                     paragraph[nowParagraphId].data.push(newSentence);
//                     break;
//                 case '>':
//                     let ep = nowLine.indexOf('=');
//                     // console.log(newStory, [nowLine.slice(0, ep), nowLine.slice(ep + 1)])
//                     setAttr.apply(newStory, ["STORY", nowLine.slice(0, ep), nowLine.slice(ep + 1)]);
//                     break;
//                 case '~':
//                     if (nowParagraphId && nowLine.split(new RegExp(`${nowParagraphId}[ ]+end`)).length != 1) {
//                         sentenceAction.saveMemory(nowParagraphId);
//                         nowParagraphId = null;
//                     }
//                     else if (nowLine.lastIndexOf(':') != -1) {
//                         const newParagraphId = nowLine.slice(0, nowLine.lastIndexOf(':'));
//                         paragraphIdList.push(newParagraphId);
//                         paragraph[newParagraphId]?.from && sentenceAction.loadMemory(paragraph[newParagraphId].from);
//                         paragraph[nowParagraphId = newParagraphId] = { id: nowParagraphId, data: [], ...paragraph[newParagraphId] };
//                     }
//                     else throw (nowLine);
//                     break;
//                 case '=':
//                     break;
//                 default:
//                     break;
//             }
//         }
//         console.log(paragraph)
//         for (let pid = 0; pid < paragraphIdList.length; pid++) {
//             const p = paragraphIdList[pid];
//             paragraph[p].start = getNextSentenceId();
//             for (let i = 0; i < paragraph[p].data.length; i++) {
//                 // if (paragraph[p].data[i].options) {
//                 //     paragraph[p].data[i].options.forEach((e) => e.jump && (e.jump = paragraph[e.jump].start));
//                 // }
//                 // console.log(getNextSentenceId(), nextSentenceId.pid + nextSentenceId.sid, nextSentenceId)
//                 const _nextSentenceId = getNextSentenceId();
//                 newStory.data[_nextSentenceId] = SENTENCE[_nextSentenceId] = { id: _nextSentenceId, ...paragraph[p].data[i] };
//                 sentenceCount++;
//                 paragraph[p].data[i + 1] && nextSentenceId.sid.increase();
//             }
//             paragraph[p].end = getNextSentenceId();
//             toNextParagraph();
//         }
//         doSetJump();
//         newStory.start = paragraph[paragraphIdList[0]].start;
//         newStory.end.forEach((e, i, arr) => {
//             arr[i] = paragraph[e].end;
//         })
//         newStory.preload = ((e) => {
//             let newPreload = [];
//             for (let name in e) {
//                 e[name].size &&
//                     newPreload.push({
//                         name: name,
//                         data: Array.from(e[name])
//                     })
//             }
//             return newPreload;
//         })(newStory.preload);
//         return STORY[newStory.id] = newStory;
//         // return newStory;
//     }
//     function Book(line) {
//         const newBook = {
//             start: null,
//             name: line[0].slice(line[0].indexOf(':') + 1),
//             end: {},
//             default_style: null,
//             data: {}
//         };
//         for (let i = 1; i < line.length; i++) {
//             switch (line[i].charAt(0)) {
//                 case '>':
//                     let ep = line[i].indexOf('=');
//                     // console.log(newBook, [line[i].slice(1, ep), line[i].slice(ep + 1)])
//                     setAttr.apply(newBook, ["BOOK", line[i].slice(1, ep), line[i].slice(ep + 1)]);
//                     break;
//                 case '=':
//                     // let [type,name] = line[i].slice(1).split(':');
//                     // if(type=="BOOK")
//                     break;
//                 default:
//                     break;
//             }
//         }
//         return newBook;
//     }
//     return function _Book(book_line, story_line) {
//         (story_line).map(e => e.split('\n')).forEach(s => Story(s));
//         return { Book: Book(book_line.split('\n')), STORY, SENTENCE }
//     }
// };
// const textToBOOK = getBook();
// console.log(te(b, s_));
// export const BOOK = { data: { 书「一」: textToBOOK(b["书「一」"], s["书「一」"]).Book } };
// export const BOOK = {
//     data: {
//         书「一」: {
//             start: "道可道",
//             name: "书「一」",
//             end: {
//                 "1-2": "在1-2结束",
//                 "1-3": "在1-3结束"
//             },
//             default_style: "style-00",
//             data: {
//                 "道可道": STORY['道可道'],
//                 "1_0": STORY['1_0'],
//                 "1_1": STORY['1_1'],
//                 "1_2": STORY['1_2'],
//                 "1_3": STORY['1_3'],
//             }
//         }
//     }
// }
// console.log(BOOK,{data:{书「一」:te(b, s_).Book}})

// console.log(
//     // Book(b),
//     STORY["1_0"],
//     Story(s),
//     // BOOK
// )

export const activePage_map = {
    home: {
        name: "home",
        preload: [],
        // createPreloadList('_H'),
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
function myarrtostr(arr) {
    return '[' + arr.map(e => Array.isArray(e) ? myarrtostr(e) : e) + ']'
}
export function objtovm(obj) {
    // 定义一个空字符串
    let vm_head = "", vm_para = "", vm;
    // 遍历对象的属性
    vm_head += "=" + obj.category + ":" + obj.id + "\n";
    for (let key in obj) {
        // // 判断属性名是否为name
        // if (key === "name") {
        //     // 提取类别和名称，并用=连接成WM文件的第一行
        //     let [category, name] = obj[key].split(":");
        //     wm += "=" + category + ":" + name + "\n";
        // } 
        if (key === "category" || key === "id") {
            continue;
        }
        else if (key === "para") { // 判断属性名是否为para
            // 遍历段落对象的属性
            for (let paraNum in obj[key]) {
                // 添加段落开始标志到WM文件中
                vm_para += "~" + paraNum + ":\n";
                // 遍历段落数组中的每个语句对象
                for (let statementObj of obj[key][paraNum]) {
                    // 添加@符号到WM文件中
                    vm_para += "@";
                    // 判断语句对象是否有cn属性，并添加到WM文件中（如果为空，则添加空字符串）
                    vm_para += statementObj.cn ?? "";
                    // 判断语句对象是否有tx属性，并添加到WM文件中（用##分割）
                    vm_para += "##" + statementObj.tx ?? "";
                    // 判断语句对象是否有fn属性，并添加到WM文件中（用##分割）
                    if (statementObj.fn) {
                        for (let fn of statementObj.fn) {
                            vm_para += "##" + fn;
                        }
                    }
                    // 添加换行符到WM文件中
                    vm_para += "\n";
                }
                // 添加段落结束标志到WM文件中
                vm_para += "~" + paraNum + " end\n";
            }
        } else { // 其他情况则表示是追加属性
            // 提取属性名和值，并用>连接成WM文件的一行
            let value = Array.isArray(obj[key]) ?
                obj[key].map(e => Array.isArray(e) ? myarrtostr(e) : e)
                : obj[key];
            value && (vm_head += ">" + key + "=" + value + "\n");
        }
    }
    console.log("objtovm", vm = (vm_head + vm_para).trim());
    return vm.trim();
}
export function vmtoobj(wm) {
    // 定义一个空对象
    let obj = {};
    // 按行分割WM文件内容
    let lines = wm.split("\n");
    // 声明一个变量存储当前段落号
    let paraNum;
    // 遍历每一行
    for (let line of lines) {
        // 判断行首符号
        switch (line[0]) {
            case "=": // 如果是=，表示文件的类别和名称
                // 提取类别和名称，并用":"连接成name属性值
                let [category, id] = line.slice(1).split(":");
                // obj.name = category + ":" + id;
                obj.category = category;
                obj.id = id
                break;
            case ">": // 如果是>，表示文件的追加属性
                // 提取属性名和值，并添加到对象中
                let [key, value] = line.slice(1).split("=");
                if (key == "end" || key == "check") value = argsStr_to_arr(value);
                obj[key] = value;
                break;
            case "~": // 如果是~，表示文件内新起或结束一个段落
                // 提取段落号，并判断是否为结束标志（去掉冒号）
                paraNum = line.slice(1).split(" ")[0].replace(":", "");
                if (line.endsWith("end")) { // 如果是结束标志，则不做任何操作
                    break;
                } else { // 如果不是结束标志，则新建一个空数组存储段落内容，并添加到para属性中（如果没有para属性，则先创建）
                    if (!obj.para) {
                        obj.para = {};
                    }
                    obj.para[paraNum] = [];
                }
                break;
            case "@": // 如果是@，表示段落中的一个语句
                // 提取语句中的各个属性，并用##分割成数组
                let statement = line.slice(1).split("##");
                // 创建一个空对象存储语句属性，并添加到当前段落数组中（如果没有当前段落，则先创建）
                if (!obj.para[paraNum]) {
                    obj.para[paraNum] = [];
                }
                let statementObj = {};
                // 判断第一个元素是否为空字符串（表示cn属性为空）
                if (statement[0] === "") {
                    statementObj.cn = "";
                } else {
                    statementObj.cn = statement[0];
                }
                // 判断第二个元素是否存在（表示tx属性）
                if (statement[1]) {
                    statementObj.tx = statement[1];
                }
                // 判断第三个元素及以后是否存在（表示fn属性）
                if (statement.length > 2) {
                    statementObj.fn = [];
                    for (let i = 2; i < statement.length; i++) {
                        statementObj.fn.push(statement[i]);
                    }
                }
                obj.para[paraNum].push(statementObj);
                break;
            default:
                break;
        }
    }
    console.log("vmtoobj", obj);
    return obj;
}