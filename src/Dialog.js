import React, { useState, useEffect, useContext, Fragment, useReducer, useRef } from 'react'
import { file_map, objtovm, s, vmtoobj } from './data/extra-test-data';
import SentenceFunctionInput from './helper/sentence-function-input-helper';
import { classNames, context } from './main';
function Dialog(props) {
    const { data, setState, getState, onClose } = props;
    const { storyTree } = useContext(context);
    const nameList = Object.keys(data).filter(e => data[e]?.type);
    const { title, onSubmit } = data;
    const [getHideFlag, setHideFlag] = ((e) => [() => e.current, (value) => e.current = value])(useRef({}));
    const [getNewIdentifier] = ((e) => [() => e.current++])(useRef(0));
    const [getDeleteForceIdentifier, setDeleteForceIdentifier] = ((e) => [() => e.current, (value) => e.current = value])(useRef(null));
    const [getInsertProps, setInsertProps] = ((e) => [() => e.current, (value) => e.current = value])(useRef({}));
    const [getNewParagraphId, setNewParagraphId] = ((e) => [() => e.current, (value) => e.current = value])(useRef(""));
    const [getParagraphIdentifier, setParagraphIdentifier] = ((e) => [() => e.current, (value) => e.current = value])(useRef({}));

    const [, forceUpdate] = useReducer(e => e + 1, 0);
    console.log(props, 'dialog props', nameList)
    useEffect(() => {
    }, [])
    return <div className="dialog">
        <div className='dialog-inner'>
            <div className='body'>
                <form
                    onSubmit={e => {
                        e.preventDefault();
                        if (!confirm("确认提交吗？")) return false;
                        // console.log(
                        //         Array.from(e.target.childNodes.map(e=>e.childNodes))
                        // )
                        // debugger;
                        // const formData = Object.fromEntries(
                        //     Array.from(e.target.childNodes).map(e => Array.from(e.childNodes)).flat(1)
                        //         .filter(e => Object.keys(data).filter(e => data[e]?.type).includes(e.name ?? e.attributes?.name?.value)).map(e => {
                        //             const tag = e.tagName;
                        //             if (tag == 'INPUT') {
                        //                 switch (e.type) {
                        //                     case "text":
                        //                         return ([e.name, e.value]);
                        //                     case "file":
                        //                         return ([e.name, e.files]);
                        //                     default:
                        //                         throw `未知的input type`
                        //                 }
                        //             }
                        //             else if (tag == 'SELECT') {
                        //                 return ([e.name, e.value]);
                        //             }
                        //             else if (tag == 'DIV') {
                        //                 if (e.attributes.type?.value == "map") {
                        //                     // window.arr = Array.from(e.childNodes);
                        //                     let entries = Array.from(e.getElementsByClassName('key-value'))
                        //                         .map(e => [e.getElementsByClassName('key')[0].value, e.getElementsByClassName('value')[0].value]).
                        //                         filter(e => e[0].length);
                        //                     return [e.attributes.name.value, Object.fromEntries(entries)];
                        //                 }
                        //                 else if (e.attributes.type?.value == "vm") {
                        //                     // debugger;
                        //                     return [e.attributes.name.value, data[e.attributes.name.value].value]
                        //                 }
                        //             }
                        //         })
                        // );
                        // 弃用的方案：从dom节点读取表单
                        const formData = Object.fromEntries(Object.entries(data).filter(([k, v]) => v.type).map(([k, v]) => [k, v.type == "file" ? v.files : v.type == "map" ? Object.fromEntries(v.value) : v.value]));
                        // console.log(formData,data);
                        // debugger;
                        let flag = onSubmit(formData);
                        if (flag) {
                            // debugger;
                            onClose();
                            setState({ ...getState(), active: false });
                        }
                        return flag;
                    }}>
                    {Object.entries(data).map(([name, { type, ch, tips, getOptions, allow_null, disabled, getOptions_key, getOptions_value, getOptions_map }], i) => {
                        switch (type) {
                            case "number":
                                data[name].value ?? (data[name].value = 0);
                                return <div className={"form-item"} key={i}>
                                    <span className='ch'>{ch + ' :'}</span>
                                    {<input name={name} type={type}
                                        value={(data[name].value)}
                                        disabled={disabled}
                                        onChange={(e) => {
                                            data[name].value = e.target.value;
                                            forceUpdate();
                                        }} />}
                                    {tips && <span className='tips'>{tips}</span>}
                                </div>;

                            case "text":
                                data[name].value ?? (data[name].value = '');
                                return <div className={"form-item"} key={i}>
                                    <span className='ch'>{ch + ' :'}</span>
                                    {<input name={name} type={type}
                                        value={(data[name].value)}
                                        disabled={disabled}
                                        onChange={(e) => {
                                            data[name].value = e.target.value;
                                            forceUpdate();
                                        }} />}
                                    {tips && <span className='tips'>{tips}</span>}
                                </div>;

                            case "file":
                                data[name].files ?? (data[name].files = []);
                                return <div className={"form-item"} key={i}>
                                    <span className='ch'>{ch + ' :'}</span>
                                    <input name={name} multiple="multiple" type={type}
                                        onChange={(e) => {
                                            data[name].files.length != 0 && (data[name].files = []);
                                            data[name].files.push(...Array.from(e.target.files).sort(({ name: aname }, { name: bname }) => aname.localeCompare(bname)));
                                            // debugger;
                                            forceUpdate();
                                        }}
                                    />
                                    {tips && <span className='tips'>{tips}</span>}
                                </div>;

                            case "select":
                                const options = getOptions();
                                !allow_null && (data[name].value ?? (data[name].value = options[0][0] ?? ""));
                                return <div className={"form-item"} key={i}>
                                    <span className='ch'>{ch + ' :'}</span>
                                    {<select name={name} onChange={(e) => {
                                        data[name].value = e.target.value;
                                        forceUpdate();
                                    }} value={data[name].value}>
                                        {allow_null && <option key={-1} value={""}></option>}
                                        {options.map(([v, n], ii) => <option key={ii} value={v}>{n ?? v}</option>)}
                                    </select>}
                                    {tips && <span className='tips'>{tips}</span>}
                                </div>;
                            case "map":
                                const [options_key, options_value] = [
                                    getOptions_key instanceof Function ? getOptions_key() : undefined,
                                    getOptions_value instanceof Function ? getOptions_value() : undefined
                                ];
                                return <div className={"form-item_map"} key={i}>
                                    <span className='ch'>{ch + ' :'}</span>
                                    {<div name={name} type={"map"}>
                                        {data[name].value.map(([id, fileKey], i) => <Fragment key={i}>
                                            <div className='key-value' name={i}>
                                                {options_key ?
                                                    <select onChange={(e) => {
                                                        debugger;
                                                        data[name].value[i][0] = e.target.value;
                                                        forceUpdate();
                                                    }} value={data[name].value[i][0]}
                                                        className={`key`}>
                                                        {allow_null && <option key={-1} value={""}></option>}
                                                        {options_key.map(([v, n], ii) => <option key={ii} value={v}>{n ?? v}</option>)}
                                                    </select> :
                                                    <input type={"text"}
                                                        value={(data[name].value[i][0] ?? "")}
                                                        onChange={(e) => {
                                                            data[name].value[i][0] = e.target.value;
                                                            forceUpdate();
                                                        }}
                                                        className={`key`} />}
                                                :
                                                {options_value ?
                                                    <select onChange={(e) => {
                                                        data[name].value[i][1] = e.target.value;
                                                        forceUpdate();
                                                    }} value={data[name].value[i][1]}
                                                        className={`value`}>
                                                        {allow_null && <option key={-1} value={""}></option>}
                                                        {options_value.map(([v, n], ii) => <option key={ii} value={v}>{n ?? v}</option>)}
                                                    </select> :
                                                    <input type={"text"}
                                                        value={(data[name].value[i][1] ?? "")}
                                                        onChange={(e) => {
                                                            data[name].value[i][1] = e.target.value;
                                                            forceUpdate();
                                                        }}
                                                        className={`value`} />}
                                                {<a onClick={() => {
                                                    data[name].value.splice(i, 1);
                                                    forceUpdate();
                                                }}>删除</a>}
                                            </div>
                                        </Fragment>)}
                                        <a onClick={() => {
                                            data[name].value.push([,]);
                                            forceUpdate();
                                        }}>添加</a>
                                    </div>}
                                    {tips && <span className='tips'>{tips}</span>}
                                </div>;
                            case "vm":
                                const vmobj = data[name].value;
                                const options_map = getOptions_map && Object.fromEntries(Object.entries(getOptions_map).map(([k, fn]) => [k, fn()]));

                                return <div className={'form-item_vm'} key={i}>
                                    <div className='ch'>
                                        {({ "STORY": "故事内容", "BOOK": "书内容", "check": "解锁条件" })[vmobj["category"]]}
                                    </div>
                                    <div type={"vm"} name={name}>
                                        {/* vm的头部编辑 */}
                                        {({
                                            "STORY": [
                                                ["category", "类型", "text", true],
                                                ["title", "标题", "text"],
                                                ["to", "默认去向", "select", false, true],
                                                ["style", "style选择", "select", false, true],
                                                ["tips", "tips", "select_m", false],
                                            ], "BOOK": [
                                                ["id", "书名", "text", true],
                                                ["category", "类型", "text", true],
                                                ["cover", "封面", "select", false, true],
                                                ["start", "起始故事", "select", false, true],
                                                ["default_style", "默认style", "select", false],
                                                ["check", "检查", "check", false],
                                            ], "check": [
                                                ["check", "检查", "check", false],
                                            ]
                                        })[vmobj["category"]]
                                            .map(([key, ch, type, disabled, allow_null], i) => {
                                                switch (type) {
                                                    case "text":
                                                        vmobj[key] ?? (vmobj[key] = '');
                                                        return <div className='form-item' key={i}>{ch}:<input name={name + '_' + key} type={type}
                                                            value={(vmobj[key])}
                                                            disabled={disabled}
                                                            onChange={(e) => {
                                                                vmobj[key] = e.target.value;
                                                                forceUpdate();
                                                            }} /></div>;
                                                    case "select":
                                                        const options = options_map[key];
                                                        vmobj[key] ?? (vmobj[key] = allow_null ? "" : options[0]);
                                                        return <div className='form-item' key={i}>{ch}:
                                                            <select name={name} onChange={(e) => {
                                                                vmobj[key] = e.target.value;
                                                                forceUpdate();
                                                            }} value={vmobj[key]}>
                                                                {allow_null && <option key={-1} value={""}></option>}
                                                                {options.map(([v, n], ii) => <option key={ii} value={v}>{n ?? v}</option>)}
                                                            </select>
                                                        </div>;
                                                    case "select_m":
                                                        const options_m = options_map[key];
                                                        const options_m_selected = vmobj[key] ? vmobj[key].split(',') : []
                                                        return <div className='form-item' key={i}>{ch}:
                                                            <select defaultValue={options_m_selected} name={name} multiple={true} size={options_m.length} onChange={(e) => {
                                                                vmobj[key] = Array.from(e.target.options).filter(e => e.selected).map(e => e.value).join(',');
                                                                forceUpdate();
                                                            }}>
                                                                {options_m.map(([v, n], ii) => <option key={ii} value={v}>{n ?? v}</option>)}
                                                            </select>
                                                        </div>;
                                                    case "check":
                                                        const allStory = Object.keys(s).map(bookId => Object.keys(s[bookId]).map(storyId => bookId + '/' + storyId)).flat(1).map(e => [e]);

                                                        vmobj[key] ?? (vmobj[key] = `[],[]`);
                                                        Array.isArray(vmobj[key]) && (vmobj[key] = `[${vmobj[key][0]}],[${vmobj[key][1]}]`);
                                                        const read_selected = vmobj[key].slice(1, vmobj[key].indexOf("],[")).split(',');
                                                        const ended_selected = vmobj[key].slice(vmobj[key].indexOf("],[") + 3, vmobj[key].length - 1).split(',');
                                                        return <div className='form-item check' key={i}>{ch}:
                                                            <input type='text' name={name} disabled={true} value={vmobj[key]}></input>
                                                            READ<select defaultValue={read_selected} name={name + "read"} multiple={true} size={allStory.length} onChange={(e) => {
                                                                const read = Array.from(e.target.options).filter(e => e.selected).map(e => e.value);
                                                                vmobj[key] = `[${read}],[${ended_selected}]`;
                                                                forceUpdate();
                                                            }}>
                                                                {allStory.map(([v, n], ii) => <option key={ii} value={v}>{n ?? v}</option>)}
                                                            </select>
                                                            ENDED<select defaultValue={ended_selected} name={name + "ended"} multiple={true} size={allStory.length} onChange={(e) => {
                                                                const ended = Array.from(e.target.options).filter(e => e.selected).map(e => e.value);
                                                                vmobj[key] = `[${read_selected}],[${ended}]`;
                                                                forceUpdate();
                                                            }}>
                                                                {allStory.map(([v, n], ii) => <option key={ii} value={v}>{n ?? v}</option>)}
                                                            </select>
                                                        </div>;
                                                    default: return <Fragment key={i}></Fragment>
                                                }
                                            })}
                                        {/* vm的段落编辑 */}
                                        {vmobj["category"] == "STORY" && <>
                                            {<input type="text" maxLength={16} onChange={(e) => { setNewParagraphId(e.target.value); forceUpdate(); }} value={getNewParagraphId()}></input>}
                                            {<a onClick={() => { const newPid = getNewParagraphId(); newPid && (vmobj.para[newPid] ?? (vmobj.para[newPid] = [])); forceUpdate(); }}>{`插入空段落`}</a>}
                                            {/* {vmobj.end} */}
                                            {Object.keys(vmobj.para).map((pid, pi) => {
                                                const identifier = getParagraphIdentifier()[pid] ?? (getParagraphIdentifier()[pid] = getNewIdentifier()),
                                                    hideFlag = getHideFlag()[identifier],
                                                    updateHideFlag = () => {
                                                        getHideFlag()[identifier] ?? (getHideFlag()[identifier] = false);
                                                        getHideFlag()[identifier] = !getHideFlag()[identifier];
                                                        forceUpdate();
                                                    }
                                                getInsertProps()[pid] ?? (getInsertProps()[pid] = 0);
                                                return <Fragment key={pid}>
                                                    <div className={classNames("edit-paragraphs", identifier == getDeleteForceIdentifier() && "delete-force")}>
                                                        段落"{pid}"(第{pi + 1}段)
                                                        {<a onClick={updateHideFlag}>{hideFlag ? `隐藏段落` : `显示段落`}(共 {vmobj.para[pid].length} 语句)</a>}
                                                        {<a onClick={() => {
                                                            delete vmobj.para[pid];
                                                            delete getParagraphIdentifier()[pid];
                                                            delete getHideFlag()[identifier];
                                                            forceUpdate();
                                                        }}
                                                            onMouseEnter={() => {
                                                                setDeleteForceIdentifier(identifier);
                                                                forceUpdate();
                                                            }}
                                                            onMouseLeave={() => {
                                                                getDeleteForceIdentifier() == identifier && setDeleteForceIdentifier(null);
                                                                forceUpdate();
                                                            }}>{`删除段落${pid}`}</a>}
                                                        {hideFlag && <>
                                                            {<a onClick={() => { vmobj.para[pid].splice(getInsertProps()[pid], 0, { cn: "", tx: "", fn: [] }); forceUpdate(); }}>{`插入空语句到`}</a>}
                                                            {<input type="number" min={0} max={vmobj.para[pid].length} onChange={(e) => { getInsertProps()[pid] = e.target.value; forceUpdate(); }} value={getInsertProps()[pid]}></input>}
                                                            {vmobj.para[pid].map((e, si) => {
                                                                const identifier = e.identifier ?? (e.identifier = getNewIdentifier()),
                                                                    hideFlag = getHideFlag()[identifier],
                                                                    updateHideFlag = () => {
                                                                        getHideFlag()[identifier] ?? (getHideFlag()[identifier] = false);
                                                                        getHideFlag()[identifier] = !getHideFlag()[identifier];
                                                                        forceUpdate();
                                                                    }
                                                                e.fn ?? (e.fn = []);
                                                                e.tx ?? (e.tx = "");
                                                                return <div className={classNames("edit-paragraph", identifier == getDeleteForceIdentifier() && "delete-force")} key={identifier}>
                                                                    语句{si}:
                                                                    {<select className={'cn'} onChange={(ee) => {
                                                                        e.cn = ee.target.value;
                                                                        forceUpdate();
                                                                    }} value={e.cn}>
                                                                        {<option key={-1} value={""}>{`<空>`}</option>}
                                                                        {options_map["cn"].map(([v, n], ii) => <option key={ii} value={v}>{n ?? v}</option>)}
                                                                    </select>}
                                                                    {<input className={'tx'}
                                                                        type={`text`}
                                                                        value={e.tx}
                                                                        onChange={(ee) => {
                                                                            e.tx = ee.target.value;
                                                                            forceUpdate();
                                                                        }} />}
                                                                    {<a onClick={updateHideFlag}>{hideFlag ? `隐藏函数` : `显示函数`}(共 {e.fn.length} 个)</a>}
                                                                    {<a onClick={() => {
                                                                        vmobj.para[pid].splice(si, 1);
                                                                        delete getHideFlag()[identifier];
                                                                        forceUpdate();
                                                                    }}
                                                                        onMouseEnter={() => {
                                                                            setDeleteForceIdentifier(identifier);
                                                                            forceUpdate();
                                                                        }}
                                                                        onMouseLeave={() => {
                                                                            getDeleteForceIdentifier() == identifier && setDeleteForceIdentifier(null);
                                                                            forceUpdate();
                                                                        }}>{`删除语句${si}`}</a>}
                                                                    {hideFlag &&
                                                                        <SentenceFunctionInput fnList={e.fn} functionName={'fn'} story={data[name].value} isRoot={true}
                                                                            onChange={({ obj, arr }) => {
                                                                                e.fn = Object.entries(obj).filter(([key]) => key.startsWith("Function:"))
                                                                                    .map(([key, value]) => {
                                                                                        const functionName = key.slice("Function:".length);
                                                                                        function myArrToString(arr) {
                                                                                            let str = '[';
                                                                                            arr.forEach((e, i) => {
                                                                                                if (i != 0) str += ',';
                                                                                                str += Array.isArray(e) ? myArrToString(e) : e ?? "";
                                                                                            });
                                                                                            return str + ']';
                                                                                        }
                                                                                        return value.map(propsArr => functionName + myArrToString(propsArr));
                                                                                    }).flat(1);
                                                                                forceUpdate();
                                                                            }} bookId={data.bookId?.value} bookStoryTree={data.bookId?.value ? storyTree[data.bookId?.value] : undefined}>
                                                                        </SentenceFunctionInput>}
                                                                </div>
                                                            }
                                                            )}
                                                        </>}
                                                    </div>
                                                </Fragment>
                                            })}
                                        </>}
                                    </div>
                                </div>
                            case "info":
                                const info = data[name].value;
                                data[name].addType ?? (data[name].addType = "text");
                                return <div className={"form-item_info"} key={i}>
                                    {info.map((item, i) => {
                                        const { type, text, fileKey } = item;
                                        let inputs = null;
                                        switch (type) {
                                            case "text":
                                                inputs = <Fragment>
                                                    {`(${i}):${type}`}
                                                    <input type='text' className='info-text' value={text}
                                                        onChange={(e) => (item.text = e.target.value, forceUpdate())}></input>
                                                </Fragment>
                                                break;
                                            case "pic":
                                                inputs = <Fragment >
                                                    {`(${i}):${type}`}
                                                    <select onChange={(e) => {
                                                        item.fileKey = e.target.value;
                                                        forceUpdate();
                                                    }} className={`info-pic`} value={fileKey}>
                                                        {<option key={-1} value={""}></option>}
                                                        {Object.keys(file_map).filter(e => file_map[e].packageKey.startsWith("home")).map(e => [e]).map(([v, n], ii) => <option key={ii} value={v}>{n ?? v}</option>)}
                                                    </select>
                                                    <a onClick={() => (info.splice(i, 1), forceUpdate())}>{"删除"}</a>
                                                </Fragment>
                                                break;
                                            default: inputs = <Fragment></Fragment>;
                                        }
                                        return <div className={classNames("info-item")} key={i}>
                                            {inputs}
                                            <a onClick={() => (info.splice(i, 1), forceUpdate())}>{"删除"}</a>
                                        </div>
                                    })}
                                    <select onChange={e => data[name].addType = e.target.value}>
                                        {[["text", "文字"], ["pic", "图片"]].map(
                                            ([name, ch]) => <option value={name} key={name}>{ch}</option>
                                        )}
                                    </select>
                                    <a onClick={() => {
                                        const newInfoItem = {};
                                        switch (data[name].addType) {
                                            case "text":
                                                newInfoItem.type = "text",
                                                    newInfoItem.text = "";
                                                break;
                                            case "pic":
                                                newInfoItem.type = "pic",
                                                    newInfoItem.fileKey = "";
                                                break;
                                            default: return;
                                        }
                                        data[name].value.push(newInfoItem);
                                        forceUpdate();
                                    }}>添加</a>
                                </div>
                            default: return <Fragment key={i} />;
                        }
                    })}
                    <input type={"submit"} />
                </form>
            </div>
            <div className='header'>
                {title}
            </div>
            <div className='close' onClick={() => {
                onClose();
                setState({ ...getState(), active: false });
            }}></div>
        </div>
    </div >
}
export default Dialog;