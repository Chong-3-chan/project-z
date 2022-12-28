import React, { useState, useEffect, useContext } from 'react'
import { getFileSrc } from "./data/extra-test-data.js"
// import { resource_base_path, sample1, preload_group,getFileSrc } from "./data/test-data.js"
import { createStyle, QStyle } from './data/spring.js'
import { useSpring, animated, config } from 'react-spring'
import { pageContext } from './App.js'
function HomeP(props) {
    const { pageAction: action, pageState } = useContext(pageContext);
    const { book: nowBook, story: nowStory, sentence: nowSentence } = action.getNow();
    return (
        <animated.div className={"HomeP"} style={{ backgroundImage: `url(${getFileSrc("_H_BG_WATER")})` }}>
            {<div className='testButton' onClick={() => action.setActivePage("main")}></div>}
        </animated.div>
    )
}

export default HomeP