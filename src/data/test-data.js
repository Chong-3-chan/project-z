const chara_map = {
    "li": {
        id: "li",
        name: "李"
    },
    "li2": {
        id: "li2",
        name: "李2"
    }
}
export const resource_base_path = "http://projecta-resource.com/game/";
// export const resource_base_path = "http://pixiv.miunachan.top/game/";
export const DEFAULT_PAGESTATE = {};
const file_map = {
    _H_BG_WATER: "home/water.jpg",
    _H_BG_FLOWER: "home/flower.jpg",

    _C_A_TEST_1: "chara/a_test_1.png",
    _C_A_TEST_2: "chara/a_test_2.png",
    _C_A_TEST_3: "chara/a_test_3.png",

    _C_B_TEST_1: "chara/b_test_1.png",
    _C_B_TEST_2: "chara/b_test_2.png",
    _C_B_TEST_3: "chara/b_test_3.png",
}
export function getFileSrc(file_map_KEY) {
    if (file_map_KEY in file_map) return resource_base_path + file_map[file_map_KEY];
    return "";
}
function createPreloadList(...args) {
    return args;
}
export const preload_group = {
    _H: { name: "背景图片", data: [file_map._H_BG_WATER, file_map._H_BG_FLOWER] },
    _C_A_TEST: { name: "TEST人物立绘A", data: ["_C_A_TEST_1", "_C_A_TEST_2", "_C_A_TEST_3"] },
    _C_B_TEST: { name: "TEST人物立绘A", data: ["_C_B_TEST_1", "_C_B_TEST_2", "_C_B_TEST_3"] }
}, PL_G = preload_group;
// DEFAULT_PAGESTATE.loadList = PL_G.DEFAULT = createPreloadList(PL_G._H, PL_G._C_A_TEST);
// DEFAULT_PAGESTATE.loadList = PL_G.DEFAULT = [
//     {name:"背景图片",data:PL_G._H},
//     {name:"TEST人物立绘A",data:PL_G._C_A_TEST},
// ]

export const tips_group = {
    home: [
        {
            title: "home tip",
            text: "111"
        },
        {
            title: "home tip",
            text: "222"
        }
    ],
    A: [
        {
            title: "伏尔坎",
            text: "伏尔坎是一座古代机器的代称，于新历13年被共同体先遣队启动。"
        },
        {
            title: "伏尔坎1",
            text: "1伏尔坎是一座古代机器的代称，于新历13年被共同体先遣队启动。"
        },
        {
            title: "伏尔坎2",
            text: "2伏尔坎是一座古代机器的代称，于新历13年被共同体先遣队启动。"
        },
        {
            title: "伏尔坎3",
            text: "3伏尔坎是一座古代机器的代称，于新历13年被共同体先遣队启动。"
        }
    ],
    B: [
        {
            title: "b伏尔坎",
            text: "伏尔坎是一座古代机器的代称，于新历13年被共同体先遣队启动。"
        },
        {
            title: "b伏尔坎1",
            text: "1伏尔坎是一座古代机器的代称，于新历13年被共同体先遣队启动。"
        },
        {
            title: "b伏尔坎2",
            text: "2伏尔坎是一座古代机器的代称，于新历13年被共同体先遣队启动。"
        },
        {
            title: "b伏尔坎3",
            text: "3伏尔坎是一座古代机器的代称，于新历13年被共同体先遣队启动。"
        }
    ]
};
// DEFAULT_PAGESTATE.tips = tips_group.DEFAULT = [tips_group.A, tips_group.B];

export const sample3 = {
    // [ "place in1","place in2","CG in1","CG in2","CG out" ]
    Sentence1: {
        // id: "00000",
        charaName: chara_map["li"].name,
        text: "place in1",
        place: "_H_BG_WATER",
        CG: null,
        CG_transform: null,
        sound: null,
        charas: {
            "li": {
                //chara-state
                in: null,
                out: null,
                move: null,
            }
        },
        style: "Li",
    },
    Sentence2: {
        // id: "00001",
        charaName: chara_map["li2"].name,
        text: "place in2",
        place: "_H_BG_FLOWER",
        CG: null,
        CG_transform: null,
        sound: null,
        charas: {
            "li": {
                //chara-state
                in: null,
                out: null,
                move: null,
            },
            "li2": {
                //chara-state
                in: null,
                out: null,
                move: null,
            }
        },
        style: "Li",
    },
    Sentence3: {
        // id: "00002",
        charaName: chara_map["li2"].name,
        text: "CG in1",
        place: "_H_BG_FLOWER",
        CG: "CG_1",
        CG_transform: null,
        sound: null,
        charas: {
            "li": {
                //chara-state
                in: null,
                out: null,
                move: null,
            },
            "li2": {
                //chara-state
                in: null,
                out: null,
                move: null,
            }
        },
        style: "Li",
    },
    Sentence4: {
        // id: "00002",
        charaName: chara_map["li2"].name,
        text: "CG in2",
        place: "_H_BG_FLOWER",
        CG: "CG_2",
        CG_transform: null,
        sound: null,
        charas: {
            "li": {
                //chara-state
                in: null,
                out: null,
                move: null,
            },
            "li2": {
                //chara-state
                in: null,
                out: null,
                move: null,
            }
        },
        style: "Li",
    },
    Sentence5: {
        // id: "00002",
        charaName: chara_map["li2"].name,
        text: "CG out",
        place: "_H_BG_FLOWER",
        CG: null,
        CG_transform: null,
        sound: null,
        charas: {
            "li": {
                //chara-state
                in: null,
                out: null,
                move: null,
            },
            "li2": {
                //chara-state
                in: null,
                out: null,
                move: null,
            }
        },
        style: "Li",
    },
    Choice: {
        charaName: chara_map["li2"].name,
        text: "Choice",
        place: "_H_BG_WATER",
        CG: null,
        CG_transform: null,
        sound: null,
        charas: {
            "li": {
                //chara-state
                in: null,
                out: null,
                move: null,
            },
            "li2": {
                //chara-state
                in: null,
                out: null,
                move: null,
            }
        },
        style: "Li",
        options: [
            {
                text: "sentaku_A",
                to: "1-2",
                jump: "10001",
            },
            {
                text: "sentaku_B",
                to: "1-3",
                jump: "20001",
            },
        ]
    }
}
export const sample2 = {
    Story1: {
        id: "1-1",
        title: "一杠一",
        start: "00000",
        end: ["10002", "20002"],
        preload: createPreloadList(PL_G._C_A_TEST),
        tips: [tips_group.A, tips_group.B],
        data: {
            // Sentence...
            "00000": sample3.Sentence1,
            "00001": sample3.Sentence2,
            "00002": sample3.Sentence3,
            "00003": sample3.Choice,
            "10001": sample3.Sentence4,
            "10002": sample3.Sentence4,
            "20001": sample3.Sentence5,
            "20002": sample3.Sentence5,
        }
    },
    Story2: {
        id: "1-2",
        title: "一杠二",
        start: "00000",
        end: ["00003"],
        preload: createPreloadList(PL_G._C_B_TEST),
        tips: [],
        data: {
            "00000": sample3.Sentence1,
            "00001": sample3.Sentence2,
            "00002": sample3.Sentence3,
            "00003": sample3.Sentence4
        }
    },
    Story3: {
        id: "1-3",
        title: "一杠三",
        start: "00000",
        end: ["00000"],
        preload: createPreloadList(PL_G._C_A_TEST, PL_G._C_B_TEST),
        tips: [],
        data: {
            "00000": sample3.Sentence1
        }
    }
}
export const sample1 = {
    data: {
        Book1: {
            start: "1-1",
            name: "Book1",
            end: {
                "1-2": "在1-2结束",
                "1-3": "在1-3结束"
            },
            data: {
                "1-1": sample2.Story1,
                "1-2": sample2.Story2,
                "1-3": sample2.Story3,
            }
        }
    }
}


export const activePage_map = {
    home: {
        name: "home",
        preload: createPreloadList(PL_G._H),
        ch: "首页",
        tips: [tips_group.home]
    },
    main: {
        name: "main",
        preload: [],
        ch: "主页面",
        tips: []
    }
};
