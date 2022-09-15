import { useSpring, animated, config, easings } from 'react-spring'
export function createStyle(...styles) {
    return Object.assign({}, ...styles)
}
export const QStyle = {
    OP_0: { opacity: 0 }, OP_1: { opacity: 1 },
    OP: (op) => ({ opacity: op }),
    BGC_000_0: { backgroundColor: "rgba(0,0,0,0)" },
    BGC_000_1: { backgroundColor: "rgba(0,0,0,1)" },
    BGC_FFF_0: { backgroundColor: "rgba(255,255,255,0)" },
    BGC_FFF_1: { backgroundColor: "rgba(255,255,255,1)" },
    BGC: (r, g, b, a) => ({ backgroundColor: `rgba(${r},${g},${b},${a})` }),
    DL_200: { delay: 200 },
    DL_1000: { delay: 1000 },
    DL: (dl) => ({ delay: dl }),
    WD_0: { width: "0%" },
    WD_50: { width: "50%" },
    WD_100: { width: "100%" },
    WD: (wd) => ({ width: wd }),
    RG: (rg) => ({ right: rg }),
    LF: (lf) => ({ left: lf }),
    CFG_A: {
        config: {
            duration: 1000,
            easing: easings.easeOutQuad,
        }
    },
    FT_B0: {filter:"brightness(0%)"},
    FT_B50: {filter:"brightness(50%)"},
    FT_B80: {filter:"brightness(80%)"},
    FT_B100: {filter:"brightness(100%)"},
    FT_B120: {filter:"brightness(120%)"},
    FT_B250: {filter:"brightness(250%)"},
    FT_B800: {filter:"brightness(800%)"},
    FT_BX: (bx)=>({filter:`blur(${bx}px)`})
};

console.log(createStyle(QStyle.OP_0, QStyle.BGC_000_0))