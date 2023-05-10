import React, { useState, useEffect, useRef, useContext } from 'react'
import { pageContext } from './App';
import './LoadP.css'
import { DBgetAll } from './tools/IndexedDB-controller';
let closing = null;
function LoadP() {
    const { pageAction: action, pageState } = useContext(pageContext);
    // const [getSaveFiles, setSaveFiles] = ((e) => [() => e.current, (value) => e.current = value])(useRef(null));
    const [saveFiles, setSaveFiles] = useState(null);
    const [displayState, setDisplayState] = useState("in");
    useEffect(() => {
        closing && (clearTimeout(closing), closing = null);
        displayState == "out" && (closing = setTimeout(() => (action.setCoverPage(null),clearTimeout(closing)), 200));
    }, [displayState])
    useEffect(() => {
        saveFiles === null && DBgetAll("save").then(e => {
            setSaveFiles(e);
            // debugger;
        })
    }, [saveFiles])
    return saveFiles && <div className={`LoadP ${displayState=="out"?"out":""}`}>
        <div className='saveFile-list'>
            {saveFiles.map(({ id, text, time }, i) => <div className='saveFile' key={id} onClick={displayState == "out" ? ()=>{} : () =>
                pageState.activePage == "main" ? action.callDialog({
                    title: "读取存档",
                    text: `读取存档会丢失当前未保存的进度！\n确认读取 ${"存档" + id} 吗?`,
                    buttons: [
                        {
                            ch: "读取",
                            style: "green",
                            fun: () => {
                                if(pageState.activePage != "main")action.setActivePage("main");
                                return action.loadSave(saveFiles[i]);
                            }
                        },
                        {
                            ch: "不",
                            style: "red",
                            fun: null
                        }
                    ]
                }) : (()=>{
                    if(pageState.activePage != "main")action.setActivePage("main");
                    action.loadSave(saveFiles[i])
                })()
            } >
                <div className='head'>存档{id}</div>
                <div className='text'>{text}</div>
                <div className='time'>{(new Date(time)).toLocaleString()}</div>
            </div>)}
        </div>
        
        <div className='fixed-buttons-bar'>
        <div className='close' onClick={displayState == "out" ? ()=>{} : () => setDisplayState("out")}></div>
        </div>
    </div>
}

export default LoadP;