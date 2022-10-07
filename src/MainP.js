import React, { useState, useEffect, useContext, useRef } from 'react'
import { getFileSrc } from "./data/test-data.js"
import { createStyle, QStyle } from './data/spring.js'
import { useSpring, animated, config } from 'react-spring'
import { pageContext } from './App.js'
import './MainP.css'
const test = [["Book1"], ["Book1", "1-1", "00002"], [undefined, "1-3"], [undefined, "1-2"], [undefined, undefined, "00000"]];
let liuId = null;
function liu(str, delay = 100, setter, callback) {
    let liu_str = "";
    const endLiu = () => {
        if (liuId === null) return;
        clearInterval(liuId);
        console.log("endLiu", liuId);
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
    return function LiuText(props) {
        const { nextText, setNextText, textPhase, setTextPhase } = props;
        const [text, setText] = useState("");
        useEffect(() => {
            console.log("text:", textPhase, nextText);
            switch (textPhase) {
                case "waiting":
                    nextText && setTextPhase("ready");
                    return;
                case "ready":
                    setText("");
                    endTextPushing = liu(nextText, undefined, setText,
                        () => {
                            console.log("endTextPushing");
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
                    return;
            }
        }, [nextText, textPhase]);
        return <div className='text'>{text}</div>;
    }
}
const LiuText = getLiuText();
function MainP(props) {
    const { pageAction: action, pageState } = useContext(pageContext);
    const { book: nowBook, story: nowStory, sentence: nowSentence } = action.getNow();
    const [lastSentence, setLastSentence] = useState(nowSentence);
    const [nextText, setNextText] = useState(null);
    const [textPhase, setTextPhase] = useState("waiting");
    useEffect(() => {
        console.log(lastSentence, nowSentence);
        setNextText(nowSentence.text);
        setTextPhase("waiting");
        // do sth
        setLastSentence(nowSentence);
    }, [nowSentence]);
    const [placeStyle, ps_api] = useSpring(() => ({}));
    // const buttons = [["auto","switch",[()=>{},()=>{}]]];
    const toNextSentence = () => {
        console.log(textPhase)
        if (textPhase == "done") {
            action.toNextSentence();
        }
        else if (textPhase == "pushing") {
            setTextPhase("done");
        }
    };
    return (
        <animated.div className={"MainP"}>
            {<div className='placeBox'>
                <img className='place' src={getFileSrc(nowSentence.place)}></img>
            </div>}
            {<div className='textBar' onClick={toNextSentence}>
                <div className='charaName'>{nowSentence.charaName}</div>
                <LiuText
                    nextText={nextText} setNextText={setNextText}
                    textPhase={textPhase} setTextPhase={setTextPhase} />
                {/* {<div className='text'>{text}</div>} */}
                {/* {<Liu_text text={nowSentence.text} phase={textPhase} setPhase={setTextPhase}></Liu_text>} */}
                <div className='buttonBar'>
                    <div className='button'>{"auto"}</div>
                    <div className='button'>{"history"}</div>
                </div>
            </div>}
            {nowSentence.options &&
                <div className='choice'>
                    <div className='optionList'>
                        {nowSentence.options.map((e, i) => <div className='option'
                            onClick={() => {
                                e.to && action.setTo(e.to);
                                e.jump ? action.setNext(undefined, undefined, e.jump) : toNextSentence.current();
                            }} key={i}>{e.text}</div>)}
                    </div>
                </div>}

            {<div className='testBar'>
                {test.map((e, i) => <div className='testButton' onClick={() => action.setNext(...e)} key={i}>测试{i} {JSON.stringify(e)}</div>)}
                <div className='testButton' onClick={() => action.setActivePage("home")}>go Home</div>
                {<div className='testButton' onClick={toNextSentence}>go</div>}
                <div className='testText'>{JSON.stringify(pageState.now)}{nowSentence.charaName} {nowSentence.text}</div>
                <div className='testText'>{JSON.stringify(nowSentence)}</div>
                {nowSentence.options && nowSentence.options.map((e, i) => <div className='testButton'
                    onClick={() => {
                        e.to && action.setTo(e.to);
                        e.jump ? action.setNext(undefined, undefined, e.jump) : toNextSentence.current();
                    }} key={i}>{JSON.stringify(e)}</div>)}
            </div>}

        </animated.div>
    )
}

export default MainP