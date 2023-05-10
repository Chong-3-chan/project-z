import React, { useState, useEffect, useRef, useContext } from 'react'
import { pageContext } from './App';
import './SaveP.css'
import { DBgetAll, DBput } from './tools/IndexedDB-controller';
import { wait } from './data/extra-test-data';
const MAX_SAVE_NUM = 32;
let closing = null;
function SaveP() {
    const { pageAction: action, pageState } = useContext(pageContext);
    const [saveFiles, setSaveFiles] = useState(null);
    const [displayState, setDisplayState] = useState("in");
    useEffect(() => {
        closing && (clearTimeout(closing), closing = null);
        displayState == "out" && (closing = setTimeout(() => (action.setCoverPage(null), clearTimeout(closing)), 200));
    }, [displayState])
    const [newSave] = ((e) => [e.current])(useRef(action.getSave(null)));
    useEffect(() => {
        saveFiles === null && DBgetAll("save").then(e => {
            setSaveFiles(e);
        })
    }, [saveFiles])
    return saveFiles && <div className={`SaveP ${displayState == "out" ? "out" : ""}`}>
        <div className='newSave'>
            <div className='text'>{"新存档！"}</div>
            <div className='saveFile'>
                {<div className='id'>
                    {"NEW"}
                </div>}
                <div className='head'>新存档</div>
                <div className='text'>{newSave.text}</div>
                <div className='time'>{(new Date(newSave.time)).toLocaleString()}</div>
            </div>
            <div className='text'>{"在右侧选择存档栏位..."}</div>
        </div>
        <div className='saveFile-list'>
            {(() => {
                const list = new Array(MAX_SAVE_NUM).fill(undefined);
                saveFiles.forEach(e => {
                    list[e.id] = e;
                });
                console.log(list, saveFiles)
                return list.map((e, i) => <div key={e?.time ?? i} className='saveFile' onClick={displayState == "out" ? () => { } : () => {
                    function putNewSave() {
                        action.callDialog({
                            title: "",
                            text: "马上就好！"
                        })
                        return Promise.allSettled([wait(1500), DBput("save", { ...newSave, id: i })])
                            .then(() => action.callDialog({
                                title: "",
                                text: "存档完成",
                                buttons: [{
                                    ch: "确定",
                                    style: "yellow",
                                    fun: () =>
                                        DBgetAll("save").then(e => {
                                            setSaveFiles(e);
                                        })
                                }]
                            }))
                    }
                    if (e) {
                        action.callDialog({
                            title: "覆盖存档",
                            text: `确定要将新存档覆盖 存档${e.id} 吗？`,
                            buttons: [
                                {
                                    ch: "确定",
                                    style: "green",
                                    fun: () => putNewSave(),
                                    notClose: true
                                },
                                {

                                    ch: "取消",
                                    style: "red",
                                    fun: null
                                }
                            ]
                        });
                    }
                    else {
                        action.callDialog({
                            title: "新存档",
                            text: `确定要将新存档保存为 存档${i} 吗？`,
                            buttons: [
                                {
                                    ch: "确定",
                                    style: "green",
                                    fun: () => putNewSave(),
                                    notClose: true
                                },
                                {

                                    ch: "取消",
                                    style: "red",
                                    fun: null
                                }
                            ]
                        });
                    }
                }}>
                    {<div className='id'>
                        {i}
                    </div>}
                    {e === undefined ? <div className='empty'>{`<空>`}</div> :
                        <>
                            <div className='head'>存档{e.id}</div>
                            <div className='text'>{e.text}</div>
                            <div className='time'>{(new Date(e.time)).toLocaleString()}</div>
                        </>
                    }</div>)
            })()}
        </div>
        {/* {saveFiles.map(({ id, text, time }, i) => <div className='saveFile' key={id} onClick={displayState == "out" ? ()=>{} : () => action.loadSave(saveFiles[i])} >
            <div>存档{id}</div>
            <div>{text}</div>
            <div>{(new Date(time)).toLocaleString()}</div>
        </div>)} */}

        <div className='fixed-buttons-bar'>
            <div className='close' onClick={displayState == "out" ? () => { } : () => setDisplayState("out")}></div>
        </div>
    </div>
}

export default SaveP;