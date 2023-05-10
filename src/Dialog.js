import React, { useState, useEffect, useRef, useContext } from 'react'
import './Dialog.css'
import { pageContext } from './App';
import { wait } from './data/extra-test-data';
let closing = null;
function Dialog({ dialogData }) {
    const { pageAction: action, pageState } = useContext(pageContext);
    const { text, title, buttons } = dialogData;
    const [displayState, setDisplayState] = useState("in");
    useEffect(() => {
        closing && (clearTimeout(closing), closing = null);
        displayState == "out" && (closing = setTimeout(() => (action.callDialog(null),clearTimeout(closing)), 200));
    }, [displayState])
    // debugger;

    return <div className={`dialog ${displayState=="out"?"out":""}`}>
        <div className='dialog-inner'>
            <div className='header'>
                {title}
            </div>
            <div className='body' key={text}>
                <div className='text'>
                    {text.split('\n').map((e, i) => <p key={i}>{e}</p>)}
                </div>
                <div className='button-list'>
                    {buttons && buttons.map(({ ch, fun, style, notClose }, i) => {
                        return <div key={i} className={`dialog-button ${style}`} onClick={displayState == "out" ? ()=>{} : () => {
                            const fn = fun ? fun() : undefined;
                            !notClose && (fn?.then ?
                                fn.then(() => setDisplayState("out"))
                                : setDisplayState("out"));
                        }}>{ch}</div>
                    })}
                </div>
            </div>
            {/* <div className='close' onClick={displayState == "out" ? ()=>{} : () => action.callDialog(null)}></div> */}
        </div>
    </div>
}
export default Dialog;