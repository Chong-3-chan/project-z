import React, { useState, useEffect, useContext } from 'react'
import { resource_base_path, sample1 } from "./data/test-data.js"
import { createStyle, QStyle } from './data/spring.js'
import { useSpring, animated, config } from 'react-spring'
import { pageContext } from './App.js'
function MainP(props) {
    const { pageAction: action, pageState } = useContext(pageContext);
    const { book: nowBook, story: nowStory, sentence: nowSentence } = action.getNow();
    const test = [["Book1"], ["Book1", "1-1", "00002"], [undefined, "1-3"], [undefined, "1-2"], [undefined, undefined, "00000"]];
    // const [a,sa]=useState(1);
    // const [b,sb]=useState(a+1);
    // useEffect(() => {
    //     console.log(a, b)
    // })
    return (
        <animated.div className={"MainP"}>
            {test.map((e,i)=><div className='testButton' onClick={()=>action.setNext(...e)} key={i}>测试{i} {JSON.stringify(e)}</div>)}
            {<div className='testButton' onClick={()=>action.toNextSentence()}>go</div>}
            <div className='testText'>{JSON.stringify(pageState.now)}{nowSentence.charaName} {nowSentence.text}</div>
            <div className='testText'>{JSON.stringify(nowSentence)}</div>
            {nowSentence.options && nowSentence.options.map((e,i)=><div className='testButton' onClick={()=>action.setTo(e.to)} key={i}>{JSON.stringify(e)}</div>)}
            {/* <div onClick={() => action.setNow(undefined, "1-2")}>{"story1"}</div>
            <div onClick={() => action.setNow(undefined, "1-3")}>{"story2"}</div>
            <div onClick={() => action.setNow("Book1", "1-1", "00001")}>{"story3"}</div>
            <div onClick={() => action.setNow("Book1")}>{"Book1"}</div> */}
            {/* <div onClick={() => {sa(a+1);sb(b+a);}}>{"story3"}</div> */}
        </animated.div>
    )
}

export default MainP