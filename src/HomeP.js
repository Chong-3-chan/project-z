import React, { useState, useEffect, useContext } from 'react'
import { getFileSrc } from "./data/extra-test-data.js"
// import { resource_base_path, sample1, preload_group,getFileSrc } from "./data/test-data.js"
import { createStyle, QStyle } from './data/spring.js'
import { useSpring, animated, config } from 'react-spring'
import { pageContext } from './App.js'
import './HomeP.css'
export const homeResource_map = {
    backgroundImageList: [//优先选择最后一个通过check的图片
        { check: [], fileKey: "_H_BG_0" },
        { check: ["1_0"], fileKey: "_H_BG_1" },
    ],
    backgroundImage:"_H_BG_1"
}
function HomeP(props) {
    const { pageAction: action, pageState } = useContext(pageContext);
    const { book: nowBook, story: nowStory, sentence: nowSentence } = action.getNow();
    return (
        <div className={"HomeP"} style={{ backgroundImage: `url(${getFileSrc(homeResource_map.backgroundImage)})` }}>
            <div className='title'>书书书书书书</div>
            <div className='menu'>
                {<div className='menu-item' onClick={() => action.setActivePage("main")}>新的开始</div>}
                {<div className='menu-item' onClick={() => action.setCoverPage("load")}>读取存档</div>}
                {<div className='menu-item' onClick={() => action.setActivePage("information")}>档案</div>}
                {<div className='menu-item' onClick={() => { }}>音乐鉴赏</div>}
                {<div className='menu-item' onClick={() => action.setCoverPage("options")}>系统设置</div>}
                {<div className='menu-item' onClick={() => window.close()}>退出游戏</div>}
            </div>
            <div className='logo'>@logo</div>
        </div>
    )
}

export default HomeP