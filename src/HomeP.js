import React, { useState, useEffect, useContext } from 'react'
import { resource_base_path, sample1 } from "./data/test-data.js"
import { createStyle, QStyle } from './data/spring.js'
import { useSpring, animated, config } from 'react-spring'
import { pageContext } from './App.js'
function HomeP(props) {
    const { pageAction: action } = useContext(pageContext);
    const story1 = sample1.Book.data['1-1'];
    const story2 = sample1.Book.data['1-2'];
    const story3 = sample1.Book.data['1-3'];
    function loadStroy(story) {
        action.load(story.preload, story.title, story.tips);
    }
    return (
        <animated.div className={"homeP"}>
            <div onClick={() => loadStroy(story1)}>{"story1"}</div>
            <div onClick={() => loadStroy(story2)}>{"story2"}</div>
            <div onClick={() => loadStroy(story3)}>{"story3"}</div>
        </animated.div>
    )
}

export default HomeP