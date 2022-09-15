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
const resource_base_path = "http://projecta-resource.com/game/";
const file_map = {
    _H_BG_WATER:"home/water.jpg",
    _H_BG_FLOWER:"home/flower.jpg",
    
    _C_A_TEST_1:"chara/a_test_1.png",
    _C_A_TEST_2:"chara/a_test_2.png",
    _C_A_TEST_3:"chara/a_test_3.png",

    _C_B_TEST_1:"chara/b_test_1.png",
    _C_B_TEST_2:"chara/b_test_2.png",
    _C_B_TEST_3:"chara/b_test_3.png",
}
function createPreloadList(...args){
    return args;
}
const preload_group = {
    _H:[_H_BG_WATER,_H_BG_FLOWER],
    _C_A_TEST:[_C_A_TEST_1,_C_A_TEST_2,_C_A_TEST_3],
    _C_B_TEST:[_C_B_TEST_1,_C_B_TEST_2,_C_B_TEST_3]
},PL_G=preload_group;
PL_G.DEFAULT = createPreloadList(PL_G._H,_C_A_TEST)

export const sample3 = {
    Sentence1: {
        id: "00000",
        charaName: chara_map["li"].name,
        text: "我回来了。",
        place: "home_1",
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
        id: "00001",
        charaName: chara_map["li2"].name,
        text: "我回来了。2",
        place: "home_1",
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
        options: [
            {
                text: "sentaku_A",
                to: "1-2",
            },
            {
                text: "sentaku_B",
                to: "1-3",
            },
        ]
    }
}
export const sample2 = {
    Story1: {
        id: "1-1",
        preload: createPreloadList(PL_G._C_A_TEST,PL_G._C_B_TEST),
        data: {
            // Sentence...
            "00000": sample3.Sentence1,
            "00001": sample3.Sentence2,
            "00002": sample3.Choice
        }
    },
    Story2: {
        id: "1-2",
        preload: createPreloadList(PL_G._C_A_TEST,PL_G._C_B_TEST),
        data: {
            "00000": sample3.Sentence2,
            "00001": sample3.Sentence2
        }
    },
    Story3: {
        id: "1-3",
        preload: createPreloadList(PL_G._C_A_TEST,PL_G._C_B_TEST),
        data: {
            "00000": sample3.Sentence1,
            "00001": sample3.Sentence1
        }
    }
}
export const sample1 = {
    Book: {
        start: "1-1",
        end: ["1-2", "1-3"],
        data: {
            "1-1": sample2.Story1,
            "1-2": sample2.Story2,
            "1-3": sample2.Story3,
        }
    }
}

export const tips = {
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
}
