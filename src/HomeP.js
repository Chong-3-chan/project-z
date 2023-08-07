import React, { useState, useEffect, useContext } from 'react'
import { BOOK, bookIds, file_map, getFileSrc } from "./data/extra-test-data.js"
// import { resource_base_path, sample1, preload_group,getFileSrc } from "./data/test-data.js"
import { createStyle, QStyle } from './data/spring.js'
import { useSpring, animated, config } from 'react-spring'
import { pageContext } from './App.js'
import './HomeP.css'
import { globalSave } from './main.js'
export const homeResource_map = {
    BGM: "_H_BGM_0",
    backgroundImageList: [//优先选择最后一个通过check的图片
        { check: { read: [], ended: [] }, fileKey: "看看_4" },
        { check: { read: [], ended: ["Book1/0_0"] }, fileKey: "_H_BG_1" },
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
function HomeP(props) {
    const { pageAction: action, pageState } = useContext(pageContext);
    const { book: nowBook, story: nowStory, sentence: nowSentence } = action.getNow();
    // debugger;
    return (
        <div className={"HomeP"} style={{ backgroundImage: `url(${getFileSrc(homeResource_map.backgroundImage)})` }}>
            {!homeResource_map.elements.title.fileKey && <div className='title'>{homeResource_map.elements.title.text}</div>}
            <div className='title'>
                <img src={getFileSrc(homeResource_map.elements.title.fileKey)} />
            </div>
            <div className='menu'>
                {/* {<div className='menu-item' onClick={() => action.setActivePage("main",{bookName:bookIds[0]})}>新的开始</div>} */}
                {<div className='menu-item' onClick={() => action.setCoverPage("content")}>新的开始</div>}
                {<div className='menu-item' onClick={() => globalSave.autoSave.nodes && action.loadSave(globalSave.autoSave)}>继续</div>}
                {<div className='menu-item' onClick={() => action.setCoverPage("load")}>读取存档</div>}
                {<div className='menu-item' onClick={() => action.setActivePage("information")}>档案</div>}
                {<div className='menu-item' onClick={() => action.setCoverPage("options")}>系统设置</div>}
                {<div className='menu-item' onClick={() => window.close()}>退出游戏</div>}
            </div>
            {/* <div className='logo'>@logo</div> */}
            <div className='logo'>
                <img src={getFileSrc(homeResource_map.elements.logo.fileKey)} />
            </div>
        </div>
    )
}

export default HomeP