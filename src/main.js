import JSZip, { filter } from 'jszip'
import React, { useState, useEffect, useContext, useRef, useCallback, useReducer } from 'react'
import { saveAs } from 'file-saver';
import ReactDOM from 'react-dom'
import { createRoot } from 'react-dom/client'
import App from './App.js'
import { objCopy, chara_map, file_map, package_map, getPackagePath, BOOKFromChild, STORYFromChild, b, s, bookIds, co, fileToBase64, getFileSrc, vmtoobj, objtovm, tips_group, display_style_list, homeResource_map, information_map, argsStr_to_arr, allData } from './data/extra-test-data.js'
import { ResourceView } from './ResourceView.js'
import FileInfo from './class/file-info.js';
import Dialog from './Dialog'
import { dataControl, dataAssign, runAll } from './class/data-controller.js';
import { messageResponseMap_clear, message_readyGetNow, message_readyGetReturnData, message_readyPutData, message_readyPutFile, message_readyPutPackage } from './helper/message-helper.js';
import { DBcount, DBget, DBget_index, DBput, DBremove, DBtraversal, downloadData, readAll, readWriteAll, removeDB, uploadData } from './class/IndexedDB-controller.js';
import _, { reject, result } from 'lodash';
document.ondragstart = function () { return false };
document.oncontextmenu = function () { return false };
const ROOT = createRoot(document.getElementById('app'));
export function classNames(...className) { return className.filter(e => e).join(" ") };
const helper_menu_list = {
    "chara_map": {
        name: "chara_map",
        ch: "角色表",
        getToAdd: () => ({
            "title": "新增人物",
            "id": { type: "text", ch: "人物id" },
            "name": { type: "text", ch: "人物名" },
            onSubmit: (formData) => {
                const newKey = formData.id;
                if (!newKey?.length || chara_map[newKey] !== undefined || dataAssign.chara_map[newKey] !== undefined) {
                    return false;
                }
                // debugger;
                dataControl(["write", { path: ["chara_map", newKey], value: { id: newKey, name: formData.name, pic: {} } }]);
                return true;
            }
        }),
        getToEdit: (data) => ({
            "title": "编辑人物",
            "id": { type: "text", ch: "人物id", disabled: true, value: data.id ?? "" },
            "name": { type: "text", ch: "人物名", value: data.name ?? "" },
            "pic": {
                type: "map", ch: "立绘表", value: Object.entries(data.pic ?? {}).sort(([a], [b]) => a - b),
                allow_null: true,
                getOptions_key: undefined,
                getOptions_value: () => Object.keys(file_map).filter(e => file_map[e].packageKey.startsWith('chara'))
                    .concat(Object.keys(dataAssign.file_map)).filter(e => file_map[e].packageKey.startsWith('chara')).map((e) => [e])
            },
            onSubmit: (formData) => {
                const newKey = formData.id;
                // if (!newKey?.length || chara_map[newKey] !== undefined || dataAssign.chara_map[newKey] !== undefined) {
                //     return false;
                // }
                // debugger;

                dataControl(["write", {
                    path: ["chara_map", newKey], value: {
                        id: newKey, name: formData.name,
                        pic: Object.fromEntries([...Object.keys(data.pic).map(e => [e, undefined]), ...Object.entries(formData.pic)])
                    }
                }]);
                return true;
            }
        }),
    },
    "file_map": {
        name: "file_map",
        ch: "资源文件",
        getToAdd: () => ({
            "title": "新增文件项",
            "file": { type: "file", ch: "文件" },
            "key": { type: "text", ch: "文件key", tips: "(多文件时，作为起始编号向后自动编号)" },
            "packageKey": {
                type: "select",
                getOptions: () => Object.keys(package_map).concat(Object.keys(dataAssign.package_map)).filter(e => e).map(e => [e]),
                allow_null: false, ch: "包名"
            },
            onSubmit: (formData) => {
                const baseKey = formData.key;
                const fileArr = Array.from(formData.file);
                // 获取尾数长度和起始
                if (!baseKey?.length || fileArr.length == 0) {
                    return false;
                }
                if (fileArr.length == 1) {
                    if (file_map[baseKey] !== undefined || dataAssign.file_map[baseKey] !== undefined) {
                        alert("和已有文件或删除但未应用文件Key冲突！请先删除并应用后再上传新文件。")
                        return false;
                    }

                    fileArr.map(e => fileToBase64(e).then(code => DBput("file", {
                        data: code,
                        fileName: e.name,
                        packageKey: formData.packageKey,
                        path: `${formData.packageKey}/${e.name}`,
                        type: e.type
                    })));

                    dataControl(
                        ...fileArr.map((file, i) => ["write",
                            {
                                path: ["file_map", baseKey],
                                value: { packageKey: formData.packageKey, fileName: file.name }
                            }])
                    );
                    return true;
                }
                let newKeyBase = _.trimEnd(baseKey, '0123456789'), endNumLength, endNumStart;
                if (newKeyBase.length == baseKey.length) {
                    if (!newKeyBase.endsWith('_')) newKeyBase = newKeyBase + '_';
                    endNumLength = (fileArr.length - 1).toString().length;
                    endNumStart = 0;
                }
                else {
                    endNumStart = baseKey.slice(newKeyBase.length);
                    if (endNumStart.length < (fileArr.length - 1).toString().length) {
                        endNumStart = endNumStart.padEnd((fileArr.length - 1).toString().length, '0');
                    }
                    if ((parseInt(endNumStart) + (fileArr.length - 1)).toString().length > endNumStart.length) {
                        endNumLength = endNumStart.length + 1;
                    }
                    else endNumLength = endNumStart.length;
                    endNumStart = parseInt(endNumStart.padEnd(endNumLength, '0'));
                }


                const fileKeys = fileArr.map((e, i) => newKeyBase + (endNumStart + i).toString().padStart(endNumLength, '0'));
                fileArr.map(e => fileToBase64(e).then(code => DBput("file", {
                    data: code,
                    fileName: e.name,
                    packageKey: formData.packageKey,
                    path: `${formData.packageKey}/${e.name}`,
                    type: e.type
                })));
                for (let key of fileKeys) {
                    if (file_map[key] !== undefined || dataAssign.file_map[key] !== undefined) {
                        console.log("fileKey冲突:", key);
                        return false;
                    }
                }
                dataControl(
                    ...fileArr.map((file, i) => ["write",
                        {
                            path: ["file_map", fileKeys[i]],
                            value: { packageKey: formData.packageKey, fileName: file.name }
                        }])
                );
                // debugger;
                // dataControl(
                //     ["write", { path: ["file_map", formData.key], value: { packageKey: formData.packageKey, fileName: Array.from(formData.file)?.[0].name } }]);
                return true;
            }
        }),
    },
    "package_map": {
        name: "package_map",
        ch: "文件包",
        getToAdd: () => ({
            "type": { type: "select", ch: "包类型", getOptions: () => ["chara", "place", "BGM", "voice", "home","CG"].map(e => [e]) },
            "name": { type: "text", ch: "包名" },
            onSubmit: (formData) => {
                const newPackageKey = formData.type + '_' + formData.name;
                if (!newPackageKey?.length || package_map[newPackageKey] !== undefined || dataAssign.package_map[newPackageKey] !== undefined) {
                    return false;
                }
                dataControl(["write", { path: ["package_map", newPackageKey], value: `package/${newPackageKey}.zip` }]);
                return true;
            }
        })
    },
    "Book": {
        name: "Book",
        ch: "书",
        getToAdd: () => ({
            "bookId": { type: "text", ch: "book名" },
            // "start": { type: "select", ch: "起始故事", allow_null: true, getOptions: () => Object.keys(STORYFromChild).map(e => Object.keys(STORYFromChild[e])).flat(1).map(e => [e]) },
            "default_style": { type: "select", ch: "默认style选择", getOptions: () => display_style_list.map(e => [e]) },
            // "end": { type: "auto", ch: "终结故事集合", props: ["start"], function: ({ start }) => { } },
            onSubmit: (formData) => {
                const { bookId, default_style } = formData;
                const new_vm = objtovm({ id: bookId, category: "BOOK", default_style });

                if (!bookId?.length || b[bookId] !== undefined || dataAssign.b[bookId] !== undefined) {
                    return false;
                }
                console.log("new_vm", new_vm, vmtoobj(new_vm));
                bookIds.push(bookId);
                dataControl(["write", { path: ["b", bookId], value: new_vm }]);
                return true;
            }
        }),
        getToEdit: (bookId, vm) => {
            const _vm = vm ? vmtoobj(vm) : {};
            return ({
                // "name": { type: "text", ch: "book名", value: bookId, disabled: true },
                "book_vm": {
                    type: "vm", ch: "故事", value: _vm,
                    getOptions_map: {
                        start: () => [...Object.keys(dataAssign.s[bookId] ?? {}).filter(e => dataAssign.s[bookId][e]), ...Object.keys(s[bookId] ?? {})].map(e => [e]),
                        default_style: () => display_style_list.map(e => [e]),
                        cover: () => Object.keys(file_map).filter(e => file_map[e].packageKey.startsWith("home"))
                            .concat(Object.keys(dataAssign.file_map)).filter(e => file_map[e].packageKey.startsWith("home")).map((e) => [e])
                    }
                },
                "end": {
                    type: "map", ch: "结束内容", value: _vm.end ?? [],
                    getOptions_key: () => [...Object.keys(dataAssign.s[bookId] ?? {}).filter(e => dataAssign.s[bookId][e]), ...Object.keys(s[bookId] ?? {})].map(e => [e]),
                    getOptions_value: undefined
                },
                onSubmit: (formData) => {
                    const end = Object.entries(formData.end);
                    // const end = formData.end;
                    const new_vm = objtovm({ ...formData.book_vm, end });
                    // if (!newKey?.length || chara_map[newKey] !== undefined || dataAssign.chara_map[newKey] !== undefined) {
                    //     return false;
                    // }

                    console.log("new_vm", new_vm, vmtoobj(new_vm));
                    // if (new_storyId != storyId || new_bookId != bookId) dataControl(["write", { path: ["s", bookId, storyId], value: undefined }]);
                    dataControl(["write", { path: ["b", bookId], value: new_vm }]);
                    return true;
                }
            })
        },
    },
    "Story": {
        name: "Story",
        ch: "故事", getToAdd: () => ({
            "title": "新增故事",
            "bookId": { type: "select", allow_null: false, ch: "属于书", getOptions: () => [...Object.keys(dataAssign.b), ...Object.keys(b)].filter(e => e).map(e => [e]) },
            "storyId": { type: "text", ch: "故事id" },
            "storyTitle": { type: "text", ch: "故事标题" },
            // "tips": { type: "select", ch: "tips集合", allow_null: true, getOptions: () => Object.keys(tips_group).map(e => [e]) },
            onSubmit: (formData) => {
                const { bookId, storyId, storyTitle: title } = formData;
                const new_vm = objtovm({ id: storyId, title, category: "STORY", para: { 0: [] } });

                if (!storyId?.length || s[bookId]?.[storyId] !== undefined || dataAssign.s[bookId]?.[storyId] !== undefined) {
                    return false;
                }
                // console.log("new_vm", new_vm, vmtoobj(new_vm));
                dataControl(["write", { path: ["s", bookId, storyId], value: new_vm }]);
                return true;
            }
        }),
        getToEdit: (bookId, storyId, vm) => ({
            "bookId": { type: "select", ch: "属于书", value: bookId, getOptions: () => [...Object.keys(dataAssign.b), ...Object.keys(b)].filter(e => e).map(e => [e]) },
            "storyId": { type: "text", ch: "故事id", value: storyId },
            "story_vm": {
                type: "vm", ch: "故事", value: vm ? vmtoobj(vm) : {},
                getOptions_map: {
                    tips: () => [...Object.keys(dataAssign.tips_group).filter(e => dataAssign.tips_group[e]), ...Object.keys(tips_group)].map(e => [e]),
                    style: () => display_style_list.map(e => [e]),
                    to: () => [...Object.keys(dataAssign.s[bookId] ?? {}).filter(e => dataAssign.s[bookId][e]), ...Object.keys(s[bookId] ?? {})].map(e => [e]),
                    cn: () => [...Object.entries(dataAssign.chara_map).filter(e => e).map(([k, v]) => [k, v.name + `(${k})`]), ...Object.entries(chara_map).map(([k, v]) => [k, v.name + `(${k})`])]
                }
            },
            onSubmit: (formData) => {
                // vm,vmtoobj(vm),objtovm(vmtoobj(vm));debugger;W
                const { bookId: new_bookId, storyId: new_storyId } = formData;
                // const end = Object.keys(formData.story_vm.para);
                const end = Object.entries(formData.story_vm.para).filter(([k, v]) => !v.some(sentence => sentence.fn?.some(fn => fn.startsWith("choice")))).map(([k, v]) => k);
                // debugger;
                const new_vm = objtovm({ ...formData.story_vm, id: new_storyId, end });
                // if (!newKey?.length || chara_map[newKey] !== undefined || dataAssign.chara_map[newKey] !== undefined) {
                //     return false;
                // }

                console.log("new_vm", new_vm, vmtoobj(new_vm));
                if (new_storyId != storyId || new_bookId != bookId) dataControl(["write", { path: ["s", bookId, storyId], value: undefined }]);
                dataControl(["write", { path: ["s", new_bookId, new_storyId], value: new_vm }]);
                return true;
            }
        }),
    },
    "tips": {
        name: "tips",
        ch: "tips管理",
        getToAdd: () => ({
            "title": "新增tips组",
            "name": { type: "text", ch: "tips组名" },
            onSubmit: (formData) => {
                const newKey = formData.name;
                if (!newKey?.length || tips_group[newKey] !== undefined || dataAssign.tips_group[newKey] !== undefined) {
                    // debugger;
                    return false;
                }
                // debugger;
                dataControl(["write", { path: ["tips_group", newKey], value: [] }]);
                return true;
            }
        }),
        getToEdit: (name, tips) => ({
            "title": "编辑tips组",
            "name": { type: "text", ch: "tips组名", value: name },
            "tips": {
                type: "map", ch: "内容", value: tips.map(({ title, text }) => [title, text]),
                allow_null: true,
                getOptions_key: undefined,
                getOptions_value: undefined
            },
            onSubmit: (formData) => {
                const newKey = formData.name, newTips = Object.entries(formData.tips).map(([title, text]) => ({ title, text }));
                if (newKey != name) dataControl(["write", { path: ["tips_group", name], value: undefined }]);
                dataControl(["write", { path: ["tips_group", newKey], value: newTips }]);
                return true;
            }
        }),
    },
    "home": {
        name: "home",
        ch: "首页编辑",
    },
    "information": {
        name: "information",
        ch: "档案编辑",
        getToAdd: () => ({
            "title": "新增档案",
            "id": { type: "text", ch: "档案id" },
            "order": { type: "number", ch: "序列值" },
            onSubmit: (formData) => {
                // const newKey = formData.id;
                const { id: newKey, order } = formData;
                // debugger;
                if (!newKey?.length || information_map[newKey] !== undefined || dataAssign.information_map[newKey] !== undefined) {
                    // debugger;
                    return false;
                }
                // debugger;
                dataControl(["write", {
                    path: ["information_map", newKey], value: {
                        id: newKey,
                        title: newKey,
                        order: order,
                        check: {
                            read: [],
                            ended: []
                        },
                        data: []
                    }
                }]);
                return true;
            }
        }),
        getToEdit: (id, info) => ({
            "title": "编辑档案",
            "id": { type: "text", ch: "档案id", disabled: true, value: id },
            "infoTitle": { type: "text", ch: "档案标题", value: info.title },
            "order": { type: "number", ch: "序列值", value: info.order },
            "check_vm": { type: "vm", ch: "解锁条件", value: { category: "check", id: id, check: [info.check.read, info.check.ended] } },
            "data": { type: "info", ch: "档案内容", value: info.data },
            onSubmit: (formData) => {
                const { id, infoTitle, check_vm, data, order } = formData;
                const [read, ended] = argsStr_to_arr(check_vm.check);
                const check = { read, ended }
                // if (!key?.length || information_map[key] !== undefined || dataAssign.information_map[key] !== undefined) {
                //     // debugger;
                //     return false;
                // }
                // debugger;
                dataControl(["write", {
                    path: ["information_map", id], value: {
                        id,
                        title: infoTitle,
                        order,
                        check,
                        data
                    }
                }]);
                return true;
            }
        })
    }
}
function getZipFile(zipName, fileList) {
    return new Promise((resolve, reject) => {
        let zip = new JSZip();
        Array.from(fileList).forEach(e => {
            zip.file(e.name, e);
        });
        zip.generateAsync({
            type: "blob",
            compression: "DEFLATE",
            compressionOptions: {
                level: 5
            }
        }).then(function (content) {
            resolve([content, zipName]);
        }).catch(err => reject(err));
    })
}
function saveZipFile(zipName, fileList) {
    let zip = new JSZip();
    // debugger;
    Array.from(fileList).forEach(e => {
        zip.file(e.name, e);
    });
    return zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: {
            level: 5
        }
    }).then(function (content) {
        saveAs(content, zipName);
    });
}
const debounceA = (() => {
    let timer = null;
    return (fn, wait) => {
        if (timer !== null) {
            clearTimeout(timer);
        }
        timer = setTimeout(fn, wait);
    }
})()
// function fileDownload(name, code) {
//     let a = document.createElement("a");
//     a.href = code;
//     a.download = name;
//     a.style.position = "fixed";
//     a.style.left = "100%";
//     a.style.pointerEvents = "none";
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
// }
const getStoryTreeAllStorySet = (function () {
    let temp;
    return (function (book, rootStoryId, re) {
        if (re) temp = {};
        const nowStory = book.data[rootStoryId];
        if (nowStory.to.able.length == 0) {
            temp[rootStoryId] ?? (temp[rootStoryId] = new Set([rootStoryId]));
            if (re) re(temp);
            return temp[rootStoryId];
        }
        else {
            if (temp[rootStoryId]) {
                if (re) re(temp);
                return temp[rootStoryId];
            }
            temp[rootStoryId] = new Set([rootStoryId]);
            temp[rootStoryId] = new Set([rootStoryId, ...nowStory.to.able.map(e => Array.from(getStoryTreeAllStorySet(book, e))).flat(1)])
            if (re) re(temp);
            return temp[rootStoryId];
        }
    })
})();
const getEndStorySet = (function () {
    let temp;
    return (function (book, rootStoryId, re) {
        if (re) temp = {};
        const nowStory = book.data[rootStoryId];
        if (nowStory.to.able.length == 0) {
            temp[rootStoryId] ?? (temp[rootStoryId] = new Set([rootStoryId]));
            if (re) re(temp);
            return temp[rootStoryId];
        }
        else {
            if (temp[rootStoryId]) {
                if (re) re(temp);
                return temp[rootStoryId];
            }
            temp[rootStoryId] = new Set([rootStoryId]);
            temp[rootStoryId] = new Set([...nowStory.to.able.map(e => Array.from(getEndStorySet(book, e))).flat(1)])
            if (re) re(temp);
            return temp[rootStoryId];
        }
    })
})();
const _storyTree = {};
export const context = React.createContext({ storyTree: _storyTree });
function Helper() {
    const [, forceUpdate] = useReducer(e => e + 1, 0);

    const [menuState, setMenuState] = useState({ name: Object.values(helper_menu_list)[0].name, state: {} });
    const viewer = useRef();
    const [setNext_bookNameSelect, setNext_storyIdSelect, setNext_sentenceIdSelect] = [useRef(), useRef(), useRef()]
    const [now, setNow] = useState({});
    const [viewerSize, setViewerSize] = useState(0.3);
    const [viewerDisplay, setViewerDisplay] = useState(true);
    const [dialogState, setDialogState] = useState({ active: false, data: {} });
    const [storyTree, setStoryTree] = useState(null);
    const [getOnDialogClose, setOnDialogClose] = ((e) => [() => e.current, (value) => e.current = value])(useRef(() => { }))
    const callDialog = useCallback((newData, onClose) => {
        setDialogState({ active: true, data: newData ?? dialogState.data });
        onClose instanceof Function && setOnDialogClose(onClose);
    }, [setDialogState, setOnDialogClose]);
    const [getOutputting, setOutputting] = ((e) => [() => e.current, (value) => e.current = value])(useRef(null));


    const [getLastMsg, setLastMsg] = (({ current: e }) => [() => e, ne => e = ne])(useRef());
    useEffect(() => {
        addEventListener("resize", () => forceUpdate());
        messageResponseMap_clear();
        message_readyPutData({ chiidWindow: viewer.current.contentWindow, forceUpdate, getLastMsg, setLastMsg });
        message_readyGetReturnData(
            { chiidWindow: viewer.current.contentWindow, forceUpdate, getLastMsg, setLastMsg },
            () => {
                const newTree = {};
                // debugger;
                Object.keys(BOOKFromChild).forEach(e => {
                    const bookTree = newTree[e] = {};
                    if (!BOOKFromChild[e].start) {
                        newTree[e] = null;
                        return;
                    }
                    getStoryTreeAllStorySet(BOOKFromChild[e], BOOKFromChild[e].start,
                        (re) => {
                            Object.entries(re).forEach(([storyId, set]) => {
                                bookTree[storyId] = {
                                    child: set
                                }
                            })
                        })
                    getEndStorySet(BOOKFromChild[e], BOOKFromChild[e].start,
                        (re) => {
                            Object.entries(re).forEach(([storyId, set]) => {
                                bookTree[storyId].leaf = set
                            })
                        })
                })
                // debugger;
                setStoryTree(newTree);
            }
        );
        message_readyPutFile({ chiidWindow: viewer.current.contentWindow });
        message_readyPutPackage({ chiidWindow: viewer.current.contentWindow });
        message_readyGetNow(null, (e) => setNow(e));
    }, [viewer.current])
    useEffect(() => {
        for (let storyId in _storyTree) {
            delete _storyTree[storyId];
        }
        for (let storyId in storyTree) {
            _storyTree[storyId] = storyTree[storyId];
        }
    }, [storyTree])
    function HidableUl(props) {
        const {
            nowMenuState,
            baseClassName,
            headText,
            flagLoaction,
            buttons
        } = props;
        let list = props.list instanceof Function ? props.list() : props.list instanceof Array ? props.list : [`异常的数据:`, `${JSON.stringify(props.list) ?? "无法转json！"}`];
        !(list instanceof Array) && (list = Array.from(list));
        if (list.length == 0) list.push(<b style={{ color: "gray" }}>{"<空>"}</b>)
        let flag = nowMenuState, flagParent;
        for (let d = 0; d < flagLoaction.length; d++) {
            flagParent = flag;
            flag = flag?.[flagLoaction[d]];
            if (flag == undefined) {
                flagParent = undefined;
                break;
            }
        }
        const menuStateChange = () => {
            if (flagParent === undefined) {
                flag = nowMenuState;
                for (let d = 0; d < flagLoaction.length; d++) {
                    flagParent = flag ?? (flag = flagParent[flagLoaction[d - 1]] = {});
                    flag = flag?.[flagLoaction[d]];
                }
            }
            flagParent[flagLoaction[flagLoaction.length - 1]] = !(flag);
            forceUpdate();
        }
        return <>
            <div className={classNames("HidableUl", ...baseClassName, "clickable", flag && "clicked")}
                onClick={() => menuStateChange(flagLoaction)}>{headText}</div>
            {flag && buttons && buttons.map(([ch, fun, disabled], i) => <button key={i} className={`HidableUl-button`} onClick={() => fun()} disabled={disabled ? true : false}>{ch}</button>)}
            {/* {<ul className={flag ? '' : 'childHide'}>
                {list.map((e, i) => <li key={i}>{e}</li>)}
            </ul>} */}
            {flag && <ul>
                {list.map((e, i) => <li key={i}>{e}</li>)}
            </ul>}
        </>
    }
    return (
        <>
            <div id="menu">
                <ul id={`funtion-menu`}>
                    {Object.values(helper_menu_list).map(({ name, ch }, i) => <li key={i} onClick={() => {
                        setMenuState({
                            ...menuState,
                            name: name
                        });
                        const nowMenuState = menuState.state[name] ?? (menuState.state[name] = {});
                        nowMenuState["add-item"] ?? (nowMenuState["add-item"] =
                            { active: false, data: helper_menu_list[name].getToAdd ? helper_menu_list[name].getToAdd() : {} });
                    }} className={menuState.name == name ? "active" : ""}>{ch}</li>)}
                </ul>
                <ul id={`controller-menu`}>
                    <li className={`viewerDisplay-controller`}>
                        {"-预览部分-"}
                        <div>
                            {"显示 "}<input type="checkbox"
                                onClick={(e) => setViewerDisplay(!e.target.checked)}>
                            </input>
                        </div>

                        <div>
                            {"大小 "}
                            {viewerDisplay ?
                                <input type="range" onChange={(e) => setViewerSize(e.target.value)} min={0} max={0.85} value={viewerSize} step={0.01}></input>
                                : <input type="range" disabled min={0} max={0.85} value={viewerSize} step={0.01}></input>}
                        </div>
                    </li>
                    <li className={`viewerDisplay-controller`}>
                        <button
                            onClick={(e) => {
                                runAll().then(() => {
                                    viewer.current.contentWindow.postMessage(
                                        { from: "weimu-helper", key: "reload", reload: true },
                                        "*");
                                    setMenuState({ ...menuState, state: {} });
                                    setDialogState({ active: false, data: {} });
                                    // forceUpdate();
                                })
                            }}>
                            {"应用并预览"}
                        </button>
                    </li>
                    <li className={`setNext-controller`}>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            const [bookName, storyId, sentenceId] = ['bookName', 'storyId', 'sentenceId'].map(name => formData.get(name));
                            console.log([bookName, storyId, sentenceId], BOOKFromChild, STORYFromChild);
                            viewer.current.contentWindow.postMessage(
                                { from: "weimu-helper", key: "setNext", data: { bookName, storyId, sentenceId } },
                                "*");
                        }}>
                            {/* <input name="bookName" type={"text"} placeholder="book名" /> */}
                            {(() => {
                                const { bookName: nowbookName, storyId: nowstoryId, sentenceId: nowsentenceId } = now;
                                const [bookNameSelect, storyIdSelect, sentenceIdselect] =
                                    [setNext_bookNameSelect.current?.value, setNext_storyIdSelect.current?.value, setNext_sentenceIdSelect.current?.value];
                                const bookNameOptions = Object.keys(BOOKFromChild).map((e, i) => <option key={i} value={e}>{e}</option>),
                                    storyIdOptions = (bookNameSelect ?
                                        Object.keys(STORYFromChild[bookNameSelect].data) :
                                        Object.keys(STORYFromChild[nowbookName]?.data ?? {})).map((e, i) => <option key={i} value={e}>{e}</option>),
                                    sentenceIdOptions = (bookNameSelect ?
                                        (storyIdSelect ? Object.keys(STORYFromChild[bookNameSelect].data[storyIdSelect].data) : []) :
                                        (storyIdSelect ? [] : Object.keys(STORYFromChild[nowbookName]?.data ? STORYFromChild[nowbookName].data[nowstoryId].data : {})))
                                        .map((e, i) => <option key={i} value={e}>{e}</option>);
                                // debugger;
                                return (<>
                                    <div>
                                        {"当前书:"}{nowbookName}
                                    </div>
                                    <select name="bookName" ref={setNext_bookNameSelect} onChange={() => { forceUpdate() }}>
                                        <option value="">-bookName-</option>
                                        {bookNameOptions}
                                    </select>
                                    <div>
                                        {"当前故事:"}{nowstoryId}
                                    </div>
                                    <select name="storyId" ref={setNext_storyIdSelect} onChange={() => { forceUpdate() }}>
                                        <option value="">-storyId-</option>
                                        {storyIdOptions}
                                    </select>
                                    <div>
                                        {"当前句子:"}{nowsentenceId}
                                    </div>
                                    <select name="sentenceId" ref={setNext_sentenceIdSelect} onChange={() => { forceUpdate() }}>
                                        <option value="">-sentenceId-</option>
                                        {sentenceIdOptions}
                                    </select>
                                </>)
                            })()}
                            <button>{"尝试跳转"}</button>
                        </form>
                    </li>
                    <li>
                        <span>
                            <a className='file-download' onClick={async () => {
                                if (getOutputting()) return;
                                setOutputting(true);
                                forceUpdate();
                                await downloadData();
                                setOutputting(false);
                                forceUpdate();
                            }} style={getOutputting() ? { color: "gray" } : {}}>
                                {"导出"}
                            </a>
                        </span>
                        {" "}
                        <label htmlFor="upload">
                            <a className='file-upload'>
                                {"导入"}
                            </a>
                        </label>
                        <input type={"file"} id={"upload"} style={{ display: "none" }} onChange={(e) => {
                            uploadData(e.target.files[0]);
                        }} />
                        {" "}
                        {/* <label htmlFor="uploadj">
                            <a className='file-upload'>
                                {"导入J"}
                            </a>
                        </label>
                        <input type={"file"} id={"uploadj"} style={{ display: "none" }} onChange={(e) => {
                            async function loadZip(arrayBuffer) {
                                const zip = await JSZip.loadAsync(arrayBuffer);
                                const o = {}
                                // console.log(zip.file("8.json").async('string').then(e=>JSON.parse(e)["ajjbqk"].length))
                                Promise.allSettled(Object.keys(zip.files).filter(p => p.endsWith(".json")).map((p) => {
                                    return zip.file(p).async('string').then(e => {
                                        // const len = JSON.parse(e)["ajjbqk"].length;
                                        // return len;
                                        // debugger;
                                        const obj = JSON.parse(e);
                                        const a = p.split('/'), f = a[1], l = a[2];
                                        o[f] ?? (o[f] = {});
                                        o[f][l] = obj;
                                    })
                                })).then(() => {
                                    console.log(o)
                                });
                                // console.log(zip.files)
                            }
                            const file = e.target.files[0]
                            const reader = new FileReader()
                            reader.readAsArrayBuffer(file)
                            reader.onload = (e) => {
                                loadZip(e.target.result)
                            }
                        }} /> */}
                        {<div>
                            <a className='file-download' onClick={() => {
                                confirm("确认重置游戏数据库？（包括已加载的资源文件和存档）") && viewer.current.contentWindow.postMessage(
                                    { from: "weimu-helper", key: "resetDB", reset: true },
                                    "*");
                            }} style={getOutputting() ? { color: "gray" } : {}}>
                                {"重置游戏数据库"}
                            </a>
                        </div>}
                        {<div>
                            <a className='file-download' onClick={() => {
                                confirm("确认重置游戏数据库？（包括已加载的资源文件和存档）") && removeDB().then(() => location.reload())
                            }} style={getOutputting() ? { color: "gray" } : {}}>
                                {"重置编辑器数据库"}
                            </a>
                        </div>}
                        {<div>
                            <a className='file-download' onClick={() => {
                                const newWindow = window.open('', '_blank');
                                newWindow.document.open();
                                newWindow.document.write(
                                    `<style>
#view>img {
    display: block;
    user-select: none;
    margin: auto;
    cursor: zoom-in;
    background-color: var(--block-color2);
    background-image: linear-gradient(45deg, var(--block-color1) 25%, transparent 0, transparent 75%, var(--block-color1) 0), linear-gradient(45deg, var(--block-color1) 25%, transparent 0, transparent 75%, var(--block-color1) 0);
    background-position: 0px 0, var(--block-size) var(--block-size);
    background-size: calc(2 * var(--block-size)) calc(2 * var(--block-size));
    transition: background-color 300ms ease 0s;
    --block-size: 15px;
    --block-color1: #bbb;
    --block-color2: #999;
}
#view {
    display: grid;
    place-items: center;
}
</style>
<div id='root'></div>`);
                                // newWindow.document.styleSheets[0].insertRule(``)
                                newWindow.document.close();
                                const ROOT = createRoot(newWindow.document.getElementById('root'));
                                ROOT.render(<>
                                    <select style={{ fontSize: '24px' }} onChange={(e) =>
                                        e.target.value && DBget("file", e.target.value).then(
                                            ({ data }) => {
                                                if (data.startsWith("data:audio")) {
                                                    const video = document.createElement('video');
                                                    const source = document.createElement("source");
                                                    source.src = data, source.type = data.slice(data.indexOf(":") + 1, data.indexOf(";"));
                                                    video.controls = true; video.autoplay = false;
                                                    video.appendChild(source);
                                                    newWindow.document.getElementById('view').innerHTML = "";
                                                    newWindow.document.getElementById('view').appendChild(video);
                                                }
                                                else if (data.startsWith("data:image")) {
                                                    const img = new Image();
                                                    img.src = data;
                                                    img.style = 'display: block;-webkit-user-select: none;margin: auto;cursor: zoom-in;background-color: hsl(0, 0%, 90%);transition: background-color 300ms;'
                                                    newWindow.document.getElementById('view').innerHTML = "";
                                                    newWindow.document.getElementById('view').appendChild(img);
                                                }
                                            })}>
                                        <option value=''>-选择fileKey-</option>
                                        {Object.entries(dataAssign.file_map).filter(([fileKey, fileInfo]) =>
                                            fileInfo
                                        ).map(([fileKey, fileInfo]) =>
                                            <option key={fileKey} value={`${fileInfo.packageKey}/${fileInfo.fileName}`}>{fileKey}</option>)
                                        }
                                        {Object.entries(file_map)
                                            .filter(([fileKey, fileInfo]) =>
                                                fileInfo &&
                                                (dataAssign.file_map[fileKey] !== null)
                                            ).map(([fileKey, fileInfo]) => <option key={fileKey} value={`${fileInfo.packageKey}/${fileInfo.fileName}`}>{fileKey}</option>)
                                        }
                                    </select>
                                    <div id='view' style={{ width: "100%", height: "95%" }}></div>
                                </>);
                            }}>所有资源预览</a>
                        </div>}
                    </li>
                </ul>
            </div>
            <div id="data-view">
                {((e) => {
                    console.log({ menuState })
                    const nowMenuState = menuState.state[e] ?? (menuState.state[e] = {});
                    const menuStateChange = (...keys) => {
                        // nowMenuState[id] ?? (nowMenuState[id] = {});
                        const g_s = (newValue) => {
                            let p = nowMenuState;
                            for (let i = 0; i < keys.length - 1; i++)p = p[keys[i]] ?? (p[keys[i]] = {});
                            return (newValue != undefined) ? (p[keys[keys.length - 1]] = newValue) : p[keys[keys.length - 1]];
                        };
                        g_s(!g_s());
                        forceUpdate();
                    }
                    if (!helper_menu_list[e].getToAdd) return false;
                    nowMenuState["add-item"] ?? (nowMenuState["add-item"] = { active: false, data: helper_menu_list[e].getToAdd() });
                    return (<>
                        <div className={classNames("add-item", "clickable", nowMenuState["add-item"]?.active && "clicked")}
                            onClick={() => {
                                menuStateChange("add-item", "active");
                                callDialog(nowMenuState["add-item"].data, () => {
                                    menuStateChange("add-item", "active")
                                });
                            }}>add</div>
                    </>)
                })(menuState.name)}
                {((e) => {
                    // console.log(menuState)
                    const nowMenuState = menuState.state[e] ?? (menuState.state[e] = {});
                    const menuStateChange = (...keys) => {
                        // nowMenuState[id] ?? (nowMenuState[id] = {});
                        const g_s = (newValue) => {
                            let p = nowMenuState;
                            for (let i = 0; i < keys.length - 1; i++)p = p[keys[i]] ?? (p[keys[i]] = {});
                            return (newValue != undefined) ? (p[keys[keys.length - 1]] = newValue) : p[keys[keys.length - 1]];
                        };
                        g_s(!g_s());
                        forceUpdate();
                    }
                    nowMenuState["data-filter"] ?? (nowMenuState["data-filter"] = { active: false, text: '', reg: null });
                    return (<>
                        <div className={(classNames("data-filter", "clickable", nowMenuState["data-filter"]?.active && "clicked"))}
                            onClick={() => {
                                menuStateChange("data-filter", "active");
                            }}>{`filter ${nowMenuState["data-filter"].active && nowMenuState["data-filter"].text?.length ? "ON" : "OFF"}`}</div>
                        <input className={`data-filter`} type={'text'} value={nowMenuState["data-filter"].text} onChange={(e) => {
                            nowMenuState["data-filter"].text = e.target.value;
                            debounceA(() => {
                                nowMenuState["data-filter"].reg = nowMenuState["data-filter"].text.length ? new RegExp('[\s\S]*' + Array.from(nowMenuState["data-filter"].text).join('[\s\S]*') + '[\s\S]*', 'i') : null;
                                forceUpdate();
                            }, 300);
                            forceUpdate();
                        }}></input>
                    </>)
                })(menuState.name)}
                {((e) => {
                    const nowMenuState = menuState.state[e] ?? (menuState.state[e] = {});
                    const menuStateChange = (...keys) => {
                        // nowMenuState[id] ?? (nowMenuState[id] = {});
                        const g_s = (newValue) => {
                            let p = nowMenuState;
                            for (let i = 0; i < keys.length - 1; i++)p = p[keys[i]] ?? (p[keys[i]] = {});
                            return (newValue != undefined) ? (p[keys[keys.length - 1]] = newValue) : p[keys[keys.length - 1]];
                        };
                        g_s(!g_s());
                        forceUpdate();
                    }
                    // const getStoryTreeAllStorySet = (function () {
                    //     const temp = {};
                    //     return (function (book, rootStoryId) {
                    //         const nowStory = book.data[rootStoryId];
                    //         if (nowStory.to.able.length == 0) {
                    //             return temp[rootStoryId] ?? (temp[rootStoryId] = new Set([rootStoryId]));
                    //         }
                    //         else {
                    //             if (temp[rootStoryId]) return temp[rootStoryId];
                    //             return temp[rootStoryId] = new Set([rootStoryId, ...nowStory.to.able.map(e => Array.from(getStoryTreeAllStorySet(book, e))).flat(1)])
                    //         }
                    //     })
                    // })();
                    let getItemHeadText = null;
                    switch (e) {
                        case "chara_map":
                            getItemHeadText = ([id, charaData]) => `${charaData.id} ${charaData.name}`;
                            const get_chara_map_li = (isAssign) =>
                                ([id, charaData]) => {
                                    return <li key={id} className={isAssign ? `dataAssign` :
                                        (dataAssign.chara_map[id] === null ? `deleted` :
                                            dataAssign.chara_map[id] && `covered`)}>
                                        <HidableUl
                                            nowMenuState={nowMenuState}
                                            baseClassName={[]}
                                            headText={getItemHeadText([id, charaData])}
                                            flagLoaction={[id, "self"]}
                                            buttons={[
                                                ["删除", () => {
                                                    dataControl(["write", { path: ["chara_map", id], value: undefined }]);
                                                    forceUpdate();
                                                }],
                                                ["编辑", () => {
                                                    nowMenuState[id] ?? (nowMenuState[id] = {})
                                                    nowMenuState[id]["edit"] =
                                                        helper_menu_list[e].getToEdit(charaData);

                                                    callDialog(nowMenuState[id]["edit"],)
                                                    // callDialog()
                                                    forceUpdate();
                                                }],
                                            ]}
                                            list={[
                                                `人物名：${charaData.name}`,
                                                <HidableUl
                                                    nowMenuState={nowMenuState}
                                                    baseClassName={[]}
                                                    headText={`立绘表：`}
                                                    flagLoaction={[id, "pic", "self"]}
                                                    list={Object.entries(charaData.pic).map(([styleId, picKey]) => `${styleId} ${picKey}`)}
                                                />]}
                                        />
                                    </li>
                                }
                            return <ul>
                                {Object.entries(dataAssign.chara_map)
                                    .filter(([id, charaData]) =>
                                        charaData &&
                                        (!(nowMenuState["data-filter"].active && nowMenuState["data-filter"].text.length && nowMenuState["data-filter"].reg)
                                            ||
                                            nowMenuState["data-filter"].reg.test(getHeadText([id, charaData])))
                                    ).map(get_chara_map_li(true))}
                                {Object.entries(chara_map)
                                    .filter(([id, charaData]) =>
                                        charaData &&
                                        // (dataAssign.chara_map[id] !== null) &&
                                        (!(nowMenuState["data-filter"].active && nowMenuState["data-filter"].text.length && nowMenuState["data-filter"].reg)
                                            ||
                                            nowMenuState["data-filter"].reg.test(getHeadText([id, charaData])))
                                    ).map(get_chara_map_li(false))}
                            </ul>;
                        case "file_map":
                            getItemHeadText = ([fileKey, fileInfo]) => `${fileKey}`;
                            const get_file_map_li = (isAssign) =>
                                ([fileKey, fileInfo]) => {
                                    return <li key={fileKey} className={isAssign ? `dataAssign` :
                                        (dataAssign.file_map[fileKey] === null ? `deleted` :
                                            dataAssign.file_map[fileKey] && `covered`)}>
                                        <HidableUl
                                            nowMenuState={nowMenuState}
                                            baseClassName={[]}
                                            headText={getItemHeadText([fileKey, fileInfo])}
                                            flagLoaction={[fileKey, "self"]}
                                            buttons={[
                                                ["删除", () => {
                                                    isAssign && DBremove("file", `${fileInfo.packageKey}/${fileInfo.fileName}`)
                                                    dataControl(["write", { path: ["file_map", fileKey], value: undefined }]);
                                                    forceUpdate();
                                                }],
                                            ]}
                                            list={[`属于（包）：${fileInfo.packageKey}`,
                                            <>文件名：
                                                <a className='file-download'
                                                    onClick={() =>
                                                        // DBget("file", `${fileInfo.packageKey}/${fileInfo.fileName}`).then(({ data }) => fileDownload(fileInfo.fileName, data));
                                                        DBget("file", `${fileInfo.packageKey}/${fileInfo.fileName}`).then(
                                                            ({ data }) => {
                                                                if (data.startsWith("data:audio")) {
                                                                    const video = document.createElement('video');
                                                                    const source = document.createElement("source");
                                                                    source.src = data, source.type = data.slice(data.indexOf(":") + 1, data.indexOf(";"));
                                                                    video.controls = true; video.autoplay = true;
                                                                    video.appendChild(source);
                                                                    const newWindow = window.open("", "_blank");
                                                                    newWindow.document.open();
                                                                    newWindow.document.write(video.outerHTML);
                                                                    newWindow.document.title = `${fileInfo.packageKey}/${fileInfo.fileName}`;
                                                                    newWindow.document.close();
                                                                    newWindow.document.body.style.backgroundColor = '#0e0e0e';
                                                                    newWindow.document.body.style.display = 'grid';
                                                                    newWindow.document.body.style.placeItems = 'center';
                                                                }
                                                                else if (data.startsWith("data:image")) {
                                                                    const img = new Image();
                                                                    img.src = data;
                                                                    img.style = 'display: block;-webkit-user-select: none;margin: auto;cursor: zoom-in;background-color: hsl(0, 0%, 90%);transition: background-color 300ms;'
                                                                    const newWindow = window.open("", "_blank");
                                                                    newWindow.document.open();
                                                                    newWindow.document.write(img.outerHTML);
                                                                    newWindow.document.title = `${fileInfo.packageKey}/${fileInfo.fileName}`;
                                                                    newWindow.document.close();
                                                                    newWindow.document.body.style.backgroundColor = '#0e0e0e';
                                                                    newWindow.document.body.style.display = 'grid';
                                                                    newWindow.document.body.style.placeItems = 'center';
                                                                }
                                                            })
                                                    }>
                                                    {fileInfo.fileName}</a>
                                            </>]}
                                        />
                                    </li>
                                }
                            return <ul>
                                <a className='file-download' onClick={() => {
                                    const newWindow = window.open('', '_blank');
                                    newWindow.document.open();
                                    newWindow.document.write(
                                        `<style>
#view>img {
    display: block;
    user-select: none;
    margin: auto;
    cursor: zoom-in;
    background-color: var(--block-color2);
    background-image: linear-gradient(45deg, var(--block-color1) 25%, transparent 0, transparent 75%, var(--block-color1) 0), linear-gradient(45deg, var(--block-color1) 25%, transparent 0, transparent 75%, var(--block-color1) 0);
    background-position: 0px 0, var(--block-size) var(--block-size);
    background-size: calc(2 * var(--block-size)) calc(2 * var(--block-size));
    transition: background-color 300ms ease 0s;
    --block-size: 15px;
    --block-color1: #bbb;
    --block-color2: #999;
}
#view {
    display: grid;
    place-items: center;
}
</style>
<div id='root'></div>`);
                                    // newWindow.document.styleSheets[0].insertRule(``)
                                    newWindow.document.close();
                                    const ROOT = createRoot(newWindow.document.getElementById('root'));
                                    ROOT.render(<>
                                        <select style={{ fontSize: '24px' }} onChange={(e) =>
                                            e.target.value && DBget("file", e.target.value).then(
                                                ({ data }) => {
                                                    if (data.startsWith("data:audio")) {
                                                        const video = document.createElement('video');
                                                        const source = document.createElement("source");
                                                        source.src = data, source.type = data.slice(data.indexOf(":") + 1, data.indexOf(";"));
                                                        video.controls = true; video.autoplay = false;
                                                        video.appendChild(source);
                                                        newWindow.document.getElementById('view').innerHTML = "";
                                                        newWindow.document.getElementById('view').appendChild(video);
                                                    }
                                                    else if (data.startsWith("data:image")) {
                                                        const img = new Image();
                                                        img.src = data;
                                                        img.style = 'display: block;-webkit-user-select: none;margin: auto;cursor: zoom-in;background-color: hsl(0, 0%, 90%);transition: background-color 300ms;'
                                                        newWindow.document.getElementById('view').innerHTML = "";
                                                        newWindow.document.getElementById('view').appendChild(img);
                                                    }
                                                })}>
                                            <option value=''>-选择fileKey-</option>
                                            {Object.entries(dataAssign.file_map).filter(([fileKey, fileInfo]) =>
                                                fileInfo &&
                                                (!(nowMenuState["data-filter"].active && nowMenuState["data-filter"].text.length && nowMenuState["data-filter"].reg)
                                                    ||
                                                    nowMenuState["data-filter"].reg.test(`${fileKey}`))
                                            ).map(([fileKey, fileInfo]) =>
                                                <option key={fileKey} value={`${fileInfo.packageKey}/${fileInfo.fileName}`}>{fileKey}</option>)
                                            }
                                            {Object.entries(file_map)
                                                .filter(([fileKey, fileInfo]) =>
                                                    fileInfo &&
                                                    (dataAssign.file_map[fileKey] !== null) &&
                                                    (!(nowMenuState["data-filter"].active && nowMenuState["data-filter"].text.length && nowMenuState["data-filter"].reg)
                                                        ||
                                                        nowMenuState["data-filter"].reg.test(`${fileKey}`))
                                                ).map(([fileKey, fileInfo]) => <option key={fileKey} value={`${fileInfo.packageKey}/${fileInfo.fileName}`}>{fileKey}</option>)
                                            }
                                        </select>
                                        <div id='view' style={{ width: "100%", height: "95%" }}></div>
                                    </>);
                                }}>本页资源预览</a>
                                {Object.entries(dataAssign.file_map)
                                    .filter(([fileKey, fileInfo]) =>
                                        fileInfo &&
                                        (!(nowMenuState["data-filter"].active && nowMenuState["data-filter"].text.length && nowMenuState["data-filter"].reg)
                                            ||
                                            nowMenuState["data-filter"].reg.test(getItemHeadText([fileKey, fileInfo])))
                                    ).map(get_file_map_li(true))}
                                {Object.entries(file_map)
                                    .filter(([fileKey, fileInfo]) =>
                                        fileInfo &&
                                        (dataAssign.file_map[fileKey] !== null) &&
                                        (!(nowMenuState["data-filter"].active && nowMenuState["data-filter"].text.length && nowMenuState["data-filter"].reg)
                                            ||
                                            nowMenuState["data-filter"].reg.test(getItemHeadText([fileKey, fileInfo])))
                                    ).sort((a, b) => getItemHeadText(a).localeCompare(getItemHeadText(b))).map(get_file_map_li(false))}
                            </ul>;
                        case "package_map":
                            getItemHeadText = ([packageKey, packagePath]) => `${packageKey}`;
                            return <ul>
                                {<>
                                    <span>
                                        <a className='file-download'
                                            onClick={() => {
                                                if (getOutputting()) return;
                                                setOutputting(true);
                                                forceUpdate();
                                                console.log(s, STORYFromChild, storyTree, (STORYFromChild))
                                                // 应用后才能导出
                                                const paths = Array.from(new Set(
                                                    [...bookIds.map((bookId) => {
                                                        return Object.keys(storyTree[bookId]).map(storyId => STORYFromChild[bookId].data[storyId].preload.map(e => e.data).flat(1)).flat(1)
                                                    }).flat(1),
                                                    ]
                                                ));
                                                const groupBy_packageKey = {};
                                                paths.forEach(fileKey => {
                                                    groupBy_packageKey[file_map[fileKey].packageKey] ?? (groupBy_packageKey[file_map[fileKey].packageKey] = []);
                                                    groupBy_packageKey[file_map[fileKey].packageKey].push(`${file_map[fileKey].packageKey}/${file_map[fileKey].fileName}`);
                                                })
                                                // 追加home相关包（不做过滤）
                                                Object.values(file_map).filter(e => e.packageKey.startsWith("home")).forEach(e => {
                                                    groupBy_packageKey[e.packageKey] ?? (groupBy_packageKey[e.packageKey] = []);
                                                    groupBy_packageKey[e.packageKey].push(`${e.packageKey}/${e.fileName}`);
                                                });
                                                // debugger;
                                                Promise.allSettled(
                                                    Object.entries(groupBy_packageKey).map(([packageKey, pathList]) => {
                                                        return Promise.allSettled(pathList.map(path => DBget('file', path))).then((result) => {
                                                            return Promise.allSettled(
                                                                result.map(({ value }) => (() => {
                                                                    if (!value) return undefined;
                                                                    const { fileName, data } = value;
                                                                    const bstr = atob(data.split(',', 2)[1]);
                                                                    let n = bstr.length,
                                                                        u8arr = new Uint8Array(n);
                                                                    while (n--) {
                                                                        u8arr[n] = bstr.charCodeAt(n);
                                                                    }
                                                                    return (new File([u8arr], fileName))
                                                                })()).filter(e => e).map((file) => new Promise((resolve, reject) => {
                                                                    resolve(file);
                                                                }))
                                                            )
                                                                .then(e => getZipFile(packageKey + ".zip", e.map(_e => _e.value))
                                                                    .then(([blob, fileName]) => new File([blob], fileName, { type: blob.type })))
                                                        })
                                                    })
                                                ).then(e => {
                                                    saveZipFile("allPackage.thin.zip", [
                                                        new File([JSON.stringify(
                                                            allData
                                                        )], "data.json", { type: "text/plain" }),
                                                        ...e.map(_e => _e.value)]).then(() => {
                                                            setOutputting(false);
                                                            forceUpdate();
                                                        })
                                                })
                                                // Promise.allSettled(
                                                //     [...Object.keys(package_map), ...Object.keys(dataAssign.package_map)].map((packageKey =>
                                                //         DBget_index('file', "packageKey", packageKey).then((result) => {
                                                //             return Promise.allSettled(
                                                //                 result.map(e => (({ fileName, data }) => {
                                                //                     const bstr = atob(data.split(',', 2)[1]);
                                                //                     let n = bstr.length,
                                                //                         u8arr = new Uint8Array(n);
                                                //                     while (n--) {
                                                //                         u8arr[n] = bstr.charCodeAt(n);
                                                //                     }
                                                //                     return (new File([u8arr], fileName))
                                                //                 })(e)).map((file) => new Promise((resolve, reject) => {
                                                //                     resolve(file);
                                                //                 }))
                                                //             )
                                                //                 .then(e => getZipFile(packageKey + ".zip", e.map(_e => _e.value))
                                                //                     .then(([blob, fileName]) => new File([blob], fileName, { type: blob.type })))
                                                //         })
                                                //     ))
                                                // ).then(e => {
                                                //     saveZipFile("allPackage.zip", e.map(_e => _e.value)).then(() => {
                                                //         setOutputting(false);
                                                //         forceUpdate();
                                                //     })
                                                // })
                                            }} style={getOutputting() ? { color: "gray" } : {}}>{"导出瘦包"}</a>
                                    </span>
                                    {" "}
                                    <span>
                                        <a className='file-download'
                                            onClick={() => {
                                                if (getOutputting()) return;
                                                setOutputting(true);
                                                forceUpdate();
                                                Promise.allSettled(
                                                    [...Object.keys(package_map), ...Object.keys(dataAssign.package_map)].map((packageKey =>
                                                        DBget_index('file', "packageKey", packageKey).then((result) => {
                                                            return Promise.allSettled(
                                                                result.map(e => (({ fileName, data }) => {
                                                                    const bstr = atob(data.split(',', 2)[1]);
                                                                    let n = bstr.length,
                                                                        u8arr = new Uint8Array(n);
                                                                    while (n--) {
                                                                        u8arr[n] = bstr.charCodeAt(n);
                                                                    }
                                                                    return (new File([u8arr], fileName))
                                                                })(e)).map((file) => new Promise((resolve, reject) => {
                                                                    resolve(file);
                                                                }))
                                                            )
                                                                .then(e => getZipFile(packageKey + ".zip", [...e.map(_e => _e.value)])
                                                                    .then(([blob, fileName]) => new File([blob], fileName, { type: blob.type })))
                                                        })
                                                    ))
                                                ).then(e => {
                                                    saveZipFile("allPackage.zip", [new File([JSON.stringify(
                                                        allData
                                                    )], "data.json", { type: "text/plain" }), ...e.map(_e => _e.value)]).then(() => {
                                                        setOutputting(false);
                                                        forceUpdate();
                                                    })
                                                })
                                            }} style={getOutputting() ? { color: "gray" } : {}}>{"导出总包"}</a>
                                    </span>
                                    {" "}
                                    <span>
                                        <a className='file-download' onClick={async () => {
                                            if (getOutputting()) return;
                                            setOutputting(true);
                                            forceUpdate();
                                            await downloadData("object_name." + "files", ['file']);
                                            setOutputting(false);
                                            forceUpdate();
                                        }} style={getOutputting() ? { color: "gray" } : {}}>
                                            {"导出files.json"}
                                        </a>
                                    </span>
                                    {" "}
                                    <span>
                                        <label htmlFor='upload-package'>
                                            <a className='file-upload'>{"导入files.json"}</a>
                                        </label>
                                        <input type={"file"} id='upload-package' style={{ display: "none" }} onChange={(e) => {
                                            uploadData(e.target.files[0]);
                                        }}></input>
                                    </span>
                                </>}
                                {Object.entries(dataAssign.package_map)
                                    .filter(([packageKey, packagePath]) =>
                                        !(nowMenuState["data-filter"].active && nowMenuState["data-filter"].text.length && nowMenuState["data-filter"].reg)
                                        ||
                                        nowMenuState["data-filter"].reg.test(getItemHeadText([packageKey, packagePath]))
                                    ).map(([packageKey, packagePath]) => {
                                        return <li key={packageKey} className={`dataAssign`}>
                                            <HidableUl
                                                nowMenuState={nowMenuState}
                                                baseClassName={[]}
                                                headText={getItemHeadText([packageKey, packagePath])}
                                                flagLoaction={[packageKey, "self"]}
                                                list={[
                                                    <>包路径：<a className='file-download'
                                                        onClick={() => {
                                                            DBget_index('file', "packageKey", packageKey).then((result) => {
                                                                Promise.allSettled(
                                                                    result.map(e => (({ fileName, data }) => {
                                                                        const bstr = atob(data.split(',', 2)[1]);
                                                                        let n = bstr.length,
                                                                            u8arr = new Uint8Array(n);
                                                                        while (n--) {
                                                                            u8arr[n] = bstr.charCodeAt(n);
                                                                        }
                                                                        return (new File([u8arr], fileName))
                                                                    })(e)).map((file) => new Promise((resolve, reject) => {
                                                                        resolve(file);
                                                                    }))
                                                                )
                                                                    .then(e => saveZipFile(packageKey + ".zip", e.map(_e => _e.value)))
                                                            })
                                                        }}>{packagePath}</a></>,
                                                    <HidableUl
                                                        nowMenuState={nowMenuState}
                                                        baseClassName={[]}
                                                        headText={`文件列表`}
                                                        flagLoaction={[packageKey, "files", "self"]}
                                                        list={
                                                            [...Object.entries(file_map), ...Object.entries(dataAssign.file_map).filter(([k, v]) => v)].filter(([, info]) => info.packageKey == packageKey).map(([k, info]) =>
                                                                <>{`${k}`}<a className='file-download'
                                                                    onClick={() =>
                                                                        // DBget("file", `${fileInfo.packageKey}/${fileInfo.fileName}`).then(({ data }) => fileDownload(fileInfo.fileName, data));
                                                                        DBget("file", `${info.packageKey}/${info.fileName}`).then(
                                                                            ({ data }) => {
                                                                                const img = new Image();
                                                                                img.src = data;
                                                                                img.style = 'display: block;-webkit-user-select: none;margin: auto;cursor: zoom-in;background-color: hsl(0, 0%, 90%);transition: background-color 300ms;'
                                                                                const newWindow = window.open("", "_blank");
                                                                                newWindow.document.open();
                                                                                newWindow.document.write(img.outerHTML);
                                                                                newWindow.document.title = `${info.packageKey}/${info.fileName}`;
                                                                                newWindow.document.close();
                                                                                newWindow.document.body.style.backgroundColor = '#0e0e0e';
                                                                                newWindow.document.body.style.display = 'grid';
                                                                                newWindow.document.body.style.placeItems = 'center';
                                                                            })
                                                                    }> {info.fileName}</a></>)
                                                        } />]}
                                            />
                                        </li>
                                    })}
                                {Object.entries(package_map)
                                    .filter(([packageKey, packagePath]) =>
                                        !(nowMenuState["data-filter"].active && nowMenuState["data-filter"].text.length && nowMenuState["data-filter"].reg)
                                        ||
                                        nowMenuState["data-filter"].reg.test(getItemHeadText([packageKey, packagePath]))
                                    ).sort((a, b) => getItemHeadText(a).localeCompare(getItemHeadText(b))).map(([packageKey, packagePath]) => {
                                        return <li key={packageKey}>
                                            <HidableUl
                                                nowMenuState={nowMenuState}
                                                baseClassName={[]}
                                                headText={getItemHeadText([packageKey, packagePath])}
                                                flagLoaction={[packageKey, "self"]}
                                                list={[
                                                    <>包路径：<a className='file-download'
                                                        onClick={() => {
                                                            DBget_index('file', "packageKey", packageKey).then((result) => {
                                                                Promise.allSettled(
                                                                    result.map(e => (({ fileName, data }) => {
                                                                        const bstr = atob(data.split(',', 2)[1]);
                                                                        let n = bstr.length,
                                                                            u8arr = new Uint8Array(n);
                                                                        while (n--) {
                                                                            u8arr[n] = bstr.charCodeAt(n);
                                                                        }
                                                                        return (new File([u8arr], fileName))
                                                                    })(e)).map((file) => new Promise((resolve, reject) => {
                                                                        resolve(file);
                                                                    }))
                                                                )
                                                                    .then(e => saveZipFile(packageKey + ".zip", e.map(_e => _e.value)))
                                                            })
                                                        }}>{packagePath}</a></>,
                                                    <HidableUl
                                                        nowMenuState={nowMenuState}
                                                        baseClassName={[]}
                                                        headText={`文件列表`}
                                                        flagLoaction={[packageKey, "files", "self"]}
                                                        list={
                                                            [...Object.entries(file_map), ...Object.entries(dataAssign.file_map).filter(([k, v]) => v)].filter(([, info]) => info.packageKey == packageKey).map(([k, info]) =>
                                                                <>{`${k}`}<a className='file-download'
                                                                    onClick={() =>
                                                                        // DBget("file", `${fileInfo.packageKey}/${fileInfo.fileName}`).then(({ data }) => fileDownload(fileInfo.fileName, data));
                                                                        DBget("file", `${info.packageKey}/${info.fileName}`).then(
                                                                            ({ data }) => {
                                                                                const img = new Image();
                                                                                img.src = data;
                                                                                img.style = 'display: block;-webkit-user-select: none;margin: auto;cursor: zoom-in;background-color: hsl(0, 0%, 90%);transition: background-color 300ms;'
                                                                                const newWindow = window.open("", "_blank");
                                                                                newWindow.document.open();
                                                                                newWindow.document.write(img.outerHTML);
                                                                                newWindow.document.title = `${info.packageKey}/${info.fileName}`;
                                                                                newWindow.document.close();
                                                                                newWindow.document.body.style.backgroundColor = '#0e0e0e';
                                                                                newWindow.document.body.style.display = 'grid';
                                                                                newWindow.document.body.style.placeItems = 'center';
                                                                            })
                                                                    }> {info.fileName}</a></>)
                                                        } />]}
                                            />
                                        </li>
                                    })}
                            </ul>;
                        case "Book":
                            // console.log(dataAssign.b);
                            return <ul>
                                {bookIds.map(bookId => dataAssign.b[bookId] && [[bookId, dataAssign.b[bookId]]].map(
                                    ([id, vm]) => <li key={id}>
                                        <HidableUl
                                            nowMenuState={nowMenuState}
                                            baseClassName={[]}
                                            headText={`${id} *预添加的`}
                                            flagLoaction={[id, "self"]}
                                            buttons={[]}
                                            list={(() => { const obj = vmtoobj(vm); return ["id", "start", "cover"].map(key => `${key}: ${obj[key]}`) })}>
                                        </HidableUl>
                                    </li>
                                ))}
                                {bookIds
                                    .filter(bookId =>
                                        !(nowMenuState["data-filter"].active && nowMenuState["data-filter"].text.length && nowMenuState["data-filter"].reg)
                                        ||
                                        nowMenuState["data-filter"].reg.test(`${bookId}`)
                                    ).map(bookId =>
                                        BOOKFromChild[bookId] &&
                                        <li key={bookId}>
                                            <HidableUl
                                                nowMenuState={nowMenuState}
                                                baseClassName={[]}
                                                headText={`${bookId}`}
                                                flagLoaction={[bookId, "self"]}
                                                buttons={[
                                                    ["编辑", () => {
                                                        nowMenuState[bookId] ?? (nowMenuState[bookId] = {})
                                                        // if (nowMenuState[bookId]["edit"]) {
                                                        //     if (confirm(`故事${bookId}有未应用的编辑记录。\n点击“确定”以重新编辑（不保留之前的编辑）。\n点击“取消”则不编辑。`))
                                                        //         nowMenuState[bookId]["edit"] = helper_menu_list[e].getToEdit(bookId, storyId, s[bookId][storyId]);
                                                        //     else return;
                                                        // }
                                                        // else {
                                                        nowMenuState[bookId]["edit"] = helper_menu_list[e].getToEdit(bookId, b[bookId]);
                                                        // }
                                                        callDialog(nowMenuState[bookId]["edit"]);
                                                        forceUpdate();
                                                    }],
                                                    ["输出vm到控制台", () => console.log(bookId, b[bookId])]
                                                ]}
                                                list={[...([["name", "Book名称"], ["start", "起始story编号"], ["end", "终结story编号-text"], ["default_style", "默认style"]].map(([e, ch]) =>
                                                    `${ch}：${JSON.stringify(BOOKFromChild[bookId][e])}`
                                                )),
                                                <HidableUl
                                                    nowMenuState={nowMenuState}
                                                    baseClassName={[]}
                                                    headText={`${"所含故事"}`}
                                                    flagLoaction={[bookId, "story"]}
                                                    list={(() => {
                                                        if (storyTree[bookId] === null) return [];
                                                        // debugger;
                                                        let nodesFromTree = (Array.from(storyTree[bookId][BOOKFromChild[bookId].start].child)).sort((a, b) => a.localeCompare(b)),
                                                            otherNodes = (() => {
                                                                let obj = Object.fromEntries(Object.keys(BOOKFromChild[bookId].data).map((e) => [e, null]));
                                                                nodesFromTree.forEach(e => { delete obj[e]; })
                                                                return Object.keys(obj)
                                                            })();
                                                        // nowMenuState[bookId] ?? (nowMenuState[bookId] = {});
                                                        // nowMenuState[bookId].nodesFromTree = nodesFromTree;
                                                        // nowMenuState[bookId].otherNodes = otherNodes;
                                                        return [
                                                            ...nodesFromTree.map(e => <span>{e}</span>),
                                                            ...otherNodes.map(e => <span style={{ color: "#aaa" }}>{e}</span>)
                                                        ]
                                                    })()}
                                                />
                                                ]}
                                            />
                                        </li>
                                    )}
                            </ul>;
                        case "Story":
                            const get_Story_li = (isAssign, bookId) =>
                                ([storyId, story], fromTree) =>
                                    <li key={storyId} className={isAssign ? `dataAssign` :
                                        (dataAssign.s[bookId]?.[storyId] === null ? `deleted` :
                                            dataAssign.s[bookId]?.[storyId] && `covered`)}>
                                        <HidableUl
                                            nowMenuState={nowMenuState}
                                            baseClassName={[]}
                                            headText={`${bookId} - ${storyId}`}
                                            flagLoaction={[storyId, "self"]}
                                            buttons={[
                                                ...(nowMenuState[storyId]?.["edit"] ? [["继续编辑", () => {
                                                    nowMenuState[storyId] ?? (nowMenuState[storyId] = {});
                                                    callDialog(nowMenuState[storyId]["edit"],)
                                                    // callDialog()
                                                    forceUpdate();
                                                }]] : []),
                                                [nowMenuState[storyId]?.["edit"] ? "重新编辑" : "编辑", () => {
                                                    nowMenuState[storyId] ?? (nowMenuState[storyId] = {})
                                                    if (nowMenuState[storyId]["edit"]) {
                                                        if (confirm(`故事${storyId}有未应用的编辑记录。\n点击“确定”以重新编辑（不保留之前的编辑）。\n点击“取消”则不编辑。`))
                                                            nowMenuState[storyId]["edit"] = helper_menu_list[e].getToEdit(bookId, storyId, s[bookId][storyId]);
                                                        else return;
                                                    }
                                                    else {
                                                        nowMenuState[storyId]["edit"] = helper_menu_list[e].getToEdit(bookId, storyId, s[bookId][storyId]);
                                                    }
                                                    callDialog(nowMenuState[storyId]["edit"],)
                                                    // callDialog()
                                                    forceUpdate();
                                                }],
                                                ["复制vm（应用中）", () => navigator.clipboard.writeText(s[bookId][storyId]).then(() => alert(`已经复制 ${bookId}_${storyId}`))],
                                                ["复制vm（编辑中）", () => console.log(objtovm(nowMenuState[storyId]["edit"].story_vm.value)),
                                                    nowMenuState[storyId]?.["edit"] === undefined],
                                                ["删除", () => {
                                                    dataControl(["write", { path: ["s", bookId, storyId], value: undefined }]);
                                                    forceUpdate();
                                                }, fromTree]
                                            ]}
                                            list={[
                                                ...([["id", "story编号"], ["title", "标题"], ["start", "起始sentence编号"], ["end", "终结sentence编号"]].map(([e, ch]) =>
                                                    `${ch}：${JSON.stringify(story[e])}`
                                                )),
                                                [["tips", "加载显示tips组"]].map(([e, ch]) => `${ch}：${(story[e]).join(',')}`),
                                                (([e, ch]) => `${ch}：${story.to.able.length ? (story.to.able).join(',') : "无"}`)([, "可达story编号"]),
                                                <HidableUl
                                                    nowMenuState={nowMenuState}
                                                    baseClassName={[]}
                                                    headText={`${"所含句子（编后）"}`}
                                                    flagLoaction={[storyId, "sentence"]}
                                                    list={Object.entries(story.data).map(([sentenceId, sentence]) =>
                                                        `${sentenceId} ${chara_map?.[sentence.charaName] ? chara_map[sentence.charaName].name : sentence.charaName}||${sentence.text}`)}
                                                />,
                                                <HidableUl
                                                    nowMenuState={nowMenuState}
                                                    baseClassName={[]}
                                                    headText={`${"所含段落"}`}
                                                    flagLoaction={[storyId, "para", "self"]}
                                                    list={(((arr) => {
                                                        if (!arr) return [];
                                                        const newArr = [];
                                                        let paragraphCount = 0;
                                                        for (let i = 0; i < arr.length; i++) {
                                                            switch (arr[i][0]) {
                                                                case "ps":
                                                                    if (newArr[paragraphCount]) throw `段落tag可能未闭合 于行${arr[i][2]}`;
                                                                    newArr.push({ tag: arr[i][1].slice(arr[i][1].search('~') + 1, arr[i][1].search(':')), start: arr[i][2], end: undefined, sentence: [] });
                                                                    break;
                                                                case "s":
                                                                    newArr[paragraphCount].sentence.push(arr[i][1]);
                                                                    break;
                                                                case "pe":
                                                                    if (newArr[paragraphCount].tag != arr[i][1].slice(arr[i][1].search('~') + 1, arr[i][1].search(' end'))) throw `段落tag不匹配 应为${newArr[paragraphCount].tag} 实为${arr[i][1].slice(arr[i][1].search('~') + 1, arr[i][1].search(' end'))} 于行${arr[i][2]}`
                                                                    newArr[paragraphCount].end = arr[i][2];
                                                                    paragraphCount += 1;
                                                                    break;
                                                            }
                                                        }
                                                        return newArr;
                                                    })(s[bookId][storyId] && s[bookId][storyId].split('\n').map(
                                                        (line, i) => {
                                                            const fc = line.charAt(0);
                                                            if (fc == '@') return [`s`, line, i];
                                                            else if (fc == '~') return [`p${line.search(new RegExp(`[ ]+end`)) != -1 ? 'e' : 's'}`, line, i];
                                                            else return [];
                                                        }
                                                    ).filter(arr => arr && arr.length > 0))
                                                    ).map(({ tag, start, end, sentence }, i) =>
                                                        <HidableUl
                                                            nowMenuState={nowMenuState}
                                                            baseClassName={[]}
                                                            headText={`段落${tag} 行${start}-${end}`}
                                                            flagLoaction={[storyId, "para", tag, "sentence", "self"]}
                                                            list={sentence.map((nowLine, i) => {
                                                                let toView = {};
                                                                // const nowLine = nowLine.slice(1);
                                                                let [charaName, text, ...actions] = nowLine.slice(1).split("##");
                                                                toView.charaName = (chara_map?.[charaName] ? charaName = chara_map[charaName].name : charaName);
                                                                toView.text = (text);
                                                                toView.actions = actions;
                                                                const anyAction = (toView.actions.length != 0);
                                                                return anyAction ?
                                                                    <HidableUl
                                                                        nowMenuState={nowMenuState}
                                                                        baseClassName={[]}
                                                                        headText={<>{toView.charaName.length == 0 ? <b>{"<空>"}</b> : toView.charaName} {`| ${toView.text}`}</>}
                                                                        flagLoaction={[storyId, "para", tag, "sentence", i]}
                                                                        list={toView.actions} /> :
                                                                    <div>
                                                                        {toView.charaName.length == 0 ? <b>{"<空>"}</b> : toView.charaName} {`| ${toView.text}`}
                                                                    </div>;
                                                            })}
                                                        />)}
                                                />
                                            ]}
                                        />
                                        {nowMenuState[storyId]?.["edit"] && <span style={{ color: 'red' }}>{" 未应用的修改！"}</span>}
                                        {!fromTree && <span style={{ color: 'green' }}>{" *剧情树外的故事"}</span>}
                                    </li>
                            return <ul>
                                {bookIds.map(bookId => dataAssign.s[bookId] && Object.entries(dataAssign.s[bookId]).filter(([id, vm]) => vm).map(
                                    ([id, vm]) => <li key={id}>
                                        <HidableUl
                                            nowMenuState={nowMenuState}
                                            baseClassName={[]}
                                            headText={`${id} *预添加的`}
                                            flagLoaction={[id, "self"]}
                                            buttons={[]}
                                            list={(() => { const obj = vmtoobj(vm); return ["id", "title"].map(key => `${key}: ${obj[key]}`) })}>
                                        </HidableUl>
                                    </li>
                                ))}
                                {bookIds.map(bookId => {
                                    if (!BOOKFromChild[bookId]) return false;
                                    if (storyTree[bookId] === null) {
                                        return STORYFromChild[bookId]?.data &&
                                            Object.entries(STORYFromChild[bookId].data)
                                                .filter(([storyId, story]) =>
                                                    story &&
                                                    !(nowMenuState["data-filter"].active && nowMenuState["data-filter"].text.length && nowMenuState["data-filter"].reg)
                                                    ||
                                                    nowMenuState["data-filter"].reg.test(`${storyId}`)
                                                )
                                                .map((e) => get_Story_li(false, bookId)(e, false))
                                    }
                                    // debugger;
                                    let nodesFromTree = storyTree ? (Array.from(storyTree[bookId][BOOKFromChild[bookId].start].child).sort((a, b) => a.localeCompare(b))) : [],
                                        otherNodes = (() => {
                                            let obj = Object.fromEntries(Object.keys(BOOKFromChild[bookId].data).map((e) => [e, null]));
                                            nodesFromTree.forEach(e => { delete obj[e]; })
                                            return Object.keys(obj)
                                        })();
                                    return STORYFromChild[bookId]?.data &&
                                        Object.entries(STORYFromChild[bookId].data)
                                            .filter(([storyId, story]) =>
                                                story &&
                                                !(nowMenuState["data-filter"].active && nowMenuState["data-filter"].text.length && nowMenuState["data-filter"].reg)
                                                ||
                                                nowMenuState["data-filter"].reg.test(`${storyId}`)
                                            )
                                            .map((e) => get_Story_li(false, bookId)(e, (otherNodes.indexOf(e[0]) === -1)))
                                })}
                            </ul>;
                        case "tips":
                            const get_tips_li = (isAssign) =>
                                ([groupKey, group]) => group &&
                                    <li key={groupKey} className={isAssign ? `dataAssign` :
                                        (dataAssign.tips_group[groupKey] === null ? `deleted` :
                                            dataAssign.tips_group[groupKey] && `covered`)}>
                                        <HidableUl
                                            nowMenuState={nowMenuState}
                                            baseClassName={[]}
                                            headText={`${groupKey}`}
                                            flagLoaction={[groupKey, "self"]}
                                            buttons={[
                                                ["编辑", () => {
                                                    nowMenuState[groupKey] ?? (nowMenuState[groupKey] = {})
                                                    nowMenuState[groupKey]["edit"] =
                                                        helper_menu_list[e].getToEdit(groupKey, group);
                                                    callDialog(nowMenuState[groupKey]["edit"],)
                                                    forceUpdate();
                                                }],
                                                ["删除组", () => {
                                                    dataControl(["write", { path: ["tips_group", groupKey], value: undefined }]);
                                                    forceUpdate();
                                                }],
                                            ]}
                                            list={[...group.map(({ title, text }) => <><b>{title}</b> <span>{text}</span></>)]}
                                        />
                                    </li>;
                            return <ul>
                                {Object.entries(dataAssign.tips_group)
                                    .filter(([groupKey, group]) =>
                                        group &&
                                        (!(nowMenuState["data-filter"].active && nowMenuState["data-filter"].text.length && nowMenuState["data-filter"].reg)
                                            ||
                                            nowMenuState["data-filter"].reg.test(`${groupKey}`))
                                    )
                                    .map(get_tips_li(true))}
                                {Object.entries(tips_group)
                                    .filter(([groupKey, group]) =>
                                        group &&
                                        (dataAssign.tips_group[groupKey] !== null) &&
                                        (!(nowMenuState["data-filter"].active && nowMenuState["data-filter"].text.length && nowMenuState["data-filter"].reg)
                                            ||
                                            nowMenuState["data-filter"].reg.test(`${groupKey}`))
                                    )
                                    .map(get_tips_li(false))}
                            </ul>
                        case "home":
                            const allStory = Object.keys(s).map(bookId => Object.keys(s[bookId]).map(storyId => bookId + '/' + storyId)).flat(1).map(e => [e]);
                            const homePackageFiles = Object.keys(file_map).filter(e => file_map[e].packageKey.startsWith("home"));
                            return <ul>
                                {[
                                    ["BGM", "BGM"],
                                    ["backgroundImage", "背景图片"],
                                ].map(([name, ch]) => {
                                    const path = [name];
                                    const [setv, v] = ((root) => {
                                        const [ac, p] = [path, path.pop()];
                                        const parent = ac.reduce((a, name) => a = a[name], root);
                                        const [setv, v] = [(nv) => parent[p] = nv, parent[p]];
                                        return [setv, v];
                                    })(homeResource_map);
                                    nowMenuState[name] ?? (nowMenuState[name] = {});
                                    return <li key={name}>
                                        {ch}:
                                        <HidableUl
                                            nowMenuState={nowMenuState}
                                            baseClassName={[]}
                                            headText={`${v}`}
                                            flagLoaction={[name, "self"]}
                                            buttons={[]}
                                            list={[
                                                <select value={nowMenuState[name].value ?? (nowMenuState[name].value = v)}
                                                    onChange={(e) => (setv(nowMenuState[name].value = e.target.value), forceUpdate())}>
                                                    {homePackageFiles.map(e => <option value={e} key={e}>{e}</option>)}
                                                </select>
                                            ]}
                                        />
                                    </li>
                                })
                                }
                                {[
                                    [["title", "text"], "标题文本（在没有图片时生效）"],
                                    [["title", "fileKey"], "标题图片Key"],
                                    [["logo", "fileKey"], "Logo"],
                                ].map(([[...path], ch]) => {
                                    const pathStr = path.toString();
                                    const [setv, v] = ((root) => {
                                        const [ac, p] = [path, path.pop()];
                                        const parent = ac.reduce((a, name) => a = a[name], root);
                                        const [setv, v] = [(nv) => parent[p] = nv, parent[p]];
                                        return [setv, v];
                                    })(homeResource_map.elements);
                                    nowMenuState[pathStr] ?? (nowMenuState[pathStr] = {});
                                    return <li key={pathStr}>
                                        {ch}:
                                        <HidableUl
                                            nowMenuState={nowMenuState}
                                            baseClassName={[]}
                                            headText={`${v}`}
                                            flagLoaction={[pathStr, "self"]}
                                            buttons={[]}
                                            list={[
                                                pathStr.endsWith("fileKey") ?
                                                    <select value={nowMenuState[pathStr].value ?? (nowMenuState[pathStr].value = v)}
                                                        onChange={(e) => (setv(nowMenuState[pathStr].value = e.target.value), forceUpdate())}>
                                                        {homePackageFiles.map(e => <option value={e} key={e}>{e}</option>)}
                                                    </select>
                                                    : <input value={nowMenuState[pathStr].value ?? (nowMenuState[pathStr].value = v)}
                                                        onChange={(e) => (setv(nowMenuState[pathStr].value = e.target.value), forceUpdate())}></input>
                                            ]}
                                        />
                                    </li>
                                })}
                                {<HidableUl
                                    nowMenuState={nowMenuState}
                                    baseClassName={[]}
                                    headText={`${"背景图片（解锁）"}`}
                                    flagLoaction={["backgroundImageList", "self"]}
                                    buttons={[["添加", () => homeResource_map.backgroundImageList.push({ check: { read: [], ended: [] }, fileKey: "" })]]}
                                    list={
                                        homeResource_map.backgroundImageList.map((item) => {
                                            const [check, read_selected, ended_selected] = [item.check, item.check.read, item.check.ended];
                                            return <>
                                                <input type='text' disabled={true} value={`[${read_selected.join(',')}],[${ended_selected.join(',')}]`}></input>
                                                READ<select defaultValue={read_selected} multiple={true} size={allStory.length} onChange={(e) => {
                                                    const read = Array.from(e.target.options).filter(e => e.selected).map(e => e.value);
                                                    check.read = read;
                                                    forceUpdate();
                                                }}>
                                                    {allStory.map(([v, n], ii) => <option key={ii} value={v}>{n ?? v}</option>)}
                                                </select>
                                                ENDED<select defaultValue={ended_selected} multiple={true} size={allStory.length} onChange={(e) => {
                                                    const ended = Array.from(e.target.options).filter(e => e.selected).map(e => e.value);
                                                    check.ended = ended;
                                                    forceUpdate();
                                                }}>
                                                    {allStory.map(([v, n], ii) => <option key={ii} value={v}>{n ?? v}</option>)}
                                                </select>
                                                <select value={item.fileKey ?? (item.fileKey = "")}
                                                    onChange={(e) => (item.fileKey = e.target.value, forceUpdate())}>
                                                    {homePackageFiles.map(e => <option value={e} key={e}>{e}</option>)}
                                                </select>
                                            </>
                                        })
                                    } />
                                }
                            </ul>
                        case "information":
                            getItemHeadText = ([infoKey, info]) => `${info.order} ${infoKey} ${info.title}`
                            const get_info_li = (isAssign) =>
                                ([infoKey, info]) => info &&
                                    <li key={infoKey} className={isAssign ? `dataAssign` :
                                        (dataAssign.information_map[infoKey] === null ? `deleted` :
                                            dataAssign.information_map[infoKey] && `covered`)}>
                                        <HidableUl
                                            nowMenuState={nowMenuState}
                                            baseClassName={[]}
                                            headText={getItemHeadText([infoKey, info])}
                                            flagLoaction={[infoKey, "self"]}
                                            buttons={[
                                                ["编辑", () => {
                                                    nowMenuState[infoKey] ?? (nowMenuState[infoKey] = {})
                                                    nowMenuState[infoKey]["edit"] =
                                                        helper_menu_list[e].getToEdit(infoKey, info);
                                                    callDialog(nowMenuState[infoKey]["edit"],)
                                                    forceUpdate();
                                                }],
                                                ["删除组", () => {
                                                    dataControl(["write", { path: ["information_map", infoKey], value: undefined }]);
                                                    forceUpdate();
                                                }],
                                            ]}
                                            list={[
                                                <><b>{"id"}</b> {info.id}</>,
                                                <><b>{"title"}</b> {info.title}</>,
                                                info.check && <HidableUl
                                                    nowMenuState={nowMenuState}
                                                    baseClassName={[]}
                                                    headText={`解锁条件`}
                                                    flagLoaction={[infoKey, "check"]}
                                                    button={[]}
                                                    list={[["read", "读过"], ["ended", "已完成"]].map(([key, ch]) => {
                                                        return <><b>{ch}</b> {info.check[key]?.length ? info.check[key].join(", ") : <b>{"<空>"}</b>}</>
                                                    })} />,
                                                <HidableUl
                                                    nowMenuState={nowMenuState}
                                                    baseClassName={[]}
                                                    headText={`档案内容`}
                                                    flagLoaction={[infoKey, "data"]}
                                                    button={[]}
                                                    list={[...info.data.map(e => {
                                                        switch (e.type) {
                                                            case "text":
                                                                return <><b>文本</b> {e.text}</>
                                                            case "pic":
                                                                return <><b>图片</b> {e.fileKey}</>
                                                            default: return <></>
                                                        }
                                                        <>{e.fileKey ?? e.text}</>
                                                    })]} />
                                            ]}
                                        />
                                    </li>;
                            return <ul>
                                {Object.entries(dataAssign.information_map)
                                    .filter(([infoKey, info]) =>
                                        info &&
                                        (!(nowMenuState["data-filter"].active && nowMenuState["data-filter"].text.length && nowMenuState["data-filter"].reg)
                                            ||
                                            nowMenuState["data-filter"].reg.test(getItemHeadText([infoKey, info])))
                                    )
                                    .map(get_info_li(true))}
                                {Object.entries(information_map)
                                    .filter(([infoKey, info]) =>
                                        info &&
                                        (dataAssign.information_map[infoKey] !== null) &&
                                        (!(nowMenuState["data-filter"].active && nowMenuState["data-filter"].text.length && nowMenuState["data-filter"].reg)
                                            ||
                                            nowMenuState["data-filter"].reg.test(getItemHeadText([infoKey, info])))
                                    ).sort(([, infoa], [, infob]) => infoa.order - infob.order)
                                    .map(get_info_li(false))}
                            </ul>
                        default:
                            return <>???</>;
                    }
                })(menuState.name)}
            </div>
            <div id="app-view" style={{ display: viewerDisplay ? undefined : "none", transform: `translate(calc(50% - ${viewerSize} * 8rem), calc(${viewerSize} * 4.5rem - 50%)) scale(${viewerSize})` }}>
                <iframe src={
                    // "https://chong-chan.cn/game_for_helper/index.html"
                    "http://localhost:8080/"
                }
                    ref={viewer}
                    height={Math.min(window.innerHeight / 9, window.innerWidth / 16) * 9}
                    width={Math.min(window.innerHeight / 9, window.innerWidth / 16) * 16}></iframe>
            </div>
            {dialogState.active && <Dialog data={dialogState.data}
                setState={(newState) => setDialogState(newState)}
                getState={() => dialogState}
                onClose={() => { getOnDialogClose()(); }}
            />}
        </>
    )
}

readWriteAll().then(() => {
    const valid_fileKPath = new Set(Object.values(file_map).map(e => `${e.packageKey}/${e.fileName}`));
    DBtraversal("file", ({ key, value }) => {
        !valid_fileKPath.has(key) && DBremove("file", key)
    });
    console.log({ file_map, chara_map, package_map, b, s, bookIds }, "alldata_")
}).then(() => {
    // debugger;
    ROOT.render(
        <React.Fragment>
            {/* <App></App> */}
            <Helper></Helper>
            {/* <ResourceView></ResourceView> */}
        </React.Fragment>
    )
})
// .
// then(()=>new Promise((rs,rj)=>setTimeout(()=>{
//     ROOT.render(
//         <React.Fragment>
//         </React.Fragment>
//     )
// },5000)))