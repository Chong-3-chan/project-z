import React, { useState, useEffect, useContext, useRef, useMemo, useCallback } from 'react'
import { getFileSrc, getCharaPicSrc, wait } from "./data/extra-test-data.js"
// import { getFileSrc, getCharaPicSrc } from "./data/test-data.js"
import { createStyle, QStyle } from './data/spring.js'
import { useSpring, animated, config } from 'react-spring'
import { getOptions, pageContext } from './App.js'
import './MainP.css'
import Sound, { player } from './tools/Sound.js'
import { DBget, DBput } from './tools/IndexedDB-controller.js'
import { globalSave } from './main.js'
const test = [["Book1"], ["Book1", "1_0", "0010004"], [undefined, "0_0"], [undefined, "1_0"], [undefined, undefined, "0010004"]];
let _mainPhase = "waiting";// place chara text done
let _mainPhaseGO = () => { };
let _charasPhase = "waiting";
let liuId = null;
function liu(str, delay = 50, setter, callback) {
    let liu_str = "";
    const endLiu = () => {
        if (liuId === null) return;
        clearInterval(liuId);
        // console.log("endLiu", liuId);
        liuId = null;
        setter(str);
        callback();
    };
    liuId = setInterval(() => {
        setter(liu_str)
        if (liu_str.length < str.length) {
            liu_str = liu_str + str.charAt(liu_str.length);
        }
        else {
            endLiu();
        }
    }, delay);
    return endLiu;
}
function getLiuText() {
    let endTextPushing = null;
    return function ({ nextText, setNextText, textPhase, setTextPhase, onClick, playVoice }) {
        const [text, setText] = useState("");
        // console.log("textRender")
        useEffect(() => {
            // console.log("text:", textPhase, nextText, _mainPhase);
            // debugger;
            switch (textPhase) {
                case "waiting":
                    setText("");
                    _mainPhase == "text" && setTextPhase("ready");
                    return;
                case "ready":
                    playVoice && playVoice();
                    endTextPushing = liu(nextText,
                        (10 - getOptions()["text_appearSpeed"]) * 12.5
                        , setText,
                        () => {
                            // console.log("endTextPushing");
                            endTextPushing = null;
                            setNextText(null);
                            setTextPhase("done");
                        });
                    setTextPhase("pushing");
                    return;
                case "pushing":
                    return;
                case "done":
                    endTextPushing && endTextPushing();
                    // _mainPhase = "done";
                    _mainPhase == "text" && _mainPhaseGO();
                    return;
            }
        }, [nextText, textPhase, _mainPhase]);
        return <div className='text' onClick={onClick}>{text}</div>;
    }
}
const LiuText = getLiuText();
function getPlaceBox() {
    const fullStyle = createStyle(QStyle.WD_100, QStyle.HG_100, QStyle.OP_1, QStyle.FT_BX("0rem"));
    const style_wd0 = createStyle(QStyle.WD_0);
    const style_hg0 = createStyle(QStyle.HG_0);
    const style_op0 = createStyle(QStyle.OP_0);
    const style_op1 = createStyle(QStyle.OP_1);
    const style_BX = createStyle(QStyle.FT_BX("1rem"));
    return function PlaceBox({ nowPlace, lastPlace, placePhase, setPlacePhase }) {
        const [placeStyle, ps_api] = useSpring(() => createStyle(style_op0, QStyle.CFG_B));
        useEffect(() => {
            console.log("placePhase", placePhase);
            switch (placePhase) {
                case "waiting":
                    // _mainPhase = "place";
                    ps_api.set(style_op0);
                    setPlacePhase("ready");
                    return;
                case "ready":
                    ps_api.start(createStyle(style_op1, { onRest: () => setPlacePhase("done") }));
                    setPlacePhase("pushing");
                    return;
                case "pushing":
                    return;
                case "done":
                    ps_api.set(style_op1);
                    // _mainPhase = "chara";
                    _mainPhase == "place" && _mainPhaseGO();
                    return;
            }
        }, [placePhase, _mainPhase])
        // console.log(nowPlace, lastPlace, (lastPlace != nowPlace), placePhase)
        return <>
            {lastPlace && <animated.div className='placeBox last'>
                <img className='place' src={getFileSrc(lastPlace)} ></img>
            </animated.div>}
            {nowPlace ? <animated.div className='placeBox' style={placePhase != "waiting" ? placeStyle : { opacity: 0 }}>
                <img className='place' src={getFileSrc(nowPlace)}></img>
                {/* {<animated.div style={{
                    fontSize: "100px",
                    position: "fixed"
                }}>
                    {placeStyle.opacity.to(e => e.toFixed(2) + placePhase)}
                </animated.div>} */}
            </animated.div>
                : <animated.div className='placeBox' style={{ backgroundColor: "black", ...(placePhase != "waiting" ? placeStyle : { opacity: 0 }) }}>
                </animated.div>}
        </>
    }
}
const PlaceBox = getPlaceBox();
function getCGBox() {
    const fullStyle = createStyle(QStyle.WD_100, QStyle.HG_100, QStyle.OP_1, QStyle.FT_BX("0rem"));
    const style_wd0 = createStyle(QStyle.WD_0);
    const style_hg0 = createStyle(QStyle.HG_0);
    const style_op0 = createStyle(QStyle.OP_0);
    const style_op1 = createStyle(QStyle.OP_1);
    const style_BX = createStyle(QStyle.FT_BX("1rem"));
    return function CGBox({ nowCG, lastCG, CGPhase, setCGPhase }) {
        const [CGStyle, ps_api] = useSpring(() => createStyle(style_op0, QStyle.CFG_B));
        useEffect(() => {
            console.log("CGPhase", CGPhase);
            switch (CGPhase) {
                case "waiting":
                    // _mainPhase = "CG";
                    ps_api.set(nowCG ? style_op0 : style_op1);
                    setCGPhase("ready");
                    return;
                case "ready":
                    ps_api.start(createStyle(nowCG ? style_op1 : style_op0, { onRest: () => setCGPhase("done") }));
                    setCGPhase("pushing");
                    return;
                case "pushing":
                    return;
                case "done":
                    ps_api.set(nowCG ? style_op1 : style_op0);
                    // _mainPhase = "chara";
                    _mainPhase == "CG" && _mainPhaseGO();
                    return;
            }
        }, [CGPhase, _mainPhase])
        // console.log(nowCG, lastCG, (lastCG != nowCG), CGPhase)
        return <>
            {lastCG && <animated.div className='CGBox last' style={nowCG ? {} : (CGPhase != "waiting" ? CGStyle : { opacity: 1 })}>
                <img className='CG' src={getFileSrc(lastCG)} ></img>
            </animated.div>}
            {nowCG && <animated.div className='CGBox' style={CGPhase != "waiting" ? CGStyle : { opacity: 0 }}>
                <img className='CG' src={getFileSrc(nowCG)}></img>
                {/* {<animated.div style={{
                    fontSize: "100px",
                    position: "fixed"
                }}>
                    {CGStyle.opacity.to(e => e.toFixed(2) + CGPhase)}
                </animated.div>} */}
            </animated.div>}
        </>
    }
}
const CGBox = getCGBox();
const charaActions = ["out", "change", "in", "move"];
function getCharas() {
    const fullStyle = createStyle(QStyle.OP_1, QStyle.TFTL("0rem", "0rem"), QStyle.CFG_ALQ);
    const style_op0 = createStyle(QStyle.OP_0);
    const style_op1 = createStyle(QStyle.OP_1);
    const style_BX = createStyle(QStyle.FT_BX("1rem"));
    const style_TFTL1 = createStyle(QStyle.TFTL("0rem", "0.1rem"));
    const style_TFTL0 = createStyle(QStyle.TFTL("0rem", "0rem"));
    const charaPhase = { now: {}, next: {} };
    function setCharaPhaseNow(name, phase) {
        charaPhase.now[name] = phase;
    }
    function setCharaPhaseNext(name, todo) {
        if (!todo || !charaPhase.next[name]) charaPhase.next[name] = {};
        todo && (charaPhase.next[name][todo] = true);
    }
    function Chara({ charaId, now, last, phase, setPhase, nextPhase, isNow, isLast, toNextCharasActionPhase }) {
        console.log(now, last, isNow, isLast)
        const dat = isNow ? now : last;
        // console.log(dat)
        const [style, api] = useSpring(() => createStyle(fullStyle, ((isNow && (now.out || now.in)) || (isLast && last.out && !last.in)) ? style_op0 : {}));
        const [changeStyle, cs_api] = useSpring(() => createStyle(style_op1, QStyle.CFG_ALQ));
        // const [nowPhase,setNowPhase] = useState("waiting");
        function check() {
            let allFinish = true;
            for (let charaId in charaPhase.next) {
                if (charaPhase.next[charaId][_charasPhase])
                    if (charaPhase.now[charaId] == _charasPhase) {
                        allFinish = false;
                        break;
                    }
            }
            if (allFinish) {
                toNextCharasActionPhase();
            }
            return allFinish;
        }
        useEffect(() => {
            setPhase("waiting");
        }, []);
        useEffect(() => {
            console.log(charaId, phase, nextPhase, _charasPhase, _mainPhase, charaPhase);
            if ((_mainPhase == "chara"))
                if (nextPhase)
                    if ((nextPhase[_charasPhase])) {
                        if (phase == "waiting" || phase == "done") {
                            setPhase(_charasPhase);
                            switch (_charasPhase) {
                                case "out":
                                    api.start(createStyle(style_op0, {
                                        onRest: () => {
                                            setPhase("done");
                                            check();
                                        }
                                    }));
                                    return;
                                case "change":
                                    // console.log("change!");
                                    cs_api.start(createStyle(style_op0, {
                                        onRest: () => {
                                            setPhase("done");
                                            check();
                                        }
                                    }));
                                    return;
                                case "in":
                                    api.start(createStyle(style_op1, {
                                        onRest: () => {
                                            setPhase("done");
                                            check();
                                        }
                                    }));
                                    return;
                                case "move":
                                    api.start(createStyle(style_TFTL1, QStyle.CFG_AQ, {
                                        onRest: () =>
                                            api.start(createStyle(style_TFTL0, {
                                                onRest: () => {
                                                    setPhase("done");
                                                    check();
                                                }
                                            }))
                                    }));
                                    return;
                                default:
                                    break;
                            }
                        }
                    }
        }, [phase, _charasPhase, _mainPhase]);
        return (
            <animated.div className={`charaBox ${dat.position}`} style={style}>
                <animated.img style={
                    (last && _charasPhase == "change" && nextPhase["change"]) ?
                        { opacity: changeStyle.opacity.to(e => 1.0 / (8 * e - 8.9) + 1 + 1 / 8.9) } : {}}
                    className='chara' src={getCharaPicSrc(charaId, dat.style)} />
                {(last && _charasPhase == "change" && nextPhase["change"])
                    && <animated.img style={changeStyle} className='chara last' src={getCharaPicSrc(charaId, last.style)} />}
            </animated.div>
        )
    }
    let toNextCharasActionPhase = (phase) => { };
    function getToNextCharasActionPhase(phaseSetter, phaseList) {
        if (phaseList.length == 0) return () => { phaseSetter("done") };
        return function (phase) {
            if (!phase) {
                console.log("setnca", phaseList[0]);
                phaseSetter(phaseList[0]);
                return;
            }
            let index = phaseList.indexOf(phase);
            let nextPhase = index + 1 < phaseList.length ? phaseList[index + 1] : "done";
            console.log("setnca", nextPhase);
            phaseSetter(nextPhase);
        }
    }
    return function Charas({ nowCharas, lastCharas, charasPhase, setCharasPhase }) {
        console.log(nowCharas, lastCharas, charasPhase)
        useEffect(() => {
            console.log("charascharaActionsPhase", charasPhase, _mainPhase);
            switch (charasPhase) {
                case "waiting":
                    // ps_api.set(fullStyle);
                    _mainPhase == "chara" && (() => {
                        charaPhase.now = {};
                        charaPhase.next = {};
                        let activeAction = {};
                        Object.keys(nowCharas).forEach((name) => {
                            let anyAction = false;
                            setCharaPhaseNext(name);
                            for (let action of charaActions) {
                                if (nowCharas[name][action]) {
                                    activeAction[action] = true;
                                    !anyAction && (anyAction = true);
                                    setCharaPhaseNext(name, action);
                                }
                            }
                            console.log(nowCharas)
                            setCharaPhaseNow(name, anyAction ? "waiting" : "done");
                        });
                        // console.log("ac1", charaActions.filter(e => activeAction[e]))
                        toNextCharasActionPhase = getToNextCharasActionPhase(setCharasPhase, charaActions.filter(e => activeAction[e]));
                        setCharasPhase("ready");
                    })();
                    return;
                case "ready":
                    toNextCharasActionPhase();
                    return;
                case "done":
                    // ps_api.set(style_op0);
                    // _mainPhase = "text";
                    console.log(_mainPhase);
                    _mainPhase == "chara" && _mainPhaseGO();
                    return;
            }

        }, [charasPhase, _mainPhase])
        // console.log(nowPlace, lastPlace, (lastPlace != nowPlace), placePhase)
        const showNow = ["change", "in", "move", "done"].some(phase => charasPhase == phase), showLast = !showNow;
        // console.log(nowCharas, lastCharas,charasPhase,showNow);
        return <>
            {/* {nowPlace && <animated.div className='placeBox'>
                <img className='place' src={getFileSrc(nowPlace)}></img>
            </animated.div>} */}
            {(nowCharas && showNow) && <>
                {Object.keys(nowCharas).map((charaId, i) =>
                    <Chara charaId={charaId} now={nowCharas[charaId]} last={lastCharas[charaId]} isNow={true}
                        phase={charaPhase.now[charaId]} setPhase={(p) => setCharaPhaseNow(charaId, p)}
                        nextPhase={charaPhase.next[charaId]} toNextCharasActionPhase={() => toNextCharasActionPhase(charasPhase)} key={i}></Chara>)}
            </>
            }
            {(lastCharas && showLast) && <>
                {Object.keys(lastCharas).map((charaId, i) =>
                    <Chara charaId={charaId} now={nowCharas[charaId]} last={lastCharas[charaId]} isLast={true}
                        phase={charaPhase.now[charaId]} setPhase={(p) => setCharaPhaseNow(charaId, p)}
                        nextPhase={charaPhase.next[charaId]} toNextCharasActionPhase={() => toNextCharasActionPhase(charasPhase)} key={i}></Chara>)}
            </>
            }
            {/* {(lastPlace && (lastPlace != nowPlace)) &&
                <animated.div className='placeBox last' style={placeStyle}>
                    <img className='place' src={getFileSrc(lastPlace)} ></img>
                </animated.div>} */}
        </>
    }
}
const Charas = getCharas();
let historySentence = [];
let autoPlayTimeout = null;
function MainP(props) {
    const { pageAction: action, pageState } = useContext(pageContext);
    const { book: nowBook, story: nowStory, sentence: nowSentence } = action.getNow();
    const [lastSentence, setLastSentence] = useState({
        charaName: "",
        text: "",
        place: null,
        CG: null,
        CG_transform: null,
        sound: null,
        charas: {
            // "li": {
            //     //chara-state
            //     in: null,
            //     out: null,
            //     move: null,
            // },
        },
        style: "",
        options: undefined
        // :[
        //     {
        //         text: "sentaku_A",
        //         to: "1-2",
        //         jump: "10001",
        //     },
        //     {
        //         text: "sentaku_B",
        //         to: "1-3",
        //         jump: "20001",
        //     },
        // ]
    });
    const [nextText, setNextText] = useState("");
    const [textPhase, setTextPhase] = useState("done");
    const [placePhase, setPlacePhase] = useState("done");
    const [CGPhase, setCGPhase] = useState("done");
    const [charasPhase, setCharasPhase] = useState("done");
    const [mainPhase, setMainPhase] = useState("waiting");
    const [newSentenceActiveFlag, setFlag] = useState(false);
    const [historyView, setHistoryView] = useState(false);
    const [getNewSentenceIsNext, setIsNext] = ((e) => [() => e.current, (value) => e.current = value])(useRef());
    const [coverData, setCoverData] = useState({ active: false });
    const [coverStyle, cs_api] = useSpring(() => createStyle(QStyle.OP_0, QStyle.CFG_ALQ));
    const [choiceStyle, chs_api] = useSpring(() => createStyle(QStyle.OP_0, QStyle.CFG_ALQ));
    const [choiceState, setChoiceState] = useState({ state: null });
    useEffect(() => {
        if (coverData.active) {
            cs_api.start(createStyle(QStyle.OP_1, {
                onRest: () => {
                    if (coverData.mission) {
                        coverData.mission();
                        delete coverData.mission;
                    }
                    coverData.notOut ? setTimeout(() => {
                        if (coverData.onRest) {
                            coverData.onRest();
                            delete coverData.onRest;
                        }
                    }, coverData.timeout ?? 2000)
                        : setTimeout(() => cs_api.start(createStyle(QStyle.OP_0, {
                            onRest: () => {
                                if (coverData.onRest) {
                                    coverData.onRest();
                                    delete coverData.onRest;
                                }
                                setCoverData({ active: false });
                            }
                        })), coverData.timeout ?? 2000);
                }
            }));
        }
    }, [coverData]);
    useEffect(() => {
        setLastSentence({
            ...nowSentence,
            ...{
                charaName: "",
                text: "",
                charas: {},
                options: undefined
            }
        });
        historySentence = [];
    }, [nowStory])
    useEffect(() => {
        console.log("sentence_", lastSentence, nowSentence, getNewSentenceIsNext());
        if (!getNewSentenceIsNext()) {
            setLastSentence({
                ...nowSentence,
                ...{
                    charaName: "",
                    text: "",
                    charas: (() => {
                        const newCharas = {};
                        Object.keys(nowSentence.charas ?? {}).filter((charaId) => {
                            return !(nowSentence.charas[charaId].in && !nowSentence.charas[charaId].out);
                        })
                            .forEach((charaId) => (newCharas[charaId] = {
                                ...nowSentence.charas[charaId],
                                in: null,
                                out: null,
                                move: null
                            }))
                        console.log(newCharas)
                        return newCharas;
                    })(),
                    options: undefined
                }
            });
        }
        setIsNext(false);
        const mainPhaseList = [];
        let mainStep = 0;
        _mainPhaseGO = function () {
            console.log(mainStep, mainPhaseList.length, mainPhaseList[mainStep], "mainPhase")
            if (mainStep >= mainPhaseList.length) return;
            setMainPhase(_mainPhase = mainPhaseList[mainStep++]);
        };
        if (lastSentence.place != nowSentence.place) {
            setPlacePhase("waiting");
            mainPhaseList.push("place");
        }
        if (lastSentence.CG != nowSentence.CG) {
            setCGPhase("waiting");
            mainPhaseList.push("CG");
        }
        if (nowSentence.charas_change || !getNewSentenceIsNext()) {
            setCharasPhase(_charasPhase = "waiting");
            mainPhaseList.push("chara");
        }
        if (nowSentence.BGM != pageState.nowSound.BGM.audioFileKey) {
            action.setBGM(nowSentence.BGM);
        }
        setNextText(nowSentence.text ?? "");
        setTextPhase("waiting");
        mainPhaseList.push("text");
        mainPhaseList.push("done");
        setFlag(true);
        console.log(mainPhaseList, "go!", pageState.loadPhase);
        if (pageState.loadPhase) {
            setTimeout(() => {
                _mainPhaseGO();
            }, 2500);
            // 加载后等候
        }
        else _mainPhaseGO();
        if (!nowSentence.options) setChoiceState({ state: null });
    }, [nowSentence]);
    useEffect(() => {
        if (mainPhase == "done") {
            setLastSentence(nowSentence);
            const old_readStory = globalSave.readStory;
            !old_readStory.some(e => e == nowStory.id) && DBput("global", { key: "readStory", value: globalSave.readStory = [...old_readStory, nowStory.id] });
            // console.log(lastSentence, nowSentence,6666);
            setFlag(false);
            if (nowSentence.options && !choiceState.state) {
                setChoiceState({ state: "in" });
            };
            if (autoPlay) {
                doAutoPlay();
            }
        }
    }, [mainPhase]);
    useEffect(() => {
        if (choiceState.state == "in") {
            if (autoPlay) {
                choiceState.autoPlay = true;
                setAutoPlay(false);
            }
            chs_api.start(createStyle(QStyle.OP_1, { onRest: () => setChoiceState({ ...choiceState, state: "wait" }) }));
        }
        else if (choiceState.state == "out") {
            choiceState.autoPlay && setAutoPlay(true);
            chs_api.start(createStyle(QStyle.OP_0, QStyle.CFG_AQ, { onRest: () => ((choiceState.onRest ?? (() => { }))(), setChoiceState({ state: null })) }));
        }
        else if (choiceState.state == null) {
            chs_api.set(createStyle(QStyle.OP_0));
        }
    }, [choiceState.state])
    const [autoPlay, setAutoPlay] = useState(false);
    useEffect(() => { autoPlay ? mainPhase=="done"&&doAutoPlay() : stopAutoPlay(); }, [autoPlay]);
    const toNextSentence = useCallback(
        (() => {
            console.log("textPhase", textPhase, { placePhase, CGPhase })
            if (textPhase == "done" && placePhase == "done" && CGPhase == "done") {
                const flag = action.toNextSentence();
                if (flag === true) {
                    historySentence.push(action.getNow().sentence);
                    console.log('history', historySentence);
                    // player.setVolume(pageState.options.volume_ALL * pageState.options.volume_effect);
                    player.play('https://chong-chan.cn/resource/extra_test_active/default/02510.ogg');
                    setIsNext(true);
                }
                else if (flag.end) {
                    setCoverData({
                        active: true,
                        onRest: () => action.setActivePage("home"),
                        text: flag.end,
                        notOut: true,
                        timeout: 5000
                    });
                }
            }
            else {
                if (textPhase == "pushing") {
                    setTextPhase("done");
                }
                if (placePhase == "pushing") {
                    setPlacePhase("done");
                }
                if (CGPhase == "pushing") {
                    setCGPhase("done");
                }
            }
            stopAutoPlay();
        })
        , [textPhase, placePhase, CGPhase, autoPlay])

    const [doAutoPlay, stopAutoPlay] = ((e) => [
        () => {
            const timeout =getOptions()["text_autoSpeed"] * (200 + 8 * nowSentence.text.length);
            e.current && clearTimeout(e.current); e.current = setTimeout(() => {
                toNextSentence();
                e.current = null;
            }, timeout);
        },
        () => { e.current && clearTimeout(e.current); e.current = null; }
    ])(useRef(null));
    const getTextBar = useCallback(
        (() => (
            <div className='textBar'>
                <div className='buttonBar'>
                    <div className='button' onClick={() => {
                        action.callSaveP();
                    }}>
                        {"保存"}
                    </div>
                    <div className='button' onClick={() => {
                        action.callLoadP();
                    }}>
                        {"读取"}
                    </div>
                    <div className='button' onClick={() => {
                        autoPlay && setAutoPlay(false);
                        action.callOptionsP();
                    }}>
                        {"设置"}
                    </div>
                    <div className='button' onClick={choiceState.state ? () => { } : () => { setAutoPlay(!autoPlay) }} style={autoPlay ? { color: "red" } : {}}>
                        {/* {"auto"} */}
                        {"自动"}
                    </div>
                    <div className='button' onClick={() => setHistoryView(true)}>
                        {"历史"}
                        {/* {"history"} */}
                    </div>
                </div>
                <div className='charaName'>{nowSentence.charaName}</div>
                <LiuText
                    nextText={nextText} setNextText={setNextText}
                    textPhase={textPhase} setTextPhase={setTextPhase}
                    playVoice={nowSentence.voice && (() => action.setVoice(nowSentence.voice))}
                    onClick={nowSentence.options ? () => { } : () => toNextSentence()} />
            </div>
        )),
        [nextText, textPhase, nowSentence.charaName, autoPlay]
    )
    return (
        ((nowSentence) => <div className={"MainP"} onClick={() =>
            player.play('https://chong-chan.cn/resource/extra_test_active/default/02510.ogg')}>
            {<PlaceBox
                nowPlace={nowSentence.place} lastPlace={lastSentence.place}
                placePhase={placePhase} setPlacePhase={setPlacePhase}
            />}
            {<Charas
                nowCharas={nowSentence.charas ?? {}} lastCharas={lastSentence.charas ?? {}}
                charasPhase={charasPhase} setCharasPhase={(cp) => setCharasPhase(_charasPhase = cp)}
            />}
            {<CGBox
                nowCG={nowSentence.CG} lastCG={lastSentence.CG}
                CGPhase={CGPhase} setCGPhase={setCGPhase}
            />}
            {getTextBar()}
            {choiceState.state &&
                <animated.div className={`choice ${choiceState.state}`} style={choiceStyle}>
                    <div className='optionList'>
                        {nowSentence.options.map((e, i) => <div className={`option`}
                            onClick={choiceState.state != "wait" ? () => { } : () => {
                                setChoiceState({
                                    ...choiceState,
                                    state: "out",
                                    onRest: () => {
                                        e.to ? action.setTo(e.to) : action.setTo(null);
                                        e.jump ? action.setNext(undefined, undefined, e.jump) : toNextSentence();
                                    }
                                })
                            }} key={i}>{e.text}</div>)}
                    </div>
                </animated.div>}
            {historyView &&
                <div className='historyView'>
                    <div className='historyList'>
                        {historySentence.map((e, i) => (<div className='historySentence' key={i}>
                            <div className='charaName'>{e.charaName}</div>
                            <div className='text'>{e.text}</div>
                            <div className='go' onClick={() => {
                                setCoverData({
                                    active: true,
                                    mission: () => {
                                        historySentence.splice(i);
                                        action.setNext(undefined, undefined, e.id);
                                        setHistoryView(false);
                                    }
                                });
                            }}>⬅跳转</div>
                        </div>))
                        }</div>
                    <div className='fixed-buttons-bar'>
                        <div className='close' onClick={() => setHistoryView(false)}></div>
                    </div>
                </div>}
            {coverData.active && <animated.div className="cover" style={coverStyle}>
                {coverData.text ?? ""}
            </animated.div>}
            {/* {<div className='testBar'>
                <div className='testButton' onClick={() => action.setActivePage("home")}>go Home</div>\
            </div>} */}
            {/* {<div className='testBar'>
                {test.map((e, i) => <div className='testButton' onClick={() => action.setNext(...e)} key={i}>测试{i} {JSON.stringify(e)}</div>)}
                {<div className='testButton' onClick={toNextSentence}>go</div>}
                <div className='testText'>{JSON.stringify(pageState.now)}{nowSentence.charaName} {nowSentence.text}</div>
                <div className='testText'>{JSON.stringify(nowSentence)}</div>
                {nowSentence.options && nowSentence.options.map((e, i) => <div className='testButton'
                    onClick={() => {
                        e.to && action.setTo(e.to);
                        e.jump ? action.setNext(undefined, undefined, e.jump) : toNextSentence.current();
                    }} key={i}>{JSON.stringify(e)}</div>)}
            </div>} */}
        </div>)(newSentenceActiveFlag ? nowSentence : lastSentence)
    )
}

export default MainP