import React, { useState, useEffect, useRef, useContext, useCallback } from 'react'
import { classNames, options_Group, options_List, pageContext } from './App';
import './OptionsP.css'
const sc = ((t) => {
    let timeout = null;
    return (fn) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
            fn();
            timeout = null;
        }, t);
    }
})(40)
let closing = null;
function OptionsP() {
    const { pageAction: action, pageState } = useContext(pageContext);
    const [nowGroup, setNowGroup] = useState(Object.keys(options_Group)[0])
    const Options = pageState.options;
    const [displayState, setDisplayState] = useState("in");
    useEffect(() => {
        closing && (clearTimeout(closing), closing = null);
        displayState == "in" && setTimeout(() => setDisplayState("default"), 200);
        displayState == "out" && (closing = setTimeout(() => (action.setCoverPage(null), clearTimeout(closing)), 200));
    }, [displayState])
    useEffect(() => { return () => action.updateOptions({}, true); }, [])
    return <div className={classNames("OptionsP", displayState == "out" && "out")}
        onClickCapture={(e) => displayState != "default" && e.stopPropagation()}>
        <div className='title'>{"设置"}</div>
        <div className='menu'>
            {Object.entries(options_Group).map(([k, v]) => {
                return <a key={k} onClick={()=>document.getElementById(k).scrollIntoView()}>
                    <div className={classNames("group", nowGroup == k && "active")}>{v.ch}</div>
                </a>
            })}
        </div>
        <div className='options-list' onScroll={(e) => {
            const currentTarget = e.currentTarget;
            sc(() => {
                const parentPositionY = e.target.getBoundingClientRect().top;
                const parentHeight = e.target.offsetHeight;
                const children = Array.from(currentTarget.childNodes).filter(e => e.className == "group").map(e => {
                    const childPositionY = e.getBoundingClientRect().top - parentPositionY;
                    return { id: e.id, position: [childPositionY, childPositionY + e.offsetHeight] }
                });
                const line = parentHeight * (children[0].position[0] / (children[0].position[0] - children[children.length - 1].position[1] + parentHeight)).toFixed(2)
                    ?? (parentHeight / 2);
                const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
                const newGroup = children.find(({ id, position: [top, bottom] }) =>
                    top - .25 * rem <= line && bottom + .25 * rem >= line
                )?.id;
                if (!newGroup) debugger;
                (newGroup != nowGroup) && setNowGroup(newGroup);
            })
        }}>
            {Object.entries(options_Group).map(([k, v]) => {
                return <div className={`group`} key={k} id={k}>
                    <div className={`group-ch`}>{v.ch}</div>
                    {v.data.map(([name, ch, defaultValue, props]) => {
                        return <div className={`option-item`} key={name}>
                            <div className='ch'>{ch}</div>
                            {props.icon && <div className={classNames("icon", props.icon)}></div>}
                            {props.type == "range" &&
                                <input type={props.type} min={props.min} max={props.max} step={props.step ?? ((props.max - props.min) / 10)} value={Options[name]}
                                    onChange={(e) => {
                                        const newOption = {};
                                        Options[name] = newOption[name] = e.target.value;
                                        action.updateOptions(newOption);
                                    }}></input>}
                            {<div className='value'>{Options[name]}</div>}
                        </div>
                    })}
                </div>
            })}
        </div>
        <div className='fixed-buttons-bar'>
            <div className='close' onClickCapture={() => setDisplayState("out")}></div>
            {pageState.activePage != "home" &&
                <div className='home'
                    onClickCapture={() => action.setActivePage("home")}></div>}
        </div>
    </div>
}

export default OptionsP;